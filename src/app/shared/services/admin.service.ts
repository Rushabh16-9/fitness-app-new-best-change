import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { adminApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class AdminService {

  constructor(
    private http: HttpClient
  ) {}
  
  getDashboardDetails() : Observable<any> {
    
    const url = adminApiUrls.getDashboard;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getPayoutData(instituteIds, paymentType, dateRange) : Observable<any> {

    const url = adminApiUrls.getPayoutData;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteIds'] = instituteIds;
    postData['paymentType'] = paymentType;
    postData['fromDate'] = dateRange.fromDate;
    postData['toDate'] = dateRange.toDate;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  transactionDetails(page, dateRange, filter = '', transactionType = '') : Observable<any> {

    const url = adminApiUrls.transactionDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['transactionType'] = transactionType;

    return this.http.post<any>(url, postData);
  }  

  getPayoutSettlmentData(instituteIds, page, dateRange, filter = '') : Observable<any> {

    const url = adminApiUrls.getPayoutSettlmentData;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['instituteIds'] = instituteIds;

    return this.http.post<any>(url, postData);
  }  

  getPayoutTransactions(values:any) : Observable<any> {

    const url = adminApiUrls.getPayoutTransactions;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['bankAccountId'] = values.bankAccountId;
    postData['fromDate'] = values.fromDate;
    postData['toDate'] = values.toDate;

    return this.http.post<any>(url, postData);
  }  

  getListOfBankAccounts(instituteIds = [], approvalStatus = '', page = {}, filter = '') : Observable<any> {

    const url = adminApiUrls.getListOfBankAccounts;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['instituteIds'] = instituteIds;
    postData['approvalStatus'] = approvalStatus;

    return this.http.post<any>(url, postData);
  }

  approveRejectBankAccount(values:any) : Observable<any> {

    const url = adminApiUrls.approveRejectBankAccount;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['bankAccountId'] = values.bankAccountId;
    postData['type'] = values.type;
    postData['nodalMerchantCode'] = values.nodalMerchantCode;
    postData['rejectedReason'] = values.rejectedReason;

    return this.http.post<any>(url, postData);
  }

  getAllActions(page, dateRange, filter = '', instituteId = '', approvalStatus = '') : Observable<any> {

    const url = adminApiUrls.getAllActions;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['instituteId'] = instituteId;
    postData['approvalStatus'] = approvalStatus;

    return this.http.post<any>(url, postData);
  }

  approveRejectAction(values:any) : Observable<any> {

    const url = adminApiUrls.approveRejectAction;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['actionId'] = values.actionId;
    postData['action'] = values.action;
    postData['rejectReason'] = values.rejectReason;

    return this.http.post<any>(url, postData);
  }

  getProfitabilityReport(values:any) : Observable<any> {

    const url = adminApiUrls.getProfitabilityReport;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['instituteIds'] = values.instituteIds;

    return this.http.post<any>(url, postData);
  }  

  getProfitabilityReportExcel(values:any) : Observable<any> {
    
    const url = adminApiUrls.getProfitabilityReportExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['instituteIds'] = values.instituteIds;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }
}
