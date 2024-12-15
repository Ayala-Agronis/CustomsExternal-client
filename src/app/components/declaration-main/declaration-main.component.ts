import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StepsModule } from 'primeng/steps';
import { StepService } from '../../shared/services/step.service';

@Component({
  selector: 'app-declaration-main',
  standalone: true,
  imports: [CommonModule, StepsModule],
  templateUrl: './declaration-main.component.html',
  styleUrl: './declaration-main.component.scss'
})
export class DeclarationMainComponent implements OnInit {
  steps = [
    { label: 'הזנת נתוני הצהרה' },
    { label: 'הוספת מסמכים' },
    { label: 'תשלום עמלה' },
    { label: 'תשלום הצהרה בעזרת שרת התשלומים של המדינה' },
    { label: 'קבלת התרה + תדפיס הצהרת יבוא' }
];

  activeIndex: number = 0;

  constructor(private router: Router, private stepService: StepService) { }

  ngOnInit(): void {
    var savedIndex = localStorage.getItem('activeIndex');

    if (!savedIndex) {
      savedIndex = '0'
      this.router.navigate(['declaration-main/dec-form']);
    }
    else{
      this.nextStep();
    }

    this.stepService.stepCompleted$.subscribe(() => {
      this.nextStep();
    });
  }

  getReadOnlyState(): boolean {
    return this.activeIndex >= this.steps.length;
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

  // selectStep(event: any): void {
  //   this.activeIndex = event.index;
  //   localStorage.setItem('activeIndex', this.activeIndex.toString());
  //   this.navigateBasedOnStep();
  // }

  navigateBasedOnStep(): void {
    if (this.activeIndex === 1) {
      this.router.navigate(['declaration-main/add-doc']);
    } else if (this.activeIndex === 2) {
      this.router.navigate(['declaration-main/commission-payment']);
    } else if (this.activeIndex === 0) {
      this.router.navigate(['declaration-main/dec-form']);
    }
  }
}
