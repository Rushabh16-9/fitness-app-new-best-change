import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { paymentApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class PaymentService {

  constructor(
    private http: HttpClient
  ) {}

  getPaymentStatus(pTrId:string) : Observable<any> {

    const url = paymentApiUrls.getPaymentStatus;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['paymentTransactionId'] = pTrId;

    return this.http.post<any>(url, postData);
  }

  getReceiptUrl(receiptId:string) : Observable<any> {

    const url = paymentApiUrls.getReceiptUrl;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['receiptId'] = receiptId;

    return this.http.post<any>(url, postData);
  }
}
