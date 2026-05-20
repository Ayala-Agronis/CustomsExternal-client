import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StepsModule } from 'primeng/steps';
import { StepService } from '../../shared/services/step.service';
import { StepperModule } from 'primeng/stepper';
import { UserService } from '../../shared/services/user.service';
import { CustomsDataService } from '../../shared/services/customs-data.service';
import { max } from 'rxjs';

@Component({
  selector: 'app-declaration-main',
  standalone: true,
  imports: [CommonModule, StepsModule, StepperModule],
  templateUrl: './declaration-main.component.html',
  styleUrl: './declaration-main.component.scss',
})
export class DeclarationMainComponent implements OnInit {
  allSteps = [
    {
      label: 'הזנת נתוני הצהרה',
      icon: 'assets/steps/1.png',
      activeIcon: 'assets/steps/1.png',
    },
    {
      label: 'הוספת מסמכים',
      icon: 'assets/steps/2.png',
      activeIcon: 'assets/steps/6.png',
    },
    // { label: 'תשלום עמלה', icon: 'assets/steps/3.png', activeIcon: 'assets/steps/7.png' },
    // { label: 'תשלום מיסים', icon: 'assets/steps/4.png', activeIcon: 'assets/steps/8.png' },
    {
      label: 'תשלום',
      icon: 'assets/steps/3.png',
      activeIcon: 'assets/steps/7.png',
    },
    {
      label: 'קבלת התרה + תדפיס הצהרה ',
      icon: 'assets/steps/5.png',
      activeIcon: 'assets/steps/9.png',
    },
  ];

  steps: any[] = [];

  activeIndex: number = 0;
  mode: any;

  currentStep = 0;
  maxIndex: number = 0;
  typeDec: string = 'tr';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private stepService: StepService,
    private userService: UserService,
    private customsDataService: CustomsDataService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];

      if (type === 'transshipment') {
        this.typeDec = 'tr';
      } else if (type === 'import') {
        this.typeDec = 'regular';
      } else if (type === 'export') {
        this.typeDec = 'ex';
      } else if (params['Mode'] === 'e') {
        this.typeDec = localStorage.getItem('decType') || 'regular';
      } else {
        this.typeDec = localStorage.getItem('decType') || 'regular';
      }

      localStorage.setItem('decType', this.typeDec);

      this.mode = params['Mode'];

      if (this.mode !== 'e') {
        this.activeIndex = 0;
        this.maxIndex = 0;
        localStorage.setItem('activeIndex', '0');
        localStorage.setItem('maxIndex', '0');
      } else {
        this.activeIndex = +(localStorage.getItem('activeIndex') || 0);
        this.maxIndex = +(localStorage.getItem('maxIndex') || 0);
      }

      this.buildSteps();
      //this.navigateBasedOnStep(null);
    });

    this.stepService.maxIndex$.subscribe((index: any) => {
      this.maxIndex = index;
    });

    this.stepService.stepCompleted$.subscribe((data: any) => {
      if (data.direction == 'dec-form' || data.direction == 'dec-form-ts') {
        this.activeIndex = 0;
        localStorage.setItem('activeIndex', '0');
        this.cdRef.detectChanges();
      } else if (data.direction == '+') {
        this.nextStep();
      } else {
        this.previousStep();
      }
    });

    this.route.queryParams.subscribe((params) => {
      const code = params['code'];

      if (code) {
        this.userService.getDetails(code).subscribe((res) => {
          this.userService.loginByGoogle(res).subscribe((res: any) => {
            localStorage.setItem('isRegister', 'true');
            localStorage.setItem('userId', res.body.Id);

            this.customsDataService
              .GetClient$(res.body.Id)
              .subscribe((client) => {
                if (
                  client.generalCustomerDataField.costomerStatusForCAField == 6
                )
                  localStorage.setItem('isClientAuthorized', 'false');
                else localStorage.setItem('isClientAuthorized', 'true');
              });

            localStorage.setItem('user', JSON.stringify(res.body));

            if (this.typeDec === 'tr') {
              this.router.navigate(['declaration-main/dec-form-ts'], {
                queryParams: { type: 'transshipment' },
              });
            } else {
              this.router.navigate(['declaration-main/dec-form'], {
                queryParams: { type: 'import' },
              });
            }
          });
        });

        this.activeIndex = 0;
        localStorage.setItem('activeIndex', '0');
      }
    });
  }

  getReadOnlyState(): boolean {
    return this.activeIndex >= this.steps.length;
  }

  restart() {
    this.activeIndex = 0;
    localStorage.setItem('currentDecId', '');
    localStorage.setItem('CustomsStatus', '');
    localStorage.removeItem('currentDecId');
    localStorage.removeItem('CustomsStatus');
    localStorage.setItem('activeIndex', '0');
    localStorage.setItem('maxIndex', '0');
    this.stepService.updateMaxIndex(0);
  }

  nextStep(): void {
    this.activeIndex = +(localStorage.getItem('activeIndex') || 0);
    if (this.activeIndex < this.steps.length - 1) {
      if (this.activeIndex == this.maxIndex) {
        this.maxIndex++;
        localStorage.setItem('maxIndex', this.maxIndex.toString());
      }
      this.activeIndex++;
      localStorage.setItem('activeIndex', this.activeIndex.toString());
      this.navigateBasedOnStep(null);
    }
  }

  previousStep(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
      localStorage.setItem('activeIndex', this.activeIndex.toString());
      this.navigateBasedOnStep(null);
    }
  }

  getTypeQueryParam(): string {
    if (this.typeDec === 'tr') return 'transshipment';
    if (this.typeDec === 'regular') return 'import';
    if (this.typeDec === 'ex') return 'export';
    return 'import';
  }

  navigateBasedOnStep(i: any): void {
    console.log('--- navigateBasedOnStep ---');
    console.log('i:', i);
    console.log('activeIndex:', this.activeIndex);
    console.log('typeDec:', this.typeDec);
    console.log('mode:', this.mode);
    console.log(
      'steps:',
      this.steps.map((x) => x.label),
    );
    if (i || i == 0) {
      this.activeIndex = i;
    }

    let navigationExtras: any = {
      queryParams: {
        type: this.getTypeQueryParam(),
      },
    };
    localStorage.setItem('activeIndex', this.activeIndex.toString());

    if (this.mode === 'e' || this.activeIndex === 1) {
      navigationExtras.queryParams = {
        ...navigationExtras.queryParams,
        Mode: 'e',
      };
    }
    if (this.activeIndex === 1) {
      this.router.navigate(['declaration-main/add-doc'], navigationExtras);
    } else if (this.activeIndex === 2) {
      const isPaymentStep = this.steps[2]?.label === 'תשלום';

      if (isPaymentStep) {
        this.router.navigate(
          ['declaration-main/commission-payment'],
          navigationExtras,
        );
      } else {
        this.router.navigate(['declaration-main/dec-print'], navigationExtras);
      }
    } else if (this.activeIndex === 3) {
      this.router.navigate(['declaration-main/dec-print'], navigationExtras);
    } else if (this.activeIndex === 0) {
      if (this.typeDec === 'tr')
        this.router.navigate(
          ['declaration-main/dec-form-ts'],
          navigationExtras,
        );
      else
        this.router.navigate(['declaration-main/dec-form'], navigationExtras);
    }
  }

  logout() {
    localStorage.setItem('isRegister', 'false');
  }

  navigateToHomePage() {
    this.router.navigate(['home-page']);
  }

  buildSteps(): void {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    const shouldShowPayment =
      this.typeDec !== 'tr' && user?.ComissionPerTranc === true;

    if (shouldShowPayment) {
      this.steps = [...this.allSteps];
    } else {
      this.steps = [this.allSteps[0], this.allSteps[1], this.allSteps[3]];
    }
  }
}