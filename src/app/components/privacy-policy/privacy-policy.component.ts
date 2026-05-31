import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [], // הסרנו את RouterLink מכיוון שאנו מנווטים דרך הקוד
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  private router = inject(Router);

  // פונקציה שמבצעת את הניווט חזרה לדף הבית
  goHome(): void {
    this.router.navigate(['/home-page']);
  }
}