// import { Component } from '@angular/core';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { DropdownModule } from 'primeng/dropdown';
// import { FileUploadModule } from 'primeng/fileupload';
// import { ButtonModule } from 'primeng/button';
// import { CalendarModule } from 'primeng/calendar';
// import { CheckboxModule } from 'primeng/checkbox';
// import { AutoCompleteModule } from 'primeng/autocomplete';
// import { MessagesModule } from 'primeng/messages';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { InputTextModule } from 'primeng/inputtext';
// import { CardModule } from 'primeng/card';
// import { TableModule } from 'primeng/table';
// import { DialogModule } from 'primeng/dialog';
// import { CommonModule } from '@angular/common';
// import { ConfirmationService, Message, MessageService } from 'primeng/api';
// import { DocumentService } from '../../shared/services/document.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CustomsDataService } from '../../shared/services/customs-data.service';
// import { map } from 'rxjs';
// import { StepService } from '../../shared/services/step.service';
// import { DeclarationService } from '../../shared/services/declaration.service';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import { TooltipModule } from 'primeng/tooltip';

// @Component({
//   selector: 'app-add-documents',
//   standalone: true,
//   templateUrl: './add-documents.component.html',
//   styleUrl: './add-documents.component.scss',
//   imports: [
//     CommonModule,
//     TableModule,
//     CardModule,
//     DropdownModule,
//     ButtonModule,
//     MessagesModule,
//     DialogModule,
//     ProgressSpinnerModule,
//     FormsModule
//   ]
// })
// export class AddDocumentsComponent {

//   /* ===================== */
//   /* משתני מערכת */
//   /* ===================== */

//   loading = false;
//   msgs1: Message[] = [];
//   documents: any[] = [];
//   cols: any[] = [];

//   currentDecId = localStorage.getItem('currentDecId');

//   /* ===================== */
//   /* הוספת מסמך */
//   /* ===================== */

//   documentCodes = [
//     { name: 'שטר מטען (WB)', code: '714' },
//     { name: 'חשבונית ספק (INV)', code: '380' },
//     { name: 'רשימת אריזה (PL)', code: '271' },
//   ];

//   selectedDocumentCode: any = null;
//   selectedFile: File | null = null;

//   /* ===================== */
//   /* צפייה במסמך */
//   /* ===================== */

//   displayDialog = false;
//   fileToView: any;

//   constructor(
//     private documentsService: DocumentService,
//     private sanitizer: DomSanitizer
//   ) { }

//   ngOnInit(): void {

//     /* הגדרת עמודות הטבלה */
//     this.cols = [
//       { field: 'Code', header: 'סוג צרופה' },
//       { field: 'FileName', header: 'שם קובץ' },
//       { field: 'Id', header: 'מזהה פנימי' },
//       { field: 'CustomsId', header: 'מזהה מכס' },
//     ];

//     this.loadDocuments();
//   }

//   /* ===================== */
//   /* טעינת מסמכים */
//   /* ===================== */

//   loadDocuments() {
//     if (!this.currentDecId) return;

//     this.loading = true;

//     this.documentsService.getDocumentsByEntityId$(this.currentDecId)
//       .subscribe({
//         next: res => {
//           this.documents = res;
//           this.loading = false;
//         },
//         error: _ => {
//           this.documents = [];
//           this.loading = false;
//         }
//       });
//   }

//   /* ===================== */
//   /* הוספת קובץ */
//   /* ===================== */

//   onFileSelect(event: any) {
//     const file = event.target.files?.[0];
//     if (file) {
//       this.selectedFile = file;
//     }
//     event.target.value = '';
//   }

//   canUpload(): boolean {
//     return !!this.selectedFile && !!this.selectedDocumentCode;
//   }

//   saveDocument() {

//     if (!this.canUpload()) return;

//     const formData = new FormData();
//     formData.append('dtvalues', this.selectedFile!);
//     formData.append('EntityID', this.currentDecId!);
//     formData.append('DocumentType', this.selectedDocumentCode.code);
//     formData.append('BlobName', this.selectedFile!.name);

//     this.loading = true;

//     this.documentsService.uploadDocument(formData).subscribe({
//       next: (res: any) => {

//         const doc = {
//           Id: 0,
//           Code: this.selectedDocumentCode.code,
//           Url: res.url,
//           FileName: this.selectedFile!.name,
//           DocumentType: this.selectedDocumentCode.code,
//           CustomsId: 0,
//           CustomsStatus: 0,
//           RelatedEntity: 1055,
//           RelatedID: this.currentDecId
//         };

//         this.documentsService.postDocuments$(doc).subscribe(() => {
//           this.msgs1 = [{ severity: 'success', summary: 'הצלחה', detail: 'המסמך נשמר' }];
//           this.selectedFile = null;
//           this.selectedDocumentCode = null;
//           this.loadDocuments();
//         });
//       },
//       error: _ => {
//         this.loading = false;
//         this.msgs1 = [{ severity: 'error', summary: 'שגיאה', detail: 'שמירת המסמך נכשלה' }];
//       }
//     });
//   }

//   /* ===================== */
//   /* פעולות טבלה */
//   /* ===================== */

//   deleteDocument(id: string) {
//     this.documentsService.deleteDocument$(id).subscribe(() => {
//       this.loadDocuments();
//     });
//   }

//   editDocument(row: any) {
//     this.selectedDocumentCode = this.documentCodes.find(d => d.code === row.DocumentType);
//   }

//   viewExistingFile(row: any) {
//     this.displayDialog = true;
//     this.fileToView = this.sanitizer.bypassSecurityTrustResourceUrl(row.Url);
//   }

//   getDocumentTypeName(code: string): string {
//     const found = this.documentCodes.find(d => d.code === code);
//     return found ? found.name : code;
//   }
// }

// // /=========================
// import { Component } from '@angular/core';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { DropdownModule } from 'primeng/dropdown';
// import { FileUploadModule } from 'primeng/fileupload';
// import { ButtonModule } from 'primeng/button';
// import { CalendarModule } from 'primeng/calendar';
// import { CheckboxModule } from 'primeng/checkbox';
// import { AutoCompleteModule } from 'primeng/autocomplete';
// import { MessagesModule } from 'primeng/messages';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { InputTextModule } from 'primeng/inputtext';
// import { CardModule } from 'primeng/card';
// import { TableModule } from 'primeng/table';
// import { DialogModule } from 'primeng/dialog';
// import { CommonModule } from '@angular/common';
// import { ConfirmationService, Message, MessageService } from 'primeng/api';
// import { DocumentService } from '../../shared/services/document.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CustomsDataService } from '../../shared/services/customs-data.service';
// import { map } from 'rxjs';
// import { StepService } from '../../shared/services/step.service';
// import { DeclarationService } from '../../shared/services/declaration.service';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import { TooltipModule } from 'primeng/tooltip';

// @Component({
//   selector: 'app-add-documents',
//   standalone: true,
//   imports: [CommonModule, TableModule, TooltipModule, CardModule, DialogModule, FormsModule, ReactiveFormsModule, DropdownModule, FileUploadModule, ButtonModule, CalendarModule, CheckboxModule, AutoCompleteModule, MessagesModule, ConfirmDialogModule, ProgressSpinnerModule, InputTextModule],
//   templateUrl: './add-documents.component.html',
//   styleUrl: './add-documents.component.scss',
//   providers: [ConfirmationService, MessageService]
// })

// export class AddDocumentsComponent {
//   // [x: string]: any;
//   Object = Object;

//   declarationid = localStorage.getItem('declarationId')
//   currentDecId = localStorage.getItem('currentDecId')

//   loading = false
//   msgs1: Message[] = [];
//   documentId: string = ''

//   isSaveAndSend = false

//   uploadedFiles: File[] = [];
//   items: any
//   documentCodes!: { name: string; code: string; }[];
//   documentCode = { name: '', code: '' }
//   documentObject = {
//     Id: 0, Code: '', Url: '', FileName: '', DocumentType: '', CustomsId: 0, InternalID: 0, CustomsStatus: 0, ErrorDesc: '', RelatedEntity: 0, RelatedID: ''
//   };

//   myfileToDb =
//     {
//       "Documents": {
//         "Code": '',
//         "URL": "",
//         "FileName": '',
//         "DocumentType": ''
//       },
//       "EntityId": 0,
//       "EntityType": ''
//     }

//   //selectedDocumentCode = { name: 'חשבונית ספק (INV)', code: '380' };
//   selectedDocumentCode: any
//   selectedFileName: string = '';
//   internalDocumentNumber: string = '';
//   customsDocumentNumber: string = '';
//   documentAttributes: any[] = [];
//   uploadedFile: any;

//   declarationCargoIDType: any = { name: '', code: '' };
//   filteredCargoIDType: any[] = []
//   fileUrl: any;
//   allAttributes: any;
//   mandatoryAttributes: any;
//   currrentAttributes: any;
//   isShowMore: boolean = false;
//   relatedID: any;

//   isUpdateMode = false
//   cols: any[] | undefined;
//   documents: any[] = [];
//   selectedDocument: any;
//   fileToView: any;
//   viewFileIndex: number = -1;
//   displayDialog = false;

//   uploadedFilesByType: { [key: string]: any[] } = {};
//   groupedDocuments: any;
//   showBtnCustoms: boolean = false;
//   deleting: { [id: string]: boolean } = {};

//   // selectedDocumentCode: any;
//   // uploadedFiles: any[] = [];
//   constructor(private documentsService: DocumentService, private sanitizer: DomSanitizer, private stepService: StepService, private decService: DeclarationService, private confirmationService: ConfirmationService, private messageService: MessageService, private router: Router, private customsDataService: CustomsDataService) { }

//   ngOnInit(): void {

//     this.documentCodes = [
//       { name: 'שטר מטען (WB)', code: '714' },
//       { name: 'חשבונית ספק (INV)', code: '380' },
//       { name: 'רשימת אריזה (PL)', code: '271' },
//     ];
//     this.selectedDocumentCode = this.documentCodes[0];

//     this.cols = [
//       { field: 'Code', header: 'סוג צרופה', },
//       { field: 'FileName', header: 'שם קובץ' },
//       { field: 'Id', header: 'מזהה פנימי' },
//       { field: 'CustomsId', header: 'מזהה מכס' },
//     ];

//     this.getdoc();

//   }

//   getdoc() {
//     if (this.currentDecId) {
//       this.loading = true
//       this.documentsService.getDocumentsByEntityId$(this.currentDecId).pipe(
//         map(res => this.documents = res),
//         map(_ => this.loading = false)
//       ).subscribe(
//         res => {
//           const hasType714 = this.documents.some((doc: any) => doc.DocumentType === '714');

//           const hasType380 = this.documents.some((doc: any) => doc.DocumentType === '380');

//           this.showBtnCustoms = hasType714 && hasType380;
//           this.groupDocumentsByType()
//         },
//         error => {
//           this.loading = false
//           this.documents = []

//         })
//     }
//   }

//   groupDocumentsByType() {
//     this.groupedDocuments = this.documents.reduce((acc, document) => {
//       const type = document.DocumentType;
//       if (!acc[type]) {
//         acc[type] = [];
//       }
//       acc[type].push(document);
//       return acc;
//     }, {});
//   }

//   loadDocuments(id: string) {
//     this.documentsService.getDocumentsById$(id).subscribe(
//       async (response: any) => {
//         this.internalDocumentNumber = response.Id;
//         this.customsDocumentNumber = response.CustomsId
//         this.fileUrl = response.URL;
//         this.selectedFileName = response.FileName;
//         this.uploadedFile = await this.fetchFileFromUrl(response.URL, response.FileName);
//         const documentTypeCode = response.DocumentType;
//         this.updateDocumentType(documentTypeCode);
//         // this.loadDocumentAttribute(id);
//       }
//     );
//   }

//   async fetchFileFromUrl(url: string, fileName: string): Promise<File> {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     return new File([blob], fileName, { type: blob.type });
//   }

//   deleteDocument(docId: string) {
//     if (this.deleting[docId]) return;
//     this.deleting[docId] = true;
//     this.documentsService.deleteDocument$(docId).subscribe(
//       response => {
//         console.log(response);
//         if (response) {
//           this.msgs1 = [
//             { severity: 'success', summary: 'מחיקת מסמך ', detail: `המסמך נמחק בהצלחה` },
//           ];
//         }
//         this.getdoc();
//       },
//       error => {
//         this.deleting[docId] = false;

//         this.msgs1 = [
//           { severity: 'error', summary: 'מחיקת מסמך ', detail: `קרתה שגיאה בעת מחיקת המסמך  ` },
//         ];
//       }
//     )
//   }

//   sendDecToCustoms() {
//     let navigationExtras: any = {};

//     navigationExtras.queryParams = { 'Mode': 'e', 'Send': 'T' };

//     this.router.navigate(['declaration-main/dec-form-ts'], navigationExtras);

//     // const decId = localStorage.getItem('currentDecId');

//     // this.decService.getDeclaration(decId).subscribe(res => {
//     //   console.log(res);
//     //   const currentDec = res;

//     // })
//   }

//   navigateToAddDocument(rowData: any) {
//     if (rowData.Code == "IL_279") {
//       window.open(rowData.URL, '_blank');
//     }
//     else {
//       this.router.navigate(['declaration-main/add-doc'], {
//         queryParams: { documentId: rowData.Id, 'Mode': 'e' }
//       });
//     }

//   }

//   getDocumentTypeName(code: string): string {
//     const docType = this.documentCodes.find((item: { code: string; }) => item.code === code);
//     return docType ? docType.name : code;
//   }


//   updateDocumentType(code: string) {
//     const foundCode = this.documentCodes.find(doc => doc.code === code);
//     if (foundCode) {
//       this.selectedDocumentCode = foundCode;
//       this.onDocumentTypeChange();
//     }
//   }

//   onDocumentTypeChange() {
//     this.resetDocumentDetails();

//   }

//   resetDocumentDetails() {
//     this.documentAttributes = [{ name: '', value: '' }];
//   }

//   onFileSelect(event: any) {
//     const input = event.target as HTMLInputElement;
//     if (input?.files?.length) {

//       const file = input.files[0];


//       const documentTypeCode = this.selectedDocumentCode.code;

//       if (!this.uploadedFilesByType[documentTypeCode]) {
//         this.uploadedFilesByType[documentTypeCode] = [];
//       }

//       this.uploadedFilesByType[documentTypeCode].push(file);
//       this.uploadedFiles.push(file);
//       console.log(this.uploadedFilesByType);

//     }

//     // this.uploadedFilesByType = {};
//     // this.uploadedFiles = [];

//     event.target.value = ''
//   }

//   viewFile(file: any): void {
//     this.displayDialog = true

//     if (file.URL) {
//       this.fileToView = this.sanitizer.bypassSecurityTrustResourceUrl(file.URL);
//     }
//     else {
//       const reader = new FileReader();

//       reader.onloadend = () => {
//         const fileUrl = reader.result as string;
//         const fileType = file.type.includes('image') ? 'image' : 'pdf';
//         this.fileToView = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
//       };

//       reader.readAsDataURL(file);
//     }
//   }

//   hideFile() {
//     this.displayDialog = false
//     this.viewFileIndex = -1;
//     this.fileToView = null;
//   }

//   removeFile(documentType: string, index: number): void {
//     this.hideFile();
//     //this.uploadedFiles.splice(index, 1);
//     this.uploadedFilesByType[documentType].splice(index, 1);

//     if (this.uploadedFilesByType[documentType].length === 0) {
//       delete this.uploadedFilesByType[documentType];
//     }
//   }
//   hasDocument(type: string): boolean {
//     return this.documents && this.documents.some((doc: any) => doc.DocumentType === type);
//   }

//   // עדכון הטולטיפ
//   getDocumentsTooltip(): string {
//     const has714 = this.hasDocument('714');
//     const has380 = this.hasDocument('380');

//     if (!has714 && !has380) {
//       return 'לא ניתן לשמור – יש להוסיף שטר מטען (714) וחשבון ספק (380)';
//     } else if (!has714) {
//       return 'לא ניתן לשמור – חסר שטר מטען (714)';
//     } else if (!has380) {
//       return 'לא ניתן לשמור – חסר חשבון ספק (380)';
//     }
//     return '';
//   }

//   canSaveDocuments(): boolean {
//     return this.hasDocument('714') && this.hasDocument('380');
//   }
//   // hasDocument714(): boolean {
//   //   return Object.keys(this.uploadedFilesByType).includes('714')
//   //     || this.documents.some((doc: any) => doc.DocumentType === '714');
//   // }

//   // get714Tooltip(): string {
//   //   if (!this.hasDocument714()) {
//   //     return 'לא ניתן לשמור – יש להוסיף שטר מטען';
//   //   }
//   //   return '';
//   // }


//   async saveDocuments() {
//     const hasCode714 = Object.keys(this.uploadedFilesByType).includes('714')
//       || this.documents.some(doc => doc.DocumentType === '714');

//     if (!hasCode714) {
//       this.msgs1 = [
//         { severity: 'error', summary: 'שגיאה', detail: 'לא ניתן לשמור! יש להעלות לפחות מסמך קוד 714' }
//       ];
//       return;
//     }
//     return new Promise<void>((resolve, reject) => {
//       if (Object.keys(this.uploadedFilesByType).length === 0) {
//         // this.msgs1 = [
//         //   { severity: 'error', summary: 'Error', detail: 'נא בחר קובץ לשליחה!' }
//         // ];
//         // this.loading = false;
//         // reject('נא בחר קובץ לשליחה!');
//         return;
//       }

//       for (const documentTypeCode in this.uploadedFilesByType) {
//         const files = this.uploadedFilesByType[documentTypeCode];

//         (async () => {
//           for (let index = 0; index < files.length; index++) {
//             this.uploadedFile = files[index];
//             this.msgs1 = [];
//             console.log(this.uploadedFile.name);
//             const englishName = this.translateHebrewToEnglish('dec');
//             const timestamp = new Date().getTime();
//             const uniqueFileName = `${englishName}_${timestamp}`;
//             const formData = new FormData();
//             formData.append('dtvalues', this.uploadedFile);
//             formData.append('EntityID', this.currentDecId || '');
//             formData.append('DocumentType', documentTypeCode);
//             formData.append('BlobName', uniqueFileName);

//             this.loading = true;

//             console.log('FormData entries:');
//             formData.forEach((value, key) => {
//               console.log(`${key}:`, value);
//             });

//             // Upload to Azure
//             try {
//               const response: any = await this.documentsService.uploadDocument(formData).toPromise();
//               console.log(response);

//               if (response.url) {
//                 this.documentObject = {
//                   Id: 0,
//                   Code: documentTypeCode,
//                   Url: response.url,
//                   FileName: this.uploadedFile.name,
//                   DocumentType: documentTypeCode,
//                   CustomsId: 0,
//                   InternalID: 0,
//                   CustomsStatus: 0,
//                   ErrorDesc: '',
//                   RelatedEntity: 1055,
//                   RelatedID: this.currentDecId || ''
//                 };

//                 // Save doc to DB
//                 if (!this.isUpdateMode) {
//                   const docResponse = await this.documentsService.postDocuments$(this.documentObject).toPromise();
//                   console.log(docResponse);
//                   this.documentId = docResponse.Id;
//                   this.documentObject.Id = docResponse.Id;
//                   this.internalDocumentNumber = docResponse.Id;
//                   this.loading = false;

//                   this.msgs1 = [
//                     { severity: 'success', summary: 'Success', detail: 'המסמך נשמר בהצלחה !' },
//                   ];

//                   this.uploadedFilesByType = {};
//                   this.uploadedFiles = [];
//                   this.getdoc();

//                   // Send to customs for each document
//                   // await this.sendToCustoms(this.uploadedFile, documentTypeCode, this.documentId, this.documentObject);
//                 } else {
//                   this.documentObject.Id = this.relatedID;
//                   const updateResponse = await this.documentsService.updateDocument$(this.relatedID, this.documentObject).toPromise();
//                   console.log(updateResponse);
//                   this.documentId = updateResponse.Id;
//                 }
//               }
//             } catch (error) {
//               console.log(error);
//               this.loading = false;
//               this.messageService.add({ severity: 'error', summary: 'Error', detail: 'העלאת המסמך נכשלה!' });
//               reject(error);
//               return;
//             }
//           }
//         })();
//       }

//       resolve();
//     });
//   }

//   // async sendToCustoms(file: any, typeCode: any, documentId: any, documentObject: any) {
//   //   // const file = this.uploadedFile;
//   //   const formData = new FormData();

//   //   formData.append('Content', file);
//   //   formData.append('Name', file.name);
//   //   formData.append('DocumentType', typeCode);
//   //   if (typeCode == '380') {
//   //     formData.append(`attributes[87]`, JSON.stringify({
//   //       id: 87,
//   //       value: 'true'
//   //     }));
//   //   }
//   //   else if (typeCode === '714') {
//   //     const decId = localStorage.getItem('currentDecId');
//   //     const res = await this.decService.getDeclaration(decId).toPromise();
//   //     console.log('res:', res);

//   //     const consignmentData = res?.[0]?.ConsignmentPackagesMeasures?.[0]?.Consignments;

//   //     formData.append(`attributes[57]`, JSON.stringify({ id: 57, value: new Date() }));

//   //     if (consignmentData?.TransportContractDocumentTypeCode) {
//   //       formData.append(`attributes[99]`, JSON.stringify({
//   //         id: 99,
//   //         value: consignmentData.TransportContractDocumentTypeCode
//   //       }));
//   //     } else {
//   //       console.warn('TransportContractDocumentTypeCode is missing');
//   //     }

//   //     if (consignmentData?.TransportContractDocumentID) {
//   //       formData.append(`attributes[100]`, JSON.stringify({
//   //         id: 100,
//   //         value: consignmentData.TransportContractDocumentID
//   //       }));
//   //     } else {
//   //       console.warn('TransportContractDocumentID is missing');
//   //     }
//   //   }


//   //   this.loading = true;

//   //   this.documentsService.sendToCustoms$(formData).subscribe(
//   //     response => {
//   //       console.log(response);

//   //       this.loading = false;
//   //       if (response.responseContentHeaderField.exceptionField) {
//   //         documentObject.CustomsStatus = 0
//   //         this.msgs1 = [
//   //           { severity: 'error', summary: 'שליחת מסמך למכס', detail: response.responseContentHeaderField.exceptionField[0].exeptionDescriptionField },
//   //         ];
//   //         return
//   //       }
//   //       else if (response.responseContentHeaderField.applicationIDField) {
//   //         this.customsDocumentNumber = response.responseContentHeaderField.applicationIDField
//   //         documentObject.CustomsStatus = 1
//   //         documentObject.CustomsId = response.responseContentHeaderField.applicationIDField
//   //         documentObject.InternalID = response.externalAttachmentIDField
//   //         this.msgs1 = [
//   //           { severity: 'success', summary: 'Success', detail: 'המסמך נשלח למכס בהצלחה!' },
//   //         ];
//   //       }
//   //       else {
//   //         this.msgs1 = [
//   //           { severity: 'error', summary: 'שליחת מסמך למכס', detail: 'התרחשה שגיאה בעת השליחה למכס' },
//   //         ];
//   //         return
//   //       }
//   //       console.log(documentId);
//   //       console.log(this.documentObject);

//   //       this.documentsService.updateDocument$(documentId, documentObject).subscribe(
//   //         res => {
//   //           this.loading = false
//   //           console.log(res)
//   //           this.getdoc()
//   //           this.uploadedFilesByType = {}
//   //         },
//   //         err => {
//   //           this.loading = false
//   //           console.log(err)
//   //         }
//   //       )
//   //     },
//   //     (error: any) => {
//   //       this.loading = false;
//   //       this.documentObject.CustomsStatus = 0,
//   //         this.documentObject.ErrorDesc = error
//   //       this.msgs1 = [
//   //         { severity: 'error', summary: 'Error', detail: 'שליחת המסמך למכס נכשלה!' }
//   //       ];
//   //       // this.documentsService.updateDocument$(this.documentId, this.documentObject).subscribe(
//   //       //   res => {
//   //       //     this.loading = false
//   //       //     console.log(res)
//   //       //     this.getdoc()
//   //       //   },
//   //       //   err => {
//   //       //     this.loading = false
//   //       //     console.log(err)
//   //       //   }
//   //       // )
//   //     }
//   //   );
//   // }

//   nextStep() {
//     this.saveDocuments();
//     // if (localStorage.getItem('CustomsStatus') !== "12" || null)
//     this.stepService.emitStepCompleted('+');
//     // else {
//     //   this.router.navigate(['declaration-main/dec-form'], { queryParams: {fromDocs:true, customsSend: true, 'Mode': 'e' } })
//     //   this.stepService.emitStepCompleted('dec-form');
//     // }
//   }

//   previousStep() {
//     this.stepService.emitStepCompleted('-');
//   }

//   getFileIcon(fileName: string): string {
//     const extension = fileName.split('.').pop()?.toLowerCase();

//     switch (extension) {
//       case 'pdf':
//         return 'pi pi-file-pdf';
//       case 'docx':
//       case 'doc':
//         return 'pi pi-file-word';
//       case 'xlsx':
//       case 'xls':
//         return 'pi pi-file-excel';
//       case 'jpg':
//       case 'jpeg':
//       case 'png':
//         return 'pi pi-image';
//       case 'txt':
//         return 'pi pi-file-text';
//       default:
//         return 'pi pi-file';
//     }
//   }


//   translateHebrewToEnglish(fileName: string): string {
//     const hebrewToEnglishMap: { [key: string]: string } = {
//       'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H', 'ו': 'V', 'ז': 'Z', 'ח': 'H',
//       'ט': 'T', 'י': 'Y', 'כ': 'K', 'ל': 'L', 'מ': 'M', 'נ': 'N', 'ס': 'S', 'ע': 'A',
//       'פ': 'P', 'צ': 'T', 'ק': 'Q', 'ר': 'R', 'ש': 'SH', 'ת': 'T',
//       ' ': '_',
//     };

//     return fileName.split('').map(char => hebrewToEnglishMap[char] || char).join('');
//   }
// }

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/api';
import { DocumentService } from '../../shared/services/document.service';
import { DomSanitizer } from '@angular/platform-browser';
import { StepService } from '../../shared/services/step.service';



@Component({
  selector: 'app-add-documents',
  standalone: true,
  templateUrl: './add-documents.component.html',
  styleUrls: ['./add-documents.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    DropdownModule,
    ButtonModule,
    MessagesModule,
    DialogModule,
    ProgressSpinnerModule,
    FormsModule
  ]
})
export class AddDocumentsComponent {

  loading = false;
  msgs1: Message[] = [];
  documents: any[] = [];
  cols: any[] = [];

  currentDecId = localStorage.getItem('currentDecId');

  // =========================
  // מסמכים
  // =========================
  documentCodes = [
    { name: 'שטר מטען (WB)', code: '714' },
    { name: 'חשבונית ספק (INV)', code: '380' },
    { name: 'רשימת אריזה (PL)', code: '271' },
  ];

  selectedDocumentCode: any = null;
  selectedFile: File | null = null;

  uploadedFilesByType: { [key: string]: File[] } = {};

  // =========================
  // צפייה במסמך
  // =========================
  displayDialog = false;
  fileToView: any;

  constructor(
    private documentsService: DocumentService,
    private sanitizer: DomSanitizer,
    private stepService: StepService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: 'Code', header: 'סוג צרופה' },
      { field: 'FileName', header: 'שם קובץ' },
      { field: 'Id', header: 'מזהה פנימי' },
      { field: 'CustomsId', header: 'מזהה מכס' },
    ];

    this.loadDocuments();

    // בחר את סוג המסמך הראשון
    if (this.documentCodes && this.documentCodes.length > 0) {
      this.selectedDocumentCode = this.documentCodes[0];
    }
  }

  // =========================
  // טעינת מסמכים קיימים
  // =========================
  loadDocuments() {
    if (!this.currentDecId) return;
    this.loading = true;
    this.documentsService.getDocumentsByEntityId$(this.currentDecId)
      .subscribe({
        next: res => {
          this.documents = res;
          this.loading = false;
          // ✅ בדוק אם אין מסמכים
          if (!this.documents || this.documents.length === 0) {
            this.msgs1 = [
              {
                severity: 'info',
                summary: 'מסמכי הצהרה',
                detail: `לא נמצאו מסמכים להצהרה מספר ${this.currentDecId}`

              }
            ];
          }
        },
        error: _ => {
          this.documents = [];
          this.loading = false;
          // ✅ בודא הודעה בשגיאה
          this.msgs1 = [
            {
              severity: 'error',
              summary: 'מסמכי הצהרה',
              detail: `לא נמצאו מסמכים להצהרה מספר ${this.currentDecId}`

            }
          ];
        }
      });
  }

  // =========================
  // בחירת קובץ חדש
  // =========================
  onFileSelect(event: any) {
    const file = event.target.files?.[0];
    if (file && this.selectedDocumentCode) {
      const code = this.selectedDocumentCode.code;
      if (!this.uploadedFilesByType[code]) {
        this.uploadedFilesByType[code] = [];
      }
      this.uploadedFilesByType[code].push(file);
    }
    event.target.value = '';
  }

  canUpload(): boolean {
    // return !!this.selectedFile || Object.keys(this.uploadedFilesByType).length > 0;
    return Object.keys(this.uploadedFilesByType).length > 0;

  }

  // =========================
  // שמירה של כל הקבצים החדשים
  // =========================
  saveDocument() {
    if (!this.canUpload()) return;

    this.loading = true;

    const types = Object.keys(this.uploadedFilesByType);
    let pending = 0;

    types.forEach(type => {
      const files = this.uploadedFilesByType[type];
      files.forEach(file => {
        pending++;

        const formData = new FormData();
        formData.append('dtvalues', file);
        formData.append('EntityID', this.currentDecId!);
        formData.append('DocumentType', type);
        formData.append('BlobName', file.name);

        this.documentsService.uploadDocument(formData).subscribe({
          next: (res: any) => {
            const doc = {
              Id: 0,
              Code: type,
              Url: res.url,
              FileName: file.name,
              DocumentType: type,
              CustomsId: 0,
              CustomsStatus: 0,
              RelatedEntity: 1055,
              RelatedID: this.currentDecId
            };

            this.documentsService.postDocuments$(doc).subscribe(() => {
              pending--;
              if (pending === 0) {
                this.uploadedFilesByType = {};
                this.loadDocuments();
                this.msgs1 = [{ severity: 'success', summary: 'הצלחה', detail: 'המסמכים נשמרו' }];
                this.loading = false;
              }
            });
          },
          error: _ => {
            pending--;
            this.loading = false;
            this.msgs1 = [{ severity: 'error', summary: 'שגיאה', detail: 'שמירת מסמך נכשלה' }];
          }
        });
      });
    });
  }

  // =========================
  // פעולות על טבלה
  // =========================
  deleteDocument(id: string) {
    this.documentsService.deleteDocument$(id).subscribe(() => {
      this.loadDocuments();
    });
  }

  // editDocument(row: any) {
  //   this.selectedDocumentCode = this.documentCodes.find(d => d.code === row.DocumentType);
  // }

  viewExistingFile(row: any) {
    this.displayDialog = true;
    // this.fileToView = this.sanitizer.bypassSecurityTrustResourceUrl(row.Url);
    // השתמש ב-URL (אותיות גדולות)
    if (row.URL) {
      this.fileToView = this.sanitizer.bypassSecurityTrustResourceUrl(row.URL);
    } else {
      this.msgs1 = [{ severity: 'error', summary: 'שגיאה', detail: 'לא ניתן לטעון את המסמך' }];
    }
  }

  viewNewFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.fileToView = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
      this.displayDialog = true;
    };
    reader.readAsDataURL(file);
  }

  removeFile(type: string, index: number) {
    this.uploadedFilesByType[type].splice(index, 1);
    if (this.uploadedFilesByType[type].length === 0) {
      delete this.uploadedFilesByType[type];
    }
  }

  getDocumentTypeName(code: string): string {
    const found = this.documentCodes.find(d => d.code === code);
    return found ? found.name : code;
  }

  goBack() {
    window.history.back();
  }

  nextStep() {
    this.stepService.emitStepCompleted('+');
  }

  previousStep() {
    this.stepService.emitStepCompleted('-');
  }

}
