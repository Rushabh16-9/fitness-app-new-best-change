import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { atktApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class AtktService {

  constructor(
    private http: HttpClient
  ) {}

  sendOtp(phone:string, instituteId: string = '', formType: string = ''): Observable<any> {
    
    const url = atktApiUrls.sendOtp;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;
    postData['phone'] = phone;
    postData['formType'] = formType;

    return this.http.post<any>(url, postData);
  }

  otpConfirmation(phone:string, otp:string, instituteId:string = '', formPolicyId: string = '', formType: string = ''): Observable<any> {
    
    const url = atktApiUrls.otpConfirmation;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = '0';
    postData['instituteId'] = instituteId;
    postData['formPolicyId'] = formPolicyId;
    postData['mobileNo'] = phone;
    postData['otp'] = otp;
    postData['formType'] = formType;

    return this.http.post<any>(url, postData);
  }

  getUserStudentsList(postParam) : Observable<any> {

    const url = atktApiUrls.getUserStudentsList;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = postParam.userId;
    postData['instituteId'] = postParam.instituteId;
    postData['mobileNo'] = postParam.mobileNo;
    postData['formPolicyId'] = postParam.formPolicyId;

    return this.http.post<any>(url, postData);
  }

  getStudentsCourses(values:any): Observable<any> {

    const url = atktApiUrls.getStudentsCourses;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['studentId'] = values.studentId;
    postData['instituteId'] = values.instituteId;
    postData['formType'] = values.formType;

    return this.http.post<any>(url, postData);
  }

  getCourseExams(confId, instituteId) : Observable<any> {

    const url = atktApiUrls.getCourseExams;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['confId'] = confId;
    postData['instituteId'] = instituteId;

    return this.http.post<any>(url, postData);
  }  

  getFormDetails() : Observable<any> {

    const url = atktApiUrls.getFormDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let userProf = globalFunctions.getUserProf();

    let postData = commonPostValues;
    postData['mobileNo'] = userProf.mobileNo;
    postData['confId'] = userProf.confId;
    postData['subjectGroupId'] = userProf.subjectGroupId;
    postData['termExamId'] = userProf.termExamId;

    return this.http.post<any>(url, postData);
  }

  saveFormDetails(postParam, categoryFormValues, personalInfo, addressInfo, subjectInfo, examMarksPatternSelected, educationInfo, passportSizePhoto, signatureImage): Observable<any> {
    
    const url = atktApiUrls.saveFormDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let userProf = globalFunctions.getUserProf();

    let postData = commonPostValues;
    postData['mobileNo'] = userProf.mobileNo;
    postData['categoryInfo'] = categoryFormValues;
    postData['atktApplicantId'] = postParam.atktApplicantId;
    postData['termYear'] = postParam.termYear;
    postData['personalInfo'] = personalInfo;
    postData['addressInfo'] = addressInfo;
    postData['subjectInfo'] = subjectInfo;
    postData['examMarksPatternSelected'] = examMarksPatternSelected;
    postData['educationInfo'] = educationInfo;
    postData['passportSizePhoto'] = passportSizePhoto;
    postData['signatureImage'] = signatureImage;
    postData['confId'] = userProf.confId;
    postData['subjectGroupId'] = userProf.subjectGroupId;
    postData['termExamId'] = userProf.termExamId;

    return this.http.post<any>(url, postData);
  }

  listCart() : Observable<any> {

    const url = atktApiUrls.listCart;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  payFees(paymentOptionId: number, finalTotal): Observable<any> {

    const url = atktApiUrls.payFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['paymentOptionId'] = paymentOptionId;
    postData['finalTotal'] = finalTotal;

    return this.http.post<any>(url, postData);
  }

  getAtktForms(): Observable<any> {

    const url = atktApiUrls.getAtktForms;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getPaymentHistory(page, filter = ''): Observable<any> {

    const url = atktApiUrls.getPaymentHistory;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['pageSize'] = page.limit;
    postData['pageNumber'] = page.offset;
    postData['sortOrder'] = page.orderBy;
    postData['sortProp'] = page.orderDir;
    postData['search'] = filter;

    return this.http.post<any>(url, postData);
  }

  getUploadedDocuments(): Observable<any> {

    const url = atktApiUrls.getUploadedDocuments;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let userProf = globalFunctions.getUserProf();

    let postData = commonPostValues;
    postData['mobileNo'] = userProf.mobileNo;
    postData['confId'] = userProf.confId;
    postData['subjectGroupId'] = userProf.subjectGroupId;
    postData['termExamId'] = userProf.termExamId;

    return this.http.post<any>(url, postData);
  }

  uploadDocImage(values: any, page = ''): Observable<any> {

    const url = atktApiUrls.uploadDocImage;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['docId'] = values.docId;
    postData['docValue'] = values.docValue;
    postData['page'] = page;

    return this.http.post<any>(url, postData);
  }

  uploadPdf(file:any, docId = '', page = '') : Observable<any> {

    const url = atktApiUrls.uploadPdf;
    let userProf = globalFunctions.getUserProf();
    let browserProf = globalFunctions.getBrowserProf();
    let commonPostValues = globalFunctions.getCommonPostValues();

    const fd = new FormData();
    for (var key in commonPostValues) {
      if (commonPostValues.hasOwnProperty(key)) {
        fd.append(key, commonPostValues[key]);
      }
    }

    fd.append('page', page);
    fd.append('docId', docId);
    fd.append('document', file, file.name);
    
    return this.http.post<any>(url, fd).pipe(timeout(globalFunctions.timeoutSeconds()));    
  }

  directFormGenerate(cartVal:any, page = ''): Observable<any> {

    const url = atktApiUrls.directFormGenerate;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['cart'] = cartVal;
    postData['page'] = page;

    return this.http.post<any>(url, postData);
  }  
}