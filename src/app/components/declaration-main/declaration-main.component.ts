import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StepsModule } from 'primeng/steps';
import { StepService } from '../../shared/services/step.service';
import { StepperModule } from 'primeng/stepper';
import { UserService } from '../../shared/services/user.service';
import { CustomsDataService } from '../../shared/services/customs-data.service';

@Component({
  selector: 'app-declaration-main',
  standalone: true,
  imports: [CommonModule, StepsModule, StepperModule],
  templateUrl: './declaration-main.component.html',
  styleUrl: './declaration-main.component.scss',
})
export class DeclarationMainComponent implements OnInit {
  steps = [
    { label: 'הזנת נתוני הצהרה' },
    { label: 'הוספת מסמכים' },
    { label: 'תשלום עמלה' },
    { label: 'תשלום מיסים' },
    { label: 'קבלת התרה + תדפיס הצהרת יבוא' }
  ];

  activeIndex: number = 0;
  mode: any;

  constructor(private router: Router, private route: ActivatedRoute, private cdRef: ChangeDetectorRef, private stepService: StepService, private userService: UserService, private customsDataService: CustomsDataService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['Mode'];
    })

    var savedIndex = localStorage.getItem('activeIndex');

    if (!savedIndex) {
      savedIndex = '0'
      this.router.navigate(['declaration-main/dec-form']);
    }
    else {
      this.activeIndex = +savedIndex;
      this.navigateBasedOnStep();
    }

    // if (this.router.url.includes('callback')) {
    //   this.activeIndex = 0; 
    //   localStorage.setItem('activeIndex', '0');
    // }

    this.stepService.stepCompleted$.subscribe((data: any) => {
      if (data.direction == 'dec-form') {
        this.activeIndex = 0
        localStorage.setItem('activeIndex', '0');
        this.cdRef.detectChanges();
      }
      else if (data.direction == '+') {
        this.nextStep();
      }
      else {
        this.previousStep();
      }
    });

    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      console.log(code);

      if (code) {
        this.userService.getDetails(code).subscribe(res => {
          console.log(res);
          this.userService.loginByGoogle(res).subscribe((res: any) => {
            console.log(res.body)
            localStorage.setItem('isRegister', "true")
            localStorage.setItem('userId', res.body.Id)
            // this.customsDataService.GetClient$("326546033").subscribe(client => {
            this.customsDataService.GetClient$(res.body.Id).subscribe(client => {
              //check if power of attorney exist
              if (client.generalCustomerDataField.costomerStatusForCAField == 6)
                localStorage.setItem('isClientAuthorized', 'false')
              else
                localStorage.setItem('isClientAuthorized', 'true')
              console.log(client);
            })

            const userJson = JSON.stringify(res.body);
            localStorage.setItem('user', userJson);
            this.router.navigate(['declaration-main/dec-form']);
          })
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
    this.activeIndex = 0
    localStorage.setItem('currentDecId', '')
    localStorage.setItem('CustomsStatus', '')
    localStorage.setItem("activeIndex", "0")
  }

  nextStep(): void {
    if (this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
      localStorage.setItem('activeIndex', this.activeIndex.toString());
      this.navigateBasedOnStep();
    }
  }

  previousStep(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
      localStorage.setItem('activeIndex', this.activeIndex.toString());
      this.navigateBasedOnStep();
    }
  }

  navigateBasedOnStep(): void {
    let navigationExtras: any = {};

    if (this.mode === 'e' || this.activeIndex === 1) {
      navigationExtras.queryParams = { 'Mode': 'e' };
    }

    if (this.activeIndex === 1) {
      this.router.navigate(['declaration-main/add-doc'], navigationExtras);
    } else if (this.activeIndex === 2) {
      this.router.navigate(['declaration-main/commission-payment'], navigationExtras);
    } else if (this.activeIndex === 3) {
      this.router.navigate(['declaration-main/independent-payment'], navigationExtras);
    } else if (this.activeIndex === 4) {
      this.router.navigate(['declaration-main/dec-print'], navigationExtras);
    } else if (this.activeIndex === 0) {
      this.router.navigate(['declaration-main/dec-form'], navigationExtras);
    }
  }

  logout() {
    localStorage.setItem("isRegister", "false")
  }
}
