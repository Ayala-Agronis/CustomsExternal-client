import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiConfig } from '../../config/api-endpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomsDataService {
  constructor(private http: HttpClient) {}

  getCustomsTableValues$(id: string): Observable<any> {
    const url = `${apiConfig.customsdbApiUrl}Sys`;
    return this.http.get<any>(url, { params: { id } });
  }

  getChargingPortsByCountry$(countryCode: string): Observable<any> {
    const url = `${apiConfig.customsdbApiUrl}Sys/charging-ports`;
    return this.http.get<any>(url, {
      params: { countryCode },
    });
  }

  getVendor$(): Observable<any> {
    // const url = `${apiConfig.customsdbApiUrl}/vendors`;
    const url = `${apiConfig.customsdbApiUrl}vendors`;

    return this.http.get<any>(url);
  }

  GetSeq$(type: any): Observable<any> {
    return this.http.get<any>(`${apiConfig.customsdbApiUrl}GetSeq/${type}`);
  }

  // GetClient$(ID: any): Observable<any> {
  //   let body = new HttpParams()
  //     .set('Id', ID)
  //     .set('Passport', '')

  //   return this.http.post(`${apiConfig.customsApiUrl}ImporterDetails`,
  //     body.toString(),
  //     {
  //       headers: new HttpHeaders()
  //         .set('Content-Type', 'application/x-www-form-urlencoded')
  //     }
  //   );
  // }

  GetClient$(ID: any): Observable<any> {
    let body = new HttpParams().set('Id', ID).set('Passport', '');

    return this.http.post(
      `${apiConfig.customsApiUrl}ImporterDetails/ImporterDetailsAsync`,
      body.toString(),
      {
        headers: new HttpHeaders().set(
          'Content-Type',
          'application/x-www-form-urlencoded',
        ),
      },
    );
  }

  GetClientAsync$(ID: any, Passport: any = ''): Observable<any> {
    const body = {
      ID: ID,
      Passport: Passport,
    };

    return this.http.post(
      `${apiConfig.customsApiUrl}ImporterDetails/ImporterDetailsAsync`,
      body,
      {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
      },
    );
  }

  GetClientName$(id: string): Observable<any> {
    return this.http.get(`${apiConfig.customsdbApiUrl}Clients/GetClientName`, {
      params: { id },
    });
  }

  addEntityEvent$(event: any): Observable<any> {
    return this.http.post(
      `${apiConfig.customsdbApiUrl}Events/AddEntityEvent`,
      event,
      {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
      },
    );
  }

  hasValidSbtEvent$(entityTypeId: string, entityKey: string): Observable<any> {
    return this.http.get<any>(
      `${apiConfig.customsdbApiUrl}Events/HasValidSbtEvent`,
      {
        params: { entityTypeId, entityKey },
      },
    );
  }

  hasValidExternalLockEvent$(
    entityTypeId: string,
    entityKey: string,
  ): Observable<any> {
    return this.http.get<any>(
      `${apiConfig.customsdbApiUrl}Events/HasValidExternalLockEvent`,
      {
        params: { entityTypeId, entityKey },
      },
    );
  }

  hasValidPaymentSuccessEvent$(
    entityTypeId: string,
    entityKey: string,
  ): Observable<any> {
    return this.http.get<any>(
      `${apiConfig.customsdbApiUrl}Events/HasValidPaymentSuccessEvent`,
      {
        params: { entityTypeId, entityKey },
      },
    );
  }

  getDecTaxesByAgentFileReferenceId$(
    agentFileReferenceId: string,
  ): Observable<any[]> {
    const url = `${apiConfig.customsdbApiUrl}DecTaxes`;
    return this.http.get<any[]>(url, {
      params: { id: agentFileReferenceId },
    });
  }

  getMaxCustomsSendAttempts$() {
    return this.http.get<number>(
      `${apiConfig.customsdbApiUrl}/GeneralInformation/GetMaxCustomsSendAttempts`,
    );
  }

  hasValidW4PaymentEvent$(
    entityTypeId: string,
    entityKey: string,
  ): Observable<any> {
    return this.http.get<any>(
      `${apiConfig.customsdbApiUrl}Events/HasValidW4PaymentEvent`,
      {
        params: { entityTypeId, entityKey },
      },
    );
  }
}
