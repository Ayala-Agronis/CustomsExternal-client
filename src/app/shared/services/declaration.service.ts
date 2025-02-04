import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeclarationService {

  private DecURL = `${environment.customsExternalApiUrl}Declaration/`;
  private InternalDecURL = `${environment.customsdbApiUrl}Declaration/`;

  constructor(private http: HttpClient) { }

  private packageData = new BehaviorSubject<any>(null);
  packageData$ = this.packageData.asObservable();

  updatePackageData(data: any) {
    this.packageData.next(data);
  }

  fillFormAndRedirect(k_asmachta: string, k_importer_num: string): Observable<any> {
    const formData = { Asmachta: k_asmachta, ImporterNum: k_importer_num };

    return this.http.post(`${environment.customsExternalApiUrl}fill-form/` , formData);
  }

  // addDeclaration(dec: any): Observable<HttpResponse<any>> {
  //   return this.http.post<any>(this.DecURL, dec, { observe: 'response' });
  // }

  SendDecToInternalDB(dec: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.InternalDecURL, dec, { observe: 'response' });
  }

  sendDeclarationToInternal(dec: any): Observable<HttpResponse<any>> {
    // return this.http.post<any>(`${environment.customsWebServiceUrl}Declaration`, dec, { observe: 'response' });
    return this.http.post<any>(`${environment.customsdbApiUrl}Dec`, dec, { observe: 'response' });
  }

  getDeclaration(decId: any): Observable<any> {
    // return this.http.get<any>(`${this.DecURL}?decId=${decId}`);
    return this.http.get<any>(`${environment.customsdbApiUrl}Dec/${decId}`);
  }

  // sendDeclaration$(decId: any, declaration: any, isSign: any): Observable<any> {
  //   return this.http.post<any>(`${environment.customsApiUrl}Declaration/${decId}?isSign=${isSign}`, declaration)
  // }

  updateDeclaration$(id: any, declaration: any): Observable<any> {
    const url = `${environment.customsdbApiUrl}dec/${id}`;
    return this.http.put<any>(url, declaration);
  }

  sendUpdateDecToInternalDB$(id: any, declaration: any): Observable<any> {
    const url = `${this.InternalDecURL}/${id}`;  
    return this.http.put<any>(url, declaration);  
  }  

  updateAndSendDeclaration$(id: any, declaration: any, isSign: any): Observable<any> {
    return this.http.post<any>(`${environment.customsdbApiUrl}dec/PutAndSend/${id}?isSign=${isSign}`, declaration)

    // return this.http.post<any>(`${environment.customsExternalApiUrl}dec/GetAndSend/${id}?isSign=${isSign}`, declaration)
  }

  getCagroQueryMessage$(params: any) {
    let body = new HttpParams().set('CargoIdentifierType', params.cargoType)
      .set('CargoIdentifierKey1', params.firstCargoID || '')
      .set('CargoIdentifierKey2', params.secondCargoID || '')    
      .set('CargoIdentifierKey3', params.thirdCargoID || '');

    return this.http.post(`${environment.customsApiUrl}CargoQuery`,
      body.toString(),
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      }
    );
  }

  //declaration query
  getDeclarations$(Date1: string, Date2: string, importerId: string, eventCode: any): Observable<any> {
    const params = new HttpParams()
      .set('Date1', Date1)
      .set('Date2', Date2)
      .set('importerId', importerId)
      .set('eventCode', eventCode);

    return this.http.get<any>(`${environment.customsdbApiUrl}/DecQuery`, { params });
  }

  GetClassificationID$(classification: any) {
    let body = new HttpParams()
      .set('classification',classification)

    return this.http.post(`${environment.customsApiUrl}CustomItemDetails`,
      body.toString(),
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      }
    );
  }

 
}
