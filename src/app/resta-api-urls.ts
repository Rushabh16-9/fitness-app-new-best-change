import { environment } from 'environments/environment';

export class commonApiUrls {
  static getDeviceConfig:string = environment.API_ENDPOINT + 'Common/getDeviceConfig';
  static getAdmissionCategories:string = environment.API_ENDPOINT + 'Common/getAdmissionCategories';
  static getReligion:string = environment.API_ENDPOINT + 'Common/getReligion';
  static getCaste:string = environment.API_ENDPOINT + 'Common/getCaste';
  static login:string = environment.API_ENDPOINT + 'Common/login';
  static resetPassword:string = environment.API_ENDPOINT + 'Common/resetPassword';
  static authLogin:string = environment.API_ENDPOINT + 'Common/authLogin';
  static forgotPassword:string = environment.API_ENDPOINT + 'Common/forgotPassword';
  static forgotPasswordotp:string = environment.API_ENDPOINT + 'Common/forgotPasswordotp';
  static changePassword:string = environment.API_ENDPOINT + 'Common/changePassword';
  static changePasswordProfile:string = environment.API_ENDPOINT + 'Common/changePasswordProfile';
  static getUserInfo:string = environment.API_ENDPOINT + 'Common/getUserInfo';  
  static getAcademicYears:string = environment.API_ENDPOINT + 'Common/getAcademicYears';  
  static getAdmissionSubCategories:string = environment.API_ENDPOINT + 'Common/getAdmissionSubCategories';
  static getYearsList:string = environment.API_ENDPOINT + 'Common/getYearsList';   
  static getMotherTongue:string = environment.API_ENDPOINT + 'Common/getMotherTongue';     
  static uploadExcel:string = environment.API_ENDPOINT + 'Common/uploadExcel';     
  static updateProfile:string = environment.API_ENDPOINT + 'Common/updateProfile';
  static removeProfilePic:string = environment.API_ENDPOINT + 'Common/removeProfilePic';
  static getFromPincode:string = environment.API_ENDPOINT + 'Common/getFromPincode';
  static generateReceipts:string = environment.API_ENDPOINT + 'Common/generateReceipts';  
  static getLedgersDropDown:string = environment.API_ENDPOINT + 'Common/getLedgersDropDown';  
  static multiUserOnChange:string = environment.API_ENDPOINT + 'Common/multiUserOnChange';  
  static getAdmissionCategoriesForFilter:string = environment.API_ENDPOINT + 'Common/getAdmissionCategoriesForFilter';  
  static uploadFile:string = environment.API_ENDPOINT + 'Common/uploadFile';  
}

export class admissionApiUrls {
  static getListOfInstitutes:string = environment.API_ENDPOINT + 'Admission/getListOfInstitutes';
  static addToCart:string = environment.API_ENDPOINT + 'Admission/addToCart';
  static listCart:string = environment.API_ENDPOINT + 'Admission/listCart';
  static removeConf:string = environment.API_ENDPOINT + 'Admission/removeConf';
  static sendOtp:string = environment.API_ENDPOINT + 'Admission/sendOtp';
  static otpConfirmation:string = environment.API_ENDPOINT + 'Admission/otpConfirmation';
  static getAdmissionFormDetails:string = environment.API_ENDPOINT + 'Admission/getAdmissionFormDetails';
  static saveForm:string = environment.API_ENDPOINT + 'Admission/saveForm';
  static uploadImage:string = environment.API_ENDPOINT + 'Admission/uploadImage';
  static payFees:string = environment.API_ENDPOINT + 'Admission/payFees';
  static getPaymentHistory:string = environment.API_ENDPOINT + 'Admission/getPaymentHistory';  
  static downloadForms:string = environment.API_ENDPOINT + 'Admission/downloadForms';  
  static getPaymentStatus:string = environment.API_ENDPOINT + 'Admission/getPaymentStatus';  
  static identifierConfirmation:string = environment.API_ENDPOINT + 'Admission/identifierConfirmation';  
  static directFormGenerate:string = environment.API_ENDPOINT + 'Admission/directFormGenerate';  
  static allowLogin:string = environment.API_ENDPOINT + 'Admission/allowLogin';  
  static uploadDocImage:string = environment.API_ENDPOINT + 'Admission/uploadDocImage';  
  static uploadPdf:string = environment.API_ENDPOINT + 'Admission/uploadPdf';
  static getFilteredGraduationEducationInfo:string = environment.API_ENDPOINT + 'Admission/getFilteredGraduationEducationInfo';
  static getUploadedDocuments:string = environment.API_ENDPOINT + 'Admission/getUploadedDocuments';
  static saveUploadedDocuments:string = environment.API_ENDPOINT + 'Admission/saveUploadedDocuments';
  static generateForm:string = environment.API_ENDPOINT + 'Admission/generateForm';
  static getFormPolicyInfo:string = environment.API_ENDPOINT + 'Admission/getFormPolicyInfo';
  static updateSubjectGroup:string = environment.API_ENDPOINT + 'Admission/updateSubjectGroup';
  static getListOfKnowAbout:string = environment.API_ENDPOINT + 'Admission/getListOfKnowAbout';
  static getAdmissionFormBDetails:string = environment.API_ENDPOINT + 'Admission/getAdmissionFormBDetails';
  static getYearSemesterWiseDropdown:string = environment.API_ENDPOINT + 'Admission/getYearSemesterWiseDropdown';
  static getBranchingQuestionBifurcate:string = environment.API_ENDPOINT + 'Admission/getBranchingQuestionBifurcate';  
}

export class instituteApiUrls {
  static getList:string = environment.API_ENDPOINT + 'Institute/getList';
  static getInstituteDetails:string = environment.API_ENDPOINT + 'Institute/getInstituteDetails';
  static getLevels:string = environment.API_ENDPOINT + 'Institute/getLevels';  
  static getDashboardDetails:string = environment.API_ENDPOINT + 'Institute/getDashboardDetails';
  static getLatestFeesReceipts:string = environment.API_ENDPOINT + 'Institute/getLatestFeesReceipts';  
  static getLatestAdmissionReceipts:string = environment.API_ENDPOINT + 'Institute/getLatestAdmissionReceipts';  
  static getAdmissionForms:string = environment.API_ENDPOINT + 'Institute/getAdmissionForms';  
  static getAdmissionFormsExcel:string = environment.API_ENDPOINT + 'Institute/getAdmissionFormsExcel';
  static getAdmissionEducationDetailsExcel:string = environment.API_ENDPOINT + 'Institute/getAdmissionEducationDetailsExcel';
  static getAllFees:string = environment.API_ENDPOINT + 'Institute/getAllFees';  
  static getLedgers:string = environment.API_ENDPOINT + 'Institute/getLedgers';  
  static getStudentsOnLevelsSelection:string = environment.API_ENDPOINT + 'Institute/getStudentsOnLevelsSelection';
  static createFees:string = environment.API_ENDPOINT + 'Institute/createFees';
  static assignDeassignStudents:string = environment.API_ENDPOINT + 'Institute/assignDeassignStudents';
  static getAllStudents:string = environment.API_ENDPOINT + 'Institute/getAllStudents';
  static getAllCourses:string = environment.API_ENDPOINT + 'Institute/getAllCourses';
  static createStudent:string = environment.API_ENDPOINT + 'Institute/createStudent';
  static feesDetails:string = environment.API_ENDPOINT + 'Institute/feesDetails';
  static studentFeesSubmit:string = environment.API_ENDPOINT + 'Institute/studentFeesSubmit';
  static getMeritList:string = environment.API_ENDPOINT + 'Institute/getMeritList';
  static createMeritList:string = environment.API_ENDPOINT + 'Institute/createMeritList';
  static getCourseFeesList:string = environment.API_ENDPOINT + 'Institute/getCourseFeesList';
  static getAllAdmissionCourses:string = environment.API_ENDPOINT + 'Institute/getAllAdmissionCourses';
  static assignAdmissionFees:string = environment.API_ENDPOINT + 'Institute/assignAdmissionFees';
  static getAllAssignedStudents:string = environment.API_ENDPOINT + 'Institute/getAllAssignedStudents';
  static getStudentFeesDetails:string = environment.API_ENDPOINT + 'Institute/getStudentFeesDetails';
  static getAllInvoices:string = environment.API_ENDPOINT + 'Institute/getAllInvoices';
  static sendSMStoAssignedStudent:string = environment.API_ENDPOINT + 'Institute/sendSMStoAssignedStudent';
  static getAllAssignedStudentsExcel:string = environment.API_ENDPOINT + 'Institute/getAllAssignedStudentsExcel';
  static getAdmissionFormsDetails:string = environment.API_ENDPOINT + 'Institute/getAdmissionFormsDetails';
  static getAdmissionFormsBDetails:string = environment.API_ENDPOINT + 'Institute/getAdmissionFormsBDetails';
  static saveAdmissionForm:string = environment.API_ENDPOINT + 'Institute/saveAdmissionForm';
  static getIdentifierDetails:string = environment.API_ENDPOINT + 'Institute/getIdentifierDetails';  
  static getLatestFeesReceiptsExcel:string = environment.API_ENDPOINT + 'Institute/getLatestFeesReceiptsExcel';  
  static getLatestAdmissionReceiptsExcel:string = environment.API_ENDPOINT + 'Institute/getLatestAdmissionReceiptsExcel';  
  static getAllStudentsList:string = environment.API_ENDPOINT + 'Institute/getAllStudentsList';  
  static getFeesList:string = environment.API_ENDPOINT + 'Institute/getFeesList';  
  static getFeesParticularsFromFees:string = environment.API_ENDPOINT + 'Institute/getFeesParticularsFromFees';  
  static createInvoice:string = environment.API_ENDPOINT + 'Institute/createInvoice';  
  static cancelInvoice:string = environment.API_ENDPOINT + 'Institute/cancelInvoice';  
  static cancelReassignAdmission:string = environment.API_ENDPOINT + 'Institute/cancelReassignAdmission';  
  static updateFeesStructure:string = environment.API_ENDPOINT + 'Institute/updateFeesStructure';  
  static deleteFeesStructure:string = environment.API_ENDPOINT + 'Institute/deleteFeesStructure';  
  static deleteInstituteCourseFees:string = environment.API_ENDPOINT + 'Institute/deleteInstituteCourseFees';  
  static getAllStudentsListExcel:string = environment.API_ENDPOINT + 'Institute/getAllStudentsListExcel';  
  static getAllStudentsListPhotos:string = environment.API_ENDPOINT + 'Institute/getAllStudentsListPhotos';
  static getAllStudentsExcel:string = environment.API_ENDPOINT + 'Institute/getAllStudentsExcel';
  static checkMobileExist:string = environment.API_ENDPOINT + 'Institute/checkMobileExist';
  static getStudentInfoEdit:string = environment.API_ENDPOINT + 'Institute/getStudentInfoEdit';
  static updateStudent:string = environment.API_ENDPOINT + 'Institute/updateStudent';
  static feesCollectionReport:string = environment.API_ENDPOINT + 'Institute/feesCollectionReport';
  static feesCollectionReportCourse:string = environment.API_ENDPOINT + 'Institute/feesCollectionReportCourse';
  static feesCollectionReportCourseExcel:string = environment.API_ENDPOINT + 'Institute/feesCollectionReportCourseExcel';
  static feesCollectionReportAdmission:string = environment.API_ENDPOINT + 'Institute/feesCollectionReportAdmission';
  static feesCollectionReportAdmissionExcel:string = environment.API_ENDPOINT + 'Institute/feesCollectionReportAdmissionExcel';
  static institutePayoutReportCourse:string = environment.API_ENDPOINT + 'Institute/institutePayoutReportCourse';
  static institutePayoutReportCourseExcel:string = environment.API_ENDPOINT + 'Institute/institutePayoutReportCourseExcel';
  static institutePayoutReportAdmission:string = environment.API_ENDPOINT + 'Institute/institutePayoutReportAdmission';
  static institutePayoutReportAdmissionExcel:string = environment.API_ENDPOINT + 'Institute/institutePayoutReportAdmissionExcel';
  static getFeesSummary:string = environment.API_ENDPOINT + 'Institute/getFeesSummary';
  static getAllInvoicesExcel:string = environment.API_ENDPOINT + 'Institute/getAllInvoicesExcel';
  static getFeesTemplates:string = environment.API_ENDPOINT + 'Institute/getFeesTemplates';
  static getLateFeesRules:string = environment.API_ENDPOINT + 'Institute/getLateFeesRules';
  static insertUpdateLateFeesRules:string = environment.API_ENDPOINT + 'Institute/insertUpdateLateFeesRules';
  static deleteLateFeesRule:string = environment.API_ENDPOINT + 'Institute/deleteLateFeesRule';
  static getAtktForms:string = environment.API_ENDPOINT + 'Institute/getAtktForms';
  static getAtktFormsExcel:string = environment.API_ENDPOINT + 'Institute/getAtktFormsExcel';
  static deleteStudent:string = environment.API_ENDPOINT + 'Institute/deleteStudent';
  static createLogin:string = environment.API_ENDPOINT + 'Institute/createLogin';
  static updateLogin:string = environment.API_ENDPOINT + 'Institute/updateLogin';
  static deleteLogin:string = environment.API_ENDPOINT + 'Institute/deleteLogin';

  static getTemplates:string = environment.API_ENDPOINT + 'Institute/getTemplates';
  static getFieldNames:string = environment.API_ENDPOINT + 'Institute/getFieldNames';
  static insertUpdateTemplate:string = environment.API_ENDPOINT + 'Institute/insertUpdateTemplate';
  static deleteTemplate:string = environment.API_ENDPOINT + 'Institute/deleteTemplate';

  static creditMessage:string = environment.API_ENDPOINT + 'Institute/creditMessage';
  static messagesDashboard:string = environment.API_ENDPOINT + 'Institute/messagesDashboard';
  static ledgerPaidDueReport:string = environment.API_ENDPOINT + 'Institute/ledgerPaidDueReport';
  static ledgerPaidDueReportExcel:string = environment.API_ENDPOINT + 'Institute/ledgerPaidDueReportExcel';
  static ledgerStatement:string = environment.API_ENDPOINT + 'Institute/ledgerStatement';
  static ledgerStatementExcel:string = environment.API_ENDPOINT + 'Institute/ledgerStatementExcel';

  static getListOfMiscFees:string = environment.API_ENDPOINT + 'Institute/getListOfMiscFees';  
  static createUpdateMiscFees:string = environment.API_ENDPOINT + 'Institute/createUpdateMiscFees';  
  static deleteMiscFees:string = environment.API_ENDPOINT + 'Institute/deleteMiscFees';
  
  static promoteStudents:string = environment.API_ENDPOINT + 'Institute/promoteStudents';
  
  static getInvoiceDetails:string = environment.API_ENDPOINT + 'Institute/getInvoiceDetails';
  static updateInvoice:string = environment.API_ENDPOINT + 'Institute/updateInvoice';
  static getRefundOnInvoices:string = environment.API_ENDPOINT + 'Institute/getRefundOnInvoices';
  static updateBulkInvoices:string = environment.API_ENDPOINT + 'Institute/updateBulkInvoices';
  
  static getLcApplications:string = environment.API_ENDPOINT + 'Institute/getLcApplications';
  static submitLcApplications:string = environment.API_ENDPOINT + 'Institute/submitLcApplications';
  static getStudentsLedgerReportExcel:string = environment.API_ENDPOINT + 'Institute/getStudentsLedgerReportExcel';
  
  static getLevelSubjectGroups:string = environment.API_ENDPOINT + 'Institute/getLevelSubjectGroups';

  static getAtktFormDetails:string = environment.API_ENDPOINT + 'Institute/getAtktFormDetails';  
  static saveAtktFormDetails:string = environment.API_ENDPOINT + 'Institute/saveAtktFormDetails';  
  
  static getAllInstituteLevelConfsEnquiry:string = environment.API_ENDPOINT + 'Institute/getAllInstituteLevelConfsEnquiry';  
}

export class studentApiUrls {
  static sendRegistrationOtp:string = environment.API_ENDPOINT + 'Student/sendRegistrationOtp';
  static confirmRegistrationOtp:string = environment.API_ENDPOINT + 'Student/confirmRegistrationOtp';
  static setUser:string = environment.API_ENDPOINT + 'Student/setUser';
  static submitSelection:string = environment.API_ENDPOINT + 'Student/submitSelection';
  static saveNewStudent:string = environment.API_ENDPOINT + 'Student/saveNewStudent';
  static feesSummary:string = environment.API_ENDPOINT + 'Student/feesSummary';
  static feesDetails:string = environment.API_ENDPOINT + 'Student/feesDetails';
  static getStudentInfo:string = environment.API_ENDPOINT + 'Student/getStudentInfo';
  static removeSelection:string = environment.API_ENDPOINT + 'Student/removeSelection';
  static confirmSelection:string = environment.API_ENDPOINT + 'Student/confirmSelection';
  static feesSubmit:string = environment.API_ENDPOINT + 'Student/feesSubmit';
  static getPaymentHistory:string = environment.API_ENDPOINT + 'Student/getPaymentHistory';
  static getOpenCart:string = environment.API_ENDPOINT + 'Student/getOpenCart';
  static insertLeadData:string = environment.API_ENDPOINT + 'Student/insertLeadData';    

}

export class paymentApiUrls {
  static getPaymentStatus:string = environment.API_ENDPOINT + 'Student/getPaymentStatus';
  static getReceiptUrl:string = environment.API_ENDPOINT + 'Student/getReceiptUrl';
}

export class excelApiUrls {
  static getStudentBulkExcelTemplate:string = environment.API_ENDPOINT + 'Excel/getStudentBulkExcelTemplate';
  static uploadStudentsBulkExcel:string = environment.API_ENDPOINT + 'Excel/uploadStudentsBulkExcel';
}

export class instituteMasterApiUrls {
  static instituteProfile:string = environment.API_ENDPOINT + 'InstituteMaster/instituteProfile';
  static instituteProfileUpdate:string = environment.API_ENDPOINT + 'InstituteMaster/instituteProfileUpdate';
  static getListOfHolidays:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfHolidays';
  static insertUpdateHolidays:string = environment.API_ENDPOINT + 'InstituteMaster/insertUpdateHolidays';
  static deleteHolidays:string = environment.API_ENDPOINT + 'InstituteMaster/deleteHolidays';
  static getListOfDesignations:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfDesignations';
  static insertUpdateDesignations:string = environment.API_ENDPOINT + 'InstituteMaster/insertUpdateDesignations';
  static deleteDesignation:string = environment.API_ENDPOINT + 'InstituteMaster/deleteDesignation';
  static getListOfDepartments:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfDepartments';
  static insertUpdateDepartments:string = environment.API_ENDPOINT + 'InstituteMaster/insertUpdateDepartments';
  static deleteDepartment:string = environment.API_ENDPOINT + 'InstituteMaster/deleteDepartment';
  static getListOfWeeklyOff:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfWeeklyOff';
  static insertUpdateWeeklyOff:string = environment.API_ENDPOINT + 'InstituteMaster/insertUpdateWeeklyOff';
  static deleteWeeklyOffRule:string = environment.API_ENDPOINT + 'InstituteMaster/deleteWeeklyOffRule';
  static getListOfUserTypes:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfUserTypes';
  static insertUpdateUserTypes:string = environment.API_ENDPOINT + 'InstituteMaster/insertUpdateUserTypes';
  static deleteUserType:string = environment.API_ENDPOINT + 'InstituteMaster/deleteUserType';
  static setPayPeriod:string = environment.API_ENDPOINT + 'InstituteMaster/setPayPeriod';
  static getListOfLeaveTypes:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfLeaveTypes';
  static insertUpdateLeaveTypes:string = environment.API_ENDPOINT + 'InstituteMaster/insertUpdateLeaveTypes';
  static deleteLeaveType:string = environment.API_ENDPOINT + 'InstituteMaster/deleteLeaveType';
  static getListOfShifts:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfShifts';
  static insertUpdateShifts:string = environment.API_ENDPOINT + 'InstituteMaster/insertUpdateShifts';
  static deleteShift:string = environment.API_ENDPOINT + 'InstituteMaster/deleteShift';
  static getAccessControl:string = environment.API_ENDPOINT + 'InstituteMaster/getAccessControl';
  static setAccessControl:string = environment.API_ENDPOINT + 'InstituteMaster/setAccessControl';
  static getListOfBankAccounts:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfBankAccounts';
  static insertUpdateBankAccount:string = environment.API_ENDPOINT + 'InstituteMaster/insertUpdateBankAccount';
  static deleteBankAccount:string = environment.API_ENDPOINT + 'InstituteMaster/deleteBankAccount';  
  static setDefaultBankAccount:string = environment.API_ENDPOINT + 'InstituteMaster/setDefaultBankAccount';
  static getAllFacultyUsers:string = environment.API_ENDPOINT + 'InstituteMaster/getAllFacultyUsers';
  static getListOfInstituteCourses:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfInstituteCourses';
  static getLevelConfiguration:string = environment.API_ENDPOINT + 'InstituteMaster/getLevelConfiguration';
  static insertUpdateCourseDetails:string = environment.API_ENDPOINT + 'InstituteMaster/insertUpdateCourseDetails';
  static deleteCourse:string = environment.API_ENDPOINT + 'InstituteMaster/deleteCourse';
  static listExamTerms:string = environment.API_ENDPOINT + 'InstituteMaster/listExamTerms';
  static createUpdateTermExam:string = environment.API_ENDPOINT + 'InstituteMaster/createUpdateTermExam';
  static deleteExamTerm:string = environment.API_ENDPOINT + 'InstituteMaster/deleteExamTerm';
  static getAllSubjects:string = environment.API_ENDPOINT + 'InstituteMaster/getAllSubjects';
  static getExamTypes:string = environment.API_ENDPOINT + 'InstituteMaster/getExamTypes';
  static getListOfSubjectGroups:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfSubjectGroups';
  static createUpdateSubjectGroup:string = environment.API_ENDPOINT + 'InstituteMaster/createUpdateSubjectGroup';
  static deleteSubjectGroup:string = environment.API_ENDPOINT + 'InstituteMaster/deleteSubjectGroup';
  static getListOfSubjectLangGroups:string = environment.API_ENDPOINT + 'InstituteMaster/getListOfSubjectLangGroups';
  static createUpdateSubjectLangGroup:string = environment.API_ENDPOINT + 'InstituteMaster/createUpdateSubjectLangGroup';
  static deleteSubjectLangGroup:string = environment.API_ENDPOINT + 'InstituteMaster/deleteSubjectLangGroup';
}

export class attendanceApiUrls {
  static getExistingSchedule:string = environment.API_ENDPOINT + 'Attendance/getExistingSchedule';
  static saveSchedule:string = environment.API_ENDPOINT + 'Attendance/saveSchedule';
  static getAllSchedules:string = environment.API_ENDPOINT + 'Attendance/getAllSchedules';
  static deleteSchedule:string = environment.API_ENDPOINT + 'Attendance/deleteSchedule';
  static getAllLectures:string = environment.API_ENDPOINT + 'Attendance/getAllLectures';
  static cancelLecture:string = environment.API_ENDPOINT + 'Attendance/cancelLecture';
  static getLectureStudents:string = environment.API_ENDPOINT + 'Attendance/getLectureStudents';
  static markAttendance:string = environment.API_ENDPOINT + 'Attendance/markAttendance';
  static getAttdDashboard:string = environment.API_ENDPOINT + 'Attendance/getAttdDashboard';  
  static getDailyAttdReport:string = environment.API_ENDPOINT + 'Attendance/getDailyAttdReport';
  static getDailyAttdReportExcel:string = environment.API_ENDPOINT + 'Attendance/getDailyAttdReportExcel';  
  static getDaywiseLectureAttd:string = environment.API_ENDPOINT + 'Attendance/getDaywiseLectureAttd';
  static getDaywiseLectureAttdExcel:string = environment.API_ENDPOINT + 'Attendance/getDaywiseLectureAttdExcel';
}

export class pdfApiUrls {
  static getReport:string = environment.API_ENDPOINT + 'Pdf/getReport';
}

export class atktApiUrls {
  static sendOtp:string = environment.API_ENDPOINT + 'Atkt/sendOtp';
  static otpConfirmation:string = environment.API_ENDPOINT + 'Atkt/otpConfirmation';
  static getUserStudentsList:string = environment.API_ENDPOINT + 'Atkt/getUserStudentsList';
  static getStudentsCourses:string = environment.API_ENDPOINT + 'Atkt/getStudentsCourses';
  static getCourseExams:string = environment.API_ENDPOINT + 'Atkt/getCourseExams';
  static getFormDetails:string = environment.API_ENDPOINT + 'Atkt/getFormDetails';
  static saveFormDetails:string = environment.API_ENDPOINT + 'Atkt/saveFormDetails';
  static listCart:string = environment.API_ENDPOINT + 'Atkt/listCart';
  static removeSubject:string = environment.API_ENDPOINT + 'Atkt/removeSubject';
  static payFees:string = environment.API_ENDPOINT + 'Atkt/payFees';
  static getAtktForms:string = environment.API_ENDPOINT + 'Atkt/getAtktForms';
  static getPaymentHistory:string = environment.API_ENDPOINT + 'Atkt/getPaymentHistory';
  static getUploadedDocuments:string = environment.API_ENDPOINT + 'Atkt/getUploadedDocuments';  
  static uploadDocImage:string = environment.API_ENDPOINT + 'Atkt/uploadDocImage';  
  static uploadPdf:string = environment.API_ENDPOINT + 'Atkt/uploadPdf';  
  static directFormGenerate:string = environment.API_ENDPOINT + 'Atkt/directFormGenerate';  
}

export class adminApiUrls {
  static getDashboard:string = environment.API_ENDPOINT + 'Admin/getDashboard';
  static getPayoutData:string = environment.API_ENDPOINT + 'Admin/getPayoutData';  
  static transactionDetails:string = environment.API_ENDPOINT + 'Admin/transactionDetails';  
  static getPayoutSettlmentData:string = environment.API_ENDPOINT + 'Admin/getPayoutSettlmentData';
  static getPayoutTransactions:string = environment.API_ENDPOINT + 'Admin/getPayoutTransactions';
  static getListOfBankAccounts:string = environment.API_ENDPOINT + 'Admin/getListOfBankAccounts';
  static approveRejectBankAccount:string = environment.API_ENDPOINT + 'Admin/approveRejectBankAccount';
  static getAllActions:string = environment.API_ENDPOINT + 'Admin/getAllActions';
  static approveRejectAction:string = environment.API_ENDPOINT + 'Admin/approveRejectAction';
  static getProfitabilityReport:string = environment.API_ENDPOINT + 'Admin/getProfitabilityReport';
  static getProfitabilityReportExcel:string = environment.API_ENDPOINT + 'Admin/getProfitabilityReportExcel';
}

export class settlementApiUrls {
  static getAllPg:string = environment.API_ENDPOINT + 'Settlement/getAllPg';
  static uploadPgSettlement:string = environment.API_ENDPOINT + 'Settlement/uploadPgSettlement';
  static getUploadedPgSettlements:string = environment.API_ENDPOINT + 'Settlement/getUploadedPgSettlements';
  static getAllSettlementData:string = environment.API_ENDPOINT + 'Settlement/getAllSettlementData';
  static processSelectedSettlements:string = environment.API_ENDPOINT + 'Settlement/processSelectedSettlements';
  static utrConfirmation:string = environment.API_ENDPOINT + 'Settlement/utrConfirmation';
  static getSettlemetTransactions:string = environment.API_ENDPOINT + 'Settlement/getSettlemetTransactions';
}

export class thirdPartyApiUrls {
  static getOpenCart:string = environment.API_ENDPOINT + 'ThirdParty/getOpenCart';
  static feesSubmit:string = environment.API_ENDPOINT + 'ThirdParty/feesSubmit';
}

export class interviewSlotsApiUrls {
  static getScheduleSlots:string = environment.API_ENDPOINT + 'InterviewSlots/getScheduleSlots';
  static bookSlot:string = environment.API_ENDPOINT + 'InterviewSlots/bookSlot';
}
