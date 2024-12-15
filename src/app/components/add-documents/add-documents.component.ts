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
import { CommonModule } from '@angular/common';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { DocumentService } from '../../shared/services/document.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomsDataService } from '../../shared/services/customs-data.service';
import { map } from 'rxjs';
import { StepService } from '../../shared/services/step.service';
import { DeclarationService } from '../../shared/services/declaration.service';

@Component({
  selector: 'app-add-documents',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule, FormsModule, ReactiveFormsModule, DropdownModule, FileUploadModule, ButtonModule, CalendarModule, CheckboxModule, AutoCompleteModule, MessagesModule, ConfirmDialogModule, ProgressSpinnerModule, InputTextModule],
  templateUrl: './add-documents.component.html',
  styleUrl: './add-documents.component.scss',
  providers: [ConfirmationService, MessageService]
})

export class AddDocumentsComponent {

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

  selectedDocumentCode = { name: 'חשבונית ספק (INV)', code: '380' };
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

  constructor(private documentsService: DocumentService, private stepService: StepService, private decService: DeclarationService, private confirmationService: ConfirmationService, private messageService: MessageService, private router: Router, private customsDataService: CustomsDataService) { }

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
    // this.customsDataService.getCustomsTableValues$('1892').pipe(
    //   map(res => {

    //     this.allAttributes = res.map((item: {
    //       Value2: any; Value1: any; Value5: any; Value6: any; Value3: any; Value4: any;
    //     }) => ({
    //       id: item.Value5,
    //       name: item.Value2,
    //       code: item.Value1,
    //       isMandatory: item.Value6 === 'true',
    //       type: item.Value3,
    //       fieldName: item.Value4
    //     }));

    //     this.currrentAttributes = this.allAttributes.filter((attr: { code: string; }) => attr.code === this.selectedDocumentCode.code);

    //     this.mandatoryAttributes = this.currrentAttributes.filter((attr: { isMandatory: any; }) => attr.isMandatory);

    //     this.documentAttributes = this.mandatoryAttributes


    //   })
    // ).subscribe(
    //   _ => {
    //     this.route.queryParams.subscribe(params => {
    //       const relatedId = params['documentId'];
    //       if (relatedId) {
    //         this.relatedID = relatedId
    //         this.loadDocuments(relatedId);
    //         this.isUpdateMode = true
    //       }
    //     });
    //   }
    // );

    // this.customsDataService.getCustomsTableValues$('1259').pipe(
    //   map(res => this.declarationCargoIDType = res.map((item: { Value2: any; Code: any; }) => ({ name: item.Value2, code: item.Code }))),
    // ).subscribe()

  }

  getdoc() {
    this.loading = true

    if (this.currentDecId)
      this.documentsService.getDocumentsByEntityId$(this.currentDecId).pipe(
        map(res => this.documents = res),
        map(_ => this.loading = false)
      ).subscribe(
        res => {
          console.log(res);
        },
        error => {
          this.loading = false
          this.documents = []
          this.msgs1 = [
            { severity: 'error', summary: 'מסמכי הצהרה', detail: `לא נמצאו מסמכים להצהרה מספר ${this.currentDecId}` },
          ];
        })
  }

  loadDocuments(id: string) {
    this.documentsService.getDocumentsById$(id).subscribe(
      async (response: any) => {
        this.internalDocumentNumber = response.Id;
        this.customsDocumentNumber = response.CustomsId
        this.fileUrl = response.URL;
        this.selectedFileName = response.FileName;
        //this.simulateFileUpload(response.FileName, response.URL);
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

  // loadDocumentAttribute(id: string): void {
  //   this.documentsService.getDocumentAttributes$(id).subscribe(
  //     (data: any) => {
  //       const existingAttributes = this.documentAttributes;

  //       existingAttributes.forEach(attribute => {
  //         const matchingAttribute = data.find((item: any) => item.Attribute === attribute.id);

  //         if (matchingAttribute) {
  //           attribute.ID = matchingAttribute.ID;

  //           if (attribute.type === 'Int') {
  //             const code = matchingAttribute.Attribute_Vlaue;

  //             const foundItem = this.declarationCargoIDType.find((item: any) => item.code === code);
  //             if (foundItem) {
  //               attribute.value = foundItem;

  //             } else {
  //               attribute.value = { name: '', code: code };
  //             }
  //           }
  //           else if (attribute.type === 'Boolean') {
  //             attribute.value = (matchingAttribute.Attribute_Vlaue === 'true');
  //           }
  //           else if (attribute.type === 'Date') {
  //             attribute.value = new Date(matchingAttribute.Attribute_Vlaue);
  //           }
  //           else {
  //             attribute.value = matchingAttribute.Attribute_Vlaue;
  //           }
  //         }
  //       });
  //       console.log(this.documentAttributes);

  //     },
  //     (error) => {
  //       console.error('Error loading document attribute', error);
  //     }
  //   );
  // }

  // showMoreAttributes(): void {
  //   this.isShowMore = true
  //   this.documentAttributes = this.currrentAttributes;
  //   this.loadDocumentAttribute(this.relatedID);
  //   if (this.relatedID) {
  //     this.loadDocumentAttribute(this.relatedID);
  //   }
  // }

  // showLessAttributes(): void {
  //   this.isShowMore = false
  //   this.documentAttributes = this.mandatoryAttributes;
  // }

  updateDocumentType(code: string) {
    const foundCode = this.documentCodes.find(doc => doc.code === code);
    if (foundCode) {
      this.selectedDocumentCode = foundCode;
      this.onDocumentTypeChange();
    }
  }

  // filterCargoIDType(event: any) {
  //   let filtered: any[] = [];
  //   let query = event.query;
  //   for (let i = 0; i < this.declarationCargoIDType.length; i++) {
  //     let a = this.declarationCargoIDType[i];
  //     if (a.name.indexOf(query) == 0) {
  //       filtered.push(a);
  //     }
  //   }
  //   this.filteredCargoIDType = filtered;
  // }

  onDocumentTypeChange() {
    this.resetDocumentDetails();

    // this.currrentAttributes = this.allAttributes.filter((attr: { code: string; }) => attr.code === this.selectedDocumentCode.code);

    // this.mandatoryAttributes = this.currrentAttributes.filter((attr: { isMandatory: any; }) => attr.isMandatory);

    // this.isShowMore = false

    // this.documentAttributes = this.mandatoryAttributes;
    // if (this.documentAttributes[0]?.code == 714) {
    //   this.documentAttributes[0].value = JSON.parse(sessionStorage.getItem("CargoIDType") || "")
    //   this.documentAttributes[1].value = sessionStorage.getItem("FirstCargoID");
    // }
  }

  resetDocumentDetails() {
    this.documentAttributes = [{ name: '', value: '' }];
  }

  onFileSelect(event: any) {
    console.log(event.files[0]);
    const file = event.files[0];
    if (this.relatedID && this.fileUrl) {
      this.confirmationService.confirm({
        message: 'קיים כבר קובץ קודם, האם ברצונך להחליף את הקובץ?',
        header: 'אישור החלפה',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.uploadedFile = file;
          console.log(this.uploadedFile);
          this.selectedFileName = this.uploadedFile.name;
          this.fileUrl = null
        },
        reject: () => {
        }
      });
    }
    else {
      this.uploadedFile = event.files[0];
      this.selectedFileName = this.uploadedFile.name;
    }

  }

  saveDocument() {
    this.msgs1 = []
    return new Promise<void>((resolve, reject) => {
      if (!this.uploadedFile) {
        this.msgs1 = [
          { severity: 'error', summary: 'Error', detail: 'נא בחר קובץ לשליחה!' }
        ];
        this.loading = false;
        reject('נא בחר קובץ לשליחה!');
        return
      }
      // if (this.validateMetadata()) {
      this.confirmationService.confirm({
        message: 'האם אתה בטוח שברצונך להעלות את הקובץ?',
        accept: () => {
          const englishName = this.translateHebrewToEnglish(this.selectedFileName);
          const timestamp = new Date().getTime();
          const uniqueFileName = `${englishName}_${timestamp}`;
          const formData = new FormData();
          formData.append('dtvalues', this.uploadedFile);
          formData.append('EntityID', this.currentDecId || '');
          formData.append('DocumentType', this.selectedDocumentCode.code);
          formData.append('BlobName', uniqueFileName);

          this.loading = true;

          console.log('FormData entries:');
          formData.forEach((value, key) => {
            console.log(`${key}:`, value);
          });
          //uplaod to azure
          this.documentsService.uploadDocument(formData).subscribe(
            (response: any) => {
              console.log(response);
              if (response.url) {
                this.documentObject = {
                  Id: 0,
                  Code: this.selectedDocumentCode.code,
                  Url: response.url,
                  FileName: this.selectedFileName,
                  DocumentType: this.selectedDocumentCode.code,
                  CustomsId: 0,
                  InternalID: 0,
                  CustomsStatus: 0,
                  ErrorDesc: '',
                  RelatedEntity: 1055,
                  RelatedID: this.currentDecId || ''
                }
                //save doc to DB
                if (!this.isUpdateMode) {
                  this.documentsService.postDocuments$(this.documentObject).subscribe(
                    async response => {
                      console.log(response);
                      this.documentId = response.Id
                      this.documentObject.Id = response.Id
                      this.internalDocumentNumber = response.Id

                      // this.loading = false;

                      this.msgs1 = [
                        { severity: 'success', summary: 'Success', detail: 'המסמך נשמר בהצלחה !' },
                      ];
                      await this.sendToCustoms();


                      // const documentAttributes = this.documentAttributes
                      //   .map(attribute => {
                      //     if (attribute.value === undefined) {
                      //       if (attribute.type === 'Boolean') {
                      //         return {
                      //           DocID: response.Id,
                      //           PointerID: this.currentDecId || null,
                      //           Attribute: attribute.id,
                      //           Attribute_Vlaue: false
                      //         };
                      //       } else {
                      //         return null;
                      //       }
                      //     }
                      //     else {
                      //       return {
                      //         DocID: response.Id,
                      //         PointerID: this.currentDecId || null,
                      //         Attribute: attribute.id,
                      //         Attribute_Vlaue: attribute.value.code ? attribute.value.code : attribute.value
                      //       };
                      //     }
                      //   })
                      //   .filter(attribute => attribute !== null);

                      // this.documentsService.addDocumentAttribute$(documentAttributes).subscribe(
                      //   () => {
                      //     this.loading = false;
                      //     this.msgs1 = [
                      //       { severity: 'success', summary: 'Success', detail: 'המסמך נשמר בהצלחה !' },
                      //     ];
                      //     if (!this.isSaveAndSend)
                      //       this.router.navigate(['/app-declaration/documents'], { queryParams: { 'Mode': 'e' } });
                      //     resolve();
                      //   },
                      //   (error: any) => {
                      //     console.log('Error saving document attributes', error);
                      //     this.loading = false;
                      //     reject(error);
                      //   }
                      // );
                    },
                    error => {
                      console.log(error)
                      this.loading = false
                      reject(error)
                    }
                  )
                }
                else {
                  this.documentObject.Id = this.relatedID;
                  this.documentsService.updateDocument$(this.relatedID, this.documentObject).subscribe(
                    response => {
                      console.log(response);
                      this.documentId = response.Id

                      // const documentAttributes = this.documentAttributes
                      //   .map(attribute => {
                      //     if (attribute.value === undefined) {
                      //       if (attribute.type === 'Boolean') {
                      //         return {
                      //           Id: attribute.ID,
                      //           DocID: response.Id,
                      //           PointerID: this.declarationid || null,
                      //           Attribute: attribute.id,
                      //           Attribute_Vlaue: false
                      //         };
                      //       } else {
                      //         return null;
                      //       }
                      //     }
                      //     else {
                      //       return {
                      //         Id: attribute.ID,
                      //         DocID: response.Id,
                      //         PointerID: this.declarationid || null,
                      //         Attribute: attribute.id,
                      //         Attribute_Vlaue: attribute.value.code ? attribute.value.code : attribute.value
                      //       };
                      //     }
                      //   })
                      //   .filter(attribute => attribute !== null);
                      // this.documentsService.updateDocumentAttribute$(this.relatedID, documentAttributes).subscribe(
                      //   () => {
                      //     this.loading = false;
                      //     this.msgs1 = [
                      //       { severity: 'success', summary: 'Success', detail: 'המסמך נשמר בהצלחה !' },
                      //     ];
                      //     if (!this.isSaveAndSend)
                      //       this.router.navigate(['/app-declaration/documents'], { queryParams: { 'Mode': 'e' } });
                      //     resolve();
                      //   },
                      //   (error: any) => {
                      //     console.log('Error saving document attributes', error);
                      //     this.loading = false;
                      //     reject(error);
                      //   }
                      // );
                    },
                    error => {
                      console.log(error);
                      this.loading = false
                      reject(error)
                    })
                }
              }
            },
            error => {
              console.log(error);
              this.loading = false;
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'העלאת המסמך נכשלה!' });
              this.loading = false
              reject(error)
            }
          );
        },
        reject: () => {
          this.loading = false
        }
      });
      // }

      // else {
      //   this.loading = false
      // }
    })
  }

  async sendToCustoms() {
    const file = this.uploadedFile;
    const formData = new FormData();

    formData.append('Content', file);
    formData.append('Name', file.name);
    formData.append('DocumentType', this.selectedDocumentCode.code); 
    if (this.selectedDocumentCode.code == '380') {
      formData.append(`attributes[87]`, JSON.stringify({
        id: 87,
        value: 'true'
      }));
    }
    else if (this.selectedDocumentCode.code == '714') {
      const decId = localStorage.getItem('currentDecId');
      const res = await this.decService.getDeclaration(decId).toPromise();
      formData.append(`attributes[57]`, JSON.stringify({ id: 57, value: new Date() }));
      formData.append(`attributes[99]`, JSON.stringify({ id: 99, value: res.Consignments[0].TransportContractDocumentTypeCode }));
      formData.append(`attributes[100]`, JSON.stringify({ id: 100, value: res.Consignments[0].TransportContractDocumentID }));
    }
    
    this.loading = true;

    this.documentsService.sendToCustoms$(formData).subscribe(
      response => {
        console.log(response);

        this.loading = false;
        if (response.responseContentHeaderField.exceptionField) {
          this.documentObject.CustomsStatus = 0
          this.msgs1 = [
            { severity: 'error', summary: 'שליחת מסמך למכס', detail: response.responseContentHeaderField.exceptionField[0].exeptionDescriptionField },
          ];
          return
        }
        else if (response.responseContentHeaderField.applicationIDField) {
          this.customsDocumentNumber = response.responseContentHeaderField.applicationIDField
          this.documentObject.CustomsStatus = 1
          this.documentObject.CustomsId = response.responseContentHeaderField.applicationIDField
          this.documentObject.InternalID = response.externalAttachmentIDField
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
        this.documentsService.updateDocument$(this.documentId, this.documentObject).subscribe(
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
    this.stepService.emitStepCompleted();
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
