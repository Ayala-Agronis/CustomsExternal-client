import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule],
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss'],
})
export class TopNavbarComponent implements OnInit {
  @Input() pageType: 'home' | 'inner' = 'home';

  items: MenuItem[] = [];
  isRegister = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isRegister = localStorage.getItem('isRegister') === 'true';
    this.buildMenuItems();
  }

buildMenuItems(): void {
  this.items = [
    {
      label: 'אודות',
      command: () => this.handleSectionNavigation('aboutSection'),
    },
    {
      label: 'שירות לעסקים',
      routerLink: '/business-service',
    },
    {
      label: 'מחירון',
      routerLink: '/pricing',
    },
    {
      label: 'תעריף מכס',
      routerLink: '/customs-book-query',
    },
    // {
    //   label: 'דברו איתנו',
    //   command: () => this.handleSectionNavigation('footerSection'),
    // },
  ];

  if (this.isRegister) 
    {
    this.items.push({
      label: 'אזור אישי',
      icon: 'pi pi-user',
      command: () => this.goToPersonalArea(),
    });
  }
}

  private handleSectionNavigation(sectionId: string): void {
    if (this.pageType === 'home') {
      this.scrollToSection(sectionId);
      return;
    }

    const url = `${window.location.origin}/home-page?scrollTo=${sectionId}`;
    window.open(url, '_blank');
  }

  private scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToPersonalArea(): void {
    this.router.navigate(['/personal-details'], {
      queryParams: { personalDetails: true },
    });
  }

  goToHome(): void {
    this.router.navigate(['/home-page']);
  }
}