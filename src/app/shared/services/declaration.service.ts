import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiConfig } from '../../config/api-endpoints';
import { BehaviorSubject, Observable } from 'rxjs';
import { CargoContext } from '../models/cargo-context.model';

@Injectable({
  providedIn: 'root',
})
export class DeclarationService {
  private DecURL = `${apiConfig.customsExternalApiUrl}Declaration/`;
  private InternalDecURL = `${apiConfig.customsdbApiUrl}Declaration/`;

  constructor(private http: HttpClient) {}

  private packageData = new BehaviorSubject<any>(null);
  packageData$ = this.packageData.asObservable();

  // =========================
  // Cargo Context (for documents attributes)
  // =========================
  private cargoContextSubject = new BehaviorSubject<CargoContext | null>(null);
  cargoContext$ = this.cargoContextSubject.asObservable();

  updatePackageData(data: any) {
    this.packageData.next(data);
  }

  setCargoContext(ctx: CargoContext) {
    //debugger
    this.cargoContextSubject.next(ctx);
    localStorage.setItem(`cargoctx:${ctx.decId}`, JSON.stringify(ctx));
  }

  loadCargoContextFromStorage(decId: string) {
    //debugger
    const raw = localStorage.getItem(`cargoctx:${decId}`);
    if (!raw) return null;
    try {
      const ctx = JSON.parse(raw) as CargoContext;
      this.cargoContextSubject.next(ctx);
      return ctx;
    } catch {
      return null;
    }
  }

  getCargoContextSnapshot() {
    return this.cargoContextSubject.value;
  }

  fillFormAndRedirect(
    k_asmachta: string,
    k_importer_num: string,
  ): Observable<any> {
    const formData = { Asmachta: k_asmachta, ImporterNum: k_importer_num };

    return this.http.post(
      `${apiConfig.customsExternalApiUrl}fill-form/`,
      formData,
    );
  }

  // addDeclaration(dec: any): Observable<HttpResponse<any>> {
  //   return this.http.post<any>(this.DecURL, dec, { observe: 'response' });
  // }

  SendDecToInternalDB(dec: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.InternalDecURL, dec, {
      observe: 'response',
    });
  }

  sendDeclarationToInternal(dec: any): Observable<HttpResponse<any>> {
    // return this.http.post<any>(`${environment.customsWebServiceUrl}Declaration`, dec, { observe: 'response' });
    return this.http.post<any>(`${apiConfig.customsdbApiUrl}Dec`, dec, {
      observe: 'response',
    });
  }

  getDeclaration(decId: any): Observable<any> {
    // return this.http.get<any>(`${this.DecURL}?decId=${decId}`);
    return this.http.get<any>(`${apiConfig.customsdbApiUrl}Dec/${decId}`);
  }

  // sendDeclaration$(decId: any, declaration: any, isSign: any): Observable<any> {
  //   return this.http.post<any>(`${environment.customsApiUrl}Declaration/${decId}?isSign=${isSign}`, declaration)
  // }

  updateDeclaration$(id: any, declaration: any): Observable<any> {
    const url = `${apiConfig.customsdbApiUrl}dec/${id}`;
    return this.http.put<any>(url, declaration);
  }

  updateDeclarationTs$(id: any, declaration: any): Observable<any> {
    const url = `${apiConfig.customsdbApiUrl}dec/PutTs/${id}`;
    return this.http.put<any>(url, declaration);
  }

  sendUpdateDecToInternalDB$(id: any, declaration: any): Observable<any> {
    const url = `${this.InternalDecURL}/${id}`;
    return this.http.put<any>(url, declaration);
  }

  updateAndSendDeclaration$(
    id: any,
    declaration: any,
    isSign: any,
  ): Observable<any> {
    return this.http.post<any>(
      `${apiConfig.customsdbApiUrl}dec/PutAndSend/${id}?isSign=${isSign}`,
      declaration,
    );

    // return this.http.post<any>(`${environment.customsExternalApiUrl}dec/GetAndSend/${id}?isSign=${isSign}`, declaration)
  }

  updateAndSendDeclarationTs$(
    id: any,
    declaration: any,
    isSign: any,
  ): Observable<any> {
    return this.http.post<any>(
      `${apiConfig.customsdbApiUrl}Dec/PutAndSendTr/${id}?isSign=${isSign}`,
      declaration,
    );

    // return this.http.post<any>(`${environment.customsExternalApiUrl}dec/GetAndSend/${id}?isSign=${isSign}`, declaration)
  }

  getCagroQueryMessage$(params: any) {
    let body = new HttpParams()
      .set('CargoIdentifierType', params.cargoType)
      .set('CargoIdentifierKey1', params.firstCargoID || '')
      .set('CargoIdentifierKey2', params.secondCargoID || '')
      .set('CargoIdentifierKey3', params.thirdCargoID || '');

    return this.http.post(
      `${apiConfig.customsApiUrl}CargoQuery`,
      body.toString(),
      {
        headers: new HttpHeaders().set(
          'Content-Type',
          'application/x-www-form-urlencoded',
        ),
      },
    );
  }

  //declaration query
  getDeclarations$(
    Date1: string,
    Date2: string,
    importerId: string,
    eventCode: any,
    typeCode: string | null,
  ): Observable<any> {
    let params = new HttpParams()
      .set('Date1', Date1)
      .set('Date2', Date2)
      .set('importerId', importerId)
      .set('eventCode', eventCode)
      .set('governmentProcedureType', '');

    if (typeCode) {
      params = params.set('typeCode', typeCode); // או typeCode אם שינית גם בשרת
    }

    return this.http.get<any>(`${apiConfig.customsdbApiUrl}DecQuery`, {
      params,
    });
  }

  GetClassificationID$(classification: any) {
    let body = new HttpParams().set('classification', classification);

    return this.http.post(
      `${apiConfig.customsApiUrl}CustomItemDetails`,
      body.toString(),
      {
        headers: new HttpHeaders().set(
          'Content-Type',
          'application/x-www-form-urlencoded',
        ),
      },
    );
  }
}
