import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { MessageService, Message, MenuItem } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { StepService } from '../../shared/services/step.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, MessagesModule, MenuModule, MenubarModule],
  providers: [MessageService],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  isRegister: any = false;
  msg: Message[] = [];
  user: any;
  menuItems: MenuItem[] = [];
  isClientAuthorized = true;
  showButtonMenu: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private stepService: StepService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      console.log(code);

      if (code)
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
          });
        });
    });

    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }

    this.isClientAuthorized =
      localStorage.getItem('isClientAuthorized') === 'true' || true;

    const isRegisterValue = localStorage.getItem('isRegister');
    this.isRegister = isRegisterValue === 'true';
    this.menuItems = [
      {
        label: 'מי אנחנו',
        icon: 'pi pi-info-circle',
        command: () => this.navigate('about-us'),
        // iconClass:'menu-item-spacing',
        // styleClass :'menu-item-spacing'
      },
      {
        label: 'שירות לעסקים',
        icon: 'pi pi-briefcase',
        command: () => this.navigate('business-service'),
      },
      {
        label: 'שירות ומחירים',
        icon: 'pi pi-dollar',
        command: () => this.navigate('pricing'),
      },
      {
        label: 'ספר מכס',
        icon: 'pi pi-book',
        command: () => this.navigate('customs-book-query'),
      },
      ...(this.isRegister
        ? [
            {
              label: 'משתמש ',
              icon: 'pi pi-user',
              items: [
                {
                  label: 'פרטים אישיים',
                  icon: 'pi pi-user',
                  command: () =>
                    this.router.navigate(['personal-details'], {
                      queryParams: { personalDetails: true },
                    }),
                },
                {
                  label: 'התנתקות',
                  icon: 'pi pi-sign-out',
                  command: () => this.logout(),
                },
              ],
            },
          ]
        : []),
    ];
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

    // נקה/אתחל תמיד כדי למנוע ערך ישן
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
    // this.router.navigateByUrl(`/declaration-main/${path}?type=${type}`);
  }
  navigate(destination: string) {
    if (destination == 'declaration-main') {
      localStorage.setItem('currentDecId', '');
      localStorage.setItem('maxIndex', '0');
    }
    this.router.navigateByUrl(destination);
  }

  logout() {
    // localStorage.clear();
    this.clearStorageOnLogout();
    this.isRegister = false;
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
