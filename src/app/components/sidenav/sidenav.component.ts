import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { LabelActionsT } from 'src/app/interfaces/labels';
import { Router } from '@angular/router';
import { bgColors, bgImages } from '../../interfaces/tooltip';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css', './modal.css'],
})
export class NavComponent implements OnInit {
  @ViewChild("modalContainer") modalContainer!: ElementRef<HTMLInputElement>;
  @ViewChild("modal") modal!: ElementRef<HTMLInputElement>;
  @ViewChild("settingsModal") settingsModal!: ElementRef<HTMLInputElement>;
  @ViewChild("keyModal") keyModal!: ElementRef<HTMLInputElement>;
  @ViewChild("calendarModal") calendarModal!: ElementRef<HTMLInputElement>;
  @ViewChild("labelInput") labelInput!: ElementRef<HTMLInputElement>;
  @ViewChild("labelError") labelError!: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  // Flags to track the active state of "Add labels" and "Settings"
  isLabelsActive: boolean = false;
  isSettingsActive: boolean = false;
  isKeyActive: boolean = false;
  isCalendarActive: boolean = false;
  showHoverIcon: boolean = false;
  // New property to handle dark mode state
  isDarkMode: boolean = false;
  isContainerVisible: boolean = true;  // New property to track container visibility

  constructor(public Shared: SharedService, public router: Router) { this.generateDates();
    this.generateYearRange();}

    currentMonth: string = 'January';
    currentYear: number = new Date().getFullYear();
    dates: { date: number, isCurrentDay: boolean }[] = [];
    months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    yearRange: number[] = []; // Range of years from 1990 to 3000
    viewMode: 'month' | 'year' | 'date' = 'date'; // toggle between month, year, and date views
  
    generateDates() {
      const firstDay = new Date(this.currentYear, this.months.indexOf(this.currentMonth), 1);
      const lastDay = new Date(this.currentYear, this.months.indexOf(this.currentMonth) + 1, 0);
    
      this.dates = [];
      const startDay = firstDay.getDay();
    
      // Get the previous month's last day
      const prevMonth = this.months.indexOf(this.currentMonth) === 0 ? 11 : this.months.indexOf(this.currentMonth) - 1;
      const prevMonthLastDate = new Date(this.currentYear, prevMonth + 1, 0).getDate();
    
      // Add days from the previous month to fill in the empty spaces
      for (let i = prevMonthLastDate - startDay + 1; i <= prevMonthLastDate; i++) {
        this.dates.push({ date: i, isCurrentDay: false }); // Add previous month's dates
      }
    
      // Add current month's dates
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const isToday = i === new Date().getDate() && this.currentMonth === this.months[new Date().getMonth()] && this.currentYear === new Date().getFullYear();
        this.dates.push({ date: i, isCurrentDay: isToday }); // Add current month's dates with current day check
      }
    
      // Calculate if there are remaining slots after the last day of the current month
      const remainingSlots = 7 - (this.dates.length % 7);
    
      // If there are remaining slots (space left in the current row), fill them with "slot" values
      if (remainingSlots < 7) {
        for (let i = 1; i <= remainingSlots; i++) {
          this.dates.push({ date: i, isCurrentDay: false }); // Add slots at the end of the calendar to fill the row
        }
      }
    }
    
    

  
    generateYearRange() {
      // Generate a year range from 1990 to 3000
      this.yearRange = [];
      for (let year = 1990; year <= 3000; year++) {
        this.yearRange.push(year);
      }
    }
  

  
    toggleView(view: 'month' | 'year') {
      if (view === 'year') {
        this.generateYearRange(); // Ensure the year range is generated each time the year view is toggled
        this.viewMode = 'year'; // Show year range from 1990 to 3000
      } else {
        this.viewMode = 'month'; // Show 12 months when you click the month
      }
    }
    
    selectMonth(month: string) {
      this.currentMonth = month;
      if (this.currentMonth !== new Date().toLocaleString('default', { month: 'long' })) {
        this.showHoverIcon = true;  // Display hover icon if month is not the current month
      }
      this.viewMode = 'date'; // After selecting a month, show the date grid
      this.generateDates();
    }
    
    selectYear(year: number) {
      this.currentYear = year;
      if (this.currentYear !== new Date().getFullYear()) {
        this.showHoverIcon = true;  // Display hover icon if year is not the current year
      }
      this.viewMode = 'date'; // After selecting a year, show the 12 months
      this.generateDates();
    }
    
    resetToCurrentDate() {
      this.currentMonth = new Date().toLocaleString('default', { month: 'long' });
      this.currentYear = new Date().getFullYear();
      this.showHoverIcon = false;  // Hide the hover icon after resetting
      this.generateDates();
    }
    


  // 
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
    const savedToggleState = localStorage.getItem('isToggled');
    this.isToggled = savedToggleState === 'true';
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
      '--gray-filter': 'brightness(60%) contrast(150%)',
      '--yellow-filter': 'brightness(0) saturate(100%) invert(52%) sepia(53%) saturate(2464%) hue-rotate(21deg) brightness(106%) contrast(101%);',
      '--ColorMenuB': '#FAAFA8',
      '--ColorMenuC': '#F39F76',
      '--ColorMenuD': '#FFF8B8',
      '--ColorMenuE': '#E2F6D3',
      '--ColorMenuF': '#B4DDD3',
      '--ColorMenuG': '#D4E4ED',
      '--ColorMenuH': '#AECCDC',
      '--ColorMenuI': '#D3BFDB',
      '--ColorMenuJ': '#F6E2DD',
      '--ColorMenuK': '#E9E3D4',
      
    });
    localStorage.setItem('theme', 'light');
//  document.body.style.backgroundImage = `url(${bgImages.B})`;
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
      '--gray-filter': 'brightness(110%) contrast(100%)',
      '--yellow-filter': 'brightness(0) saturate(100%) invert(88%) sepia(74%) saturate(1777%) hue-rotate(320deg) brightness(101%) contrast(98%);',
      '--ColorMenuB': '#77172e',
      '--ColorMenuC': '#692b17',
      '--ColorMenuD': '#7c4a03',
      '--ColorMenuE': '#264d3b',
      '--ColorMenuF': '#0c625d',
      '--ColorMenuG': '#256377',
      '--ColorMenuH': '#284255',
      '--ColorMenuI': '#472e5b',
      '--ColorMenuJ': '#6c394f',
      '--ColorMenuK': '#4b443a',
  
    });
    localStorage.setItem('theme', 'dark');

    // document.body.style.backgroundImage = `url(${bgImages.B})`;
  }

  setCSSVariables(variables: { [key: string]: string }) {
    for (const key in variables) {
      if (variables.hasOwnProperty(key)) {
        document.documentElement.style.setProperty(key, variables[key]);
      }
    }
  }

  // ? modal ----------------------------------------------------------
  openModal(isSettings: boolean = false, isKey: boolean = false, isCalendar: boolean = false) {
    if (isSettings) {
      // Open settings modal
      this.settingsModal.nativeElement.style.display = 'block';
      this.isSettingsActive = true;
    } else if (isKey) {
      // Open key modal
      this.keyModal.nativeElement.style.display = 'block';
      this.isKeyActive = true;
    } else if (isCalendar) {
      // Open calendar modal
      this.calendarModal.nativeElement.style.display = 'block';
      this.isCalendarActive = true;
    } else {
      // Open label modal
      this.modalContainer.nativeElement.style.display = 'block';
      this.isLabelsActive = true;
    }
    document.addEventListener('mousedown', this.mouseDownEvent);
  }
  
  
  hideModal(isSettings: boolean = false, isKey: boolean = false, isCalendar: boolean = false) {
    if (isSettings) {
      // Hide settings modal
      this.settingsModal.nativeElement.style.display = 'none';
      this.isSettingsActive = false;
    } else if (isKey) {
      // Hide key modal
      this.keyModal.nativeElement.style.display = 'none';
      this.isKeyActive = false;
    } else if (isCalendar) {
      // Hide key modal
      this.calendarModal.nativeElement.style.display = 'none';
      this.isCalendarActive = false;
    } else {
      // Hide label modal
      this.modalContainer.nativeElement.style.display = 'none';
      this.isLabelsActive = false;
    }
    document.removeEventListener('mousedown', this.mouseDownEvent);
  }
  
  mouseDownEvent = (event: Event) => {
    const modalEl = this.modal.nativeElement;
    const settingsModalEl = this.settingsModal.nativeElement;
    const keyModalEl = this.keyModal.nativeElement;
    const calendarModalEl = this.calendarModal.nativeElement;
  
    // Handle click outside label modal
    if (this.isLabelsActive && !modalEl.contains(event.target as Node)) {
      this.hideModal();
    }
  
    // Handle click outside settings modal
    if (this.isSettingsActive && !settingsModalEl.contains(event.target as Node)) {
      this.hideModal(true);
    }
  
    // Handle click outside key modal
    if (this.isKeyActive && !keyModalEl.contains(event.target as Node)) {
      this.hideModal(false, true);
    }
  
    // Handle click outside calendar modal
    if (this.isCalendarActive && !calendarModalEl.contains(event.target as Node)) {
      this.hideModal(false, false, true); // Pass correct arguments for calendar modal
    }
  };
  

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


  isToggled = false;



  toggleSidebar() {
    this.isToggled = !this.isToggled;
    localStorage.setItem('isToggled', this.isToggled.toString());
  }
}

