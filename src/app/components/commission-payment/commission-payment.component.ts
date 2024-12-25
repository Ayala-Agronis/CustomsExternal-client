import { Component, OnInit } from '@angular/core';
import { StepService } from '../../shared/services/step.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-commission-payment',
  standalone: true,
  imports: [CommonModule,SafeUrlPipe],
  templateUrl: './commission-payment.component.html',
  styleUrl: './commission-payment.component.scss'
})
export class CommissionPaymentComponent implements OnInit {
  iframeUrl: string = ''


  constructor(private stepService: StepService, private router: Router) { }

  ngOnInit(): void {
    this.openTransaction();
  }

  nextStep() {
    this.router.navigate(['declaration-main/dec-form'], { queryParams: { customsSend: true, 'Mode': 'e' } })
    this.stepService.emitStepCompleted('dec-form');
  }

  previousStep() {
    this.stepService.emitStepCompleted('-');
  }

  openTransaction() {
    this.iframeUrl = `https://direct.tranzila.com/customsil/iframenew.php?tranmode=V%5C%5C&currency=1`;
    //this.iframeUrl = `https://direct.tranzila.com/customsil/iframenew.php?tranmode=V\\&currency=1`;
  }
}
