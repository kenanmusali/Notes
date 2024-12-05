import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }

  // Method to scroll to the top
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' 
    });
  }
}
