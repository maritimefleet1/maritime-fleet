import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- Add this import

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: true,
  imports: [CommonModule, RouterModule] // <-- Add RouterModule here
})
export class HeaderComponent {
  isMobileMenuOpen = false;

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMenu() {
    this.isMobileMenuOpen = false;
  }
}