import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessagesModule } from 'primeng/messages';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { DocumentService } from '../../shared/services/document.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomsDataService } from '../../shared/services/customs-data.service';
import { map } from 'rxjs';
import { StepService } from '../../shared/services/step.service';
import { DeclarationService } from '../../shared/services/declaration.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-add-documents',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule, DialogModule, FormsModule, ReactiveFormsModule, DropdownModule, FileUploadModule, ButtonModule, CalendarModule, CheckboxModule, AutoCompleteModule, MessagesModule, ConfirmDialogModule, ProgressSpinnerModule, InputTextModule],
  templateUrl: './add-documents.component.html',
  styleUrl: './add-documents.component.scss',
  providers: [ConfirmationService, MessageService]
})

export class AddDocumentsComponent {
  // [x: string]: any;
  Object = Object;

  declarationid = localStorage.getItem('declarationId')
  currentDecId = localStorage.getItem('currentDecId')

  loading = false
  msgs1: Message[] = [];
  documentId: string = ''

  isSaveAndSend = false

  uploadedFiles: File[] = [];
  items: any
  documentCodes!: { name: string; code: string; }[];
  documentCode = { name: '', code: '' }
  documentObject = {
    Id: 0, Code: '', Url: '', FileName: '', DocumentType: '', CustomsId: 0, InternalID: 0, CustomsStatus: 0, ErrorDesc: '', RelatedEntity: 0, RelatedID: ''
  };

  myfileToDb =
    {
      "Documents": {
        "Code": '',
        "URL": "",
        "FileName": '',
        "DocumentType": ''
      },
      "EntityId": 0,
      "EntityType": ''
    }

  //selectedDocumentCode = { name: 'חשבונית ספק (INV)', code: '380' };
  selectedDocumentCode: any
  selectedFileName: string = '';
  internalDocumentNumber: string = '';
  customsDocumentNumber: string = '';
  documentAttributes: any[] = [];
  uploadedFile: any;

  declarationCargoIDType: any = { name: '', code: '' };
  filteredCargoIDType: any[] = []
  fileUrl: any;
  allAttributes: any;
  mandatoryAttributes: any;
  currrentAttributes: any;
  isShowMore: boolean = false;
  relatedID: any;

  isUpdateMode = false
  cols: any[] | undefined;
  documents: any[] = [];
  selectedDocument: any;
  fileToView: any;
  viewFileIndex: number = -1;
  displayDialog = false;

  uploadedFilesByType: { [key: string]: any[] } = {};
  groupedDocuments: any;
  // selectedDocumentCode: any;
  // uploadedFiles: any[] = [];
  constructor(private documentsService: DocumentService, private sanitizer: DomSanitizer, private stepService: StepService, private decService: DeclarationService, private confirmationService: ConfirmationService, private messageService: MessageService, private router: Router, private customsDataService: CustomsDataService) { }

  ngOnInit(): void {

    this.documentCodes = [
      { name: 'חשבונית ספק (INV)', code: '380' },
      { name: 'שטר מטען (WB)', code: '714' },
      { name: 'רשימת אריזה (PL)', code: '271' },
    ];
    this.cols = [
      { field: 'Code', header: 'סוג צרופה', },
      { field: 'FileName', header: 'שם קובץ' },
      { field: 'Id', header: 'מזהה פנימי' },
      { field: 'CustomsId', header: 'מזהה מכס' },
    ];

    this.getdoc();

  }

  getdoc() {
    if (this.currentDecId) {
      this.loading = true
      this.documentsService.getDocumentsByEntityId$(this.currentDecId).pipe(
        map(res => this.documents = res),
        map(_ => this.loading = false)
      ).subscribe(
        res => {
          console.log(res);
          console.log(this.documents);
          this.groupDocumentsByType()
        },
        error => {
          this.loading = false
          this.documents = []
          this.msgs1 = [
            { severity: 'error', summary: 'מסמכי הצהרה', detail: `לא נמצאו מסמכים להצהרה מספר ${this.currentDecId}` },
          ];
        })
    }
  }

  groupDocumentsByType() {
    this.groupedDocuments = this.documents.reduce((acc, document) => {
      const type = document.DocumentType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(document);
      return acc;
    }, {});
  }

  loadDocuments(id: string) {
    this.documentsService.getDocumentsById$(id).subscribe(
      async (response: any) => {
        this.internalDocumentNumber = response.Id;
        this.customsDocumentNumber = response.CustomsId
        this.fileUrl = response.URL;
        this.selectedFileName = response.FileName;
        this.uploadedFile = await this.fetchFileFromUrl(response.URL, response.FileName);
        const documentTypeCode = response.DocumentType;
        this.updateDocumentType(documentTypeCode);
        // this.loadDocumentAttribute(id);
      }
    );
  }

  async fetchFileFromUrl(url: string, fileName: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  }

  deleteDocument(docId: string) {
    this.documentsService.deleteDocument$(docId).subscribe(
      response => {
        console.log(response);
        if (response) {
          this.msgs1 = [
            { severity: 'success', summary: 'מחיקת מסמך ', detail: `המסמך נמחק בהצלחה` },
          ];
        }
        this.getdoc();
      },
      error => {
        this.msgs1 = [
          { severity: 'error', summary: 'מחיקת מסמך ', detail: `קרתה שגיאה בעת מחיקת המסמך  ` },
        ];
      }
    )
  }

  navigateToAddDocument(rowData: any) {
    if (rowData.Code == "IL_279") {
      window.open(rowData.URL, '_blank');
    }
    else {
      this.router.navigate(['declaration-main/add-doc'], {
        queryParams: { documentId: rowData.Id, 'Mode': 'e' }
      });
    }

  }

  getDocumentTypeName(code: string): string {
    const docType = this.documentCodes.find((item: { code: string; }) => item.code === code);
    return docType ? docType.name : code;
  }


  updateDocumentType(code: string) {
    const foundCode = this.documentCodes.find(doc => doc.code === code);
    if (foundCode) {
      this.selectedDocumentCode = foundCode;
      this.onDocumentTypeChange();
    }
  }

  onDocumentTypeChange() {
    this.resetDocumentDetails();

  }

  resetDocumentDetails() {
    this.documentAttributes = [{ name: '', value: '' }];
  }

  onFileSelect(event: any) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {

      const file = input.files[0];


      const documentTypeCode = this.selectedDocumentCode.code;

      if (!this.uploadedFilesByType[documentTypeCode]) {
        this.uploadedFilesByType[documentTypeCode] = [];
      }

      this.uploadedFilesByType[documentTypeCode].push(file);
      this.uploadedFiles.push(file);
      console.log(this.uploadedFilesByType);

    }
    //  else {
    // }

    event.target.value = ''
  }

  viewFile(file: any): void {
    this.displayDialog = true

    if (file.URL) {
      this.fileToView = this.sanitizer.bypassSecurityTrustResourceUrl(file.URL);
    }
    else {
      const reader = new FileReader();

      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        const fileType = file.type.includes('image') ? 'image' : 'pdf';
        this.fileToView = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
      };

      reader.readAsDataURL(file);
    }
  }

  hideFile() {
    this.displayDialog = false
    this.viewFileIndex = -1;
    this.fileToView = null;
  }

  removeFile(documentType: string, index: number): void {
    this.hideFile();
    //this.uploadedFiles.splice(index, 1);
    this.uploadedFilesByType[documentType].splice(index, 1);

    if (this.uploadedFilesByType[documentType].length === 0) {
      delete this.uploadedFilesByType[documentType];
    }
  }


  // saveDocuments() {
  //   console.log(this.uploadedFilesByType);

  //   return new Promise<void>((resolve, reject) => {
  //     if (Object.keys(this.uploadedFilesByType).length === 0) {
  //       // if (!this.uploadedFiles.length) {
  //       this.msgs1 = [
  //         { severity: 'error', summary: 'Error', detail: 'נא בחר קובץ לשליחה!' }
  //       ];
  //       this.loading = false;
  //       reject('נא בחר קובץ לשליחה!');
  //       return;
  //     }
  //     // for (let index = 0; index < this.uploadedFiles.length; index++) {
  //     //   this.uploadedFile = this.uploadedFiles[index];
  //     //   console.log(this.uploadedFile);
  //     for (const documentTypeCode in this.uploadedFilesByType) {
  //       const files = this.uploadedFilesByType[documentTypeCode];

  //       for (let index = 0; index < files.length; index++) {
  //         this.uploadedFile = files[index];
  //         this.msgs1 = [];

  //         // this.confirmationService.confirm({
  //         //   message: 'האם אתה בטוח שברצונך להעלות את הקובץ?',
  //         // accept: () => {
  //         const englishName = this.translateHebrewToEnglish('dec');
  //         const timestamp = new Date().getTime();
  //         const uniqueFileName = `${englishName}_${timestamp}`;
  //         const formData = new FormData();
  //         formData.append('dtvalues', this.uploadedFile);
  //         formData.append('EntityID', this.currentDecId || '');
  //         formData.append('DocumentType', documentTypeCode);
  //         formData.append('BlobName', uniqueFileName);

  //         this.loading = true;

  //         console.log('FormData entries:');
  //         formData.forEach((value, key) => {
  //           console.log(`${key}:`, value);
  //         });

  //         // Upload to Azure
  //         this.documentsService.uploadDocument(formData).subscribe(
  //           (response: any) => {
  //             console.log(response);
  //             if (response.url) {
  //               this.documentObject = {
  //                 Id: 0,
  //                 Code: documentTypeCode,
  //                 Url: response.url,
  //                 FileName: this.selectedFileName,
  //                 DocumentType: documentTypeCode,
  //                 CustomsId: 0,
  //                 InternalID: 0,
  //                 CustomsStatus: 0,
  //                 ErrorDesc: '',
  //                 RelatedEntity: 1055,
  //                 RelatedID: this.currentDecId || ''
  //               };

  //               // Save doc to DB
  //               if (!this.isUpdateMode) {
  //                 this.documentsService.postDocuments$(this.documentObject).subscribe(
  //                   async (response) => {
  //                     console.log(response);
  //                     this.documentId = response.Id;
  //                     this.documentObject.Id = response.Id;
  //                     this.internalDocumentNumber = response.Id;
  //                     this.loading = false;

  //                     this.msgs1 = [
  //                       { severity: 'success', summary: 'Success', detail: 'המסמך נשמר בהצלחה !' },
  //                     ];
  //                     await this.sendToCustoms(this.uploadedFile, documentTypeCode, this.documentId,this.documentObject)
  //                     // resolve();  // Resolve the promise after the document is saved
  //                   },
  //                   (error) => {
  //                     console.log(error);
  //                     this.loading = false;
  //                     reject(error);
  //                   }
  //                 );
  //               } else {
  //                 this.documentObject.Id = this.relatedID;
  //                 this.documentsService.updateDocument$(this.relatedID, this.documentObject).subscribe(
  //                   (response) => {
  //                     console.log(response);
  //                     this.documentId = response.Id;
  //                     resolve();  // Resolve the promise after the document is updated
  //                   },
  //                   (error) => {
  //                     console.log(error);
  //                     this.loading = false;
  //                     reject(error);
  //                   }
  //                 );
  //               }
  //             }
  //           },
  //           (error) => {
  //             console.log(error);
  //             this.loading = false;
  //             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'העלאת המסמך נכשלה!' });
  //             reject(error);
  //           }
  //         );

  //       }
  //     }
  //   });
  // }
  async saveDocuments() {
    console.log(this.uploadedFilesByType);

    return new Promise<void>((resolve, reject) => {
      if (Object.keys(this.uploadedFilesByType).length === 0) {
        this.msgs1 = [
          { severity: 'error', summary: 'Error', detail: 'נא בחר קובץ לשליחה!' }
        ];
        this.loading = false;
        reject('נא בחר קובץ לשליחה!');
        return;
      }

      for (const documentTypeCode in this.uploadedFilesByType) {
        const files = this.uploadedFilesByType[documentTypeCode];

        (async () => {
          for (let index = 0; index < files.length; index++) {
            this.uploadedFile = files[index];
            this.msgs1 = [];
            console.log(this.uploadedFile.name);
            const englishName = this.translateHebrewToEnglish('dec');
            const timestamp = new Date().getTime();
            const uniqueFileName = `${englishName}_${timestamp}`;
            const formData = new FormData();
            formData.append('dtvalues', this.uploadedFile);
            formData.append('EntityID', this.currentDecId || '');
            formData.append('DocumentType', documentTypeCode);
            formData.append('BlobName', uniqueFileName);

            this.loading = true;

            console.log('FormData entries:');
            formData.forEach((value, key) => {
              console.log(`${key}:`, value);
            });

            // Upload to Azure
            try {
              const response: any = await this.documentsService.uploadDocument(formData).toPromise();
              console.log(response);

              if (response.url) {
                this.documentObject = {
                  Id: 0,
                  Code: documentTypeCode,
                  Url: response.url,
                  FileName: this.uploadedFile.name,
                  DocumentType: documentTypeCode,
                  CustomsId: 0,
                  InternalID: 0,
                  CustomsStatus: 0,
                  ErrorDesc: '',
                  RelatedEntity: 1055,
                  RelatedID: this.currentDecId || ''
                };

                // Save doc to DB
                if (!this.isUpdateMode) {
                  const docResponse = await this.documentsService.postDocuments$(this.documentObject).toPromise();
                  console.log(docResponse);
                  this.documentId = docResponse.Id;
                  this.documentObject.Id = docResponse.Id;
                  this.internalDocumentNumber = docResponse.Id;
                  this.loading = false;

                  this.msgs1 = [
                    { severity: 'success', summary: 'Success', detail: 'המסמך נשמר בהצלחה !' },
                  ];

                  // Send to customs for each document
                  await this.sendToCustoms(this.uploadedFile, documentTypeCode, this.documentId, this.documentObject);
                } else {
                  this.documentObject.Id = this.relatedID;
                  const updateResponse = await this.documentsService.updateDocument$(this.relatedID, this.documentObject).toPromise();
                  console.log(updateResponse);
                  this.documentId = updateResponse.Id;
                }
              }
            } catch (error) {
              console.log(error);
              this.loading = false;
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'העלאת המסמך נכשלה!' });
              reject(error);
              return;
            }
          }
        })();
      }

      resolve();
    });
  }

  async sendToCustoms(file: any, typeCode: any, documentId: any, documentObject: any) {
    // const file = this.uploadedFile;
    const formData = new FormData();

    formData.append('Content', file);
    formData.append('Name', file.name);
    formData.append('DocumentType', typeCode);
    if (typeCode == '380') {
      formData.append(`attributes[87]`, JSON.stringify({
        id: 87,
        value: 'true'
      }));
    }
    else if (typeCode == '714') {
      const decId = localStorage.getItem('currentDecId');
      const res = await this.decService.getDeclaration(decId).toPromise();
      formData.append(`attributes[57]`, JSON.stringify({ id: 57, value: new Date() }));
      formData.append(`attributes[99]`, JSON.stringify({ id: 99, value: res[0].ConsignmentPackagesMeasures[0].Consignments.TransportContractDocumentTypeCode }));
      formData.append(`attributes[100]`, JSON.stringify({ id: 100, value: res[0].ConsignmentPackagesMeasures[0].Consignments.TransportContractDocumentID }));
    }

    this.loading = true;

    this.documentsService.sendToCustoms$(formData).subscribe(
      response => {
        console.log(response);

        this.loading = false;
        if (response.responseContentHeaderField.exceptionField) {
          documentObject.CustomsStatus = 0
          this.msgs1 = [
            { severity: 'error', summary: 'שליחת מסמך למכס', detail: response.responseContentHeaderField.exceptionField[0].exeptionDescriptionField },
          ];
          return
        }
        else if (response.responseContentHeaderField.applicationIDField) {
          this.customsDocumentNumber = response.responseContentHeaderField.applicationIDField
          documentObject.CustomsStatus = 1
          documentObject.CustomsId = response.responseContentHeaderField.applicationIDField
          documentObject.InternalID = response.externalAttachmentIDField
          this.msgs1 = [
            { severity: 'success', summary: 'Success', detail: 'המסמך נשלח למכס בהצלחה!' },
          ];
        }
        else {
          this.msgs1 = [
            { severity: 'error', summary: 'שליחת מסמך למכס', detail: 'התרחשה שגיאה בעת השליחה למכס' },
          ];
          return
        }
        console.log(documentId);
        console.log(this.documentObject);

        this.documentsService.updateDocument$(documentId, documentObject).subscribe(
          res => {
            // this.router.navigate(['/app-declaration/documents'], { queryParams: { 'Mode': 'e' } });
            this.loading = false
            console.log(res)
            this.getdoc()
          },
          err => {
            this.loading = false
            console.log(err)
          }
        )
      },
      (error: any) => {
        this.loading = false;
        this.documentObject.CustomsStatus = 0,
          this.documentObject.ErrorDesc = error
        this.msgs1 = [
          { severity: 'error', summary: 'Error', detail: 'שליחת המסמך למכס נכשלה!' }
        ];
        this.documentsService.updateDocument$(this.documentId, this.documentObject).subscribe(
          res => {
            this.loading = false
            console.log(res)
            this.getdoc()
          },
          err => {
            this.loading = false
            console.log(err)
          }
        )
      }
    );
  }

  nextStep() {
    this.stepService.emitStepCompleted('+');
  }

  previousStep() {
    this.stepService.emitStepCompleted('-');
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'pi pi-file-pdf';
      case 'docx':
      case 'doc':
        return 'pi pi-file-word';
      case 'xlsx':
      case 'xls':
        return 'pi pi-file-excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'pi pi-image';
      case 'txt':
        return 'pi pi-file-text';
      default:
        return 'pi pi-file';
    }
  }


  translateHebrewToEnglish(fileName: string): string {
    const hebrewToEnglishMap: { [key: string]: string } = {
      'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H', 'ו': 'V', 'ז': 'Z', 'ח': 'H',
      'ט': 'T', 'י': 'Y', 'כ': 'K', 'ל': 'L', 'מ': 'M', 'נ': 'N', 'ס': 'S', 'ע': 'A',
      'פ': 'P', 'צ': 'T', 'ק': 'Q', 'ר': 'R', 'ש': 'SH', 'ת': 'T',
      ' ': '_',
    };

    return fileName.split('').map(char => hebrewToEnglishMap[char] || char).join('');
  }
}
