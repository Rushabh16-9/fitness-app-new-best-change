import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { settlementApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class SettlementService {

  constructor(
    private http: HttpClient
  ) {}
  
  getAllPg() : Observable<any> {
    
    const url = settlementApiUrls.getAllPg;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  uploadPgSettlement(excelFile:any, values:any) : Observable<any> {

    const url = settlementApiUrls.uploadPgSettlement;
    let userProf = globalFunctions.getUserProf();
    let browserProf = globalFunctions.getBrowserProf();
    let commonPostValues = globalFunctions.getCommonPostValues();

    const fd = new FormData();
    for (var key in commonPostValues) {
      if (commonPostValues.hasOwnProperty(key)) {
        fd.append(key, commonPostValues[key]);
      }
    }
    
    fd.append('pgId', values.pgId);
    fd.append('settlementDate', values.settlementDate);
    fd.append('pgExcel', excelFile, excelFile.name);

    return this.http.post<any>(url, fd).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  getUploadedPgSettlements(page, dateRange, filter = '', pgIds = '') : Observable<any> {

    const url = settlementApiUrls.getUploadedPgSettlements;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['pgIds'] = pgIds;

    return this.http.post<any>(url, postData);
  }

  getAllSettlementData(page, dateRange, filter = '', instituteIds = [], settlementStatus = '', clientSidePaging = false) : Observable<any> {

    const url = settlementApiUrls.getAllSettlementData;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['instituteIds'] = instituteIds;
    postData['settlementStatus'] = settlementStatus;
    postData['clientSidePaging'] = clientSidePaging;

    return this.http.post<any>(url, postData);
  }

  getSettlemetTransactions(page, dateRange, filter = '', instituteSettlementId, clientSidePaging = false) : Observable<any> {

    const url = settlementApiUrls.getSettlemetTransactions;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['instituteSettlementId'] = instituteSettlementId;
    postData['clientSidePaging'] = clientSidePaging;

    return this.http.post<any>(url, postData);
  }

  processSelectedSettlements(instituteSettlementIds = []) : Observable<any> {

    const url = settlementApiUrls.processSelectedSettlements;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteSettlementIds'] = instituteSettlementIds;

    return this.http.post<any>(url, postData);
  }

  utrConfirmation(values: any) : Observable<any> {

    const url = settlementApiUrls.utrConfirmation;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteSettlementId'] = values.instituteSettlementId;
    postData['transferDate'] = values.transferDate;
    postData['utrNo'] = values.utrNo;

    return this.http.post<any>(url, postData);
  }

}
