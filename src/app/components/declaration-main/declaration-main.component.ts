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
  activeIndex: number = 0;
  steps = [
    { label: 'שלב 1:  הזנת נתוני הצהרה ' },
    { label: 'שלב 2: הוספת מסמכים  ' },
    { label: 'שלב 3: תשלום עמלה' },
    { label: 'שלב 4: תשלום הצהרה בעזרת שרת התשלומים של המדינה' },
    { label: 'שלב 5: קבלת התרה + תדפיס הצהרת יבוא' }
  ];

  constructor(private router: Router,private stepService:StepService) { }

  ngOnInit(): void {
    this.router.navigate(['declaration-main/dec-form']);

    this.stepService.stepCompleted$.subscribe(() => {
      this.nextStep();
    });
  }

  nextStep(): void {
    if (this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
      if (this.activeIndex === 1) {
        this.router.navigate(['declaration-main/add-doc']);
      } else if (this.activeIndex === 2) {
        this.router.navigate(['/step3']);
      }
    }
  }

}
