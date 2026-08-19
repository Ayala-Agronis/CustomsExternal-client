import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule],
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss'],
})
export class TopNavbarComponent implements OnInit, OnDestroy {
  @Input() pageType: 'home' | 'inner' = 'home';

  items: MenuItem[] = [];
  isLoggedIn = false;

  private routerSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.refreshAuthStateAndMenu();

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.refreshAuthStateAndMenu();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private refreshAuthStateAndMenu(): void {
    this.isLoggedIn = this.hasValidToken();
    this.buildMenuItems();
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('authToken');

    if (!token) {
      localStorage.removeItem('isRegister');
      return false;
    }

    if (this.isJwtExpired(token)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isRegister');
      return false;
    }

    return true;
  }

  private isJwtExpired(token: string): boolean {
    try {
      const parts = token.split('.');

      // אם זה לא JWT רגיל, לא בודקים תוקף לפי exp
      if (parts.length !== 3) {
        return false;
      }

      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');

      const payload = JSON.parse(atob(payloadBase64));
      const exp = payload.exp;

      if (!exp) {
        return false;
      }

      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
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

    if (this.isLoggedIn) {
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
    // בדיקה נוספת ברגע הלחיצה
    // כדי שלא ייכנס אם הטוקן נמחק אחרי שהתפריט כבר נטען
    if (!this.hasValidToken()) {
      this.refreshAuthStateAndMenu();
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/personal-details'], {
      queryParams: { personalDetails: true },
    });
  }

  goToHome(): void {
    this.router.navigate(['/home-page']);
  }
}
