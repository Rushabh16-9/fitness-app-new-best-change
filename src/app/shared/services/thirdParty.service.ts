import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { thirdPartyApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class ThirdPartyService {

  constructor(
    private http: HttpClient
  ) {}

  getOpenCart(): Observable<any> {

    const url = thirdPartyApiUrls.getOpenCart;
    let commonPostValues = globalFunctions.getCommonPostValues();
    
    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  feesSubmit(totalFeesArray, paymentOptionId = 0, convenienceFeesAmt = 0) : Observable<any> {

    const url = thirdPartyApiUrls.feesSubmit;
    let commonPostValues = globalFunctions.getCommonPostValues();
    
    let postData = commonPostValues;
    postData['mainInvoices'] = totalFeesArray;
    postData['paymentOptionId'] = paymentOptionId;
    postData['convenienceFeesAmt'] = convenienceFeesAmt;

    return this.http.post<any>(url, postData);
  }

}
