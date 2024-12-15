import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DeclarationService } from '../../shared/services/declaration.service';

@Component({
  selector: 'app-independent-payment',
  standalone: true,
  imports: [],
  templateUrl: './independent-payment.component.html',
  styleUrl: './independent-payment.component.scss'
})
export class IndependentPaymentComponent {
  public safeUrl: any;
  public safeHtml: SafeHtml = '';
  URL: any = 'https://ecom.gov.il/voucherspa/input/380?clear=true'

  constructor(private sanitizer: DomSanitizer, private http: HttpClient, private decService: DeclarationService) {

    const url = 'https://localhost:44308/api/Proxy?url=' + encodeURIComponent('https://ecom.gov.il/voucherspa/input/380?clear=true');
    // console.log(url);

    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    // this.http.get<{ content: string }>(url).subscribe(response => {
    // console.log(response);     
    //  this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(response.content);
    // });
  }
  encodeUrl(url: string): string {
    return encodeURIComponent(url);
  }

  submitAndRedirect() {
    const asmachta = '6';
    const importerNum = '8';

    this.decService.fillFormAndRedirect(asmachta, importerNum).subscribe(
      (response) => {
        console.log('Form submitted successfully');
        this.openExternalSite();
      },
      (error) => {
        console.error('Error submitting form:', error);
      }
    );
  }

  openExternalSite() {
    const url = 'https://ecom.gov.il/voucherspa/input/380?clear=true';
    window.open(url, '_blank');
  }
}
