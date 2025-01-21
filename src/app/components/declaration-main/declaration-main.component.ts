import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StepsModule } from 'primeng/steps';
import { StepService } from '../../shared/services/step.service';
import { StepperModule } from 'primeng/stepper';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-declaration-main',
  standalone: true,
  imports: [CommonModule, StepsModule, StepperModule],
  templateUrl: './declaration-main.component.html',
  styleUrl: './declaration-main.component.scss',
})
export class DeclarationMainComponent implements OnInit {

  //   if (this.activeIndex < this.steps.length - 1) {
  //     this.activeIndex++;
  //     localStorage.setItem('activeIndex', this.activeIndex.toString())
  //     if (this.activeIndex == 1) {
  //       this.router.navigate(['declaration-main/add-doc']);
  //     } else if (this.activeIndex == 2) {
  //       this.router.navigate(['declaration-main/commission-payment']);
  //     }
  //   }
  // }

  steps = [
    { label: 'הזנת נתוני הצהרה' },
    { label: 'הוספת מסמכים' },
    { label: 'תשלום עמלה' },
    { label: 'תשלום מיסים' },
    { label: 'קבלת התרה + תדפיס הצהרת יבוא' }
  ];

  activeIndex: number = 0;
  mode: any;

  constructor(private router: Router, private route: ActivatedRoute, private stepService: StepService, private userService: UserService) { }

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
      //this.nextStep();
    }

    this.stepService.stepCompleted$.subscribe((data: any) => {
      if (data.direction == 'dec-form') {
        this.activeIndex = 0
        localStorage.setItem('activeIndex', '0');
      }
      else if (data.direction == '+') {
        this.nextStep();
      }
      else {
        this.previousStep();
      } 936
    });

    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      console.log(code);

      if (code)
        this.userService.getDetails(code).subscribe(res => {
          console.log(res);
          this.userService.loginByGoogle(res).subscribe((res: any) => {
            console.log(res)
            console.log(res.body)
            // this.msg = [
            //   { severity: 'success', summary: '', detail: 'hi' + res.body.FirstName },
            // ];
          })
        })
    });
  }

  getReadOnlyState(): boolean {
    return this.activeIndex >= this.steps.length;
  }

  restart() {
    localStorage.setItem('currentDecId','')
    localStorage.setItem("activeIndex", "0")
  }

  // nextStep(): void {
  //   if (this.activeIndex < this.steps.length - 1) {
  //     this.activeIndex++;
  //     localStorage.setItem('activeIndex', this.activeIndex.toString())
  //     if (this.activeIndex == 1) {
  //       this.router.navigate(['declaration-main/add-doc']);
  //     } else if (this.activeIndex == 2) {
  //       this.router.navigate(['declaration-main/commission-payment']);
  //     }
  //   }
  // }
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
    if (this.activeIndex === 1) {
      this.router.navigate(['declaration-main/add-doc']);
    } else if (this.activeIndex === 2) {
      this.router.navigate(['declaration-main/commission-payment']);
    }
    else if (this.activeIndex === 3) {
      this.router.navigate(['declaration-main/independent-payment'])
    }
    else if (this.activeIndex === 4) {
      this.router.navigate(['declaration-main/dec-print'])
    }
    else if (this.activeIndex === 0) {
      if (this.mode == 'e') {
        this.router.navigate(['declaration-main/dec-form'], { queryParams: { 'Mode': 'e' } })
      }
      else
        this.router.navigate(['declaration-main/dec-form']);
    }
  }

  logout() {
    localStorage.setItem("isRegister", "false")
  }
}
