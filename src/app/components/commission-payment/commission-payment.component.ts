import { Component, OnInit } from '@angular/core';
import { StepService } from '../../shared/services/step.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { PaymentService } from '../../shared/services/payment.service';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { forkJoin } from 'rxjs';
import { CustomsDataService } from '../../shared/services/customs-data.service';
import { TranzilaService } from '../../shared/services/tranzila.service';
@Component({
  selector: 'app-commission-payment',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe, MessagesModule],
  providers: [MessageService],
  templateUrl: './commission-payment.component.html',
  styleUrl: './commission-payment.component.scss',
})
export class CommissionPaymentComponent implements OnInit {
  iframeUrl: string = '';
  paymentSuccess: boolean = false;
  paymentStatus: any;
  paymentAmount: number = 0;
  paymentRows: any[] = [];
  taxTypes: any[] = [];
  currentDec: any;
  loadingPaymentData = false;
  currency: any;
  decId: any;
  confirmationCode: any;

  msgs1: Message[] = [];
  typeDec: string = 'tr';

  taxRows: any[] = [];
  releaseFeeRow: any = null;

  constructor(
    private stepService: StepService,
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private customsDataService: CustomsDataService,
    private tranzilaService: TranzilaService,
  ) {}

  ngOnInit(): void {
    this.typeDec = localStorage.getItem('decType') || '';

    this.decId = localStorage.getItem('currentDecId');
    this.currentDec = this.getCurrentDeclarationFromStorage();
    this.route.queryParams.subscribe((params) => {
      const isFailed = params['fail'];
      if (isFailed) {
        this.msgs1 = [
          { severity: 'error', summary: 'תשלום נכשל  ', detail: 'נסה שוב' },
        ];
      }
      const success = params['Success'];
      if (success == undefined) {
        this.loadPaymentData();
      } else {
        const successData = success.split('&');
        let currencyCode = '';
        successData.forEach((param: any) => {
          if (param.startsWith('currency=')) {
            currencyCode = param.split('=')[1];
          } else if (param.startsWith('ConfirmationCode')) {
            this.confirmationCode = param.split('=')[1];
          }
        });
        this.currency = this.convertCurrency(currencyCode);

        console.log('Success:', success); //Success:"false&Response=039&lang=us&ccard=&expmonth=04&currency=1&ccno=8527&expyear=26&supplier=customsil&sum=2&benid=16sq53o1kqtvcsthihff9gq7d1&ConfirmationCode=0000000&cardtype=2&cardissuer=6&cardaquirer=0&index=17&Tempref=01220001&"[[Prototype]]: Object
        //"true&Response=000&lang=us&ccard=&expmonth=11&currency=1&ccno=8525&expyear=30&supplier=customsil&sum=2&benid=16sq53o1kqtvcsthihff9gq7d1&ConfirmationCode=0000000&cardtype=2&cardissuer=6&cardaquirer=6&index=18&Tempref=01570002&"
        if (success && success.startsWith('true')) {
          this.paymentStatus = true;
          this.savePaymentStatus(true);
          this.nextStep();
        } else {
          this.paymentStatus = false;
          // this.savePaymentStatus(false);
          this.nextTry();
        }
      }
    });
  }

  nextStep() {
    if (window.top) {
      if (this.typeDec == 'tr') {
        this.stepService.emitStepCompleted('dec-form-ts');
        window.top.location.href =
          '/declaration-main/dec-form-ts?customsSend=true&Mode=e';
      } else {
        this.stepService.emitStepCompleted('dec-form');
        window.top.location.href =
          '/declaration-main/dec-form?customsSend=true&Mode=e';
      }
    }
  }

  nextTry() {
    if (window.top) {
      // this.stepService.emitStepCompleted('commission-payment');
      window.top.location.href =
        '/declaration-main/commission-payment?Mode=e&fail=true';
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
    this.iframeUrl = this.tranzilaService.buildIframeUrl(this.paymentAmount);
  }

  savePaymentStatus(success: boolean) {
    const paymentData = {
      declarationNumber: this.decId,
      isPaid: success ? 1 : 0,
      amountPaid: this.paymentAmount,
      approvalNumber: this.confirmationCode,
      paymentDate: new Date().toISOString(),
      currency: this.currency,
    };

    this.paymentService
      .saveCustomerPayment(paymentData)
      .subscribe((response) => {
        console.log(response);
      });
  }

  convertCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case '1':
        return 'NIS';
      case '2':
        return 'USD';
      case '978':
        return 'EUR';
      case '826':
        return 'GBP';
      default:
        return 'NIS';
    }
  }

  getCurrentDeclarationFromStorage(): any {
    const raw = localStorage.getItem('currentDec');

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  loadPaymentData(): void {
    const agentFileReferenceId = this.currentDec?.AgentFileReferenceID;

    if (!agentFileReferenceId) {
      this.msgs1 = [
        {
          severity: 'error',
          summary: 'שגיאה',
          detail: 'לא נמצא מספר תיק סוכן להצגת חיובי תשלום',
        },
      ];
      return;
    }

    this.loadingPaymentData = true;

    forkJoin({
      taxes:
        this.customsDataService.getDecTaxesByAgentFileReferenceId$(
          agentFileReferenceId,
        ),
      taxTypes: this.customsDataService.getCustomsTableValues$('1120'),
    }).subscribe({
      next: ({ taxes, taxTypes }) => {
        this.taxTypes = taxTypes || [];

        const taxRows = (taxes || []).map((tax: any) => {
          const type = this.taxTypes.find(
            (x: any) => String(x.Code) === String(tax.TaxTypeCode),
          );

          return {
            name: type?.Value2 || tax.TaxTypeCode,
            amount: Number(tax.Amount || 0),
            vatRequired: false,
          };
        });

        this.taxRows = taxRows;

        this.releaseFeeRow = {
          name: 'עמלת שחרור',
          amount: this.getReleaseFee(),
          vatRequired: true,
        };

        this.paymentRows = [...this.taxRows, this.releaseFeeRow];

        this.paymentAmount = this.getTotalWithVat();
        this.loadingPaymentData = false;

        this.openTransaction();
      },
      error: () => {
        this.loadingPaymentData = false;
        this.msgs1 = [
          {
            severity: 'error',
            summary: 'שגיאה',
            detail: 'טעינת נתוני התשלום נכשלה',
          },
        ];
      },
    });
  }

  getReleaseFee(): number {
    // debugger;
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    const governmentProcedure =
      this.currentDec?.GovernmentProcedure ||
      this.currentDec?.Consignments?.[0]?.GovernmentProcedure ||
      this.currentDec?.Consignments?.GovernmentProcedure;

    const code =
      governmentProcedure?.code ??
      governmentProcedure?.Value1 ??
      governmentProcedure;

    if (String(code) === '4000501') {
      return Number(user?.PersonalFee || 0);
    }

    if (String(code) === '4000001') {
      return Number(user?.BusinessFee || 0);
    }

    return 0;
  }

  getVatBaseAmount(): number {
    return Number(this.releaseFeeRow?.amount || 0);
  }

  getVatAmount(): number {
    return this.getVatBaseAmount() * 0.18;
  }

  getSubtotal(): number {
    return this.paymentRows.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0,
    );
  }

  getTotalWithVat(): number {
    return this.getSubtotal() + this.getVatAmount();
  }
}
