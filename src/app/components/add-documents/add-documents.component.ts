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

import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { switchMap } from 'rxjs';
import { DeclarationService } from '../../shared/services/declaration.service';
import { CargoKey } from '../../shared/models/cargo-context.model';
import { CustomsDataService } from '../../shared/services/customs-data.service';
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
    FormsModule,
    TooltipModule,
  ],
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

  isDocumentsLockedBySbt: boolean = false;

  uploadedFilesByType: { [key: string]: File[] } = {};
  requiredDocuments: {
    code: string;
    name: string;
    required: boolean;
    exists: boolean;
    pendingFiles: File[];
  }[] = [];

  pendingDocumentCode: string | null = null;

  @ViewChild('hiddenFileInput') hiddenFileInput!: ElementRef<HTMLInputElement>;
  // =========================
  // צפייה במסמך
  // =========================
  displayDialog = false;
  fileToView: any;

  constructor(
    private documentsService: DocumentService,
    private sanitizer: DomSanitizer,
    private stepService: StepService,
    private router: Router,
    private decService: DeclarationService, // ✅ חדש
    private customsDataService: CustomsDataService,
  ) {}

  ngOnInit(): void {
    this.cols = [
      { field: 'Code', header: 'סוג צרופה' },
      { field: 'FileName', header: 'שם קובץ' },
      { field: 'Id', header: 'מזהה פנימי' },
      { field: 'CustomsId', header: 'מזהה מכס' },
    ];

    this.loadDocuments();
    this.checkIfDocumentsLockedBySbt();

    if (this.currentDecId) {
      this.decService.loadCargoContextFromStorage(this.currentDecId);
    }

    // בחר את סוג המסמך הראשון
    if (this.documentCodes && this.documentCodes.length > 0) {
      this.selectedDocumentCode = this.documentCodes[0];
    }
  }

  // =========================
  // טעינת מסמכים קיימים
  // =========================
  // loadDocuments() {
  //   if (!this.currentDecId) return;
  //   this.loading = true;
  //   this.documentsService.getDocumentsByEntityId$(this.currentDecId).subscribe({
  //     next: (res) => {
  //       this.documents = res;
  //       this.loading = false;
  //       // ✅ בדוק אם אין מסמכים
  //       if (!this.documents || this.documents.length === 0) {
  //         this.msgs1 = [
  //           // {
  //           //   severity: 'info',
  //           //   summary: 'מסמכי הצהרה',
  //           //   detail: `לא נמצאו מסמכים להצהרה מספר ${this.currentDecId}`
  //           // }
  //         ];
  //       }
  //     },
  //     error: (err: any) => {
  //       this.documents = [];
  //       this.loading = false;
  //       // ✅ אם אין מסמכים (404/204) אל תציג הודעה
  //       if (err?.status === 404 || err?.status === 204) {
  //         this.msgs1 = [];
  //         return;
  //       }
  //       // ✅ בודא הודעה בשגיאה
  //       this.msgs1 = [
  //         {
  //           severity: 'error',
  //           summary: 'מסמכי הצהרה',
  //           detail: `לא נמצאו מסמכים להצהרה מספר ${this.currentDecId}`,
  //         },
  //       ];
  //     },
  //   });
  // }
  loadDocuments() {
    if (!this.currentDecId) return;
    this.loading = true;

    this.documentsService.getDocumentsByEntityId$(this.currentDecId).subscribe({
      next: (res) => {
        this.documents = res ?? [];
        this.buildRequiredDocuments();
        this.loading = false;

        if (!this.documents || this.documents.length === 0) {
          this.msgs1 = [];
        }
      },
      error: (err: any) => {
        this.documents = [];
        this.buildRequiredDocuments();
        this.loading = false;

        if (err?.status === 404 || err?.status === 204) {
          this.msgs1 = [];
          return;
        }

        this.msgs1 = [
          {
            severity: 'error',
            summary: 'מסמכי הצהרה',
            detail: `לא נמצאו מסמכים להצהרה מספר ${this.currentDecId}`,
          },
        ];
      },
    });
  }

  // hasDocument(type: string): boolean {
  //   return (
  //     Array.isArray(this.documents) &&
  //     this.documents.some((d: any) => d.DocumentType === type)
  //   );
  // }

  hasDocument(type: string): boolean {
    return (
      Array.isArray(this.documents) &&
      this.documents.some((d: any) => (d.DocumentType ?? d.Code) === type)
    );
  }

  // האם יש קבצים חדשים שעוד לא נשמרו
  hasPendingUploads(): boolean {
    return Object.keys(this.uploadedFilesByType).length > 0;
  }

  // תנאי האם אפשר לשלוח למכס (כמו שהיה לך: 714 + 380)
  // canSendToCustoms(): boolean {
  //   return (
  //     this.hasDocument('714') &&
  //     this.hasDocument('380') &&
  //     !this.loading &&
  //     !this.hasPendingUploads()
  //   );
  // }

  canSendToCustoms(): boolean {
    if (this.isDocumentsLockedBySbt) return false;

    const requiredCodes = this.getRequiredDocumentCodes();

    const allRequiredExist = requiredCodes.every((code) =>
      this.hasDocument(code),
    );

    // return allRequiredExist && !this.loading && !this.hasPendingUploads();
    return (
      allRequiredExist &&
      !this.loading &&
      !this.hasPendingUploads() &&
      !this.isVersionTooHigh()
    );
  }

  sendDecToCustoms() {
    // אם את רוצה להיות בטוחה – אל תשלחי אם התנאים לא מתקיימים
    if (!this.canSendToCustoms()) {
      this.msgs1 = [
        {
          severity: 'warn',
          summary: 'לא ניתן לשלוח',
          detail: this.getSendToCustomsTooltip(),
        },
      ];
      return;
    }

    // const navigationExtras: any = {
    //   queryParams: { Mode: 'e', Send: 'T' },
    // };

    // this.router.navigate(['declaration-main/dec-form-ts'], navigationExtras);

    const decType = (
      localStorage.getItem('decType') ?? 'regular'
    ).toLowerCase();

    const target =
      decType === 'tr' || decType === 'ts'
        ? 'declaration-main/dec-form-ts'
        : 'declaration-main/dec-form';

    // הכי בטוח כשיש '/' בנתיב:
    this.router.navigateByUrl(
      `${target}?Mode=e&Send=T&type=${encodeURIComponent(decType)}`,
    );
  }

  // getSendToCustomsTooltip(): string {
  //   if (this.hasPendingUploads())
  //     return 'יש קבצים שנבחרו ועדיין לא נשמרו. שמרי קודם ואז שלחי למכס.';
  //   const has714 = this.hasDocument('714');
  //   const has380 = this.hasDocument('380');

  //   if (!has714 && !has380) return 'חסר שטר מטען (714) וחסר חשבונית ספק (380)';
  //   if (!has714) return 'חסר שטר מטען (714)';
  //   if (!has380) return 'חסר חשבונית ספק (380)';
  //   return '';
  // }

  getSendToCustomsTooltip(): string {
    if (this.isDocumentsLockedBySbt) {
      return 'ההצהרה הועברה להמשך טיפול. ניתן לצפות במסמכים בלבד.';
    }

    if (this.isVersionTooHigh()) {
      return 'ניתן לשלוח למכס עד 6 טיוטות';
    }

    if (this.hasPendingUploads()) {
      return 'יש קבצים שנבחרו ועדיין לא נשמרו. שמור קודם ואז שלח למכס.';
    }

    const missingDocs = this.getRequiredDocumentCodes()
      .filter((code) => !this.hasDocument(code))
      .map((code) => this.getDocumentTypeName(code));

    if (missingDocs.length > 0) {
      return `חסרים מסמכי חובה: ${missingDocs.join(', ')}`;
    }

    return '';
  }

  // =========================
  // בחירת קובץ חדש
  // =========================
  // onFileSelect(event: any) {
  //   const file = event.target.files?.[0];
  //   if (file && this.selectedDocumentCode) {
  //     const code = this.selectedDocumentCode.code;
  //     if (!this.uploadedFilesByType[code]) {
  //       this.uploadedFilesByType[code] = [];
  //     }
  //     this.uploadedFilesByType[code].push(file);
  //   }
  //   event.target.value = '';
  // }

  onFileSelect(event: any) {
    if (this.isDocumentsLockedBySbt) return;

    const file = event.target.files?.[0];
    if (file && this.selectedDocumentCode) {
      const code = this.selectedDocumentCode.code;
      if (!this.uploadedFilesByType[code]) {
        this.uploadedFilesByType[code] = [];
      }
      this.uploadedFilesByType[code].push(file);
      this.buildRequiredDocuments();
    }
    event.target.value = '';
  }

  canUpload(): boolean {
    if (this.isDocumentsLockedBySbt) return false;

    // return !!this.selectedFile || Object.keys(this.uploadedFilesByType).length > 0;
    return Object.keys(this.uploadedFilesByType).length > 0;
  }

  // =========================
  // שמירה של כל הקבצים החדשים
  // =========================

  saveDocument() {
    if (this.isDocumentsLockedBySbt) return;

    if (!this.canUpload()) return;

    this.loading = true;
    this.msgs1 = [];

    const types = Object.keys(this.uploadedFilesByType);
    let pending = 0;
    let hasError = false;

    // const finalizeIfDone = () => {
    //   if (pending === 0) {
    //     this.uploadedFilesByType = {};
    //     this.loadDocuments();
    //     this.msgs1 = [
    //       { severity: 'success', summary: 'הצלחה', detail: 'המסמכים נשמרו' },
    //     ];
    //     this.loading = false;
    //   }
    // };

    const finalizeIfDone = () => {
      if (pending === 0) {
        this.uploadedFilesByType = {};
        this.buildRequiredDocuments();
        this.loadDocuments();
        if (!hasError) {
          this.msgs1 = [
            {
              severity: 'success',
              summary: 'הצלחה',
              detail: 'המסמכים נשמרו',
            },
          ];
        }
        this.loading = false;
      }
    };

    for (const type of types) {
      const files = this.uploadedFilesByType[type];

      for (const file of files) {
        pending++;

        // שלב 1 - העלאה ל-Blob
        const blobFormData = new FormData();
        blobFormData.append('dtvalues', file);
        blobFormData.append('EntityID', this.currentDecId!);
        blobFormData.append('DocumentType', type);
        blobFormData.append('BlobName', file.name);

        this.documentsService.uploadDocument(blobFormData).subscribe({
          next: (blobRes: any) => {
            // שלב 2 – שמירה ב-DB מיד לאחר העלאה ל-Blob
            const doc = {
              Id: 0,
              Code: type,
              Url: blobRes.url,
              FileName: file.name,
              DocumentType: type,
              CustomsId: 0, // לפני השליחה למכס
              InternalID: null,
              CustomsStatus: 0, // עדיין לא נשלח
              ErrorDesc: null,
              RelatedEntity: 1055,
              RelatedID: this.currentDecId,
            };

            this.documentsService.postDocuments$(doc).subscribe({
              next: (createdDoc: any) => {
                // const attrsBase = this.buildAttributesForDoc(type);

                // // שמירת האטריביוטים תמיד
                // const attrsToSave = attrsBase.map((a) => ({
                //   DocID: createdDoc.Id,
                //   PointerID: this.currentDecId,
                //   Attribute: a.Attribute,
                //   Attribute_Vlaue: a.Attribute_Vlaue,
                // }));

                // this.documentsService
                //   .addDocumentAttributes$(attrsToSave)
                //   .subscribe({
                //     next: () => {
                //       // שלב 3 – שליחה למכס, אם נכשל רק נעדכן סטטוס
                //       const customsFormData = new FormData();
                //       customsFormData.append('file', file, file.name);
                //       customsFormData.append('DocumentType', type);
                //       attrsBase.forEach((attr, index) => {
                //         customsFormData.append(
                //           `attributes[${index}]`,
                //           JSON.stringify({
                //             id: String(attr.Attribute),
                //             value: String(attr.Attribute_Vlaue),
                //           }),
                //         );
                //       });

                //       this.documentsService
                //         .sendToCustoms$(customsFormData)
                //         .subscribe({
                //           next: (customsRes: any) => {
                //             // עדכון המסמך הקיים במידע מהמכס
                //             // הכנת אובייקט מלא עבור update
                //             const updateDoc = {
                //               Id: createdDoc.Id,
                //               Code: createdDoc.Code,
                //               URL: createdDoc.URL,
                //               FileName: createdDoc.FileName,
                //               DocumentType: createdDoc.DocumentType,
                //               CustomsId: customsRes.CustomsId ?? 0,
                //               InternalID: customsRes.InternalId ?? null,
                //               CustomsStatus: customsRes.Success ? 1 : 0,
                //               ErrorDesc: customsRes.ErrorMessage ?? null,
                //               RelatedEntity: createdDoc.RelatedEntity,
                //               RelatedID: createdDoc.RelatedID,
                //             };
                //             this.documentsService
                //               .updateDocument$(createdDoc.Id, updateDoc)
                //               .subscribe({
                //                 next: () => {
                //                   pending--;
                //                   finalizeIfDone();
                //                 },
                //                 error: () => {
                //                   hasError = true;
                //                   pending--;
                //                   this.msgs1 = [
                //                     {
                //                       severity: 'error',
                //                       summary: 'שגיאה',
                //                       detail: 'עדכון סטטוס למכס נכשל',
                //                     },
                //                   ];
                //                   finalizeIfDone();
                //                 },
                //               });
                //           },
                //           error: () => {
                //             hasError = true;
                //             pending--;
                //             this.msgs1 = [
                //               {
                //                 severity: 'warn',
                //                 summary: 'שליחה למכס נכשלה',
                //                 detail: `המסמך ${file.name} נשמר אך לא נשלח למכס`,
                //               },
                //             ];
                //             finalizeIfDone();
                //           },
                //         });
                //     },
                //     error: () => {
                //       hasError = true;
                //       pending--;
                //       this.msgs1 = [
                //         {
                //           severity: 'error',
                //           summary: 'שגיאה',
                //           detail: 'שמירת האטריביוטים נכשלה',
                //         },
                //       ];
                //       finalizeIfDone();
                //     },
                //   });
                const saveAttributes = () => {
                  const attrsBase = this.buildAttributesForDoc(type);

                  const attrsToSave = attrsBase.map((a) => ({
                    DocID: createdDoc.Id,
                    PointerID: this.currentDecId,
                    Attribute: a.Attribute,
                    Attribute_Vlaue: a.Attribute_Vlaue,
                  }));

                  this.documentsService
                    .addDocumentAttributes$(attrsToSave)
                    .subscribe({
                      next: () => {
                        // שלב 3 – שליחה למכס, אם נכשל רק נעדכן סטטוס
                        const customsFormData = new FormData();
                        customsFormData.append('file', file, file.name);
                        customsFormData.append('DocumentType', type);

                        attrsBase.forEach((attr, index) => {
                          customsFormData.append(
                            `attributes[${index}]`,
                            JSON.stringify({
                              id: String(attr.Attribute),
                              value: String(attr.Attribute_Vlaue),
                            }),
                          );
                        });

                        this.documentsService
                          .sendToCustoms$(customsFormData)
                          .subscribe({
                            next: (customsRes: any) => {
                              const updateDoc = {
                                Id: createdDoc.Id,
                                Code: createdDoc.Code,
                                URL: createdDoc.URL,
                                FileName: createdDoc.FileName,
                                DocumentType: createdDoc.DocumentType,
                                CustomsId: customsRes.CustomsId ?? 0,
                                InternalID: customsRes.InternalId ?? null,
                                CustomsStatus: customsRes.Success ? 1 : 0,
                                ErrorDesc: customsRes.ErrorMessage ?? null,
                                RelatedEntity: createdDoc.RelatedEntity,
                                RelatedID: createdDoc.RelatedID,
                              };

                              this.documentsService
                                .updateDocument$(createdDoc.Id, updateDoc)
                                .subscribe({
                                  next: () => {
                                    pending--;
                                    finalizeIfDone();
                                  },
                                  error: () => {
                                    hasError = true;
                                    pending--;
                                    this.msgs1 = [
                                      {
                                        severity: 'error',
                                        summary: 'שגיאה',
                                        detail: 'עדכון סטטוס למכס נכשל',
                                      },
                                    ];
                                    finalizeIfDone();
                                  },
                                });
                            },
                            error: () => {
                              hasError = true;
                              pending--;
                              this.msgs1 = [
                                {
                                  severity: 'warn',
                                  summary: 'שליחה למכס נכשלה',
                                  detail: `המסמך ${file.name} נשמר אך לא נשלח למכס`,
                                },
                              ];
                              finalizeIfDone();
                            },
                          });
                      },
                      error: () => {
                        hasError = true;
                        pending--;
                        this.msgs1 = [
                          {
                            severity: 'error',
                            summary: 'שגיאה',
                            detail: 'שמירת האטריביוטים נכשלה',
                          },
                        ];
                        finalizeIfDone();
                      },
                    });
                };

                if (type === '714' && !this.getCargoCreateDateIsoSafe()) {
                  this.refreshCargoCreateDateIfMissing().then(() => {
                    saveAttributes();
                  });
                } else {
                  saveAttributes();
                }
              },
              error: () => {
                hasError = true;
                pending--;
                this.msgs1 = [
                  {
                    severity: 'error',
                    summary: 'שגיאה',
                    detail: 'שמירת המסמך ב-DB נכשלה',
                  },
                ];
                finalizeIfDone();
              },
            });
          },
          error: () => {
            hasError = true;
            pending--;
            this.msgs1 = [
              {
                severity: 'error',
                summary: 'שגיאה',
                detail: `העלאת המסמך ${file.name} ל-Blob נכשלה`,
              },
            ];
            finalizeIfDone();
          },
        });
      }
    }

    finalizeIfDone();
  }

  // =========================
  // פעולות על טבלה
  // =========================
  // deleteDocument(id: string) {
  //   this.documentsService.deleteDocument$(id).subscribe(() => {
  //     this.loadDocuments();
  //   });
  // }

  deleteDocument(id: string) {
    if (this.isDocumentsLockedBySbt) return;

    this.loading = true;
    this.msgs1 = [];

    this.documentsService
      .deleteDocumetAttributes$(id)
      .pipe(switchMap(() => this.documentsService.deleteDocument$(id)))
      .subscribe({
        next: () => {
          this.msgs1 = [
            {
              severity: 'success',
              summary: 'הצלחה',
              detail: 'המסמך נמחק',
            },
          ];
          this.loadDocuments();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.msgs1 = [
            {
              severity: 'error',
              summary: 'שגיאה',
              detail: 'מחיקה נכשלה',
            },
          ];
        },
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
      this.msgs1 = [
        {
          severity: 'error',
          summary: 'שגיאה',
          detail: 'לא ניתן לטעון את המסמך',
        },
      ];
    }
  }

  viewNewFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.fileToView = this.sanitizer.bypassSecurityTrustResourceUrl(
        reader.result as string,
      );
      this.displayDialog = true;
    };
    reader.readAsDataURL(file);
  }

  // removeFile(type: string, index: number) {
  //   this.uploadedFilesByType[type].splice(index, 1);
  //   if (this.uploadedFilesByType[type].length === 0) {
  //     delete this.uploadedFilesByType[type];
  //   }
  // }

  removeFile(type: string, index: number) {
    if (this.isDocumentsLockedBySbt) return;

    this.uploadedFilesByType[type].splice(index, 1);
    if (this.uploadedFilesByType[type].length === 0) {
      delete this.uploadedFilesByType[type];
    }
    this.buildRequiredDocuments();
  }

  getDocumentTypeName(code: string): string {
    const found = this.documentCodes.find((d) => d.code === code);
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

  // private buildAttributesForDoc(type: string) {
  //   const year = new Date().getFullYear().toString();
  //   const today = new Date().toISOString();

  //   if (type === '380') {
  //     return [{ Attribute: 87, Attribute_Vlaue: 'false' }]; // בכוונה
  //   }

  //   if (type === '714') {
  //     return [
  //       { Attribute: 57, Attribute_Vlaue: today },
  //       { Attribute: 99, Attribute_Vlaue: '1' },
  //       { Attribute: 100, Attribute_Vlaue: year },
  //     ];
  //   }

  //   return [];
  // }

  private buildAttributesForDoc(type: string) {
    const todayIso = new Date().toISOString();
    const rawCtx = this.decService.getCargoContextSnapshot();
    const ctx =
      rawCtx && String(rawCtx.decId) === String(this.currentDecId)
        ? rawCtx
        : null;

    let currentDec: any = null;
    try {
      currentDec = JSON.parse(localStorage.getItem('currentDec') || 'null');
    } catch {
      currentDec = null;
    }

    const consignment =
      currentDec?.ConsignmentPackagesMeasures?.[0]?.Consignments ?? null;

    const cargoDateIso = this.getCargoCreateDateIsoSafe();
    const finalDate = cargoDateIso ?? todayIso;

    const cargoTypeValue = String(
      ctx?.key?.cargoType ??
        consignment?.TransportContractDocumentTypeCode?.code ??
        consignment?.TransportContractDocumentTypeCode ??
        '1',
    );

    const firstCargoIdValue = String(
      ctx?.key?.firstCargoID ??
        consignment?.TransportContractDocumentID?.code ??
        consignment?.TransportContractDocumentID ??
        new Date().getFullYear().toString(),
    );

    if (type === '380') {
      return [{ Attribute: 87, Attribute_Vlaue: 'true' }];
    }

    if (type === '714') {
      return [
        {
          Attribute: 57,
          Attribute_Vlaue: finalDate, // ✅ התאריך מגיע מה-CargoQuery אם אפשר
        },
        {
          Attribute: 99,
          Attribute_Vlaue: cargoTypeValue,
        },
        {
          Attribute: 100,
          Attribute_Vlaue: firstCargoIdValue,
        },
      ];
    }

    return [];
  }

  // private getCargoCreateDateIsoSafe(): string | null {
  //   if (!this.currentDecId) return null;

  //   const ctx = this.decService.getCargoContextSnapshot();
  //   if (!ctx) return null;

  //   // ✅ שייכות להצהרה
  //   if (ctx.decId !== this.currentDecId) return null;

  //   // // ✅ טריות (30 דקות) - אפשר לשנות
  //   // if (!this.isFresh(ctx.receivedAtIso, 30)) return null;

  //   // ✅ תאריך תקין
  //   if (!ctx.createDate || !this.isValidDateString(ctx.createDate)) return null;

  //   return new Date(ctx.createDate).toISOString();
  // }

  // private getCargoCreateDateIsoSafe(): string | null {
  //   console.log('[getCargoCreateDateIsoSafe] start');

  //   if (!this.currentDecId) {
  //     console.log('no currentDecId');
  //     return null;
  //   }

  //   const ctx = this.decService.getCargoContextSnapshot();
  //   console.log('ctx snapshot:', ctx);

  //   if (!ctx) {
  //     console.log('ctx is null');
  //     return null;
  //   }

  //   if (ctx.decId !== this.currentDecId) {
  //     console.log('decId mismatch', {
  //       ctxDecId: ctx.decId,
  //       currentDecId: this.currentDecId,
  //     });
  //     return null;
  //   }

  //   const currentKey = this.getCurrentCargoKeyFromLocalDec();
  //   console.log('currentKey:', currentKey);

  //   if (!currentKey) {
  //     console.log('currentKey is null');
  //     return null;
  //   }

  //   if (!this.cargoKeyEquals(ctx.key, currentKey)) {
  //     console.log('cargo key mismatch', { ctxKey: ctx.key, currentKey });
  //     return null;
  //   }

  //   if (!ctx.createDate || !this.isValidDateString(ctx.createDate)) {
  //     console.log('invalid createDate', { createDate: ctx.createDate });
  //     return null;
  //   }

  //   console.log('✅ using cargo createDate (as-is):', ctx.createDate);
  //   return ctx.createDate; // ✅ בלי להוריד שעות
  // }

  private getCargoCreateDateIsoSafe(): string | null {
    if (!this.currentDecId) return null;

    const ctx = this.decService.getCargoContextSnapshot();
    if (!ctx) return null;

    if (String(ctx.decId) !== String(this.currentDecId)) {
      return null;
    }

    if (!ctx.createDate || !this.isValidDateString(ctx.createDate)) {
      return null;
    }

    return ctx.createDate;
  }

  private isValidDateString(s: string): boolean {
    const d = new Date(s);
    return !isNaN(d.getTime());
  }

  private isFresh(receivedAtIso: string, maxMinutes: number): boolean {
    const ageMs = Date.now() - new Date(receivedAtIso).getTime();
    return ageMs <= maxMinutes * 60 * 1000;
  }

  private getCurrentCargoKeyFromLocalDec(): CargoKey | null {
    const raw = localStorage.getItem('currentDec');
    if (!raw) return null;

    let dec: any;
    try {
      dec = JSON.parse(raw);
    } catch {
      return null;
    }

    // 1) קודם כל: לקחת מתוך ConsignmentPackagesMeasures (שם יש אובייקטים מלאים)
    const fullConsignments: any[] = [];
    if (Array.isArray(dec?.ConsignmentPackagesMeasures)) {
      for (const m of dec.ConsignmentPackagesMeasures) {
        if (m?.Consignments && typeof m.Consignments === 'object') {
          // מסנן הפניות $ref בלבד
          if (!m.Consignments.$ref) fullConsignments.push(m.Consignments);
        }
      }
    }

    // אם לא מצאנו כלום (נדיר) - ננסה מכל מקור אחר אבל נסנן $ref
    if (fullConsignments.length === 0 && Array.isArray(dec?.Consignments)) {
      for (const c of dec.Consignments) {
        if (c && typeof c === 'object' && !c.$ref) fullConsignments.push(c);
      }
    }

    if (fullConsignments.length === 0) return null;

    // בוחרים את הראשון (אפשר לשפר בחירה לפי I/E אם תרצי)
    const cons = fullConsignments[0];

    const cargoType = (cons.TransportContractDocumentTypeCode ?? '')
      .toString()
      .trim();
    const firstCargoID = (cons.TransportContractDocumentID ?? '')
      .toString()
      .trim();

    // נירמול יצוא: ThirdCargoID + SecondCargoID -> "XXX-YYYYYYY"
    const rawSecond = (cons.SecondCargoID ?? '').toString().trim();
    const rawThird = (cons.ThirdCargoID ?? '').toString().trim();

    const secondCargoID =
      rawThird && rawSecond && !rawSecond.includes('-')
        ? `${rawThird}-${rawSecond}`
        : rawSecond;

    if (!cargoType || !firstCargoID || !secondCargoID) return null;

    return {
      cargoType,
      firstCargoID,
      secondCargoID,
      thirdCargoID: '', // אחרי הנרמול אין צורך לשמור אותו
    };
  }

  // private cargoKeyEquals(a: CargoKey, b: CargoKey): boolean {
  //   return (
  //     a.cargoType === b.cargoType &&
  //     a.firstCargoID === b.firstCargoID &&
  //     a.secondCargoID === b.secondCargoID &&
  //     (a.thirdCargoID ?? '') === (b.thirdCargoID ?? '')
  //   );
  // }

  private cargoKeyEquals(a: CargoKey, b: CargoKey): boolean {
    return (
      (a.cargoType ?? '') === (b.cargoType ?? '') &&
      (a.firstCargoID ?? '') === (b.firstCargoID ?? '') &&
      (a.secondCargoID ?? '') === (b.secondCargoID ?? '')
    );
  }

  private getTotalPackageQuantity(): number {
    const raw = localStorage.getItem('currentDec');
    if (!raw) return 0;

    try {
      const dec = JSON.parse(raw);

      const qty = dec?.ConsignmentPackagesMeasures?.[0]?.TotalPackageQuantity;
      const parsedQty = Number(qty);

      return isNaN(parsedQty) ? 0 : parsedQty;
    } catch {
      return 0;
    }
  }

  private getRequiredDocumentCodes(): string[] {
    const totalPackageQuantity = this.getTotalPackageQuantity();

    const requiredCodes = ['714', '380'];

    if (totalPackageQuantity >= 2) {
      requiredCodes.push('271');
    }

    return requiredCodes;
  }

  // private buildRequiredDocuments(): void {
  //   const requiredCodes = this.getRequiredDocumentCodes();

  //   this.requiredDocuments = this.documentCodes
  //     .filter((doc) => requiredCodes.includes(doc.code))
  //     .map((doc) => ({
  //       code: doc.code,
  //       name: doc.name,
  //       required: true,
  //       exists: this.hasDocument(doc.code),
  //       pendingFiles: this.uploadedFilesByType[doc.code] ?? [],
  //     }));
  // }
  private buildRequiredDocuments(): void {
    const requiredCodes = this.getRequiredDocumentCodes();

    this.requiredDocuments = this.documentCodes
      .filter((doc) => requiredCodes.includes(doc.code))
      .map((doc) => ({
        code: doc.code,
        name: doc.name,
        required: true,
        exists: this.hasDocument(doc.code),
        pendingFiles: this.uploadedFilesByType[doc.code] ?? [],
      }))
      // ✅ סינון: השאר רק מה שחסר או חובה
      .filter((doc) => !doc.exists);
  }

  getRequiredDocumentStatus(doc: {
    code: string;
    required: boolean;
    exists: boolean;
    pendingFiles: File[];
  }): string {
    if (doc.exists) return 'קיים במערכת';
    if (doc.pendingFiles.length > 0) return 'נבחר קובץ וטרם נשמר';
    if (doc.required) return 'חסר';
    return 'לא הועלה';
  }

  getRequiredDocumentStatusClass(doc: {
    code: string;
    required: boolean;
    exists: boolean;
    pendingFiles: File[];
  }): string {
    if (doc.exists) return 'status-ok';
    if (doc.pendingFiles.length > 0) return 'status-pending';
    if (doc.required) return 'status-missing';
    return 'status-optional';
  }

  openFilePicker(code: string): void {
    if (this.isDocumentsLockedBySbt) return;

    this.pendingDocumentCode = code;
    this.hiddenFileInput.nativeElement.click();
  }

  onRequiredFileSelect(event: any): void {
    if (this.isDocumentsLockedBySbt) return;

    const file = event.target.files?.[0];
    const code = this.pendingDocumentCode;

    if (file && code) {
      if (!this.uploadedFilesByType[code]) {
        this.uploadedFilesByType[code] = [];
      }

      this.uploadedFilesByType[code].push(file);
      this.buildRequiredDocuments();
    }

    event.target.value = '';
    this.pendingDocumentCode = null;
  }

  private isVersionTooHigh(): boolean {
    const raw = localStorage.getItem('currentDec');
    if (!raw) return false;

    try {
      const dec = JSON.parse(raw);
      const versionStr = String(dec?.VersionID ?? '');
      const parts = versionStr.split('.');
      const version = parts.length > 1 ? Number(parts[1]) : 0;
      return version > 5;
    } catch {
      return false;
    }
  }

  private checkIfDocumentsLockedBySbt(): void {
    if (!this.currentDecId) {
      this.isDocumentsLockedBySbt = false;
      return;
    }
    const entityType = this.getCurrentEntityType();

    this.customsDataService
      .hasValidExternalLockEvent$(entityType, this.currentDecId)
      .subscribe({
        next: (res) => {
          this.isDocumentsLockedBySbt = res?.isLocked === true;
        },
        error: () => {
          this.isDocumentsLockedBySbt = false;
        },
      });
  }

  private getCurrentEntityType(): string {
    const decType = (localStorage.getItem('decType') ?? '').toLowerCase();

    if (decType === 'tr') {
      return '2'; // שטעון
    }

    return '1'; // הצהרה רגילה
  }

  private getCargoParamsFromCurrentDec(): {
    cargoType: string;
    firstCargoID: string;
    secondCargoID: string;
    thirdCargoID: string;
  } | null {
    const raw = localStorage.getItem('currentDec');
    if (!raw) return null;

    let dec: any;
    try {
      dec = JSON.parse(raw);
    } catch {
      return null;
    }

    const consignment =
      dec?.ConsignmentPackagesMeasures?.[0]?.Consignments ?? null;

    if (!consignment) return null;

    const cargoType = String(
      consignment?.TransportContractDocumentTypeCode?.code ??
        consignment?.TransportContractDocumentTypeCode ??
        '',
    ).trim();

    const firstCargoID = String(
      consignment?.TransportContractDocumentID?.code ??
        consignment?.TransportContractDocumentID ??
        '',
    ).trim();

    const secondCargoID = String(
      consignment?.SecondCargoID?.code ?? consignment?.SecondCargoID ?? '',
    ).trim();

    const thirdCargoID = String(
      consignment?.ThirdCargoID?.code ?? consignment?.ThirdCargoID ?? '',
    ).trim();

    if (!cargoType || !firstCargoID || !secondCargoID) {
      return null;
    }

    return {
      cargoType,
      firstCargoID,
      secondCargoID,
      thirdCargoID,
    };
  }

  private refreshCargoCreateDateIfMissing(): Promise<boolean> {
    if (!this.currentDecId) {
      return Promise.resolve(false);
    }

    const params = this.getCargoParamsFromCurrentDec();
    if (!params) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.decService.getCagroQueryMessage$(params).subscribe({
        next: (res: any) => {
          const createDateField = res?.cargosVersionField?.[0]?.createDateField;

          if (!createDateField) {
            resolve(false);
            return;
          }

          this.decService.setCargoContext({
            decId: String(this.currentDecId),
            key: {
              cargoType: params.cargoType,
              firstCargoID: params.firstCargoID,
              secondCargoID: params.secondCargoID,
              thirdCargoID: params.thirdCargoID,
            },
            createDate: createDateField,
            receivedAtIso: new Date().toISOString(),
          });

          resolve(true);
        },
        error: () => resolve(false),
      });
    });
  }
}
