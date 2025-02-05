import { Component, OnInit, Renderer2 } from '@angular/core';
import { StepService } from '../../shared/services/step.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { PaymentService } from '../../shared/services/payment.service';

@Component({
  selector: 'app-commission-payment',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './commission-payment.component.html',
  styleUrl: './commission-payment.component.scss'
})
export class CommissionPaymentComponent implements OnInit {
  iframeUrl: string = ''
  paymentSuccess: boolean = false;
  paymentStatus: any;
  paymentAmount: any = 2;
  currency: any;
  decId: any;
  confirmationCode: any;

  constructor(private stepService: StepService, private router: Router, private route: ActivatedRoute, private paymentService: PaymentService, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.decId = localStorage.getItem('currentDecId');
    this.route.queryParams.subscribe(params => {

      const success = params['Success'];
      if (success == undefined) {
        this.openTransaction();
      }
      else {

        const successData = success.split('&');
        let currencyCode = '';
        successData.forEach((param: any) => {
          if (param.startsWith('currency=')) {
            currencyCode = param.split('=')[1];
          }
          else if (param.startsWith('ConfirmationCode')) {
            this.confirmationCode = param.split('=')[1];
          }
        });
        this.currency = this.convertCurrency(currencyCode);

        console.log('Success:', success);//Success:"false&Response=039&lang=us&ccard=&expmonth=04&currency=1&ccno=8527&expyear=26&supplier=customsil&sum=2&benid=16sq53o1kqtvcsthihff9gq7d1&ConfirmationCode=0000000&cardtype=2&cardissuer=6&cardaquirer=0&index=17&Tempref=01220001&"[[Prototype]]: Object
        //"true&Response=000&lang=us&ccard=&expmonth=11&currency=1&ccno=8525&expyear=30&supplier=customsil&sum=2&benid=16sq53o1kqtvcsthihff9gq7d1&ConfirmationCode=0000000&cardtype=2&cardissuer=6&cardaquirer=6&index=18&Tempref=01570002&"
        if (success && success.startsWith('true')) {
          this.paymentStatus = true;
          this.savePaymentStatus(true);
          this.nextStep();
         
        } else {
          this.paymentStatus = false;
          this.savePaymentStatus(false);
        }
      }
    });
  }

  nextStep() {
    if (window.top) {
      this.stepService.emitStepCompleted('dec-form');

      window.top.location.href = '/declaration-main/dec-form?customsSend=true&Mode=e';
    }
  }

  // nextStep() {
  //   this.router.navigate(['declaration-main/dec-form'], { queryParams: { customsSend: true, 'Mode': 'e' } })
  //   this.stepService.emitStepCompleted('dec-form');

  // }

  previousStep() {
    this.stepService.emitStepCompleted('-');
  }

  openTransaction() {
    // this.iframeUrl = `https://direct.tranzila.com/customsil/iframenew.php?tranmode=V%5C%5C&currency=1`; //תפיסת מסגרת
    this.iframeUrl = `https://direct.tranzila.com/customsil/iframenew.php?currency=1&sum=${this.paymentAmount}`;
    //this.iframeUrl = `https://direct.tranzila.com/customsil/iframenew.php?tranmode=V\\&currency=1`;
  }

  savePaymentStatus(success: boolean) {

    const paymentData = {
      declarationNumber: this.decId,
      isPaid: success ? 1 : 0,
      amountPaid: this.paymentAmount,
      approvalNumber: this.confirmationCode,
      paymentDate: new Date().toISOString(),
      currency: this.currency
    };

    this.paymentService.saveCustomerPayment(paymentData).subscribe(response => {
      console.log(response);
    });
  }

  convertCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case '1': return 'NIS';
      case '2': return 'USD';
      case '978': return 'EUR';
      case '826': return 'GBP';
      default: return 'NIS';
    }
  }
}
