import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { admissionApiUrls, instituteApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class InstitutesService {

  constructor(
    private http: HttpClient
  ) {}

  getListOfInstitutes() : Observable<any> {

    const url = admissionApiUrls.getListOfInstitutes;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    return this.http.post<any>(url, postData);
  }

  addToCart(cartVal:any) : Observable<any> {
    
    const url = admissionApiUrls.addToCart;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['cart'] = cartVal;

    return this.http.post<any>(url, postData);
  }

  listCart() : Observable<any> {

    const url = admissionApiUrls.listCart;
    let userProf = globalFunctions.getUserProf();
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['appUserId'] = userProf.userId;

    return this.http.post<any>(url, postData);
  }

  removeCourse(instituteId, admissionConfId: number) : Observable<any> {

    const url = admissionApiUrls.removeConf;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['admissionConfId'] = admissionConfId;
    postData['instituteId'] = instituteId;

    return this.http.post<any>(url, postData);
  }

  getInstituteDetails(instituteId) : Observable<any> {

    const url = instituteApiUrls.getInstituteDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = '0';
    postData['instituteId'] = instituteId;

    return this.http.post<any>(url, postData);
  }

  getLevels(instituteId, selectedLevels) : Observable<any> {
    
    const url = instituteApiUrls.getLevels;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = '0';
    postData['instituteId'] = instituteId;
    postData['selectedLevels'] = selectedLevels;

    return this.http.post<any>(url, postData);
  }

  getInstitutesList() : Observable<any> {
    
    const url = instituteApiUrls.getList;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['userId'] = '0';

    return this.http.post<any>(url, postData);
  }

  getDashboardDetails() : Observable<any> {
    
    const url = instituteApiUrls.getDashboardDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getLatestFeesReceipts(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getLatestFeesReceipts;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = values.confIds;

    return this.http.post<any>(url, postData);
  }

  getLatestFeesReceiptsExcel(values:any) : Observable<any> {

    const url = instituteApiUrls.getLatestFeesReceiptsExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = values.confIds;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }
  
  getLatestAdmissionReceipts(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getLatestAdmissionReceipts;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['admissionConfIds'] = values.admissionConfIds;

    return this.http.post<any>(url, postData);
  }

  getLatestAdmissionReceiptsExcel(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getLatestAdmissionReceiptsExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['admissionConfIds'] = values.admissionConfIds;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  getAdmissionForms(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getAdmissionForms;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['admissionConfIds'] = values.admissionConfIds;
    postData['confId'] = values.confId;
    postData['isInHouse'] = values.isInHouse;
    postData['clientSidePaging'] = values.clientSidePaging;
    postData['admissionStatus'] = values.admissionStatus;
    postData['formStatus'] = values.formStatus;
    postData['filterGender'] = values.filterGender;
    postData['admissionCategoryIds'] = values.admissionCategoryIds;
    postData['percentageRange'] = values.percentageRange;

    return this.http.post<any>(url, postData);
  }

  getAdmissionFormsExcel(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getAdmissionFormsExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['isInHouse'] = values.isInHouse;
    postData['admissionConfIds'] = values.admissionConfIds;
    postData['admissionStatus'] = values.admissionStatus;
    postData['formStatus'] = values.formStatus;
    postData['filterGender'] = values.filterGender;
    postData['academicYearId'] = values.academicYearId;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  getAdmissionEducationDetailsExcel(values:any) : Observable<any> {

    const url = instituteApiUrls.getAdmissionEducationDetailsExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['isInHouse'] = values.isInHouse;
    postData['admissionConfIds'] = values.admissionConfIds;
    postData['admissionStatus'] = values.admissionStatus;
    postData['formStatus'] = values.formStatus;
    postData['filterGender'] = values.filterGender;    
    postData['academicYearId'] = values.academicYearId;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  getAllAssignedStudents(values:any) : Observable<any> {

    const url = instituteApiUrls.getAllAssignedStudents;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['clientSidePaging'] = values.clientSidePaging;
    postData['confIds'] = values.confIds;
    postData['isInHouse'] = values.isInHouse;
    postData['filterGender'] = values.filterGender;

    return this.http.post<any>(url, postData);
  }

  getAllAssignedStudentsExcel(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getAllAssignedStudentsExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['clientSidePaging'] = values.clientSidePaging;
    postData['isInHouse'] = values.isInHouse;
    postData['confIds'] = values.confIds;
    postData['filterGender'] = values.filterGender;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }
  
  getAllFees() : Observable<any> {
    
    const url = instituteApiUrls.getAllFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getLedgers() : Observable<any> {

    const url = instituteApiUrls.getLedgers;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }
  
  getStudentsOnLevelsSelection(confIds, academicYearId = 0) : Observable<any> {
    
    const url = instituteApiUrls.getStudentsOnLevelsSelection;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['confIds'] = confIds;
    postData['academicYearId'] = academicYearId;

    return this.http.post<any>(url, postData);
  }

  createFees(particulars, studentsData, feesDetails, dueDate) : Observable<any> {

    const url = instituteApiUrls.createFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['feesDetails'] = feesDetails;
    postData['particulars'] = particulars;
    postData['studentsData'] = studentsData;
    postData['dueDate'] = dueDate;

    return this.http.post<any>(url, postData);
  }

  assignDeassignStudents(feesCode, studentsData) : Observable<any> {
    
    const url = instituteApiUrls.assignDeassignStudents;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['feesCode'] = feesCode;
    postData['studentsData'] = studentsData;

    return this.http.post<any>(url, postData);
  }

  getAllStudents(values:any) : Observable<any> {

    const url = instituteApiUrls.getAllStudents;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = values.confIds;
    postData['filterGender'] = values.filterGender;

    return this.http.post<any>(url, postData);
  }

  getStudentsLedgerReportExcel(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getStudentsLedgerReportExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = values.confIds;
    postData['filterGender'] = values.filterGender;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }
  
  getAllStudentsExcel(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getAllStudentsExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }  

  getAllCourses(instituteId=null) : Observable<any> {
    
    const url = instituteApiUrls.getAllCourses;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;

    return this.http.post<any>(url, postData);
  }

  getAllInstituteLevelConfsEnquiry(instituteId=null) : Observable<any> {
    
    const url = instituteApiUrls.getAllInstituteLevelConfsEnquiry;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;

    return this.http.post<any>(url, postData);
  }

  getAllAdmissionCourses() : Observable<any> {
    
    const url = instituteApiUrls.getAllAdmissionCourses;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getCourseFeesList(confId = '', formId = '', selectedLevels = '') : Observable<any> {
    
    const url = instituteApiUrls.getCourseFeesList;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['confId'] = confId;
    postData['formId'] = formId;
    postData['selectedLevels'] = selectedLevels;

    return this.http.post<any>(url, postData);
  }

  createStudent(selectedLevels, subjectGroupId, currentAcademicYearId, admissionYearId, studentDetails, instituteFeesIds) : Observable<any> {

    const url = instituteApiUrls.createStudent;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['selectedLevels'] = selectedLevels;
    postData['subjectGroupId'] = subjectGroupId;
    postData['currentAcademicYearId'] = currentAcademicYearId;
    postData['admissionYearId'] = admissionYearId;
    postData['studentDetails'] = studentDetails;
    postData['instituteFeesIds'] = instituteFeesIds;

    return this.http.post<any>(url, postData);
  }

  getMeritList() : Observable<any> {
    
    const url = instituteApiUrls.getMeritList;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  createMeritList(meritListDetails, studentsData) : Observable<any> {

    const url = instituteApiUrls.createMeritList;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['meritListDetails'] = meritListDetails;
    postData['studentsData'] = studentsData;

    return this.http.post<any>(url, postData);
  }  

  assignAdmissionFees(values:any) : Observable<any> {

    const url = instituteApiUrls.assignAdmissionFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['confId'] = values.confId;
    postData['studentsData'] = values.studentsData;
    postData['instituteFeesIds'] = values.instituteFeesIds;
    postData['langGroupId'] = values.langGroupId;
    postData['subjectGroupId'] = values.subjectGroupId;

    return this.http.post<any>(url, postData);
  }  

  getStudentFeesDetails(studentId) : Observable<any> {

    const url = instituteApiUrls.getStudentFeesDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['studentId'] = studentId;

    return this.http.post<any>(url, postData);
  }

  studentFeesSubmit(studentId, totalFeesArray, miscInvoices, paymentOptionId, paymentOptionValues : any) : Observable<any> {

    const url = instituteApiUrls.studentFeesSubmit;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['studentId'] = studentId;
    postData['mainInvoices'] = totalFeesArray;
    postData['miscInvoices'] = miscInvoices;    
    postData['paymentOptionId'] = paymentOptionId;
    postData['paymentOptionValues'] = paymentOptionValues;

    return this.http.post<any>(url, postData);
  }

  getAllInvoices(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getAllInvoices;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['showCancel'] = values.showCancel;
    postData['confIds'] = values.confIds;
    postData['clientSidePaging'] = values.clientSidePaging;
    postData['paymentStatus'] = values.paymentStatus;
    postData['feesIds'] = values.feesIds;
    postData['filterGender'] = values.filterGender;

    return this.http.post<any>(url, postData);
  }

  getAllInvoicesExcel(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getAllInvoicesExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['showCancel'] = values.showCancel;
    postData['confIds'] = values.selectedConfIds;
    postData['academicYearId'] = values.academicYearId;
    postData['filterGender'] = values.filterGender;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  sendSMStoAssignedStudent(studentConfId) : Observable<any> {

    const url = instituteApiUrls.sendSMStoAssignedStudent;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['studentConfId'] = studentConfId;

    return this.http.post<any>(url, postData);
  }

  cancelReassignAdmission(cancelType = '', studentConfId = '') : Observable<any> {

    const url = instituteApiUrls.cancelReassignAdmission;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['cancelType'] = cancelType;
    postData['studentConfId'] = studentConfId;

    return this.http.post<any>(url, postData);
  }

  getAdmissionFormsDetails(formId): Observable<any> {
    
    const url = instituteApiUrls.getAdmissionFormsDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['formId'] = formId;

    return this.http.post<any>(url, postData);
  }
  
  getAdmissionFormsBDetails(formId): Observable<any> {
    
    const url = instituteApiUrls.getAdmissionFormsBDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['formId'] = formId;

    return this.http.post<any>(url, postData);
  }

  saveAdmissionForm(values:any, passportSizePhoto, signatureImage, parentSignatureImage): Observable<any> {

    const url = instituteApiUrls.saveAdmissionForm;
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
    postData['is_name_change_from_ai'] = isNameChangeFromAi;
    postData['passportSizePhoto'] = passportSizePhoto;
    postData['signatureImage'] = signatureImage;
    postData['formId'] = values.formId;
    postData['parentSignatureImage'] = parentSignatureImage;
    postData['branchingQuestion'] = values.branchingQuestion;   

    return this.http.post<any>(url, postData);
  }

  getIdentifierDetails() : Observable<any> {

    const url = instituteApiUrls.getIdentifierDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getFeesList() : Observable<any> {
    
    const url = instituteApiUrls.getFeesList;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getFeesParticularsFromFees(feesId) : Observable<any> {
    
    const url = instituteApiUrls.getFeesParticularsFromFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['feesId'] = feesId;

    return this.http.post<any>(url, postData);
  }

  createInvoice(particulars, studentsData, feesDetails, dueDate, feesId) : Observable<any> {

    const url = instituteApiUrls.createInvoice;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['feesDetails'] = feesDetails;
    postData['particulars'] = particulars;
    postData['studentsData'] = studentsData;
    postData['dueDate'] = dueDate;
    postData['feesId'] = feesId;

    return this.http.post<any>(url, postData);
  }

  cancelInvoice(invoiceId) : Observable<any> {
    
    const url = instituteApiUrls.cancelInvoice;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['invoiceId'] = invoiceId;

    return this.http.post<any>(url, postData);
  }

  updateFeesStructure(feesDetails, particulars) : Observable<any> {

    const url = instituteApiUrls.updateFeesStructure;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['feesDetails'] = feesDetails;
    postData['particulars'] = particulars;

    return this.http.post<any>(url, postData);
  }

  deleteFeesStructure(feesId) : Observable<any> {

    const url = instituteApiUrls.deleteFeesStructure;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['feesId'] = feesId;

    return this.http.post<any>(url, postData);
  }
    
  deleteInstituteCourseFees(instituteFeesId) : Observable<any> {

    const url = instituteApiUrls.deleteInstituteCourseFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteFeesId'] = instituteFeesId;

    return this.http.post<any>(url, postData);
  }

  getAllStudentsList(values:any) : Observable<any> {

    const url = instituteApiUrls.getAllStudentsList;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = values.confIds;
    postData['clientSidePaging'] = values.clientSidePaging;
    postData['academicYearId'] = values.academicYearId;
    postData['filterGender'] = values.filterGender;

    return this.http.post<any>(url, postData);
  }

  getAllStudentsListExcel(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getAllStudentsListExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = values.confIds;
    postData['academicYearId'] = values.academicYearId;
    postData['filterGender'] = values.filterGender;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }
  
  getAllStudentsListPhotos(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getAllStudentsListPhotos;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = values.confIds;
    postData['academicYearId'] = values.academicYearId;
    postData['filterGender'] = values.filterGender;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } );
  }

  checkMobileExist(values) : Observable<any> {
    
    const url = instituteApiUrls.checkMobileExist;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['studentId'] = values.studentId;
    postData['mobileNo'] = values.mobileNo;

    return this.http.post<any>(url, postData);
  }

  getStudentInfoEdit(studentConfId) : Observable<any> {

    const url = instituteApiUrls.getStudentInfoEdit;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['studentConfId'] = studentConfId;

    return this.http.post<any>(url, postData);
  }

  updateStudent(values) : Observable<any> {

    const url = instituteApiUrls.updateStudent;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['studentDetails'] = values;

    return this.http.post<any>(url, postData);
  }

  feesCollectionReportCourse(values:any) : Observable<any> {
    
    const url = instituteApiUrls.feesCollectionReportCourse;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = values.confIds;
    postData['academicYearId'] = values.academicYearId;

    return this.http.post<any>(url, postData);
  }
  
  feesCollectionReportCourseExcel(values:any) : Observable<any> {

    const url = instituteApiUrls.feesCollectionReportCourseExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = values.confIds;
    postData['academicYearId'] = values.academicYearId;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  feesCollectionReport(page, filter = '') : Observable<any> {
    
    const url = instituteApiUrls.feesCollectionReport;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  feesCollectionReportAdmission(values:any) : Observable<any> {
    
    const url = instituteApiUrls.feesCollectionReportAdmission;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['admissionConfIds'] = values.admissionConfIds;
    postData['academicYearId'] = values.academicYearId;

    return this.http.post<any>(url, postData);
  }  

  feesCollectionReportAdmissionExcel(values:any) : Observable<any> {
    
    const url = instituteApiUrls.feesCollectionReportAdmissionExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(values.page, values.dateRange, values.filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['admissionConfIds'] = values.admissionConfIds;
    postData['academicYearId'] = values.academicYearId;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  institutePayoutReportCourse(page, dateRange, filter = '', selectedConfIds) : Observable<any> {
    
    const url = instituteApiUrls.institutePayoutReportCourse;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = selectedConfIds;

    return this.http.post<any>(url, postData);
  }

  institutePayoutReportCourseExcel(page, dateRange, filter = '', selectedConfIds) : Observable<any> {
    
    const url = instituteApiUrls.institutePayoutReportCourseExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = selectedConfIds;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  institutePayoutReportAdmission(page, dateRange, filter = '', selectedConfIds) : Observable<any> {
    
    const url = instituteApiUrls.institutePayoutReportAdmission;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['admissionConfIds'] = selectedConfIds;

    return this.http.post<any>(url, postData);
  }

  institutePayoutReportAdmissionExcel(page, dateRange, filter = '', selectedConfIds) : Observable<any> {
    
    const url = instituteApiUrls.institutePayoutReportAdmissionExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['admissionConfIds'] = selectedConfIds;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  getFeesSummary(values:any) : Observable<any> {
    
    const url = instituteApiUrls.getFeesSummary;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['fromDate'] = values.dateRange.fromDate;
    postData['toDate'] = values.dateRange.toDate;
    postData['search'] = values.search;
    postData['reportFor'] = values.reportFor;
    postData['admissionConfIds'] = values.admissionConfIds;
    postData['confIds'] = values.confIds;

    return this.http.post<any>(url, postData);
  }

  getFeesTemplates(instituteId = '') : Observable<any> {

    const url = instituteApiUrls.getFeesTemplates;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;

    return this.http.post<any>(url, postData);
  }
  
  getLateFeesRules() : Observable<any> {

    const url = instituteApiUrls.getLateFeesRules;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }  

  insertUpdateLateFeesRules(postValues) : Observable<any> {

    const url = instituteApiUrls.insertUpdateLateFeesRules;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['lateFeesId'] = postValues.lateFeesId;
    postData['lateFeesName'] = postValues.lateFeesName;
    postData['lateFeesDesc'] = postValues.lateFeesDesc;
    postData['lateFeesApplyType'] = postValues.lateFeesApplyType;
    postData['lateFeesValue'] = postValues.lateFeesValue;
    postData['intervalDays'] = postValues.intervalDays;

    return this.http.post<any>(url, postData);
  }

  deleteLateFeesRule(lateFeesId) : Observable<any> {

    const url = instituteApiUrls.deleteLateFeesRule;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['lateFeesId'] = lateFeesId;

    return this.http.post<any>(url, postData);
  }
  
  getAtktForms(page, dateRange, filter = '', atktConfIds = [], confId = '', clientSidePaging = false, studentType = '', admissionStatus = '') : Observable<any> {
    
    const url = instituteApiUrls.getAtktForms;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = atktConfIds;
    postData['studentType'] = studentType;
    postData['admissionStatus'] = admissionStatus;
    postData['confId'] = confId;
    postData['clientSidePaging'] = clientSidePaging;

    return this.http.post<any>(url, postData);
  }

  getAtktFormsExcel(page, dateRange, filter = '', atktConfIds = [], studentType = '', admissionStatus = '') : Observable<any> {
    
    const url = instituteApiUrls.getAtktFormsExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = atktConfIds;
    postData['studentType'] = studentType;
    postData['admissionStatus'] = admissionStatus;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  deleteStudent(values) : Observable<any> {

    const url = instituteApiUrls.deleteStudent;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['studentConfId'] = values.studentConfId;
    postData['studentId'] = values.studentId;

    return this.http.post<any>(url, postData);
  }

  createLogin(values) : Observable<any> {

    const url = instituteApiUrls.createLogin;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['mobileNo'] = values.mobileNo;
    postData['createPass'] = values.createPass;
    postData['manualPass'] = values.manualPass;
    postData['sendSms'] = values.sendSms;
    postData['studentConfId'] = values.studentConfId;
    postData['studentId'] = values.studentId;

    return this.http.post<any>(url, postData);
  }

  updateLogin(values) : Observable<any> {

    const url = instituteApiUrls.updateLogin;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['mobileNo'] = values.mobileNo;
    postData['createPass'] = values.createPass;
    postData['manualPass'] = values.manualPass;
    postData['sendSms'] = values.sendSms;
    postData['studentConfId'] = values.studentConfId;
    postData['studentId'] = values.studentId;
    postData['studentUserId'] = values.studentUserId;

    return this.http.post<any>(url, postData);
  } 
  
  deleteLogin(values:any) : Observable<any> {

    const url = instituteApiUrls.deleteLogin;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['studentConfId'] = values.studentConfId;
    postData['studentId'] = values.studentId;
    postData['studentUserId'] = values.studentUserId;

    return this.http.post<any>(url, postData);
  }

  getTemplates() : Observable<any> {

    const url = instituteApiUrls.getTemplates;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getFieldNames() : Observable<any> {

    const url = instituteApiUrls.getFieldNames;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  insertUpdateTemplate(values:any) : Observable<any> {

    const url = instituteApiUrls.insertUpdateTemplate;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['templateId'] = values.templateId;
    postData['templateName'] = values.templateName;
    postData['message'] = values.message;

    return this.http.post<any>(url, postData);
  }

  deleteTemplate(templateId:number) : Observable<any> {

    const url = instituteApiUrls.deleteTemplate;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['templateId'] = templateId;

    return this.http.post<any>(url, postData);
  }

  messagesDashboard() : Observable<any> {

    const url = instituteApiUrls.messagesDashboard;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  creditMessage(postValues) : Observable<any> {

    const url = instituteApiUrls.creditMessage;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['credit'] = postValues.credit;

    return this.http.post<any>(url, postData);
  }

  ledgerPaidDueReport(postValues) : Observable<any> {

    const url = instituteApiUrls.ledgerPaidDueReport;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['confIds'] = postValues.confIds;
    postData['ledgerIds'] = postValues.ledgerIds;
    postData['paymentStatus'] = postValues.paymentStatus;

    return this.http.post<any>(url, postData);
  }

  ledgerPaidDueReportExcel(postValues) : Observable<any> {
    
    const url = instituteApiUrls.ledgerPaidDueReportExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['confIds'] = postValues.confIds;
    postData['ledgerIds'] = postValues.ledgerIds;
    postData['paymentStatus'] = postValues.paymentStatus;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }  

  ledgerStatement(postValues) : Observable<any> {

    const url = instituteApiUrls.ledgerStatement;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['ledgerId'] = postValues.ledgerId;

    return this.http.post<any>(url, postData);
  }

  ledgerStatementExcel(postValues) : Observable<any> {
    
    const url = instituteApiUrls.ledgerStatementExcel;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['ledgerId'] = postValues.ledgerId;

    return this.http.post<Blob>(url, postData, { responseType: 'blob' as 'json' } ).pipe(timeout(globalFunctions.timeoutSeconds()));
  }

  getListOfMiscFees() : Observable<any> {
    
    const url = instituteApiUrls.getListOfMiscFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  createUpdateMiscFees(values:any) : Observable<any> {

    const url = instituteApiUrls.createUpdateMiscFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['miscFeesId'] = values.miscFeesId;
    postData['feesName'] = values.feesName;
    postData['totalAmount'] = values.totalAmount;
    postData['maxQuantity'] = values.maxQuantity;
    postData['confIds'] = values.confIds;
    postData['bankAccountId'] = values.bankAccountId;
    postData['displayStatus'] = values.displayStatus;

    return this.http.post<any>(url, postData);
  }

  deleteMiscFees(miscFeesId:number) : Observable<any> {

    const url = instituteApiUrls.deleteMiscFees;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['miscFeesId'] = miscFeesId;

    return this.http.post<any>(url, postData);
  }

  promoteStudents(values:any) : Observable<any> {

    const url = instituteApiUrls.promoteStudents;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['fromConfId'] = values.fromConfId;
    postData['fromAcademicYearId'] = values.fromAcademicYearId;
    postData['toConfId'] = values.toConfId;
    postData['toAcademicYearId'] = values.toAcademicYearId;
    postData['studentsData'] = values.studentsData;
    postData['instituteFeesIds'] = values.instituteFeesIds;

    return this.http.post<any>(url, postData);
  }

  getInvoiceDetails(values:any) : Observable<any> {

    const url = instituteApiUrls.getInvoiceDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['invoiceId'] = values.invoiceId;
    postData['studentId'] = values.studentId;
    
    return this.http.post<any>(url, postData);
  }

  updateInvoice(values:any) : Observable<any> {

    const url = instituteApiUrls.updateInvoice;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = Object.assign({}, commonPostValues, values);
 
    return this.http.post<any>(url, postData);
  }

  getRefundOnInvoices(selectedInvoices) : Observable<any> {

    const url = instituteApiUrls.getRefundOnInvoices;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['selectedInvoices'] = selectedInvoices;

    return this.http.post<any>(url, postData);
  }

  updateBulkInvoices(values:any) : Observable<any> {

    const url = instituteApiUrls.updateBulkInvoices;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['selectedInvoices'] = values.selectedInvoices;
    postData['updateType'] = values.updateType;
    postData['lateFeesIds'] = values.lateFeesIds;
    postData['dueDate'] = values.dueDate;
    postData['changeReason'] = values.changeReason;

    return this.http.post<any>(url, postData);
  }

  getLcApplications(page, dateRange, filter = '', selectedConfIds, clientSidePaging:boolean = false) : Observable<any> {
    
    const url = instituteApiUrls.getLcApplications;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, dateRange, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['confIds'] = selectedConfIds;
    postData['clientSidePaging'] = clientSidePaging;

    return this.http.post<any>(url, postData);
  }  

  submitLcApplications(formValues:any) : Observable<any> {
    
    const url = instituteApiUrls.getLcApplications;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['formValues'] = formValues;

    return this.http.post<any>(url, postData);
  }
  
  getLevelSubjectGroups(selectedLevels:any) : Observable<any> {
    
    const url = instituteApiUrls.getLevelSubjectGroups;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['selectedLevels'] = selectedLevels;

    return this.http.post<any>(url, postData);
  }

  getAtktFormDetails(atktFormId, atktApplicantId): Observable<any> {

    const url = instituteApiUrls.getAtktFormDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['atktFormId'] = atktFormId;
    postData['atktApplicantId'] = atktApplicantId;

    return this.http.post<any>(url, postData);
  }

  saveAtktFormDetails(postParam, categoryFormValues, personalInfo, addressInfo, subjectInfo, examMarksPatternSelected, educationInfo, passportSizePhoto, signatureImage, atktFormId): Observable<any> {
    
    const url = instituteApiUrls.saveAtktFormDetails;
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
    postData['atktFormId'] = atktFormId;

    return this.http.post<any>(url, postData);
  }  
}
