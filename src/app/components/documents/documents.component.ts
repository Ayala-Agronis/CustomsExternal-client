import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../shared/services/document.service';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, MessagesModule, ConfirmDialogModule, ProgressSpinnerModule, TableModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent {

  declarationid = localStorage.getItem('declarationId')
  currentDecId = localStorage.getItem('currentDecId')

  UpdateMode: any
  loading = false
  msgs1: Message[] = [];
  documents: any
  documentObject = {
    Id: 0, Code: '', Url: '', FileName: '', DocumentType: '', CustomsId: 0, CustomsStatus: 0, ErrorDesc: '', RelatedEntity: 0, RelatedID: 0
  };

  cols: any[] = [];

  uploadedFiles: any[] = [];
  selectedDocument: any;
  documentCodes: any;
  CustomsStatus: any;

  constructor(private route: ActivatedRoute, private router: Router, private documentsService: DocumentService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.UpdateMode = params['Mode'];
    });
  }

  ngOnInit(): void {
    this.cols = [
      { field: 'Code', header: 'סוג צרופה', },
      { field: 'FileName', header: 'שם קובץ' },
      { field: 'Id', header: 'מזהה פנימי' },
      { field: 'CustomsId', header: 'מזהה מכס' },
    ];

    this.documentCodes = [
      { name: 'חשבונית ספק (INV)', code: '380' },
      { name: 'שטר מטען (WB)', code: '714' },
      { name: 'רשימת אריזה (PL)', code: '271' },
      { name: 'אחר', code: 'IST' },
    ];

    this.getdoc();

    this.CustomsStatus = JSON.parse(localStorage.getItem('formData') || '')?.CustomsStatus;

  }

  toAddDocument() {
    this.router.navigate(['add-doc'], { queryParams: { 'Mode': 'e' } });
  }

  sendToCustoms(rowData: any) {
    this.documentsService.getDocumentsById$(rowData.Id).subscribe(
      (res1: any) => {
        fetch(res1.URL)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
          }).then((blob) => {
            const file = new File([blob], res1.FileName);

            const formData = new FormData();

            formData.append('Content', file);
            formData.append('Name', file.name);
            formData.append('DocumentType', res1.DocumentType);

            // this.documentsService.getDocumentAttributes$(rowData.Id).subscribe(
            //   (res2: any) => {
            //     res2.forEach((attribute: { Attribute: any; Attribute_Vlaue: any }) => {
            //       formData.append(`attributes[${attribute.Attribute}]`, JSON.stringify({
            //         id: attribute.Attribute,
            //         value: attribute.Attribute_Vlaue
            //       }));
            //     });
            //     this.documentsService.sendToCustoms$(formData).subscribe(
            //       response => {
            //         console.log(response);

            //         this.loading = false;
            //         if (response.responseContentHeaderField.exceptionField) {
            //           this.documentObject = {
            //             Id: res1.Id,
            //             Code: res1.Code,
            //             Url: res1.URL,
            //             FileName: res1.FileName,
            //             DocumentType: res1.DocumentType,
            //             CustomsId: 0,
            //             CustomsStatus: 0,
            //             ErrorDesc: response.responseContentHeaderField.exceptionField[0].exeptionDescriptionField,
            //             RelatedEntity: res1.RelatedEntity,
            //             RelatedID: res1.RelatedID
            //           };
            //           this.msgs1 = [
            //             { severity: 'error', summary: 'שליחת מסמך למכס', detail: response.responseContentHeaderField.exceptionField[0].exeptionDescriptionField },
            //           ];
            //           return
            //         }
            //         else if (response.responseContentHeaderField.applicationIDField) {
            //           this.documentObject = {
            //             Id: res1.Id,
            //             Code: res1.Code,
            //             Url: res1.URL,
            //             FileName: res1.FileName,
            //             DocumentType: res1.DocumentType,
            //             CustomsId: response.responseContentHeaderField.applicationIDField,
            //             CustomsStatus: 1,
            //             ErrorDesc: '',
            //             RelatedEntity: res1.RelatedEntity,
            //             RelatedID: res1.RelatedID
            //           };
            //           this.msgs1 = [
            //             { severity: 'success', summary: 'Success', detail: 'המסמך נשלח למכס בהצלחה!' },
            //           ];
            //         }

            //         else {
            //           this.msgs1 = [
            //             { severity: 'error', summary: 'שליחת מסמך למכס', detail: 'התרחשה שגיאה בעת השליחה למכס' },
            //           ];
            //           return
            //         }
            //         this.documentsService.updateDocument$(res1.Id, this.documentObject).subscribe(
            //           res => {
            //             this.loading = false
            //             this.getdoc();
            //             console.log(res)
            //           },
            //           err => {
            //             this.loading = false
            //             console.log(err)
            //           }
            //         )

            //       },
            //       (error: any) => {
            //         console.log(error);

            //         this.loading = false;

            //         this.msgs1 = [
            //           { severity: 'error', summary: 'Error', detail: 'שליחת המסמך למכס נכשלה!' }
            //         ];
            //       }
            //     );
            //   })

          })
          .catch((error) => {
            console.error('Error fetching the file:', error);
          });

      },
      (error) => {
        console.error('Error fetching documents:', error);
      }
    );
    this.loading = true
    // if (this.uploadedFiles.length > 0) {
    // 

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

  navigateToAddDocument(rowData: any) {
    if (rowData.Code == "IL_279") {
      window.open(rowData.URL, '_blank');
    }
    else {
      this.router.navigate(['add-doc'], {
        queryParams: { documentId: rowData.Id, 'Mode': 'e' }
      });
    }

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

  getDocumentTypeName(code: string): string {
    const docType = this.documentCodes.find((item: { code: string; }) => item.code === code);
    return docType ? docType.name : code;
  }
}
