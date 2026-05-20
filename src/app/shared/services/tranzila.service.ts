// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class TranzilaService {
//   private readonly supplier = 'customsil';
//   private readonly baseUrl = 'https://direct.tranzila.com';

//   buildIframeUrl(amount: number): string {
//     return `${this.baseUrl}/${this.supplier}/iframenew.php?currency=1&sum=${amount}`;
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiConfig } from '../../config/api-endpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranzilaService {
  constructor(private http: HttpClient) {}

  createPaymentUrl$(
    amount: number,
    declarationId: number,
    returnUrl: string,
  ): Observable<{ iframeUrl: string }> {
    return this.http.post<{ iframeUrl: string }>(
      `${apiConfig.customsdbApiUrl}Tranzila/CreatePaymentUrl`,
      {
        amount,
        declarationId,
        returnUrl,
      },
    );
  }
}