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

  declartions: any
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
    this.importerId = localStorage.getItem('userId')
    window.dispatchEvent(new Event('resize'));

    this.startDate.setDate(this.startDate.getDate() - 7);

    this.search();

    this.customsDataService.getCustomsTableValues$('1981').pipe(
      map(res => {
        this.customsStatuses = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 }));
      }),
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

  search() {
    if (!this.endDate || !this.startDate) {
      this.msgs1 = [
        { severity: 'error', summary: 'שאילתת הצהרות', detail: 'נא להשלים שדה תאריך' }]
    }
    else {
      this.loading = true
      let i = 0
      this.declarationService.getDeclarations$('', '', this.importerId || "", this.eventCode || "").pipe(
        // this.declarationService.getDeclarations$(this.startDate.toJSON(), this.endDate.toJSON(), this.importerId || "", this.eventCode || "").pipe(
        tap(res => this.initialDeclarationsCount = res.length),
        tap(res => this.allDeclarations = res),
        tap(_ => this.loading = false),
      ).subscribe(
        _ => {
          console.log(this.allDeclarations);

          this.getImporterName();
          this.allDeclarations.forEach((x: any) => {
            if (x.Consignments && x.Consignments.length > 0 && x.Consignments[0] && x.Consignments[0].ArrivalDateTime) {

              var myDate = new Date(x.Consignments[0].ArrivalDateTime)
              x.Consignments[0].ArrivalDateTime = (myDate.getMonth() + 1) + '/' + myDate.getDate() + '/' + myDate.getFullYear();
              x.CargoDescription = x.Consignments[0].CargoDescription;
              x.ArrivalDateTime = x.Consignments[0].ArrivalDateTime;
            }
          });
          this.filteredDeclarations = this.allDeclarations;

          this.filteredDeclarationsCount = this.allDeclarations.length
          this.isShowFilter = true
        }
      )
    }
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

    this.isFiltered = true
    this.filteredDeclarationsCount = this.filteredDeclarations.length;
  }

  cancelFilter() {
    this.filteredDeclarations = this.allDeclarations;
    this.startDate = new Date();
    this.endDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 7);

    this.isFiltered = false;
    this.filteredDeclarationsCount = this.filteredDeclarations.length;
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
    for (let i = 0; i < this.customsStatuses.length; i++) {
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
    this.router.navigate(['declaration-main/dec-form'], { queryParams: { customsSend: true, 'Mode': 'e' } })
    this.stepService.emitStepCompleted('dec-form');
    // this.router.navigateByUrl('declaration-main/dec-form?Mode=e');
  }

}
