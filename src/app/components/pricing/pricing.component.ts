import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, TopNavbarComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {

  private router = inject(Router);

  pricingData = [
        {
      type: 'אישי',
      value: '$ עד 150 ',
      price: '35 ₪',
    },
    {
      type: 'אישי',
      value: '$ 151-500 ',
      price: '50 ₪',
    },
    {
      type: 'אישי',
      value: '$ 501-1000 ',
      price: '100 ₪',
    },
    {
      type: 'אישי',
      value: 'מעל $ 1000 ',
      price: '180 ₪',
    },
    {
      type: 'מסחרי',
      value: '$ 0-500 ',
      price: '70 ₪',
    },
    {
      type: 'מסחרי',
      value: '$ 501-1000 ',
      price: '120 ₪',
    },
    {
      type: 'מסחרי',
      value: 'מעל $ 1000 ',
      price: '200 ₪',
    },
  ];

  goHome(): void {
    this.router.navigate(['/home-page']);
  }

}