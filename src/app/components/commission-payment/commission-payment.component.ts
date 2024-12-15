import { Component } from '@angular/core';
import { StepService } from '../../shared/services/step.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-commission-payment',
  standalone: true,
  imports: [],
  templateUrl: './commission-payment.component.html',
  styleUrl: './commission-payment.component.scss'
})
export class CommissionPaymentComponent {

  constructor(private stepService: StepService, private router: Router) { }

  nextStep() {
    this.router.navigate(['declaration-main/dec-form'], { queryParams: { customsSend: true , 'Mode': 'e'} })
    //this.stepService.emitStepCompleted();
  }
}
