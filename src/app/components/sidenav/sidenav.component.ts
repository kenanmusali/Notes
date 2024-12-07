import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { LabelActionsT } from 'src/app/interfaces/labels';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css', './modal.css'],
})
export class NavComponent implements OnInit {
  @ViewChild("modalContainer") modalContainer!: ElementRef<HTMLInputElement>;
  @ViewChild("modal") modal!: ElementRef<HTMLInputElement>;
  @ViewChild("labelInput") labelInput!: ElementRef<HTMLInputElement>;
  @ViewChild("labelError") labelError!: ElementRef<HTMLInputElement>;

  // Add a flag to track the active state of "Add labels"
  isLabelsActive: boolean = false;

  constructor(public Shared: SharedService, public router: Router) { }

  // ? modal ----------------------------------------------------------
  openModal() {
    this.modalContainer.nativeElement.style.display = 'block';
    document.addEventListener('mousedown', this.mouseDownEvent);

    // Mark "Add labels" as active when the modal is opened
    this.isLabelsActive = true;
  }

  hideModal() {
    this.modalContainer.nativeElement.style.display = 'none';
    document.removeEventListener('mousedown', this.mouseDownEvent);

    // Reset active state when the modal is closed
    this.isLabelsActive = false;
  }

  mouseDownEvent = (event: Event) => {
    let modalEl = this.modal.nativeElement;
    if (!(modalEl as any).contains(event.target)) {
      this.hideModal();
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

  ngOnInit(): void {
    this.Shared.closeSideBar.subscribe(x => { if (x) this.collapseSideBar(); });
    if (window.innerWidth <= 600) {
      this.collapseSideBar();
    }
  }
}
