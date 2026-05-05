import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TranzilaService {
  private readonly supplier = 'customsil';
  private readonly baseUrl = 'https://direct.tranzila.com';

  buildIframeUrl(amount: number): string {
    return `${this.baseUrl}/${this.supplier}/iframenew.php?currency=1&sum=${amount}`;
  }
}
