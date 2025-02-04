import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService, Message } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { tap, map } from 'rxjs';
import { VendorService } from '../../shared/services/vendor.service';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-search-vendor',
  standalone: true,
  imports: [CommonModule, MessagesModule, CardModule, ProgressSpinnerModule,InputTextModule, FormsModule, TableModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService,ConfirmationService],
  templateUrl: './search-vendor.component.html',
  styleUrl: './search-vendor.component.scss'
})
export class SearchVendorComponent {
  constructor(private vendorService: VendorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,) { }

  cols: any[] = [];

  exportColumns: any[] = [];


  fullvendors: any

  vendors: any

  vendor: any;

  loading: boolean = false;

  min2: boolean = true

  //searchVendor: string = '' PostalCode
  searchVendor = {
    VendorName: '',
    EnglishPostalCode: '',
    LicensedDealerNumber: '',
    VendorID: '',
  }

  msgs1: Message[] = [];



  ngOnInit(): void {
    this.cols = [
      { field: 'VendorID', header: 'קוד ספק במכס' },
      { field: 'VendorName', header: 'שם ספק' },
      { field: 'VendorTypeID', header: 'סוג ספק' },
      { field: 'EnglishCountry', header: ' ארץ' },
      { field: 'EnglishCityName', header: ' עיר ספק' },
      { field: 'SingleTextAddress', header: ' כתובת ספק' },
      { field: 'EnglishPostalCode', header: ' מיקוד' },
      { field: 'LicensedDealerNumber', header: ' חפ ספק' },
      // { field: 'VendorName', header: 'שם ספק' },  
    ];

    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));

  }

  search() {
    this.msgs1 = []
    const hebrewPattern = /[א-ת]/;
    const alphanumericPattern = /^[A-Za-z0-9]+$/;

    if (!this.searchVendor.VendorName && !this.searchVendor.EnglishPostalCode && !this.searchVendor.LicensedDealerNumber && !this.searchVendor.VendorID) {
      this.msgs1 = [
        { severity: 'error', summary: 'שליפת פרטי ספק', detail: 'חובה למלא לפחות אחד משדות החיפוש' }
      ];
      return;
    }

    if (this.searchVendor.VendorName?.length < 2) {
      this.msgs1 = [
        { severity: 'error', summary: 'שליפת פרטי ספק', detail: 'שם ספק חייב להיות באורך של לפחות 2 תווים' }
      ];
      return;
    } else if (hebrewPattern.test(this.searchVendor?.VendorName)) {
      this.msgs1 = [
        { severity: 'error', summary: 'שליפת פרטי ספק', detail: 'שם ספק יכול להכיל רק אותיות באנגלית ומספרים' }
      ];
      return;
    } else if (!alphanumericPattern.test(this.searchVendor?.VendorName)) {
      this.msgs1 = [
        { severity: 'error', summary: 'שליפת פרטי ספק', detail: 'שם ספק יכול להכיל רק אותיות באנגלית ומספרים' }
      ];
      return;
    }

    else {
      this.loading = true
      let vendorName = { vendorName: this.searchVendor }
      return this.vendorService.getVendors$(this.searchVendor).pipe(
        tap(res => console.log(res)),
        tap(res => this.fullvendors = res.vendorResultField),
        map(res => res.vendorResultField ? this.vendors = res.vendorResultField.map(this.convertVendor) : this.msgs1 = [
          { severity: 'error', summary: 'שליפת פרטי ספק', detail: 'לא נמצאו ספקים' }
        ]),


        tap(_ => this.loading = false)
      )
        .subscribe()
    }

  }

  selectProduct(vendor: any) {

  }

  convertVendor(item: any): any {
    return {
      DunsNumberFieldSpecified: item.dunsNumberFieldSpecified,
      LicensedDealerNumber: item.licensedDealerNumberField,
      StatusID: item.statusIDField,
      VendorName: item.vendorNameField,
      VendorTypeID: item.vendorTypeIDField,
      SingleTextAddress: item.englishAddressField?.englishMainAddressLineField,
      // VendorNameField2: item.vendorNameField,englishMainAddressLineField
      VendorID: item.vendorIDField,
      EnglishCityName: item.englishAddressField?.englishCityNameField,
      EnglishCountry: item.englishAddressField?.englishCountryField,
      EnglishPostalCode: item.englishAddressField?.englishPostalCodeField,
    };
  }


  AddVendor(vendor: any) {
    console.log(vendor)
    this.vendor = vendor
    this.confirm(vendor)
  }

  confirm(vendor: any) {
    this.confirmationService.confirm({
      message: "האם לקלוט ספק מהמכס?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.loading = true

        let postVendor = {
          vendorName: vendor.vendorNameField,
          vendorID: vendor.vendorIDField,
          englishCityName: vendor.englishCityNameField,
          englishCountry: vendor.englishCountryField,
          englishPostalCode: vendor.englishPostalCodeField,
          StatusID: vendor.StatusID,
          LicensedDealerNumber: vendor.licensedDealerNumberField,
          // DunsNumber:vendor.dunsNumberFieldSpecified,
        };
        this.vendorService.postVendor$(postVendor).pipe(
          tap(_ => this.loading = false),
          tap(_ => console.log(_)
          ),
        ).subscribe(
          _ => {
            this.messageService.add({
              severity: "info",
              summary: "שמירה הצליחה",
              detail: "ספק נקלט במערכת"
            })
          },
          (error) => {
            if (error.status == 409) {

              this.updateConfirm(this.convertVendor(vendor))
            }
          }
        )
      },
      reject: () => {
        this.messageService.add({
          severity: "error",
          summary: " התהליך נעצר",
          detail: ""
        });
      }
    });
  }

  updateConfirm(vendor: any) {
    setTimeout(() => {
      this.loading = false
      this.confirmationService.confirm({
        message: `נתוני הספק קיימים במערכת. האם לעדכן?`,
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          this.vendorService.updateVendor$(vendor).subscribe(res => console.log(res))
        },
        reject: () => {
          this.messageService.add({
            severity: "error",
            summary: "התהליך נעצר",
            detail: ""
          });
        }
      });

    }, 1000);

  }
}
