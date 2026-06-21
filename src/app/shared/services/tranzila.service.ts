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
    guid: string | null = null, // 🌟 1. הוספת ה-guid כפרמטר אופציונלי
  ): Observable<{ iframeUrl: string }> {
    // 🌟 2. בניית ה-URL: אם יש guid, משרשרים אותו בסוף הכתובת
    let url = `${apiConfig.customsdbApiUrl}Tranzila/CreatePaymentUrl`;
    if (guid) {
      url += `?guid=${guid}`;
    }

    // שולחים את ה-POST עם ה-body המקורי, אבל ל-URL המעודכן
    return this.http.post<{ iframeUrl: string }>(url, {
      amount,
      declarationId,
      returnUrl,
    });
  }

  // 👈 שני את הפונקציה לזה:
  getDeclarationByGuid$(guid: string, responseCode?: string): Observable<any> {
    let url = `${apiConfig.customsdbApiUrl}PaymentLink/GetByGuid?guid=${guid}`;

    // אם יש קוד שגיאה, נצרף אותו לכתובת ה-URL
    if (responseCode) {
      url += `&responseCode=${responseCode}`;
    }

    return this.http.get<any>(url);
  }

  getServiceFeeAmount$(
    declarationId: number,
    guid: string | null = null,
  ): Observable<{ amount: number }> {
    let url = `${apiConfig.customsdbApiUrl}Tranzila/GetServiceFeeAmount/${declarationId}`;

    if (guid) {
      url += `?guid=${guid}`;
    }

    return this.http.get<{ amount: number }>(url);
  }
}
