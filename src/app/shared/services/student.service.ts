import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { studentApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class StudentService {

  constructor(
    private http: HttpClient
  ) {}

  sendRegistrationOtp(values:any, userId) : Observable<any> {

    const url = studentApiUrls.sendRegistrationOtp;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = userId;
    postData['instituteId'] = values.institute;
    postData['firstName'] = values.firstName;
    postData['middleName'] = values.middleName;
    postData['lastName'] = values.lastName;
    postData['email'] = values.email;
    postData['mobileNo'] = values.mobileNo;
    postData['dob'] = values.dob;
    postData['gender'] = values.gender;
    postData['residentialAddress'] = values.residentialAddress;
    postData['villageName'] = values.villageName;
    postData['resend'] = values.resend;

    return this.http.post<any>(url, postData);
  }

  confirmRegistrationOtp(values:any, otpFormValues:any, instituteId) : Observable<any> {
    
    const url = studentApiUrls.confirmRegistrationOtp;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = '0';
    postData['instituteId'] = instituteId;
    postData['otp'] = otpFormValues.otp;
    postData['firstName'] = values.firstName;
    postData['middleName'] = values.middleName;
    postData['lastName'] = values.lastName;
    postData['email'] = values.email;
    postData['mobileNo'] = values.mobileNo;
    postData['dob'] = values.dob;
    postData['gender'] = values.gender;
    postData['residentialAddress'] = values.residentialAddress;

    return this.http.post<any>(url, postData);
  }

  setUser(selectedUserId, instituteId) : Observable<any> {
    
    const url = studentApiUrls.setUser;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = '0';
    postData['instituteId'] = instituteId;
    postData['selectedUserId'] = selectedUserId;

    return this.http.post<any>(url, postData);
  }

  submitSelection(instituteId, selectedLevels, academicYearId, userId, studentId) : Observable<any> {
    
    const url = studentApiUrls.submitSelection;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = userId;
    postData['instituteId'] = instituteId;
    postData['studentId'] = studentId;
    postData['selectedLevels'] = selectedLevels;
    postData['academicYearId'] = academicYearId;

    return this.http.post<any>(url, postData);
  }

  saveNewStudent(values:any) : Observable<any> {
    
    const url = studentApiUrls.saveNewStudent;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = '0';
    postData['mobileNo'] = values.mobileNo;
    postData['firstName'] = values.firstName;
    postData['middleName'] = values.middleName;
    postData['lastName'] = values.lastName;
    postData['email'] = values.email;

    return this.http.post<any>(url, postData);
  }

  feesSummary() : Observable<any> {
    
    const url = studentApiUrls.feesSummary;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  feesDetails() : Observable<any> {
    
    const url = studentApiUrls.feesDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getStudentInfo() : Observable<any> {

    const url = studentApiUrls.getStudentInfo;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  removeSelection(userId, studentConfId) : Observable<any> {

    const url = studentApiUrls.removeSelection;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = userId;
    postData['studentConfId'] = studentConfId;

    return this.http.post<any>(url, postData);
  }

  confirmSelection(userId) : Observable<any> {

    const url = studentApiUrls.confirmSelection;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = userId;

    return this.http.post<any>(url, postData);
  }

  feesSubmit(totalFeesArray, miscInvoices, admissionInvoices, paymentOptionId = 0, convenienceFeesAmt = 0) : Observable<any> {

    const url = studentApiUrls.feesSubmit;
    let commonPostValues = globalFunctions.getCommonPostValues();
    
    let postData = commonPostValues;
    postData['admissionInvoices'] = admissionInvoices;
    postData['mainInvoices'] = totalFeesArray;
    postData['miscInvoices'] = miscInvoices;
    postData['paymentOptionId'] = paymentOptionId;
    postData['convenienceFeesAmt'] = convenienceFeesAmt;

    return this.http.post<any>(url, postData);
  }

  getPaymentHistory(page, rowsPerPage = '0', filter = '') : Observable<any> {

    const url = studentApiUrls.getPaymentHistory;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  getOpenCart(): Observable<any> {

    const url = studentApiUrls.getOpenCart;
    let commonPostValues = globalFunctions.getCommonPostValues();
    
    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  insertLeadData(values,instituteId,courseName): Observable<any> {
    const url = studentApiUrls.insertLeadData;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['firstName'] = values.firstName;
    postData['middleName'] = values.middleName;
    postData['lastName'] = values.lastName;
    postData['email'] = values.email;
    postData['mobileNo'] = values.mobileNo;
    postData['confId'] =  values.confId;
    postData['courseName'] = courseName;
    postData['gender'] = values.gender;
    postData['instituteId'] = instituteId;
    postData['filterAcademicYearId'] = '20';

    return this.http.post<any>(url, postData);

  }


}
