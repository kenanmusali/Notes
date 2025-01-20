import { CheckboxI, NoteI } from './../../interfaces/notes';
import { ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';

import { Component, Input, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
// @ts-ignore
import Bricks from 'bricks.js'
import { SharedService } from 'src/app/services/shared.service';
import { bgColors, bgImages } from 'src/app/interfaces/tooltip';
import { LabelI } from 'src/app/interfaces/labels';
import { ActivationEnd, NavigationEnd, Router } from '@angular/router';
@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
})
export class NotesComponent implements OnInit {

  @Input() isToggled: boolean = false;
  @ViewChild("mainContainer") mainContainer!: ElementRef<HTMLInputElement>
  @ViewChild("modalContainer") modalContainer!: ElementRef<HTMLInputElement>
  @ViewChild("modal") modal!: ElementRef<HTMLInputElement>
  @ViewChildren('noteEl') noteEl!: QueryList<ElementRef<HTMLDivElement>>
  @ViewChildren('title') title!: QueryList<ElementRef<HTMLDivElement>>
  
  selectedNotes: Set<HTMLElement> = new Set();
  selectedCount: number = 0;
  notes: HTMLElement[] = [];
  selectedEditDiv!: HTMLElement;

  constructor(public Shared: SharedService, private router: Router, private cdr: ChangeDetectorRef) { }
  //? -----------------------------------------------------
  currentPage = {
    archive: false,
    trash: false,
    label: undefined
  }
  currentPageName = ''
  labels: LabelI[] = []
  bgColors = bgColors
  bgImages = bgImages
  noteWidth = 240
  clickedNoteData: NoteI = {} as NoteI
  //? -----------------------------------------------------
  trackBy(item: any) { return item.id }

  
private isBuildingMasonry = false;

buildMasonry() {
  if (this.isBuildingMasonry) return;
  this.isBuildingMasonry = true;

  let gutter = 8; 
  let containerWidth = this.mainContainer.nativeElement.clientWidth; // Get the container's width
  let numberOfColumns = 0;
  let masonryWidth = '0px';


  if (this.Shared.noteViewType.value === 'grid') {
    // Initial noteWidth starts at 240px
    const initialNoteWidth = 240;

    numberOfColumns = Math.max(1, Math.floor(containerWidth / (initialNoteWidth + gutter)));

    const maxNoteWidth = (containerWidth - (numberOfColumns - 1) * gutter) / numberOfColumns;


    this.noteWidth = Math.max(initialNoteWidth, maxNoteWidth);

  } else {
    if (containerWidth >= 600) {
      this.noteWidth = 600;
    } else {
      this.noteWidth = containerWidth - 10;
    }
    numberOfColumns = 1; 
  }

  document.documentElement.style.setProperty('--note-width', `${this.noteWidth}px`);

  const sizes = [{ columns: numberOfColumns, gutter: gutter }];

  this.noteEl.toArray().forEach(el => {
    brikcs(el.nativeElement);
    if (el.nativeElement.style.width) masonryWidth = el.nativeElement.style.width;
  });

  function brikcs(node: HTMLDivElement) {
    const instance = Bricks({ container: node, packed: 'data-packed', sizes: sizes, position: false });
    instance.pack();
  }

  this.title.forEach(el => {
    if (this.Shared.noteViewType.value === 'list') {
      el.nativeElement.style.maxWidth = masonryWidth;
    } else {
      el.nativeElement.style.maxWidth = '';
    }
  });

  window.addEventListener('resize', this.handleResize.bind(this));

  setTimeout(() => {
    this.buildMasonry();
    this.isBuildingMasonry = false; 
  }, 300); 
}

isDarkMode: boolean = false; // or get this from the parent component, depending on your implementation

  toggleTheme(event: any) {
    this.isDarkMode = event.target.checked;
  }
  
handleResize() {

  if (!this.isBuildingMasonry) {
    this.buildMasonry();
  }
}

// Modal functions remain unchanged
openModal(clickedNote: HTMLDivElement, noteData: NoteI) {
  this.Shared.note.id = noteData.id!;
  this.clickedNoteData = noteData;
  this.clickedNoteEl = clickedNote;
  let modalContainer = this.modalContainer.nativeElement;
  let modal = this.modal.nativeElement;
  this.setModalStyling();
  setTimeout(() => { modal.removeAttribute("style"); });
  clickedNote.classList.add('hide');
  modalContainer.style.display = 'block';
  document.addEventListener('mousedown', this.mouseDownEvent);
}

clickedNoteEl!: HTMLDivElement; // needed in setModalStyling()

closeModal() {
  document.removeEventListener('mousedown', this.mouseDownEvent);
  let modalContainer = this.modalContainer.nativeElement;
  this.setModalStyling();
  setTimeout(() => {
    this.clickedNoteEl.classList.remove('hide');
    modalContainer.style.display = 'none';
  }, 300);
}


  mouseDownEvent = (event: Event) => {
    let isTooltipOpen = document.querySelector('[data-is-tooltip-open="true"]')
    let modalEL = this.modal.nativeElement
    if (!(modalEL as any).contains(event.target)) {
      if (!isTooltipOpen) {
        this.Shared.saveNote.next(true)
        this.closeModal()
      }
    }
  }

  setModalStyling() {
    let bounding = this.clickedNoteEl.getBoundingClientRect()
    let modal = this.modal.nativeElement
    modal.style.transform = `translate(${bounding.x}px, ${bounding.y}px)`
    modal.style.width = bounding.width + 'px'
    modal.style.height = bounding.height + 'px'
    modal.style.top = `0`
    modal.style.left = `0`
  }

  //? checkbox  -----------------------------------------------------------

  checkBoxTools(note: NoteI, event: Event) {
    this.Shared.note.id = note.id!
    event?.stopPropagation()
    let actions = {
      check: (cb: CheckboxI) => {
        cb.done = !cb.done
      },
      remove: (cb: CheckboxI) => {
        let index = note.checkBoxes?.findIndex(x => x === cb)
        if (index !== undefined) note.checkBoxes?.splice(index, 1)
      }
    }
    this.Shared.note.db.updateKey({ checkBoxes: note.checkBoxes })
    return actions
  }

  //? pin note  -----------------------------------------------------------

  togglePin(noteId: number, pinned: boolean) {
    this.Shared.note.id = noteId
    pinned = !pinned
    this.Shared.note.db.updateKey({ pinned: pinned })
  }

  //? labels -------------------------------------------------------------

  removeLabel(note: NoteI, label: LabelI) {
    this.Shared.note.id = note.id!
    label.added = !label.added
    this.Shared.note.db.updateKey({ labels: note.labels })
  }
  //? tooltip  -----------------------------------------------------------

  Ttbutton?: HTMLDivElement // used in moreMenu.openLabelMenu
  openTooltip(button: HTMLDivElement, tooltipEl: HTMLDivElement, noteId: number) {
    this.Shared.note.id = noteId
    this.Ttbutton = button
    this.Shared.createTooltip(button, tooltipEl)
  }

  moreMenu(tooltipEl: HTMLDivElement) {
    let actions = {
      trash: () => {
        this.Shared.note.db.trash()
      },
      clone: () => {
        this.Shared.note.db.clone()
      },
      openLabelMenu: (tooltipEl: HTMLDivElement) => {
        this.labels = JSON.parse(JSON.stringify(this.Shared.label.list))
        this.Shared.createTooltip(this.Ttbutton!, tooltipEl)
        this.Shared.note.db.get().then(note => {
          note.labels.forEach(noteLabel => {
            let label = this.labels.find(x => x.name === noteLabel.name)
            if (label) label.added = noteLabel.added
          })
        })
      }
    }
    this.Shared.closeTooltip(tooltipEl)
    return actions
  }

  colorMenu = {
    bgColor: (data: bgColors) => {
      this.Shared.note.db.updateKey({ bgColor: data })
    },
    bgImage: (data: bgImages) => {
      this.Shared.note.db.updateKey({ bgImage: `url(${data})` })
    }
  }

  labelMenu(label: LabelI) {
    label.added = !label.added
    this.Shared.note.db.updateKey({ labels: this.labels })
  }

  // ? archive page

  toggleArchive(noteId: number, archived: boolean) {
    this.Shared.note.id = noteId
    archived = !archived
    this.Shared.note.db.updateKey({ archived: archived })
    let obj = archived ? { action: 'archived', opposite: 'unarchived' } : { action: 'unrchived', opposite: 'archived' }
    this.Shared.snackBar(obj, { archived: !archived }, noteId)
  }

  // ? trash page

  removeNote(noteId: number) {
    this.Shared.note.id = noteId
    this.Shared.note.db.delete()
  }

  restoreNote(noteId: number) {
    this.Shared.note.id = noteId
    this.Shared.note.db.updateKey({ trashed: false, archived: false })
    this.Shared.snackBar({ action: 'restored', opposite: 'trashed' }, { trashed: true }, noteId)
  }
  // ?--------------------------------------------------------------

  ngAfterViewChecked() {
    this.buildMasonry()

  }

  ngOnInit(): void {
    this.Shared.closeSideBar.subscribe(() => { setTimeout(() => { this.buildMasonry() }, 200) })
    this.Shared.closeModal.subscribe(x => { if (x) this.closeModal() })
    this.Shared.noteViewType.subscribe(() => { setTimeout(() => this.buildMasonry(), 300); })
    this.router.events.subscribe(url => {
      if (url instanceof NavigationEnd) {
        url.url.includes('archive') ? this.currentPage.archive = true : this.currentPage.archive = false
        url.url.includes('trash') ? this.currentPage.trash = true : this.currentPage.trash = false
      }
      else if (url instanceof ActivationEnd) {
        this.currentPage.label = url.snapshot.params['name']
      }
      this.currentPageName = this.currentPage.label ? this.currentPage.label : this.currentPage.archive ? 'archived' : (this.currentPage.trash ? 'trashed' : 'home')
    })
  }

  selectNoteMain(noteElement: HTMLElement): void {
    if (this.selectedNotes.has(noteElement)) {
      // Deselect the note
      noteElement.classList.remove('selected');
      this.selectedNotes.delete(noteElement);
    } else {
      // Select the note
      noteElement.classList.add('selected');
      this.selectedNotes.add(noteElement);
    }
  
    // Update the selected count
    this.selectedCount = this.selectedNotes.size;
  
    // Update the divEditNote class based on selection
    const editDiv = document.querySelector('.divEditNote');
    if (editDiv) {
      if (this.selectedNotes.size > 0) {
        editDiv.classList.add('selected');
      } else {
        editDiv.classList.remove('selected');
      }
    }
  
    this.cdr.detectChanges();
  }
  


  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
  
    // Check if the click is inside any note or the divEditNote
    let clickedInsideNote = false;
    this.selectedNotes.forEach(note => {
      if (note.contains(target)) {
        clickedInsideNote = true;
      }
    });
  
    // Check if the click is inside divEditNote
    const editDiv = document.querySelector('.divEditNote');
    if (editDiv && (editDiv.contains(target) || target === editDiv)) {
      clickedInsideNote = true;
    }
  
    // If clicked outside all notes and divEditNote, deselect all
    if (!clickedInsideNote && !(target.closest('.note-container'))) {
      this.deselectAllNotes();
    }
  }
  

deselectAllNotes(): void {
    // Deselect all selected notes
    this.selectedNotes.forEach(note => note.classList.remove('selected'));
    this.selectedNotes.clear();

    // Update the selected count
    this.selectedCount = this.selectedNotes.size;

    // Remove 'selected' class from divEditNote
    const editDiv = document.querySelector('.divEditNote');
    if (editDiv) {
        editDiv.classList.remove('selected');
    }

    this.cdr.detectChanges();
}

selectAllNotes(): void {
  const allNotes = document.querySelectorAll('.note-main'); // Use a proper selector to select all notes

  allNotes.forEach(note => {
      const htmlNote = note as HTMLElement; // Type assertion to HTMLElement

      if (!this.selectedNotes.has(htmlNote)) {
          htmlNote.classList.add('selected');
          this.selectedNotes.add(htmlNote);
      }
  });

  // Update the selected count
  this.selectedCount = this.selectedNotes.size;

  // Update the divEditNote class
  const editDiv = document.querySelector('.divEditNote');
  if (editDiv) {
      editDiv.classList.add('selected');
  }

  this.cdr.detectChanges();
}

onNoteClick(event: MouseEvent, noteElement: HTMLElement): void {
    // Stop the click from propagating to the document listener
    event.stopPropagation();
    
    // Toggle the selection of the individual note
    this.selectNoteMain(noteElement);
}

handleSelectAll(): void {
    this.selectAllNotes();
}

handleDeselectAll(): void {
    this.deselectAllNotes();
}
toggleButtons(): void {
  const selectAllButton = document.getElementById('selectAllButton');
  const deselectAllButton = document.getElementById('deselectAllButton');

  if (selectAllButton && deselectAllButton) {
      if (selectAllButton.style.display === 'inline') {
          selectAllButton.style.display = 'none';
          deselectAllButton.style.display = 'flex';
      } else {
          selectAllButton.style.display = 'inline';
          deselectAllButton.style.display = 'none';
      }
  }
}

}