import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { map, tap } from 'rxjs';
import { Message, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { DeclarationService } from '../../shared/services/declaration.service';
import { CustomsDataService } from '../../shared/services/customs-data.service';
import { StepService } from '../../shared/services/step.service';

@Component({
  selector: 'app-declaration-query',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ProgressSpinnerModule, ButtonModule, TableModule, ToastModule, DropdownModule, CalendarModule, MessagesModule,],
  providers: [MessageService],
  templateUrl: './declaration-query.component.html',
  styleUrl: './declaration-query.component.scss'
})
export class DeclarationQueryComponent {
  msgs1: Message[] = [];

  declartions: any;
  decType = 'tr'
  allDeclarations: any;
  // declartion!: Declaration;
  initialDeclarationsCount: number = 0;
  filteredDeclarationsCount: number = 0;
  filteredDeclarations: any[] = [];
  loading = false

  endDate = new Date()
  startDate: Date = new Date();
  importerId: any;
  eventCode: any;

  minEndDate!: Date

  @Output() newItemEvent = new EventEmitter<string>();

  UpdateModeE = 'e'

  DeclarationToEdit: any

  importerFilter: string = '';
  declarationOfficeFilter: string = '';
  governmentProcedureFilter: string = '';

  isShowFilter = false
  importerName: any;
  customsStatuses: any;
  isLoading: boolean = true;
  events: any;
  isFiltered: boolean = false;


  constructor(
    private router: Router,
    private declarationService: DeclarationService,
    private customsDataService: CustomsDataService,
    // private customsClientService: CustomsClientsService,
    private cdRef: ChangeDetectorRef,
    private stepService: StepService,
  ) { }


  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.importerId = localStorage.getItem('userId');

    window.dispatchEvent(new Event('resize'));

    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setDate(this.endDate.getDate() - 10);

    this.search();

    this.customsDataService.getCustomsTableValues$('1981').pipe(
      map(res => {
        this.customsStatuses = res.map((item: { Value2: any; Value1: any }) => ({
          name: item.Value2,
          code: item.Value1
        }));
      })
    ).subscribe();
  }

  updateEndDateMinDate() {
    if (this.startDate) {
      // Set the minimum date for endDate to be the startDate
      this.minEndDate = new Date(this.startDate);
    }
    this.isFiltered = false
  }

  handleDateSelect() {
    this.isFiltered = false
  }

  noDeclarationsFound: boolean = false;

  noDeclarationsMsg: Message[] = [
    {
      severity: 'info ',
      summary: ' תוצאה',
      detail: ' לא נמצאו הצהרות בטווח התאריכים שבחרת.'
    }
  ];

  search() {

    this.msgs1 = [];

    if (!this.endDate || !this.startDate) {
      this.msgs1 = [
        { severity: 'error', summary: ' שאילתת הצהרות', detail: 'נא להשלים שדה תאריך' }
      ];
      this.noDeclarationsFound = false;
      this.noDeclarationsMsg = [];
      return;
    }

    this.loading = true;

    const start = this.startDate instanceof Date ? this.startDate : new Date(this.startDate);
    const end = this.endDate instanceof Date ? this.endDate : new Date(this.endDate);

    this.declarationService.getDeclarations$(
      start.toISOString(),
      end.toISOString(),
      this.importerId || "",
      this.eventCode || ""
    ).pipe(
      tap(res => {
        this.allDeclarations = res;

        this.allDeclarations.forEach((x: any) => {
          const arrival = x.Consignments?.[0]?.ArrivalDateTime;
          if (arrival) {
            const myDate = new Date(arrival);
            const formatted = (myDate.getMonth() + 1) + '/' + myDate.getDate() + '/' + myDate.getFullYear();
            x.ArrivalDateTime = formatted;
            x.CargoDescription = x.Consignments?.[0]?.CargoDescription;
          }
        });

        this.filteredDeclarations = this.allDeclarations;
        this.filteredDeclarationsCount = this.filteredDeclarations.length;
        this.noDeclarationsFound = this.filteredDeclarationsCount === 0;

        if (this.noDeclarationsFound) {
          this.noDeclarationsMsg = [{
            severity: 'info',
            summary: 'תוצאה',
            detail: 'לא נמצאו הצהרות בטווח התאריכים שבחרת.'
          }];
        } else {
          this.noDeclarationsMsg = [];
        }

        this.msgs1 = [];
        this.isShowFilter = true;
        this.isFiltered = true;
      }),
      tap(_ => this.loading = false)
    ).subscribe({
      error: err => {
        this.loading = false;
        this.msgs1 = [{ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעת שליפת ההצהרות' }];
      }
    });
  }

  filterByDates() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      this.filteredDeclarations = this.allDeclarations.filter((declaration: any) => {
        const arrivalDate = declaration.Consignments?.[0]?.ArrivalDateTime ? new Date(declaration.Consignments[0].ArrivalDateTime) : null;
        if (arrivalDate) {
          return arrivalDate >= start && arrivalDate <= end;
        }
        return false;
      });
    } else {
      this.filteredDeclarations = this.allDeclarations;
    }

    this.filteredDeclarationsCount = this.filteredDeclarations.length;
    this.noDeclarationsFound = this.filteredDeclarationsCount === 0; // ✅ חדש
    this.isFiltered = true;
  }

  cancelFilter() {
    this.filteredDeclarations = [];
    this.filteredDeclarationsCount = 0;
    this.noDeclarationsFound = true; // ✅ חדש
    this.isFiltered = false;
    this.isShowFilter = false;
  }

  getImporterName() {
    // this.customsClientService.GetClient$(this.importerId, '').subscribe({
    //   next: (responseData: any) => {
    //     this.importerName = responseData?.generalCustomerDataField?.fullNameField
    //     return responseData?.generalCustomerDataField?.fullNameField
    //   },
    //   error: () => {
    //   }
    // });
  }

  customStatusName(code: any) {
    for (let i = 0; i < this.customsStatuses?.length; i++) {
      let a = this.customsStatuses[i];
      if (a.code == code) {
        return a.name
      }
    }
  }

  onFilter(event: any) {
    this.filteredDeclarationsCount = event.filteredValue.length;
  }

  editDeclaration(declaration: any) {
    // this.newItemEvent.emit(this.UpdateModeE);
    // this.newDeclarationService.getDeclarationToEdit$(declaration.AgentFileReferenceID).pipe(
    //   map(res => this.DeclarationToEdit = res[0]),
    // ).subscribe()

    // localStorage.setItem('declarationId', declaration.AgentFileReferenceID)
    // this.router.navigateByUrl('app-declaration/new-declaration?Mode=e');
    localStorage.setItem('currentDecId', declaration.Id)
    this.decType = declaration.Type;
    localStorage.setItem('decType', declaration.Type);

    if (this.decType == 'tr') {
      this.router.navigate(['declaration-main/dec-form-ts'], { queryParams: { 'Mode': 'e', } })
      this.stepService.emitStepCompleted('dec-form-ts');

    }
    else {
      this.router.navigate(['declaration-main/dec-form'], { queryParams: { 'Mode': 'e', } })
      this.stepService.emitStepCompleted('dec-form');
    }

    // this.router.navigateByUrl('declaration-main/dec-form?Mode=e');
  }
  // ✅ פונקציה חדשה להעתקת הצהרה
  copyDeclaration(declaration: any) {
    localStorage.setItem('currentDecId', declaration.Id);
    localStorage.setItem('decType', declaration.Type);
    localStorage.setItem('copyMode', 'true'); // ✅ סימן שזה מצב העתקה

    if (declaration.Type == 'tr') {
      this.router.navigate(['declaration-main/dec-form-ts'], {
        queryParams: {
          'Mode': 'copy',  // ✅ מצב העתקה במקום עריכה
          'type': 'import'
        }
      });
      this.stepService.emitStepCompleted('dec-form-ts');
    } else {
      this.router.navigate(['declaration-main/dec-form'], {
        queryParams: {
          'Mode': 'copy',  // ✅ מצב העתקה במקום עריכה
          'type': 'import'
        }
      });
      this.stepService.emitStepCompleted('dec-form');
    }
  }

}
