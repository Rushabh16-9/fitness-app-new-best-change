import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, map, catchError } from 'rxjs/operators';

import { admissionApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';
import { environment } from 'environments/environment';

@Injectable()
export class AdmissionService {

  constructor(
    private http: HttpClient
  ) { }

  getListOfInstitutes(): Observable<any> {

    const url = admissionApiUrls.getListOfInstitutes;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    return this.http.post<any>(url, postData);
  }

  addToCart(cartVal: any): Observable<any> {

    const url = admissionApiUrls.addToCart;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['cart'] = cartVal;

    return this.http.post<any>(url, postData);
  }

  listCart(): Observable<any> {

    const url = admissionApiUrls.listCart;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  removeCourse(instituteId: string, admissionConfId: number): Observable<any> {

    const url = admissionApiUrls.removeConf;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;
    postData['admissionConfId'] = admissionConfId;

    return this.http.post<any>(url, postData);
  }

  sendOtp(values: any, preRegFormValues: any): Observable<any> {

    const url = admissionApiUrls.sendOtp;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['formPolicyId'] = values.formPolicyId;
    postData['mobileNo'] = values.mobileNo;
    postData['formType'] = values.formType;
    postData['signIn'] = values.signIn;
    postData['resend'] = values.resend;
    postData['preRegFormValues'] = preRegFormValues;
    postData['loginBy'] = values.loginBy;
    postData['email'] = values.email;
    postData['isMobileLogin'] = values.isMobileLogin;

    return this.http.post<any>(url, postData);
  }

  otpConfirmation(values: any): Observable<any> {

    const url = admissionApiUrls.otpConfirmation;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = '0';
    postData['instituteId'] = values.instituteId;
    postData['formPolicyId'] = values.formPolicyId;
    postData['mobileNo'] = values.mobileNo;
    postData['email'] = values.email;
    postData['otp'] = values.otp;
    postData['formType'] = values.formType;
    postData['preRegFormValues'] = values.preRegFormValues;
    postData['isMobileLogin'] = values.isMobileLogin;

    return this.http.post<any>(url, postData);
  }

  getAdmissionFormDetails(): Observable<any> {

    const url = admissionApiUrls.getAdmissionFormDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getAdmissionFormBDetails(): Observable<any> {

    const url = admissionApiUrls.getAdmissionFormBDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  saveForm(values: any, fatherPassportSizePhotoToUpload, motherPassportSizePhotoToUpload, sisterPassportSizePhotoToUpload, brotherPassportSizePhotoToUpload, guardianPassportSizePhotoToUpload, passportSizePhoto, signatureImage, parentSignatureImage, fatherSignaturePhoto, motherSignaturePhoto, sisterSignaturePhoto, brotherSignaturePhoto, guardianSignaturePhoto): Observable<any> {

    const url = admissionApiUrls.saveForm;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    const personalInfo = values.personalInfo ? values.personalInfo : {};
    const isNameChangeFromAi = Number(
      values.is_name_change_from_ai !== undefined ? values.is_name_change_from_ai :
        (values.isNameChangeFromAi !== undefined ? values.isNameChangeFromAi :
          (personalInfo.is_name_change_from_ai !== undefined ? personalInfo.is_name_change_from_ai :
            (personalInfo.isNameChangeFromAi !== undefined ? personalInfo.isNameChangeFromAi : 0)))
    ) || 0;

    personalInfo.isNameChangeFromAi = isNameChangeFromAi;
    personalInfo.is_name_change_from_ai = isNameChangeFromAi;
    postData['coursesList'] = values.coursesList;
    postData['categories'] = values.categories;
    postData['personalInfo'] = personalInfo;
    postData['addressInfo'] = values.addressInfo;
    postData['guardianInfo'] = values.guardianInfo;
    postData['educationInfo'] = values.educationInfo;
    postData['additionalQualification'] = values.additionalQualification;
    postData['extraCurriculumActivities'] = values.extraCurriculumActivities;
    postData['bankInfo'] = values.bankInfo;
    postData['questionnaire'] = values.questionnaire;
    postData['extraCertificate'] = values.extraCertificate;
    postData['softwareKnowledge'] = values.softwareKnowledge;
    postData['workExpDetails'] = values.workExpDetails;
    postData['isConfidential'] = values.isConfidential;
    postData['uploadedFileNames'] = values.uploadedFileNames;
    postData['courseSelectionValues'] = values.courseSelectionValues;
    postData['subjectSelectionValues'] = values.subjectSelectionValues;
    postData['declarationFormValues'] = values.declarationFormValues;
    postData['finalSave'] = values.finalSave;
    postData['stepName'] = values.stepName;
    postData['page'] = values.page;
    postData['isNameChangeFromAi'] = isNameChangeFromAi;
    postData['fatherPhoto'] = fatherPassportSizePhotoToUpload;
    postData['motherPhoto'] = motherPassportSizePhotoToUpload;
    postData['sisterPhoto'] = sisterPassportSizePhotoToUpload;
    postData['brotherPhoto'] = brotherPassportSizePhotoToUpload;
    postData['guardianPhoto'] = guardianPassportSizePhotoToUpload;
    postData['passportSizePhoto'] = passportSizePhoto;
    postData['signatureImage'] = signatureImage;
    postData['parentSignatureImage'] = parentSignatureImage;
    postData['fatherSignature'] = fatherSignaturePhoto;
    postData['motherSignature'] = motherSignaturePhoto;
    postData['sisterSignature'] = sisterSignaturePhoto;
    postData['brotherSignature'] = brotherSignaturePhoto;
    postData['guardianSignature'] = guardianSignaturePhoto;
    postData['branchingQuestion'] = values.branchingQuestion;

    return this.http.post<any>(url, postData);
  }

  payFees(finalTotal, paymentOptionId = 0): Observable<any> {

    const url = admissionApiUrls.payFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['finalTotal'] = finalTotal;
    postData['paymentOptionId'] = paymentOptionId;

    return this.http.post<any>(url, postData);
  }

  getPaymentHistory(page, filter = ''): Observable<any> {

    const url = admissionApiUrls.getPaymentHistory;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  downloadForms(): Observable<any> {

    const url = admissionApiUrls.downloadForms;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getPaymentStatus(pTrId: string): Observable<any> {

    const url = admissionApiUrls.getPaymentStatus;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['paymentTransactionId'] = pTrId;

    return this.http.post<any>(url, postData);
  }

  identifierConfirmation(values: any): Observable<any> {

    const url = admissionApiUrls.identifierConfirmation;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = values.userId;
    postData['instituteId'] = values.instituteId;
    postData['formPolicyId'] = values.formPolicyId;
    postData['inHouseSelection'] = values.inHouseSelection;
    postData['prnNo'] = values.prnNo;
    postData['nameSearch'] = values.nameSearch;
    postData['identifier'] = values.identifier;
    postData['applicantId'] = values.applicantId;
    postData['mobileNo'] = values.mobileNo;
    postData['formType'] = values.formType;

    return this.http.post<any>(url, postData);
  }

  syncNameOnConfirmation(values: any): Observable<any> {

    const url = admissionApiUrls.syncNameOnConfirmation;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    if (!globalFunctions.isEmpty(values?.applicantId)) postData['applicantId'] = values.applicantId;
    if (!globalFunctions.isEmpty(values?.studentConfId)) postData['studentConfId'] = values.studentConfId;
    if (!globalFunctions.isEmpty(values?.formPolicyId)) postData['formPolicyId'] = values.formPolicyId;
    if (!globalFunctions.isEmpty(values?.nameChange)) postData['nameChange'] = values.nameChange;
    if (!globalFunctions.isEmpty(values?.fullNameMarksheet)) postData['fullNameMarksheet'] = values.fullNameMarksheet;
    if (!globalFunctions.isEmpty(values?.firstName)) postData['firstName'] = values.firstName;
    if (!globalFunctions.isEmpty(values?.middleName)) postData['middleName'] = values.middleName;
    if (!globalFunctions.isEmpty(values?.lastName)) postData['lastName'] = values.lastName;

    return this.http.post<any>(url, postData);
  }

  uploadDocImage(values: any, page = ''): Observable<any> {

    const url = admissionApiUrls.uploadDocImage;
    let commonPostValues = globalFunctions.getCommonPostValues();

    const fd = new FormData();
    for (var key in commonPostValues) {
      if (commonPostValues.hasOwnProperty(key)) {
        fd.append(key, commonPostValues[key]);
      }
    }

    fd.append('page', page);
    fd.append('docId', values.docId);
    if (typeof values.docValue === 'string') {
      fd.append('document', values.docValue);
    } else {
      let file: File;
      if (values.docValue instanceof Blob || values.docValue instanceof File) {
        file = values.docValue;
      } else if (values.docValue && values.docValue.length > 0) {
        file = values.docValue[0];
      } else {
        file = values.docValue;
      }
      fd.append('document', file, file.name || 'document.png');
    }

    return this.http.post<any>(url, fd).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  uploadPdf(file: any, docId = '', page = ''): Observable<any> {

    const url = admissionApiUrls.uploadPdf;
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

  uploadImage(formData): Observable<any> {

    const url = admissionApiUrls.uploadImage;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['formData'] = formData;

    return this.http.post<any>(url, formData);
  }

  getFilteredGraduationEducationInfo(values: any): Observable<any> {

    const url = admissionApiUrls.getFilteredGraduationEducationInfo;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['yearSemesterWise'] = values.yearSemesterWise;
    postData['semesterNo'] = values.semesterNo;
    postData['yearNo'] = values.yearNo;
    postData['appearing'] = values.appearing;
    postData['page'] = values.page;
    postData['formId'] = values.formId;

    return this.http.post<any>(url, postData);
  }

  directFormGenerate(cartVal: any, page = ''): Observable<any> {

    const url = admissionApiUrls.directFormGenerate;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['cart'] = cartVal;
    postData['page'] = page;

    return this.http.post<any>(url, postData);
  }

  allowLogin(phone: string, password: string, instituteId: string = '', formPolicyId: string = ''): Observable<any> {

    const url = admissionApiUrls.allowLogin;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = '0';
    postData['instituteId'] = instituteId;
    postData['formPolicyId'] = formPolicyId;
    postData['mobileNo'] = phone;
    postData['password'] = password;

    return this.http.post<any>(url, postData);
  }

  getUploadedDocuments(): Observable<any> {

    const url = admissionApiUrls.getUploadedDocuments;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  saveUploadedDocuments(uploadedFileNames): Observable<any> {

    const url = admissionApiUrls.saveUploadedDocuments;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['documents'] = uploadedFileNames;

    return this.http.post<any>(url, postData);
  }

  generateForm(values: any): Observable<any> {

    const url = admissionApiUrls.generateForm;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['page'] = values.page;

    return this.http.post<any>(url, postData);
  }

  getFormPolicyInfo(instituteId = '', formPolicyId = ''): Observable<any> {

    const url = admissionApiUrls.getFormPolicyInfo;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;
    postData['formPolicyId'] = formPolicyId;

    return this.http.post<any>(url, postData);
  }

  updateSubjectGroup(values: any): Observable<any> {

    const url = admissionApiUrls.updateSubjectGroup;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = values.userId;
    postData['instituteId'] = values.instituteId;
    postData['formPolicyId'] = values.formPolicyId;
    postData['inHouseSelection'] = values.inHouseSelection;
    postData['prnNo'] = values.prnNo;
    postData['nameSearch'] = values.nameSearch;
    postData['identifier'] = values.identifier;
    postData['applicantId'] = values.applicantId;
    postData['mobileNo'] = values.mobileNo;
    postData['admissionConfId'] = values.admissionConfId;
    postData['langGroupId'] = values.langGroupId;
    postData['subjectGroupId'] = values.subjectGroupId;

    return this.http.post<any>(url, postData);
  }

  getListOfKnowAbout(instituteId = '', formPolicyId = ''): Observable<any> {

    const url = admissionApiUrls.getListOfKnowAbout;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;
    postData['formPolicyId'] = formPolicyId;

    return this.http.post<any>(url, postData);
  }

  getYearSemesterWiseDropdown(values: any): Observable<any> {

    const url = admissionApiUrls.getYearSemesterWiseDropdown;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['appearing'] = values.appearing;
    postData['yearSemesterWise'] = values.yearSemesterWise;
    postData['page'] = values.page;
    postData['formId'] = values.formId;

    return this.http.post<any>(url, postData);
  }

  getBranchingQuestionBifurcate(formPolicyId, branchingQuestionChange): Observable<any> {

    const url = admissionApiUrls.getBranchingQuestionBifurcate;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = Object.assign({}, commonPostValues);
    postData['formPolicyId'] = formPolicyId;
    postData['branchingQuestionChange'] = branchingQuestionChange;

    return this.http.post<any>(url, postData);
  }

  validatePassportPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('document', file);
    return this.http.post<any>(environment.API_ENDPOINT + 'api/validate-photo', formData)
      .pipe(
        timeout(globalFunctions.timeoutSeconds()),
        map(response => response),
        catchError(error => { throw error; })
      );
  }

  validateSignature(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('document', file);
    return this.http.post<any>(environment.API_ENDPOINT + 'api/validate-signature', formData)
      .pipe(
        timeout(globalFunctions.timeoutSeconds()),
        map(response => response),
        catchError(error => { throw error; })
      );
  }

  verifyDocument(file: File, expectedType: string): Observable<any> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('expectedType', expectedType);
    return this.http.post<any>(environment.API_ENDPOINT + 'api/verify-document', formData)
      .pipe(
        map(response => response),
        catchError(error => { throw error; })
      );
  }

}
