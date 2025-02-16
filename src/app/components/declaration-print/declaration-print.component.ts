import { Component } from '@angular/core';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { DocumentService } from '../../shared/services/document.service';

@Component({
  selector: 'app-declaration-print',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './declaration-print.component.html',
  styleUrl: './declaration-print.component.scss'
})
export class DeclarationPrintComponent {
  customsPDF: any;
  constructor(private docService: DocumentService) { }

  ngOnInit() {
    const decId = localStorage.getItem("currentDecId") || "";
    if (decId) {
      this.docService.getDocumentsByEntityId$(decId).subscribe(
        res => {
          const document = res.find((x: any) => x.DocumentType === "IL_279");
          if (document){
            this.customsPDF = document.URL;
          }
        }
      )
    }
  }

}
