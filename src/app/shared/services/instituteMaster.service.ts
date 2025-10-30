import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { instituteMasterApiUrls } from 'app/resta-api-urls';
import * as globalFunctions from 'app/global/globalFunctions';

@Injectable()
export class InstituteMasterService {

  constructor(
    private http: HttpClient
  ) {}

  getInstituteProfile() : Observable<any> {

    const url = instituteMasterApiUrls.instituteProfile;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  instituteProfileUpdate(values, instituteLogo) : Observable<any> {

    const url = instituteMasterApiUrls.instituteProfileUpdate;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteName'] = values.instituteName;
    postData['shortName'] = values.shortName;
    postData['contactPerson'] = values.contactPerson;
    postData['mobileNo'] = values.mobileNo;
    postData['telephone'] = values.telephone;
    postData['websiteLink'] = values.websiteLink;
    postData['email'] = values.email;
    postData['address'] = values.address;
    postData['instituteLogo'] = instituteLogo;

    return this.http.post<any>(url, postData);
  }

  getListOfDepartments(page, filter = '') : Observable<any> {

    const url = instituteMasterApiUrls.getListOfDepartments;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  insertUpdateDepartments(values) : Observable<any> {

    const url = instituteMasterApiUrls.insertUpdateDepartments;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['departmentId'] = values.departmentId;
    postData['departmentName'] = values.departmentName;

    return this.http.post<any>(url, postData);
  }

  deleteDepartment(departmentId) : Observable<any> {

    const url = instituteMasterApiUrls.deleteDepartment;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['departmentId'] = departmentId;

    return this.http.post<any>(url, postData);
  }

  getListOfDesignations(page, filter = '') : Observable<any> {

    const url = instituteMasterApiUrls.getListOfDesignations;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  insertUpdateDesignations(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.insertUpdateDesignations;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['designationId'] = values.designationId;
    postData['designation'] = values.designationName;
    postData['designationShort'] = values.shortName;

    return this.http.post<any>(url, postData);
  }

  deleteDesignation(designationId) : Observable<any> {

    const url = instituteMasterApiUrls.deleteDesignation;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['designationId'] = designationId;

    return this.http.post<any>(url, postData);
  }

  setPayPeriod(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.setPayPeriod;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['payrollCycleStartDay'] = values.payrollCycleStartDay;
    postData['payrollCycleEndDay'] = values.payrollCycleEndDay;
    postData['payrollPaymentProcessingDay'] = values.processingDay;
    postData['payrollFinancialMonthStart'] = values.financialMonthStart;
    postData['payrollFinancialMonthEnd'] = values.financialMonthEnd;
    postData['payrollLongHolidayLeave'] = values.longHolidayLeave;

    return this.http.post<any>(url, postData);
  }  

  getListOfWeeklyOff(page, filter = '') : Observable<any> {

    const url = instituteMasterApiUrls.getListOfWeeklyOff;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  insertUpdateWeeklyOff(values, weekOffRule) : Observable<any> {

    const url = instituteMasterApiUrls.insertUpdateWeeklyOff;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['weekOffRuleId'] = values.weekOffRuleId;
    postData['weekOffRuleTitle'] = values.weekOffRuleTitle;
    postData['weekStartDay'] = values.weekStartDay;
    postData['weekEndDay'] = values.weekEndDay;
    postData['halfdayAllowed'] = values.halfdayAllowed;
    postData['halfdayValue'] = values.halfdayValue;
    postData['halfdayHours'] = values.halfdayHours;
    postData['weekOffRule'] = weekOffRule;

    return this.http.post<any>(url, postData);
  }

  deleteWeeklyOffRule(weekOffRuleId) : Observable<any> {

    const url = instituteMasterApiUrls.deleteWeeklyOffRule;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['weekOffRuleId'] = weekOffRuleId;

    return this.http.post<any>(url, postData);
  }

  getListOfUserTypes(page, filter = '', skipAdmin = false) : Observable<any> {

    const url = instituteMasterApiUrls.getListOfUserTypes;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['skipAdmin'] = skipAdmin;

    return this.http.post<any>(url, postData);
  }

  insertUpdateUserTypes(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.insertUpdateUserTypes;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteUserTypeId'] = values.instituteUserTypeId;
    postData['userType'] = values.userType;

    return this.http.post<any>(url, postData);
  }

  deleteUserType(instituteUserTypeId) : Observable<any> {

    const url = instituteMasterApiUrls.deleteUserType;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteUserTypeId'] = instituteUserTypeId;

    return this.http.post<any>(url, postData);
  }

  getListOfHolidays(page, filter = '') : Observable<any> {

    const url = instituteMasterApiUrls.getListOfHolidays;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  insertUpdateHolidays(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.insertUpdateHolidays;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['holidayId'] = values.holidayId;
    postData['holidayName'] = values.holidayName;
    postData['holidayDate'] = values.holidayDate;

    return this.http.post<any>(url, postData);
  }

  deleteHolidays(holidayId) : Observable<any> {

    const url = instituteMasterApiUrls.deleteHolidays;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['holidayId'] = holidayId;

    return this.http.post<any>(url, postData);
  }

  getListOfLeaveTypes(page, filter = '') : Observable<any> {

    const url = instituteMasterApiUrls.getListOfLeaveTypes;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  insertUpdateLeaveTypes(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.insertUpdateLeaveTypes;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['leaveTypeId'] = values.leaveTypeId;
    postData['leaveType'] = values.leaveType;
    postData['leaveTypeShort'] = values.leaveTypeShort;
    postData['leaveApplicable'] = values.leaveApplicable;
    postData['leaveProcessing'] = values.leaveProcessing;
    postData['leaveLaps'] = values.leaveLaps;

    return this.http.post<any>(url, postData);
  }

  deleteLeaveType(leaveTypeId) : Observable<any> {

    const url = instituteMasterApiUrls.deleteLeaveType;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['leaveTypeId'] = leaveTypeId;

    return this.http.post<any>(url, postData);
  }
  
  getListOfShifts(page, filter = '') : Observable<any> {

    const url = instituteMasterApiUrls.getListOfShifts;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);

    return this.http.post<any>(url, postData);
  }

  insertUpdateShifts(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.insertUpdateShifts;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['shiftId'] = values.shiftId;
    postData['shiftName'] = values.shiftName;
    postData['shiftStartTime'] = values.shiftStartTime;
    postData['shiftEndTime'] = values.shiftEndTime;
    postData['extraBufferMinutes'] = values.extraBufferMinutes;
    postData['minimumLoginHoursDay'] = values.minimumLoginHoursDay;
    postData['bufferType'] = values.bufferType;
    postData['bufferInHours'] = values.bufferInHours;

    return this.http.post<any>(url, postData);
  }

  deleteShift(shiftId) : Observable<any> {

    const url = instituteMasterApiUrls.deleteShift;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['shiftId'] = shiftId;

    return this.http.post<any>(url, postData);
  }

  getAccessControl(instituteUserTypeId) : Observable<any> {

    const url = instituteMasterApiUrls.getAccessControl;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteUserTypeId'] = instituteUserTypeId;

    return this.http.post<any>(url, postData);
  }

  setAccessControl(instituteUserTypeId, accessControl) : Observable<any> {

    const url = instituteMasterApiUrls.setAccessControl;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteUserTypeId'] = instituteUserTypeId;
    postData['accessControl'] = accessControl;

    return this.http.post<any>(url, postData);
  }

  getListOfBankAccounts(instituteId = '', approvalStatus = 0, page = {}, filter = '') : Observable<any> {

    const url = instituteMasterApiUrls.getListOfBankAccounts;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['instituteId'] = instituteId;
    postData['approvalStatus'] = approvalStatus;

    return this.http.post<any>(url, postData);
  }

  insertUpdateBankAccount(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.insertUpdateBankAccount;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['bankAccountId'] = values.bankAccountId;
    postData['accountNo'] = values.accountNo;
    postData['accountType'] = values.accountType;
    postData['title'] = values.title;
    postData['ifsc'] = values.ifsc;
    postData['micr'] = values.micr;
    postData['emailIds'] = values.emailIds;
    postData['beneficiary'] = values.beneficiary;
    postData['bankName'] = values.bankName;

    return this.http.post<any>(url, postData);
  }

  deleteBankAccount(bankAccountId, instituteId) : Observable<any> {

    const url = instituteMasterApiUrls.deleteBankAccount;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;
    postData['bankAccountId'] = bankAccountId;

    return this.http.post<any>(url, postData);
  }
  
  setDefaultBankAccount(bankAccountId, instituteId) : Observable<any> {

    const url = instituteMasterApiUrls.setDefaultBankAccount;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;
    postData['bankAccountId'] = bankAccountId;

    return this.http.post<any>(url, postData);
  }
  
  getAllFacultyUsers(instituteId = '', page = {}, filter = '') : Observable<any> {

    const url = instituteMasterApiUrls.getAllFacultyUsers;
    let commonPostValues = globalFunctions.getCommonPostValues();
    let searchPostValues = globalFunctions.getSearchPostValues(page, {}, filter);

    let postData = Object.assign({}, commonPostValues, searchPostValues);
    postData['instituteId'] = instituteId;

    return this.http.post<any>(url, postData);
  }

  deleteEmployee(instituteUserId, instituteId) : Observable<any> {

    const url = instituteMasterApiUrls.deleteBankAccount;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;
    postData['instituteUserId'] = instituteUserId;

    return this.http.post<any>(url, postData);
  } 

  getListOfInstituteCourses(instituteId) : Observable<any> {

    const url = instituteMasterApiUrls.getListOfInstituteCourses;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;

    return this.http.post<any>(url, postData);
  }

  getLevelConfiguration(instituteId, confId) : Observable<any> {

    const url = instituteMasterApiUrls.getLevelConfiguration;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = instituteId;
    postData['confId'] = confId;

    return this.http.post<any>(url, postData);
  }

  insertUpdateCourseDetails(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.insertUpdateCourseDetails;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['userSelectedLevels'] = values.userSelectedLevels;
    postData['confId'] = values.confId;
    postData['bankAccountId'] = values.bankAccountId;
    postData['courseTitle'] = values.courseTitle;
    postData['shortName'] = values.shortName;
    postData['printName'] = values.printName;
    postData['admissionFormFees'] = values.admissionFormFees;
    postData['convinienceAmount'] = values.convinienceAmount;
    postData['parentConfIds'] = values.parentConfIds;

    return this.http.post<any>(url, postData);
  }

  deleteCourse(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.deleteCourse;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['confId'] = values.confId;

    return this.http.post<any>(url, postData);
  }

  listExamTerms(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.listExamTerms;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['confId'] = values.confId;
    postData['clientSidePaging'] = values.clientSidePaging;

    return this.http.post<any>(url, postData);
  }

  createUpdateTermExam(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.createUpdateTermExam;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['confId'] = values.confId;
    postData['termExamId'] = values.termExamId;
    postData['termExam'] = values.termExam;

    return this.http.post<any>(url, postData);
  }

  deleteExamTerm(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.deleteExamTerm;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;
    postData['confId'] = values.confId;
    postData['termExamId'] = values.termExamId;

    return this.http.post<any>(url, postData);
  }

  getAllSubjects() : Observable<any> {

    const url = instituteMasterApiUrls.getAllSubjects;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getExamTypes() : Observable<any> {

    const url = instituteMasterApiUrls.getExamTypes;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;

    return this.http.post<any>(url, postData);
  }

  getListOfSubjectGroups(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.getListOfSubjectGroups;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;    
    postData['confId'] = values.confId;

    return this.http.post<any>(url, postData);
  }

  createUpdateSubjectGroup(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.createUpdateSubjectGroup;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;    
    postData['confId'] = values.confId;
    postData['subjectGroupId'] = values.subjectGroupId;
    postData['subjectGroupName'] = values.subjectGroupName;
    postData['langGroupIds'] = values.langGroupIds;
    postData['subjectList'] = values.subjectList;

    return this.http.post<any>(url, postData);
  }

  deleteSubjectGroup(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.deleteSubjectGroup;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;    
    postData['subjectGroupId'] = values.subjectGroupId;

    return this.http.post<any>(url, postData);
  }
  
  getListOfSubjectLangGroups(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.getListOfSubjectLangGroups;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;    
    postData['confId'] = values.confId;

    return this.http.post<any>(url, postData);
  }

  createUpdateSubjectLangGroup(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.createUpdateSubjectLangGroup;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;    
    postData['confId'] = values.confId;
    postData['langGroupId'] = values.langGroupId;
    postData['langGroupName'] = values.langGroupName;
    postData['subjectList'] = values.subjectList;

    return this.http.post<any>(url, postData);
  }

  deleteSubjectLangGroup(values:any) : Observable<any> {

    const url = instituteMasterApiUrls.deleteSubjectLangGroup;
    let commonPostValues = globalFunctions.getCommonPostValues();

    let postData = commonPostValues;
    postData['instituteId'] = values.instituteId;    
    postData['langGroupId'] = values.langGroupId;

    return this.http.post<any>(url, postData);
  }
}
