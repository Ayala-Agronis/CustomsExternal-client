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
import { UserService } from '../../shared/services/user.service';

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

  // 🌟 משתנים חדשים עבור מסלול הלינק במייל
  guid: string | null = null;
  linkFees: { personalFee: number; businessFee: number } | null = null;

  constructor(
    private stepService: StepService,
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private customsDataService: CustomsDataService,
    private tranzilaService: TranzilaService,
    private declarationService: DeclarationService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.guid = params['guid'] || null;

      // 🌟 טעינת עמלות קיימות מהזיכרון אם קיימות
      if (this.guid) {
        const savedFees = localStorage.getItem(`linkFees_${this.guid}`);
        if (savedFees) {
          this.linkFees = JSON.parse(savedFees);
        }
      }

      const paymentStatus = params['paymentStatus'];

      // 🌟 מסלול לינק חיצוני (GUID)
      if (this.guid) {
        // א. טיפול במצב של הצלחה/כישלון במסלול ה-GUID לאחר חזרה מטרנזילה
        if (paymentStatus) {
          this.isReturningFromPayment = true;
          this.loadingPaymentData = true;

          // 1. מביאים את נתוני התיק מהשרת הפנימי המורשה ל-GUID
          this.tranzilaService.getDeclarationByGuid$(this.guid).subscribe({
            next: (declaration) => {
              if (declaration) {
                this.currentDec = declaration;
                this.decId = declaration.Id || declaration.id;
                this.typeDec = 'tr';

                if (paymentStatus === 'success') {
                  this.paymentStatus = true;
                  this.isAlreadyPaid = true;
                  this.iframeUrl = '';
                  this.paymentSuccess = true; // מציג כרטיס הצלחה
                  this.loadingPaymentData = false;
                  this.isReturningFromPayment = false;
                } else {
                  // 🌟 התיקון המאובטח למצב כישלון - ללא פניות ל-API חסום! 🌟
                  this.paymentStatus = false;
                  this.iframeUrl = '';
                  this.isReturningFromPayment = false;
                  this.loadingPaymentData = false;

                  // תרגום קוד השגיאה מקומית באנגולר כדי למנוע קריאה לשרת והפניה ללוגין
                  const responseCode = params['responseCode'] || '';

                  // קריאה לשרת עם קוד השגיאה
                  this.tranzilaService
                    .getDeclarationByGuid$(this.guid!, responseCode)
                    .subscribe({
                      next: (declaration) => {
                        if (declaration) {
                          this.currentDec = declaration;
                          this.decId = declaration.Id || declaration.id;

                          // 🌟 שימוש בהודעה שהשרת החזיר לנו
                          const errorMessage =
                            declaration.PaymentErrorMessage ||
                            'חלה שגיאה בתהליך התשלום, נא לנסות שוב.';

                          this.msgs1 = [
                            {
                              severity: 'error',
                              summary: 'התשלום נכשל',
                              detail: errorMessage,
                            },
                          ];

                          // טעינת שורות המסים (אותו קוד שהיה לך)
                          const readyTaxes =
                            declaration.Taxes || declaration.taxes || [];
                          this.taxRows = readyTaxes.map((tax: any) => ({
                            name:
                              tax.TaxTypeName ||
                              tax.TaxTypeCode ||
                              tax.taxTypeCode,
                            amount: Number(tax.Amount || tax.amount || 0),
                            vatRequired: false,
                          }));

                          this.releaseFeeRow = {
                            name: 'עמלת שחרור',
                            amount:
                              this.linkFees?.personalFee ||
                              this.linkFees?.businessFee ||
                              0,
                            vatRequired: true,
                          };

                          this.paymentRows = [
                            ...this.taxRows,
                            this.releaseFeeRow,
                          ];
                          this.paymentAmount = this.getTotalWithVat();
                        }
                      },
                      error: (err) => {
                        this.showError('שגיאה', 'טעינת הנתונים נכשלה.');
                      },
                    });
                  return;
                }
              } else {
                this.showError('שגיאה', 'ההצהרה המבוקשת לא נמצאה.');
                this.loadingPaymentData = false;
                this.isReturningFromPayment = false;
              }
            },
            error: (err) => {
              this.loadingPaymentData = false;
              this.isReturningFromPayment = false;
              this.showError('שגיאה', 'טעינת הנתונים נכשלה לפעולת החזרה.');
            },
          });
          return;
        }

        // ב. כניסה ראשונית מהמייל (בלי סטטוס תשלום עדיין) - נשאר אותו דבר
        if (!paymentStatus && !params['fail']) {
          this.loadingPaymentData = true;
          this.tranzilaService.getDeclarationByGuid$(this.guid).subscribe({
            next: (declaration) => {
              if (!declaration) {
                this.showError('שגיאה', 'ההצהרה המבוקשת לא נמצאה.');
                this.loadingPaymentData = false;
                return;
              }
              this.currentDec = declaration;
              this.decId = declaration.Id || declaration.id;
              this.typeDec = 'tr';

              const customerId =
                declaration.CustomerId || declaration.customerId;
              if (!customerId) {
                this.showError(
                  'שגיאה',
                  'לא נמצא מזהה לקוח תואם עבור קישור זה.',
                );
                this.loadingPaymentData = false;
                return;
              }

              this.userService
                .getCustomerFeesOutside(customerId, this.guid!)
                .subscribe({
                  next: (fees) => {
                    this.linkFees = {
                      personalFee: fees.PersonalFee ?? fees.personalFee ?? 0,
                      businessFee: fees.BusinessFee ?? fees.businessFee ?? 0,
                    };
                    // 🌟 שמירה ייחודית לפי GUID
                    localStorage.setItem(
                      `linkFees_${this.guid}`,
                      JSON.stringify(this.linkFees),
                    );
                    this.loadPaymentData(true);
                    this.loadPaymentData(true);
                  },
                  error: (err) => {
                    console.error('שגיאה בטעינת עמלות לקוח חיצוניות:', err);
                    this.linkFees = { personalFee: 0, businessFee: 0 };
                    this.loadPaymentData(true);
                  },
                });
            },
            error: (err) => {
              this.loadingPaymentData = false;
              const errMsg =
                err.error?.Message || 'הקישור אינו בתוקף או שהתשלום כבר בוצע.';
              this.showError('קישור לא בתוקף', errMsg);
            },
          });
          return;
        }
      }

      // --- המסלול הרגיל (בתוך האתר - משתמש מחובר) ---
      this.typeDec = localStorage.getItem('decType') || '';
      this.decId = localStorage.getItem('currentDecId');
      this.currentDec = this.getCurrentDeclarationFromStorage();

      const returnedDeclarationId = params['declarationId'];
      if (returnedDeclarationId) {
        this.decId = returnedDeclarationId;
        localStorage.setItem('currentDecId', returnedDeclarationId);
      }

      if (paymentStatus) {
        this.isReturningFromPayment = true;
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
        this.setPaymentFailMessage(params['responseCode'] || '');
        this.loadPaymentData(false);
        return;
      }

      const isFailed = params['fail'];
      if (isFailed) {
        this.paymentStatus = false;
        this.iframeUrl = '';
        this.showError('תשלום נכשל', 'נסה שוב');
        this.loadPaymentData(false);
        return;
      }

      this.checkIfAlreadyPaid();
    });
  }

  goToDeclarationAfterSuccess(): void {
    if (this.guid) {
      // 🌟 ניקוי הנתונים בסיום
      localStorage.removeItem(`linkFees_${this.guid}`);
      this.msgs1 = [
        {
          severity: 'success',
          summary: 'תודה רבה!',
          detail: 'התשלום הסתיים בהצלחה. הודעה נשלחה לעמיל המכס.',
        },
      ];
      return;
    }

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
    const returnUrl = this.guid
      ? `${window.location.origin}/commission-payment?guid=${this.guid}`
      : `${window.location.origin}/declaration-main/commission-payment`;

    this.tranzilaService
      .createPaymentUrl$(
        this.paymentAmount,
        Number(this.decId),
        returnUrl,
        this.guid,
      )
      .subscribe({
        next: (res) => {
          this.iframeUrl = res.iframeUrl;
        },
        error: () => {
          this.showError('שגיאה', 'לא ניתן לפתוח תשלום כעת');
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
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  loadPaymentData(openIframe: boolean = true): void {
    const agentFileReferenceId =
      this.currentDec?.AgentFileReferenceID ||
      this.currentDec?.agentFileReferenceID ||
      this.currentDec?.agentFileReferenceId;

    if (!agentFileReferenceId) {
      this.showError('שגיאה', 'לא נמצא מספר תיק סוכן להצגת חיובי תשלום');
      this.loadingPaymentData = false;
      return;
    }

    this.loadingPaymentData = true;

    const processRows = (taxes: any[], taxTypes: any[]) => {
      this.taxTypes = taxTypes || [];

      this.taxRows = (taxes || []).map((tax: any) => {
        let taxName = tax.TaxTypeName;

        if (!taxName) {
          const type = this.taxTypes.find(
            (x: any) =>
              String(x.Code || x.Value1) ===
              String(tax.TaxTypeCode || tax.taxTypeCode),
          );
          taxName = type?.Value2 || tax.TaxTypeCode || tax.taxTypeCode;
        }

        return {
          name: taxName,
          amount: Number(tax.Amount || tax.amount || 0),
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
    };

    if (this.guid && (this.currentDec?.Taxes || this.currentDec?.taxes)) {
      const readyTaxes = this.currentDec.Taxes || this.currentDec.taxes;
      processRows(readyTaxes, []);
      return;
    }

    forkJoin({
      taxes:
        this.customsDataService.getDecTaxesByAgentFileReferenceId$(
          agentFileReferenceId,
        ),
      taxTypes: this.customsDataService.getCustomsTableValues$('1120'),
    }).subscribe({
      next: ({ taxes, taxTypes }) => {
        processRows(taxes, taxTypes);
      },
      error: () => {
        this.loadingPaymentData = false;
        this.isReturningFromPayment = false;
        this.showError('שגיאה', 'טעינת נתוני התשלום נכשלה');
      },
    });
  }

  getReleaseFee(): number {
    const governmentProcedure =
      this.currentDec?.GovernmentProcedure ||
      this.currentDec?.Consignments?.[0]?.GovernmentProcedure ||
      this.currentDec?.Consignments?.GovernmentProcedure;

    const code =
      governmentProcedure?.code ??
      governmentProcedure?.Value1 ??
      governmentProcedure;
    const isPersonal = String(code) === '4000501';
    const isBusiness = String(code) === '4000001';

    if (this.guid && this.linkFees) {
      return isPersonal
        ? this.linkFees.personalFee
        : isBusiness
          ? this.linkFees.businessFee
          : 0;
    }

    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    if (isPersonal) return Number(user?.PersonalFee || 0);
    if (isBusiness) return Number(user?.BusinessFee || 0);

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

            if (this.guid) {
              this.paymentSuccess = true;
              this.loadingPaymentData = false;
              return;
            }

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
        this.showError(
          'תשלום נכשל',
          error?.Value2
            ? `התשלום נכשל. ${error.Value2} קוד שגיאה: ${cleanCode}`
            : `התשלום נכשל. קוד שגיאה: ${cleanCode}`,
        );
      },
      error: () => {
        this.showError('תשלום נכשל', `התשלום נכשל. קוד שגיאה: ${cleanCode}`);
      },
    });
  }

  private showError(summary: string, detail: string): void {
    this.msgs1 = [{ severity: 'error', summary, detail }];
  }
}
