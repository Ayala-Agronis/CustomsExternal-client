import { HttpParams, HttpHeaders, HttpClient } from "@angular/common/http";
import { catchError, Observable } from "rxjs";
import { apiConfig } from '../../config/api-endpoints';
import { Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class VendorService{
  constructor(private http: HttpClient) { }

  getVendors$(vendor:any): Observable<any> { 
      const body = new HttpParams().set('vendorName', vendor.VendorName)
      .set('englishPostalCode', vendor.EnglishPostalCode)
      .set('licensedDealerNumber', vendor.LicensedDealerNumber)
      .set('vendorID', vendor.VendorID)
      return this.http.post( `${apiConfig.customsApiUrl}Vendor`,
        body.toString(),
        {
          headers: new HttpHeaders()
            .set('Content-Type', 'application/x-www-form-urlencoded')
        }
      );
  }

  postVendor$(vendor: any): Observable<any> { 
    console.log(vendor);
    return this.http.post<any>(`${apiConfig.customsdbApiUrl}vendors/PostVendors`, vendor).pipe(
      catchError(error => {
        console.error('Error in postVendor$', error);
        throw error; 
      })
    );
  }

  updateVendor$(vendor: any): Observable<any> {
    return this.http.put<any>(`${apiConfig.customsdbApiUrl}/Vendors/${vendor.vendorIDField}`, vendor);
  }
  
  
}
