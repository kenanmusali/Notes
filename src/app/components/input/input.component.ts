import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Input, HostListener, Renderer2 } from '@angular/core';
import { NoteI, CheckboxI } from '../../interfaces/notes';
import { bgImages, bgColors } from 'src/app/interfaces/tooltip';
import { SharedService } from 'src/app/services/shared.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LabelI } from 'src/app/interfaces/labels';

type InputLengthI = { title?: number, body?: number, cb?: number }

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
  // Declare formatVisibility to track the visibility state of format sections
  formatVisibility: { format: boolean; align: boolean; font: boolean; textSpacingY: boolean; textSpacingX: boolean; textCase: boolean; textSize: boolean; textList: boolean; textShortcut: boolean;} = {
    format: false,
    align: false,
    font: false,
    textSpacingY: false,
    textSpacingX: false,
    textCase: false,
    textSize: false,
    textList: false,
    textShortcut: false,
  };

  // Properties for note data, checkboxes, and labels
  @Input() isEditing = false;
  @Input() noteToEdit: NoteI = {} as NoteI;

  checkBoxes: CheckboxI[] = [];
  labels: LabelI[] = [];

  // State for different flags like archived, trashed, etc.
  isArchived = false;
  isTrashed = false;
  isCboxCompletedListCollapsed = false;

  // Subjects to track visibility of checkboxes and input length
  isCbox = new BehaviorSubject<boolean>(false);
  inputLength = new BehaviorSubject<InputLengthI>({ title: 0, body: 0, cb: 0 });

  // Background colors and images (for tooltips)
  bgColors = bgColors;
  bgImages = bgImages;

  // More menu items
  moreMenuEls = {
    delete: { disabled: true },
    copy: { disabled: true },
    checkbox: { value: 'Show checkboxes' },
  };

  @ViewChild("main") main!: ElementRef<HTMLDivElement>;
  @ViewChild("notePlaceholder") notePlaceholder!: ElementRef<HTMLDivElement>;
  @ViewChild("noteMain") noteMain!: ElementRef<HTMLDivElement>;
  @ViewChild("noteContainer") noteContainer!: ElementRef<HTMLDivElement>;
  @ViewChild("noteTitle") noteTitle!: ElementRef<HTMLDivElement>;
  @ViewChild("noteBody") noteBody?: ElementRef<HTMLDivElement>;
  @ViewChild("notePin") notePin!: ElementRef<HTMLDivElement>;
  @ViewChild("cboxInput") cboxInput!: ElementRef<HTMLDivElement>;
  @ViewChild("cboxPh") cboxPh?: ElementRef<HTMLDivElement>;
  @ViewChild("moreMenuTtBtn") moreMenuTtBtn?: ElementRef<HTMLDivElement>;
  @ViewChild('noteTemplate') noteTemplate!: ElementRef<HTMLDivElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('labelMenuTt', { static: false }) labelMenuTt!: ElementRef;


  imageElementToChange?: HTMLImageElement;

  constructor(private cd: ChangeDetectorRef, public Shared: SharedService, private renderer: Renderer2, private el: ElementRef) { }

  toggleFormatText(event: MouseEvent, type: 'format' | 'align' | 'font' | 'textSpacingY' | 'textSpacingX' | 'textCase' | 'textSize' | 'textList' | 'textShortcut'): void {
    if (this.formatVisibility[type]) {
      this.formatVisibility[type] = false;
    } else {
      this.formatVisibility.format = false;
      this.formatVisibility.align = false;
      this.formatVisibility.font = false;
      this.formatVisibility.textSpacingY = false;
      this.formatVisibility.textSpacingX = false;
      this.formatVisibility.textCase = false;
      this.formatVisibility.textSize = false;
      this.formatVisibility.textList = false;
      this.formatVisibility.textShortcut = false;
      this.formatVisibility[type] = true;
    }
    event.stopPropagation(); 
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.el.nativeElement.querySelector('.FormatText')?.contains(event.target);

    if (!clickedInside) {
      this.formatVisibility.format = false;
      this.formatVisibility.align = false;
      this.formatVisibility.font = false;
      this.formatVisibility.textSpacingY = false;
      this.formatVisibility.textSpacingX = false;
      this.formatVisibility.textCase = false;
      this.formatVisibility.textSize = false;
      this.formatVisibility.textList = false;
      this.formatVisibility.textShortcut = false;
    }
  }

  addImage(event: any, imgElement?: HTMLImageElement) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.imageElementToChange) {
          this.imageElementToChange.src = e.target.result;
          this.imageElementToChange = undefined;
        } else {
          const imgDiv = document.createElement('div');
          imgDiv.style.display = 'flex';
          imgDiv.style.flexDirection = 'row';
          imgDiv.style.alignItems = 'center';
          imgDiv.style.gap = '1rem';
  
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.maxWidth = '20rem';
          img.style.height = 'auto';
          img.style.borderRadius = '12px';
          img.style.border = '1px solid var(--lightGrayStroke)';
          img.style.padding = '0.3rem';
  
          imgDiv.appendChild(img);
  
          const createIconsContainer = (imgElement: HTMLImageElement, imgDiv: HTMLElement) => {
            const iconsContainer = document.createElement('div');
            iconsContainer.style.display = 'flex';
            iconsContainer.style.flexDirection = 'column';
            iconsContainer.style.alignItems = 'center';
            iconsContainer.style.gap = '0.5rem';
  
            const delIcon = document.createElement('span');
            delIcon.classList.add('img-delete');
            delIcon.innerHTML = '<img src="../../../assets/images/Icon/Trash.svg" alt="Delete Icon">';
            delIcon.style.cursor = 'pointer';
            delIcon.innerHTML = '<img src="../../../assets/images/Icon/Trash.svg" alt="Delete Icon">';
          delIcon.style.cursor = 'pointer';
          delIcon.style.backgroundColor = 'var(--white)';
          delIcon.style.border = '1px solid var(--lightGrayStroke)';
          delIcon.style.outline = '1px solid var(--lightStroke)';
          delIcon.style.borderRadius = '100px';
          delIcon.style.width = '35px';
          delIcon.style.height = '35px';
          delIcon.style.display = 'flex';  
          delIcon.style.justifyContent = 'center';  
          delIcon.style.alignItems = 'center';
            delIcon.onclick = () => {
              imgDiv.remove();
              this.imageElementToChange = undefined;
            };
  
            const changeIcon = document.createElement('span');
            changeIcon.classList.add('img-change');
            changeIcon.innerHTML = '<img src="../../../assets/images/Icon/Replace.svg" alt="Replace Icon">';
            changeIcon.style.cursor = 'pointer';
            changeIcon.style.backgroundColor = 'var(--white)';
            changeIcon.style.border = '1px solid var(--lightGrayStroke)';
            changeIcon.style.outline = '1px solid var(--lightStroke)';
            changeIcon.style.borderRadius = '100px';
            changeIcon.style.width = '35px';
            changeIcon.style.height = '35px';
            changeIcon.style.display = 'flex';  
            changeIcon.style.justifyContent = 'center';  
            changeIcon.style.alignItems = 'center';
            changeIcon.onclick = () => {
              this.imageElementToChange = imgElement;
              this.imageInput.nativeElement.click();
            };
  
            const downloadIcon = document.createElement('span');
            downloadIcon.classList.add('img-download');
            downloadIcon.innerHTML = '<img src="../../../assets/images/Icon/Download.svg" alt="Download Icon">';
            downloadIcon.style.cursor = 'pointer';
            downloadIcon.style.backgroundColor = 'var(--white)';
            downloadIcon.style.border = '1px solid var(--lightGrayStroke)';
            downloadIcon.style.outline = '1px solid var(--lightStroke)';
            downloadIcon.style.borderRadius = '100px';
            downloadIcon.style.width = '35px';
            downloadIcon.style.height = '35px';
            downloadIcon.style.display = 'flex';  
            downloadIcon.style.justifyContent = 'center';  
            downloadIcon.style.alignItems = 'center';
            downloadIcon.onclick = () => {
              const link = document.createElement('a');
              link.href = imgElement.src;
              const fileType = file.type.split('/')[1];
              link.download = `downloaded-image.${fileType}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };
  
            const printIcon = document.createElement('span');
            printIcon.classList.add('img-print');
            printIcon.innerHTML = '<img src="../../../assets/images/Icon/Print.svg" alt="Print Icon">';
            printIcon.style.cursor = 'pointer';
            printIcon.style.backgroundColor = 'var(--white)';
            printIcon.style.border = '1px solid var(--lightGrayStroke)';
            printIcon.style.outline = '1px solid var(--lightStroke)';
            printIcon.style.borderRadius = '100px';
            printIcon.style.width = '35px';
            printIcon.style.height = '35px';
            printIcon.style.display = 'flex';  
            printIcon.style.justifyContent = 'center';  
            printIcon.style.alignItems = 'center';

            printIcon.onclick = () => {
              const printContainer = document.createElement('div');
              printContainer.style.display = 'none';
            
              // Create a new image element for the print container each time the print icon is clicked
              const printImage = document.createElement('img');
              printImage.src = img.src;  // Always use the current image's src
              printImage.style.maxWidth = '100%';  // Adjust styling as needed
              printImage.style.height = 'auto';
            
              // Append the image to the print container
              printContainer.appendChild(printImage);
            
              // Append the container to the body (optional, for debugging)
              document.body.appendChild(printContainer);
            
              // Open a print window with only the image content
              const printWindow = window.open('', '', 'height=600,width=800');
            
           
              if (printWindow) {
                printWindow.document.write('<html><head><title>Print Image</title></head><body>');
                printWindow.document.write(printContainer.innerHTML); 
                printWindow.document.write('</body></html>');
                printWindow.document.close();  
                printWindow.print();  
            
          
                printWindow.onafterprint = () => {
                  document.body.removeChild(printContainer);
                };
              } else {
                console.error('Failed to open print window');
              }
            };
            
            

            
  
            const duplicateIcon = document.createElement('span');
            duplicateIcon.classList.add('img-duplicate');
            duplicateIcon.innerHTML = '<img src="../../../assets/images/Icon/Duplicate.svg" alt="Duplicate Icon">';
            duplicateIcon.style.cursor = 'pointer';
            duplicateIcon.style.backgroundColor = 'var(--white)';
            duplicateIcon.style.border = '1px solid var(--lightGrayStroke)';
            duplicateIcon.style.outline = '1px solid var(--lightStroke)';
            duplicateIcon.style.borderRadius = '100px';
            duplicateIcon.style.width = '35px';
            duplicateIcon.style.height = '35px';
            duplicateIcon.style.display = 'flex';  
            duplicateIcon.style.justifyContent = 'center';  
            duplicateIcon.style.alignItems = 'center';
            duplicateIcon.onclick = () => {
              const duplicateImgDiv = document.createElement('div');
              duplicateImgDiv.style.display = 'flex';
              duplicateImgDiv.style.flexDirection = 'row';
              duplicateImgDiv.style.alignItems = 'center';
              duplicateImgDiv.style.gap = '1rem';
  
              const duplicateImg = imgElement.cloneNode(true) as HTMLImageElement;
  
              duplicateImgDiv.appendChild(duplicateImg);
  
              const newIconsContainer = createIconsContainer(duplicateImg, duplicateImgDiv);
              duplicateImgDiv.appendChild(newIconsContainer);
  
              if (imgDiv.parentElement) {
                imgDiv.parentElement.appendChild(duplicateImgDiv);
  
                // Create a new text note for the duplicated image
                const textDiv = document.createElement('div');
                textDiv.style.marginTop = '1rem';
  
                const textElement = document.createElement('div');
                textElement.textContent = 'Take a note...'; // Add duplicate text
                textDiv.appendChild(textElement);
  
                imgDiv.parentElement.appendChild(textDiv);
              }
            };
  
            iconsContainer.appendChild(delIcon);
            iconsContainer.appendChild(changeIcon);
            iconsContainer.appendChild(downloadIcon);
            iconsContainer.appendChild(printIcon);
            iconsContainer.appendChild(duplicateIcon);
  
            return iconsContainer;
          };
  
          const iconsContainer = createIconsContainer(img, imgDiv);
          imgDiv.appendChild(iconsContainer);
  
          if (this.noteBody && this.noteBody.nativeElement) {
            this.noteBody.nativeElement.appendChild(imgDiv);
  
            // Add "Take a note..." text for the first image
            const textDiv = document.createElement('div');
            textDiv.style.marginTop = '1rem';
  
            const textElement = document.createElement('div');
            textElement.textContent = 'Take a note...';
            textDiv.appendChild(textElement);
  
            this.noteBody.nativeElement.appendChild(textDiv);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
  
  toggleNoteVisibility(condition: boolean) {
    if (condition) {
      this.notePlaceholder.nativeElement.hidden = true; this.noteMain.nativeElement.hidden = false
    } else {
      this.notePlaceholder.nativeElement.hidden = false; this.noteMain.nativeElement.hidden = true
    }
  }


  toggleLabelMenu(event: MouseEvent) {
    // Prevent event propagation to allow outside click detection to work
    event.stopPropagation();
    const element = this.labelMenuTt.nativeElement;
    const isTooltipOpen = element.getAttribute('data-is-tooltip-open') === 'true';
    element.setAttribute('data-is-tooltip-open', (!isTooltipOpen).toString());
  }
  
  closeLabelMenu() {
    const element = this.labelMenuTt.nativeElement;
    element.setAttribute('data-is-tooltip-open', 'false');
  }
  
  
  handleClickOutside(event: MouseEvent) {
    const element = this.labelMenuTt.nativeElement;
    
    // Check if the click is outside the tooltip (and not on the tooltip)
    if (element && !element.contains(event.target as Node)) {
      // Close the tooltip if outside click detected
      this.closeLabelMenu();
    }
  }
  
  
  
  notePhClick() {
    this.toggleNoteVisibility(true)
    if (this.isCbox.value) this.cboxPh?.nativeElement.focus()
    else this.noteBody?.nativeElement.focus()
    if (!this.isEditing) {
      this.inputLength.next({ title: 0, body: 0, cb: 0 })
      document.addEventListener('mousedown', this.mouseDownEvent)
    }
    this.labels = JSON.parse(JSON.stringify(this.Shared.label.list))
  }

  mouseDownEvent = (event: Event) => {
    if (this.isEditing) return
    let el = this.main.nativeElement
    let isTooltipOpen: any = document.querySelector('[data-is-tooltip-open="true"]')
    // if tooltip is open, we close is
    if (isTooltipOpen !== null) {
      if (!(el as any).contains(event.target) && !isTooltipOpen.contains(event.target)) { }
    }
    // else we close the note
    else if (!(el as any).contains(event.target)) {
      this.saveNote(); this.closeNote()
    }
  }

  closeNote() {
    this.toggleNoteVisibility(false)
    document.removeEventListener('mousedown', this.mouseDownEvent)
    this.reset()
  }

  //? note  -----------------------------------------------------


  async saveNote() {
    this.cboxInput?.nativeElement.blur()
    let noteObj: NoteI = {
      noteTitle: this.noteTitle.nativeElement.innerHTML,
      noteBody: this.noteBody?.nativeElement.innerHTML ? this.noteBody?.nativeElement.innerHTML : '',
      pinned: this.notePin.nativeElement.dataset['pinned'] === "true", // converting string to bool,
      bgColor: this.noteMain.nativeElement.style.backgroundColor,
      bgImage: this.noteContainer.nativeElement.style.backgroundImage,
      checkBoxes: this.checkBoxes,
      isCbox: this.isCbox.value,
      labels: this.labels.filter(x => x.added),
      archived: this.isArchived,
      trashed: this.isTrashed
    }
    if (noteObj.noteTitle.length || noteObj.noteBody && noteObj.noteBody?.length || this.checkBoxes.length) {
      if (this.isEditing) {
        this.Shared.note.db.update(noteObj)
        this.Shared.closeModal.next(true)
      } else {
        let id = await this.Shared.note.db.add(noteObj)
        if (this.isArchived) {
          this.Shared.snackBar({ action: 'archived', opposite: 'unarchived' }, { archived: false }, id)
        }
        if (this.isTrashed) {
          this.Shared.snackBar({ action: 'trashed', opposite: 'untrashed' }, { trashed: false }, id)
        }
        this.closeNote()
      }
    }
  }


  reset() {
    this.noteTitle.nativeElement.innerHTML = ''
    if (this.noteBody) this.noteBody.nativeElement.innerHTML = ''
    this.notePin.nativeElement.dataset['pinned'] = 'false'
    this.noteContainer.nativeElement.style.backgroundImage = ''
    this.noteMain.nativeElement.style.backgroundColor = ''
    this.noteMain.nativeElement.style.borderColor = ''
    //
    this.checkBoxes = []
    this.isCbox.next(false)
    this.isArchived = false
    this.isTrashed = false
    this.isCboxCompletedListCollapsed = false
    this.inputLength.next({ title: 0, body: 0, cb: 0 })
  }


  pasteEvent(event: ClipboardEvent) {
    // to remove text styling -> before : https://prnt.sc/a7M5g-kbofba, after : https://prnt.sc/D7KEV6rdlm_7
    event.preventDefault()
    let text = event.clipboardData?.getData('text/plain');
    let target = event.target as HTMLDivElement
    target.innerText += text
    let sel = window.getSelection()
    sel?.selectAllChildren(target)
    sel?.collapseToEnd()
    // document.execCommand('insertText', false, text)
    // ! TODO, when u paste, yji fel <br> => so ywali maybanch
  }


  //? checkboxes  --------------------------------------------------

  cboxPhKeyDown($event: KeyboardEvent) {
    $event.preventDefault()
    const isLetter = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"²^\\|,.<>\/?éèçµ]$/i.test($event.key)
    // ex : if he clicked the f1 btn for example, nothing would happen, otherwise : 
    if (!isLetter) return
    let enteredValue = $event.key
    this.addCheckBox(enteredValue) // a new checkbox will appear in the html
    this.cd.detectChanges()
    let el = document.querySelector(`[data-cbox-last="true"]`)
    // we move the cursor to the end, so the user will just continue what he typed before
    let sel = window.getSelection()
    if (el) sel?.selectAllChildren(el)
    sel?.collapseToEnd()
  }

  addCheckBox(data: string) {
    this.checkBoxes.push({
      done: false,
      data: data,
      id: this.checkBoxes.length
    })
    this.inputLength.next({ ...this.inputLength.value, cb: this.checkBoxes.length })
  }

  cBoxKeyDown($event: KeyboardEvent, id: number) {
    let target = $event.target as HTMLDivElement
    if ($event.key === 'Enter') {
      $event.preventDefault()
      this.cboxPh!.nativeElement.focus()
    }
    if ($event.key === 'Backspace' && target.innerText.length === 0) {
      this.cboxPh!.nativeElement.focus()
      this.cboxTools(id).remove()
    }
  }


  cboxTools(id: number) {
    let i = this.checkBoxes.findIndex(x => x.id === id)
    let actions = {
      remove: () => {
        this.checkBoxes.splice(i, 1)
        this.inputLength.next({ ...this.inputLength.value, cb: this.checkBoxes.length })
      },
      check: () => {
        this.checkBoxes[i].done = !this.checkBoxes[i].done
      },
      update: (el: HTMLDivElement) => {
        let elValue = el?.innerHTML
        this.checkBoxes[i].data = elValue
      }
    }
    return actions
  }

  //? isEditing  -----------------------------------------------------------

  innerData(note: NoteI) {
    this.notePhClick()
    this.noteTitle.nativeElement.innerHTML = note.noteTitle
    if (this.noteBody) this.noteBody.nativeElement.innerHTML = note.noteBody!
    this.notePin.nativeElement.dataset['pinned'] = String(note.pinned)
    this.noteContainer.nativeElement.style.backgroundImage = note.bgImage
    this.noteMain.nativeElement.style.backgroundColor = note.bgColor
    this.noteMain.nativeElement.style.borderColor = note.bgColor
    if (note.checkBoxes) this.checkBoxes = note.checkBoxes
    this.isCbox.next(note.isCbox)
    this.isArchived = note.archived
    this.isTrashed = note.trashed
    //
    this.inputLength.next({ title: note.noteTitle.length, body: note.noteBody ? note.noteBody?.length : 0, cb: note.checkBoxes?.length! })
    note.labels.forEach(noteLabel => {
      let label = this.labels.find(x => x.name === noteLabel.name)
      if (label) label.added = noteLabel.added
    })
    this.cd.detectChanges()
  }

  //? tooltip  -----------------------------------------------------------

  openTooltip(button: HTMLDivElement, tooltipEl: HTMLDivElement) {
    this.Shared.createTooltip(button, tooltipEl)
  }

  moreMenu(tooltipEl: HTMLDivElement) {
    let actions = {
      trash: () => {
        if (this.isEditing) {
          this.Shared.note.db.trash()
          this.Shared.closeModal.next(true)
        } else {
          this.isTrashed = true
          this.saveNote()
        }
      },
      clone: () => {
        this.saveNote()
      },
      toggleCbox: () => {
        this.isCbox.next(!this.isCbox.value)
      }
    }
    this.Shared.closeTooltip(tooltipEl)
    return actions
  }

  colorMenu = {
    bgColor: (data: bgColors) => {
      this.noteMain.nativeElement.style.backgroundColor = data
      this.noteMain.nativeElement.style.borderColor = data
    },
    bgImage: (data: bgImages) => {
      this.noteContainer.nativeElement.style.backgroundImage = `url(${data})`
    }
  }
 
  updateInputLength(type: InputLengthI) {
    if (type.title != undefined) this.inputLength.next({ ...this.inputLength.value, title: type.title })
    if (type.body != undefined) this.inputLength.next({ ...this.inputLength.value, body: type.body })
  }
  saveNoteSubscription?: Subscription
  ngAfterViewInit() {
    if (this.isEditing) { this.saveNoteSubscription = this.Shared.saveNote.subscribe(x => { if (x) this.saveNote() }) }
    //? ----------------------------------------------------------------
    this.isCbox.subscribe(value => {
      if (value) this.moreMenuEls.checkbox.value = 'Hide checkboxes'
      else this.moreMenuEls.checkbox.value = 'Show checkboxes'
    })
    //? ----------------------------------------------------------------
    this.inputLength.subscribe(x => {
      if ((x.title) || (x.body) || (x.cb)) {
        this.moreMenuEls.delete.disabled = false
        this.moreMenuEls.copy.disabled = false
      } else {
        this.moreMenuEls.delete.disabled = true
        this.moreMenuEls.copy.disabled = true
      }
    })
    if (this.isEditing) {
      this.innerData(this.noteToEdit)
    }
  }

  // ngOnInit(): void { }

  // ngOnDestroy() { this.saveNoteSubscription?.unsubscribe() }

  ngOnInit() {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }
  
  ngOnDestroy() {
    this.saveNoteSubscription?.unsubscribe() 
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

}