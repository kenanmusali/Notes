import { Component, OnInit } from '@angular/core';
import {  HostListener } from '@angular/core';
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

  isToggled = false;  // Flag to track whether the sidebar is toggled

  // Method to toggle the state of 'isToggled' on click inside the sidebar
  toggleImage(event: MouseEvent): void {
    event.stopPropagation();  // Prevent click from propagating to document body
    this.isToggled = !this.isToggled;  // Toggle the value of 'isToggled' between true/false
  }

  // HostListener to listen for clicks outside the sidebar
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    const sidebarElement = document.querySelector('.SideBarAccount');
    if (sidebarElement && !sidebarElement.contains(event.target as Node)) {
      this.isToggled = false;  // Close the sidebar if click happens outside
    }
  }


  isDarkMode = false;

  toggleTheme(event: any) {
    this.isDarkMode = event.target.checked;
  }

}