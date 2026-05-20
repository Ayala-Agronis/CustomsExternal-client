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
import { DeclarationService } from '../../shared/services/declaration.service';

@Component({
  selector: 'app-commission-payment',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe, MessagesModule],
  providers: [MessageService],
  templateUrl: './commission-payment.component.html',
  styleUrl: './commission-payment.component.scss',
})
export class CommissionPaymentComponent implements OnInit {
  iframeUrl = '';
  paymentSuccess = false;
  paymentStatus: any;
  paymentAmount = 0;
  paymentRows: any[] = [];
  taxTypes: any[] = [];
  currentDec: any;
  loadingPaymentData = false;
  isReturningFromPayment = false;
  currency: any;
  decId: any;
  confirmationCode: any;

  msgs1: Message[] = [];
  typeDec = 'tr';

  taxRows: any[] = [];
  releaseFeeRow: any = null;

  isAlreadyPaid = false;

  constructor(
    private stepService: StepService,
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private customsDataService: CustomsDataService,
    private tranzilaService: TranzilaService,
    private declarationService: DeclarationService,
  ) {}

  ngOnInit(): void {
    this.typeDec = localStorage.getItem('decType') || '';
    this.decId = localStorage.getItem('currentDecId');
    this.currentDec = this.getCurrentDeclarationFromStorage();

    this.route.queryParams.subscribe((params) => {
      const returnedDeclarationId = params['declarationId'];

      if (returnedDeclarationId) {
        this.decId = returnedDeclarationId;
        localStorage.setItem('currentDecId', returnedDeclarationId);
      }

      const paymentStatus = params['paymentStatus'];

      if (paymentStatus) {
        this.isReturningFromPayment = true;
        // if (paymentStatus === 'success') {
        //   this.paymentStatus = true;
        //   this.nextStep();
        //   return;
        // }

        if (paymentStatus === 'success') {
          this.paymentStatus = true;
          this.isAlreadyPaid = true;
          this.iframeUrl = '';

          this.msgs1 = [
            {
              severity: 'success',
              summary: 'התשלום בוצע בהצלחה',
              detail: 'התשלום נקלט בהצלחה. מעבירים למסך ההצהרה...',
            },
          ];

          this.loadPaymentData(false);

          setTimeout(() => {
            this.goToDeclarationAfterSuccess();
          }, 1200);

          return;
        }

        this.paymentStatus = false;
        this.iframeUrl = '';

        // this.msgs1 = [
        //   {
        //     severity: 'error',
        //     summary: 'תשלום נכשל',
        //     detail: `התשלום נכשל. קוד שגיאה: ${params['responseCode'] || ''}`,
        //   },
        // ];

        this.setPaymentFailMessage(params['responseCode'] || '');

        this.loadPaymentData(false);
        return;
      }

      const isFailed = params['fail'];
      if (isFailed) {
        this.paymentStatus = false;
        this.iframeUrl = '';

        this.msgs1 = [
          {
            severity: 'error',
            summary: 'תשלום נכשל',
            detail: 'נסה שוב',
          },
        ];

        this.loadPaymentData(false);
        return;
      }

      // this.loadPaymentData(true);
      this.checkIfAlreadyPaid();
    });
  }

  goToDeclarationAfterSuccess(): void {
    this.declarationService.getDeclaration(this.decId).subscribe({
      next: (dec) => {
        localStorage.setItem('currentDec', JSON.stringify(dec || {}));
        localStorage.setItem('currentDecId', String(this.decId || ''));

        this.router.navigate(['/declaration-main/dec-form'], {
          queryParams: {
            customsSend: true,
            Mode: 'e',
            declarationId: this.decId,
          },
        });
      },
      error: () => {
        this.router.navigate(['/declaration-main/dec-form'], {
          queryParams: {
            customsSend: true,
            Mode: 'e',
            declarationId: this.decId,
          },
        });
      },
    });
  }

  nextStep(): void {
    if (this.typeDec === 'tr') {
      this.stepService.emitStepCompleted('dec-form-ts');
    } else {
      this.stepService.emitStepCompleted('dec-form');
    }

    this.goToDeclarationAfterSuccess();
  }

  previousStep(): void {
    this.stepService.emitStepCompleted('-');
  }

  retryPayment(): void {
    this.msgs1 = [];
    this.iframeUrl = '';
    this.openTransaction();
  }

  openTransaction(): void {
    const returnUrl = `${window.location.origin}/declaration-main/commission-payment`;

    this.tranzilaService
      .createPaymentUrl$(this.paymentAmount, Number(this.decId), returnUrl)
      .subscribe({
        next: (res) => {
          this.iframeUrl = res.iframeUrl;
        },
        error: () => {
          this.msgs1 = [
            {
              severity: 'error',
              summary: 'שגיאה',
              detail: 'לא ניתן לפתוח תשלום כעת',
            },
          ];
        },
      });
  }

  savePaymentStatus(success: boolean): void {
    const paymentData = {
      declarationNumber: this.decId,
      isPaid: success ? 1 : 0,
      amountPaid: this.paymentAmount,
      approvalNumber: this.confirmationCode,
      paymentDate: new Date().toISOString(),
      currency: this.currency,
    };

    this.paymentService.saveCustomerPayment(paymentData).subscribe();
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

  loadPaymentData(openIframe: boolean = true): void {
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

        this.taxRows = (taxes || []).map((tax: any) => {
          const type = this.taxTypes.find(
            (x: any) => String(x.Code) === String(tax.TaxTypeCode),
          );

          return {
            name: type?.Value2 || tax.TaxTypeCode,
            amount: Number(tax.Amount || 0),
            vatRequired: false,
          };
        });

        this.releaseFeeRow = {
          name: 'עמלת שחרור',
          amount: this.getReleaseFee(),
          vatRequired: true,
        };

        this.paymentRows = [...this.taxRows, this.releaseFeeRow];
        this.paymentAmount = this.getTotalWithVat();
        this.loadingPaymentData = false;
        this.isReturningFromPayment = false;

        if (openIframe) {
          this.openTransaction();
        }
      },
      error: () => {
        this.loadingPaymentData = false;
        this.isReturningFromPayment = false;
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

  checkIfAlreadyPaid(): void {
    if (!this.decId) {
      this.loadPaymentData(true);
      return;
    }

    const entityType = this.typeDec === 'tr' ? '2' : '1';

    this.customsDataService
      .hasValidPaymentSuccessEvent$(entityType, String(this.decId))
      .subscribe({
        next: (res) => {
          this.isAlreadyPaid = res?.isPaid === true;

          if (this.isAlreadyPaid) {
            this.paymentStatus = true;
            this.iframeUrl = '';

            this.msgs1 = [
              {
                severity: 'success',
                summary: 'התשלום בוצע בהצלחה',
                detail: 'לא ניתן לבצע תשלום נוסף עבור הצהרה זו.',
              },
            ];

            this.loadPaymentData(false);
            return;
          }

          this.loadPaymentData(true);
        },
        error: () => {
          this.loadPaymentData(true);
        },
      });
  }

  setPaymentFailMessage(responseCode: string): void {
    const cleanCode = (responseCode || '').split(',')[0];

    this.customsDataService.getCustomsTableValues$('5000').subscribe({
      next: (values) => {
        const error = (values || []).find(
          (x: any) => String(x.Code) === String(cleanCode),
        );

        this.msgs1 = [
          {
            severity: 'error',
            summary: 'תשלום נכשל',
            detail: error?.Value2
              ? `התשלום נכשל. ${error.Value2} קוד שגיאה: ${cleanCode}`
              : `התשלום נכשל. קוד שגיאה: ${cleanCode}`,
          },
        ];
      },
      error: () => {
        this.msgs1 = [
          {
            severity: 'error',
            summary: 'תשלום נכשל',
            detail: `התשלום נכשל. קוד שגיאה: ${cleanCode}`,
          },
        ];
      },
    });
  }
}
