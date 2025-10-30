import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { commonApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class CommonService {

  constructor(
    private http: HttpClient
  ) {}

  getAdmissionCategories(values:any): Observable<any> {

    const url = commonApiUrls.getAdmissionCategories;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['atktForm'] = values.atktForm;

    return this.http.post<any>(url, postData);
  }
  
  getAdmissionCategoriesForFilter() : Observable<any> {

    const url = commonApiUrls.getAdmissionCategoriesForFilter;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }
  
  getReligion() : Observable<any> {

    const url = commonApiUrls.getReligion;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }
  
  getCaste() : Observable<any> {

    const url = commonApiUrls.getCaste;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  checkLogin(userName:string, pass:string) : Observable<any> {
    
    const url = commonApiUrls.login;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userName'] = userName;
    postData['password'] = pass;

    return this.http.post<any>(url, postData);
  }

  resetPassword(userName:string) : Observable<any> {

    const url = commonApiUrls.login;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }
  
  checkAuthLogin(authCode:string, openCart:boolean = false, applicantId:string) : Observable<any> {
    
    const url = commonApiUrls.authLogin;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['authCode'] = authCode;
    postData['openCart'] = openCart;
    postData['applicantId'] = applicantId;

    return this.http.post<any>(url, postData);
  }

  forgotPassword(values:any) : Observable<any> {

    const url = commonApiUrls.forgotPassword;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userName'] = values.resetUserName;
    postData['resend'] = values.resend;

    return this.http.post<any>(url, postData);
  }

  forgotPasswordotp(values:any, otpFormValues:any) : Observable<any> {

    const url = commonApiUrls.forgotPasswordotp;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userName'] = values.resetUserName;
    postData['otp'] = otpFormValues.otp;

    return this.http.post<any>(url, postData);
  }

  changePassword(newPassFormGroup:any, userId) : Observable<any> {

    const url = commonApiUrls.changePassword;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = userId;
    postData['newPassword'] = newPassFormGroup.newPassword;
    postData['confirmPassword'] = newPassFormGroup.confirmPassword;

    return this.http.post<any>(url, postData);
  }

  changePasswordProfile(values:any) : Observable<any> {

    const url = commonApiUrls.changePasswordProfile;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['oldPassword'] = values.oldPassword;
    postData['newPassword'] = values.newPassword;
    postData['confirmPassword'] = values.confirmPassword;

    return this.http.post<any>(url, postData);
  }

  getUserInfo() : Observable<any> {

    const url = commonApiUrls.getUserInfo;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getAcademicYears() : Observable<any> {

    const url = commonApiUrls.getAcademicYears;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getAdmissionSubCategories(values:any): Observable<any> {

    const url = commonApiUrls.getAdmissionSubCategories;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['atktForm'] = values.atktForm;

    return this.http.post<any>(url, postData);
  }  

  getMotherTongue() : Observable<any> {

    const url = commonApiUrls.getMotherTongue;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getYearsList() : Observable<any> {

    const url = commonApiUrls.getYearsList;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  uploadExcel(excelFile:any) : Observable<any> {

    const url = commonApiUrls.uploadExcel;
    let userProf = globalFunctions.getUserProf();
    let browserProf = globalFunctions.getBrowserProf();
    let commonPostValues = globalFunctions.getCommonPostValues();

    const fd = new FormData();
    for (var key in commonPostValues) {
      if (commonPostValues.hasOwnProperty(key)) {
        fd.append(key, commonPostValues[key]);
      }
    }

    fd.append('studentExcel', excelFile, excelFile.name);
    
    return this.http.post<any>(url, fd).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  updateProfile(email:string, profilePic:string) : Observable<any> {

    const url = commonApiUrls.updateProfile;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['email'] = email;
    postData['profilePic'] = profilePic;

    return this.http.post<any>(url, postData);
  }

  removeProfilePic() : Observable<any> {

    const url = commonApiUrls.removeProfilePic;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getFromPincode(pincode:string) : Observable<any> {

    const url = commonApiUrls.getFromPincode;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['pincode'] = pincode;

    return this.http.post<any>(url, postData);
  }

  generateReceipts(pTrId) : Observable<any> {

    const url = commonApiUrls.generateReceipts;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['paymentTransactionId'] = pTrId;

    return this.http.post<any>(url, postData);
  }  

  getLedgersDropDown(instituteId, allLedgers:boolean = false) : Observable<any> {

    const url = commonApiUrls.getLedgersDropDown;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;
    postData['allLedgers'] = allLedgers;

    return this.http.post<any>(url, postData);
  }

  multiUserOnChange(multiUserId): Observable<any> {

    const url = commonApiUrls.multiUserOnChange;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['multiUserId'] = multiUserId;

    return this.http.post<any>(url, postData);
  }

  uploadFile(file:any, values:any): Observable<any> {

    const url = commonApiUrls.uploadFile;
    let commonPostValues = globalFunctions.getCommonPostValues();

    const fd = new FormData();
    for (var key in commonPostValues) {
      if (commonPostValues.hasOwnProperty(key)) {
        fd.append(key, commonPostValues[key]);
      }
    }

    fd.append('fileUpload', file, file.name);
    fd.append('fileFormat', values.fileFormat);
    fd.append('unzipFile', values.unzipFile);

    return this.http.post<any>(url, fd, {reportProgress: true, observe: 'events'});    
    // return this.http.post<any>(url, fd, {reportProgress: true, observe: 'events'}).pipe(timeout(globalFunctions.timeoutSeconds()));    
  }

}
