import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { LabelActionsT } from 'src/app/interfaces/labels';
import { Router } from '@angular/router';
// import { bgColors, bgImages } from '../../interfaces/tooltip';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css', './modal.css'],
})
export class NavComponent implements OnInit {
  @ViewChild("modalContainer") modalContainer!: ElementRef<HTMLInputElement>;
  @ViewChild("modal") modal!: ElementRef<HTMLInputElement>;
  @ViewChild("settingsModal") settingsModal!: ElementRef<HTMLInputElement>;
  @ViewChild("labelInput") labelInput!: ElementRef<HTMLInputElement>;
  @ViewChild("labelError") labelError!: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  // Flags to track the active state of "Add labels" and "Settings"
  isLabelsActive: boolean = false;
  isSettingsActive: boolean = false;

  // New property to handle dark mode state
  isDarkMode: boolean = false;
  isContainerVisible: boolean = true;  // New property to track container visibility

  constructor(public Shared: SharedService, public router: Router) { }

  // Theme switching logic
  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.setDarkMode();
    } else {
      this.setLightMode();
    }

    // Load container visibility from local storage
    const containerVisibility = localStorage.getItem('containerVisibility');
    this.isContainerVisible = containerVisibility !== 'hidden';
    this.updateContainerOpacity();

    // Handle sidebar initialization if needed
    this.Shared.closeSideBar.subscribe(x => { if (x) this.collapseSideBar(); });
    if (window.innerWidth <= 600) {
      this.collapseSideBar();
    }
  }

  toggleTheme(event: any) {
    if (event.target.checked) {
      this.isDarkMode = true;
      this.setDarkMode();
    } else {
      this.isDarkMode = false;
      this.setLightMode();
      
    }
  }

  toggleContainerVisibility(event: any) {
    this.isContainerVisible = event.target.checked;
    localStorage.setItem('containerVisibility', this.isContainerVisible ? 'visible' : 'hidden');
    this.updateContainerOpacity();
  }

  updateContainerOpacity() {
    this.setCSSVariables({
      '--container-opacity': this.isContainerVisible ? '1' : '0'
    });
  }

  setLightMode() {
    this.setCSSVariables({
      '--bgColor': '#EAEAEA',
      '--bgColorArea': 'rgba(236, 236, 236, 0.5)',
      '--black': '#000000',
      '--white': '#ffffff',
      '--mainYellow': '#FEEFBE',
      '--mainYellow1': '#FDD046',
      '--textYellow': '#BF9102',
      '--bgAnimation': '#FFE38B',
      '--lightGrayHover': '#F5F5F5',
      '--grayText': '#5F5F5F',
      '--lightGrayStroke': '#E3E3E3',
      '--lightStroke': 'transparent',
      '--lightGrayVersion': '#AEAEAE',
      '--hrLine': '#E7E7E7',
      '--highlight': '#FFE79D',
      '--scroll': '#D9D9D9',
      '--scrollHover': '#BDBDBD',
      '--lightRed': '#ff9b9b',
      '--black-filter': 'invert(1) grayscale(100%) brightness(0) contrast(100%)',
      '--white-filter': 'brightness(0) invert(1)',
      '--gray-filter':  'brightness(60%) contrast(150%)',
      '--yellow-filter': 'brightness(0) saturate(100%) invert(52%) sepia(53%) saturate(2464%) hue-rotate(21deg) brightness(106%) contrast(101%);',
    });
    localStorage.setItem('theme', 'light');

  }

  setDarkMode() {
    this.setCSSVariables({
      '--bgColor': '#181818',
      '--bgColorArea': 'rgb(24, 24, 24, 0.5)',
      '--black': '#ffffff',
      '--white': '#222222',
      '--mainYellow': '#3B3626',
      '--mainYellow1': '#af8a1c',
      '--textYellow': '#CD9B00',
      '--bgAnimation': '#503c00',
      '--lightGrayHover': '#1d1d1d',
      '--grayText': '#AEAEAE',
      '--lightGrayStroke': '#333333',
      '--lightStroke': 'transparent',
      '--lightGrayVersion': '#AEAEAE',
      '--hrLine': '#313131',
      '--highlight': '#FFE79D',
      '--scroll': '#434343',
      '--scrollHover': '#7D7D7D',
      '--lightRed': '#ff9b9b',
      '--black-filter': 'brightness(0) invert(1)',
      '--white-filter': 'brightness(0) invert(1)',
      '--gray-filter':  'brightness(110%) contrast(100%)',
      '--yellow-filter': 'brightness(0) saturate(100%) invert(88%) sepia(74%) saturate(1777%) hue-rotate(320deg) brightness(101%) contrast(98%);',
    });
    localStorage.setItem('theme', 'dark');

    
  }

  setCSSVariables(variables: { [key: string]: string }) {
    for (const key in variables) {
      if (variables.hasOwnProperty(key)) {
        document.documentElement.style.setProperty(key, variables[key]);
      }
    }
  }

  // ? modal ----------------------------------------------------------
  openModal(isSettings: boolean = false) {
    if (isSettings) {
      // Open settings modal
      this.settingsModal.nativeElement.style.display = 'block';
      this.isSettingsActive = true;
    } else {
      // Open label modal
      this.modalContainer.nativeElement.style.display = 'block';
      this.isLabelsActive = true;
    }
    document.addEventListener('mousedown', this.mouseDownEvent);
  }

  hideModal(isSettings: boolean = false) {
    if (isSettings) {
      // Hide settings modal
      this.settingsModal.nativeElement.style.display = 'none';
      this.isSettingsActive = false;
    } else {
      // Hide label modal
      this.modalContainer.nativeElement.style.display = 'none';
      this.isLabelsActive = false;
    }
    document.removeEventListener('mousedown', this.mouseDownEvent);
  }

  mouseDownEvent = (event: Event) => {
    let modalEl = this.modal.nativeElement;
    let settingsModalEl = this.settingsModal.nativeElement;

    // Handle click outside label modal
    if (this.isLabelsActive && !modalEl.contains(event.target as Node) && !settingsModalEl.contains(event.target as Node)) {
      // Clicked outside label modal, so close label modal
      this.hideModal();
    }

    // Handle click outside settings modal
    if (this.isSettingsActive && !settingsModalEl.contains(event.target as Node)) {
      // Clicked outside settings modal, so close settings modal
      this.hideModal(true);
    }
  }

  // ? labels ----------------------------------------------------
  addLabel(el: HTMLInputElement) {
    if (!el) return;

    const labelName = el.value.replace(/\s+/g, '_');

    this.Shared.label.db.add({ name: labelName })
      .then(() => {
        this.labelError.nativeElement.hidden = true;
        el.value = '';
        el.focus();
      })
      .catch(x => {
        if (x.name === "ConstraintError") this.labelError.nativeElement.hidden = false;
        el.focus();
      });
  }

  editLabel(id: number) {
    this.Shared.label.id = id;
    let actions: LabelActionsT = {
      delete: () => {
        this.Shared.label.db.delete();
        this.Shared.label.db.updateAllLabels('');
      },
      update: (value: string) => {
        this.Shared.label.db.update({ name: value });
        this.Shared.label.db.updateAllLabels(value);
      }
    };
    return actions;
  }

  collapseSideBar() {
    document.querySelector('[sideBar]')?.classList.toggle('close');
  }
}
