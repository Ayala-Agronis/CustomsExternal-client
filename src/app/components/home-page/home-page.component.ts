import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { MessageService, Message, MenuItem } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { StepService } from '../../shared/services/step.service';
import { AccordionModule } from 'primeng/accordion';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    MessagesModule,
    MenuModule,
    MenubarModule,
    AccordionModule,
    TopNavbarComponent,
  ],
  providers: [MessageService],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  msg: Message[] = [];
  user: any;
  menuItems: MenuItem[] = [];
  isClientAuthorized = true;
  showButtonMenu: boolean = false;

  private routerSub?: Subscription;

  processSteps = [
    'הזנת נתוני הצהרה',
    'הוספת מסמכים',
    'תשלום מסים ועמלת שחרור',
    'קבלת התרה ותדפיס הצהרה',
  ];

  activeProcessStep = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private stepService: StepService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      const sectionId = params['scrollTo'];

      console.log(code);
      console.log(sectionId);

      if (code) {
        this.userService.getDetails(code).subscribe((res) => {
          console.log(res);

          this.userService.loginByGoogle(res).subscribe((res: any) => {
            console.log(res);
            console.log(res.body);

            this.msg = [
              {
                severity: 'success',
                summary: '',
                detail: 'hi' + res.body.FirstName,
              },
            ];

            this.loadUserFromStorage();
            this.refreshAuthStateAndMenu();
          });
        });
      }

      if (sectionId) {
        setTimeout(() => {
          this.scrollToSection(sectionId);
        }, 300);
      }
    });

    this.loadUserFromStorage();

    this.isClientAuthorized =
      localStorage.getItem('isClientAuthorized') === 'true' || true;

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

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('user');

    if (userData) {
      this.user = JSON.parse(userData);
    } else {
      this.user = null;
    }
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

      // אם זה לא JWT רגיל, לא בודקים exp
      if (parts.length !== 3) {
        return false;
      }

      let payloadBase64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      while (payloadBase64.length % 4) {
        payloadBase64 += '=';
      }

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

  private buildMenuItems(): void {
    this.menuItems = [
      {
        label: 'אודות',
        command: () => this.scrollToSection('aboutSection'),
      },
      {
        label: 'שירות לעסקים',
        command: () => this.navigate('business-service'),
      },
      {
        label: 'מחירון',
        command: () => this.navigate('pricing'),
      },
      {
        label: 'תעריף מכס',
        command: () => this.openCustomsBookInNewTab(),
      },
      // {
      //   label: 'דברו איתנו',
      //   command: () => this.scrollToSection('footerSection'),
      // },
    ];

    if (this.isLoggedIn) {
      this.menuItems.push({
        label: 'אזור אישי',
        icon: 'pi pi-user',
        items: [
          {
            label: 'פרטים אישיים',
            icon: 'pi pi-user-edit',
            command: () => this.goToPersonalDetails(),
          },
          {
            label: 'התנתקות',
            icon: 'pi pi-power-off',
            command: () => this.logout(),
          },
        ],
      });
    }
  }

  private goToPersonalDetails(): void {
    if (!this.hasValidToken()) {
      this.refreshAuthStateAndMenu();
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['personal-details'], {
      queryParams: { personalDetails: true },
    });
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToProcessSection() {
    this.scrollToSection('processSection');
  }

  openCustomsBookInNewTab() {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/customs-book-query']),
    );

    window.open(url, '_blank');
  }

  openMail() {
    const gmailUrl =
      'https://mail.google.com/mail/?view=cm&fs=1&to=office@customsil.co.il';

    const newWindow = window.open(gmailUrl, '_blank');

    if (!newWindow) {
      window.location.href = 'mailto:office@customsil.co.il';
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToStart() {
    this.router.navigate(['/login']);
  }

  footerNavigate(destination: string) {
    switch (destination) {
      case 'about':
        this.scrollToSection('aboutSection');
        break;
      case 'book':
        this.openCustomsBookInNewTab();
        break;
      case 'products':
        this.scrollToSection('productsSection');
        break;
      default:
        this.navigate(destination);
        break;
    }
  }

  toggleButtonMenu() {
    this.showButtonMenu = !this.showButtonMenu;
  }

  navigateToNewDeclaration(type: string) {
    localStorage.setItem('currentDecId', '');
    localStorage.setItem('CustomsStatus', '');
    localStorage.setItem('activeIndex', '0');
    localStorage.setItem('maxIndex', '0');
    this.stepService.updateMaxIndex(0);

    localStorage.setItem('decType', '');

    let path = '';

    switch (type) {
      case 'import':
        path = 'dec-form';
        localStorage.setItem('decType', 'regular');
        break;
      case 'transshipment':
        path = 'dec-form-ts';
        localStorage.setItem('decType', 'tr');
        break;
      case 'export':
        path = 'dec-form-export';
        break;
      default:
        path = 'dec-form';
        localStorage.setItem('decType', 'regular');
    }

    console.log(path);

    this.router.navigate([`declaration-main/${path}`], {
      queryParams: { type },
    });
  }

  navigate(destination: string) {
    if (destination == 'declaration-main') {
      localStorage.setItem('currentDecId', '');
      localStorage.setItem('maxIndex', '0');
    }

    this.router.navigateByUrl(destination);
  }

  logout() {
    this.clearStorageOnLogout();
    this.user = null;
    this.isLoggedIn = false;
    this.refreshAuthStateAndMenu();
    this.router.navigate(['/login']);
  }

  private clearStorageOnLogout(): void {
    const keysToKeep = [
      'customsCargoIDType',
      'customsChargingCountry',
      'customsCountryExport',
      'customsFacilityID',
      'customsUnpackingSite',
    ];

    const prefixesToKeep = ['chargingPorts_'];

    const savedValues: Record<string, string> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key) continue;

      const shouldKeepByName = keysToKeep.includes(key);
      const shouldKeepByPrefix = prefixesToKeep.some((prefix) =>
        key.startsWith(prefix),
      );

      if (shouldKeepByName || shouldKeepByPrefix) {
        const value = localStorage.getItem(key);

        if (value !== null) {
          savedValues[key] = value;
        }
      }
    }

    localStorage.clear();

    for (const [key, value] of Object.entries(savedValues)) {
      localStorage.setItem(key, value);
    }
  }
}