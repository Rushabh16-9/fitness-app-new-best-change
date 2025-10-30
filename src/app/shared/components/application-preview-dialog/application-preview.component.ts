import { Component, ViewEncapsulation, ViewChild, ElementRef, Input, OnInit,Inject } from '@angular/core';
import { HttpResponse, HttpEventType } from '@angular/common/http';

import { Router } from '@angular/router';
import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, UntypedFormBuilder, Validators , FormGroup} from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { SharedCourseSelectionComponent } from 'app/shared/components/shared-course-selection/shared-course-selection.component';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { DatePipe } from '@angular/common';
import { MatStepper } from '@angular/material/stepper';
import { MatDatepicker } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { CommonService } from 'app-shared-services/common.service';
import { AdmissionService } from 'app-shared-services/admission.service';
import { InstitutesService } from 'app-shared-services/institutes.service';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { ConfirmDialogComponent } from 'app-shared-components/confirm-dialog/confirm-dialog.component';
import { InfoDialogComponent } from 'app-shared-components/info-dialog/info-dialog.component';
//import { ApplicationPreviewDialogComponent } from 'app-shared-components/application-preview-dialog/application-preview.component';

import { ImageCropperDialogComponent } from 'app-shared-components/image-cropper-dialog/image-cropper-dialog.component';
import { MatLegacyDialog as MatDialog,MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import * as _moment from 'moment';
const moment = _moment;

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';
import * as regexValidators from 'app/global/validator';
import { emailValidator } from 'app/global/app-validators';

import { AllEventEmitters } from 'app/global/all-event-emitters';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'preview-dialog',
  templateUrl: 'application-preview.component.html',
  styleUrls: ['application-preview.component.css'],
  providers: [
    SnackBarMsgComponent,
    AmazingTimePickerService,
    AdmissionService, 
    CommonService, 
    InstitutesService,
    DatePipe,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},    
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}          
  ],
  encapsulation: ViewEncapsulation.None
})
export class ApplicationPreviewDialogComponent implements OnInit {


  @ViewChild('courseSelectionComponent') courseSelectionComponent:SharedCourseSelectionComponent;
  // @ViewChild('child') child:SharedCourseSelectionComponent;

  //@Input('panelMode') panelMode;
  //@Input('formDetails') formDetails;
  //@Input('sharedDialogRef') sharedDialogRef;
  panelMode = 'admission';
  formDetails:any = {};
 
  modalTitle = "Preview";

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('dobElementToFocus') _input: ElementRef;
  @ViewChild('dobAdharElementToFocus') _inputAdhar: ElementRef;
  @ViewChild('issueDateElementToFocus') _issueDateInput: ElementRef;
  @ViewChild('expiryDateElementToFocus') _expiryDateInput: ElementRef;
  @ViewChild('schoDocToUploadFileInput') schoDocToUploadFileInput: ElementRef;
  @ViewChild('docToUploadFileInput') docToUploadFileInput: ElementRef;
  attachmentFileExt: string = "ppt, pptx, doc, docx, xls, xlsx, txt, pdf, jpg, jpeg, png";
  imageFileExt: string = "png, jpg, jpeg";  
  attachmentMaxFileSize:number = 10;

  fromDateMinDate: Date;
  toDateMinDate: Date;
  maxDate: Date;
  minDate: Date;

  isLinear = false;
  uploadsInfoFormValues = [];  

  motherTongueList = [];
  filteredMotherTongues = [];

  courseSelectionValues = {};
  boardList = [];
  filteredBoardList = [];
  mediumOfEducationList = [];
  filteredMediumOfEducation = [];
  disabilityArray = [];
  disabilityList = [];

  filteredInstitutes = [];
  selectedInstitutesArray = [];
  semesterNoList = [];
  yearNoList = [];
  showFormTitle: boolean  = false;
  removable: boolean  = true;
  selectable: boolean = true;
  showBank: boolean = false;
  showUnderGraduate: boolean = false;
  showGraduate: boolean = false;
  showPostGraduate: boolean = false;
  showMasterGraduate: boolean = false;
  showPercentile: boolean = false;
  showScore: boolean = false;
  showSeatNo: boolean = false;
  showEnteranceSubjects: boolean = false;
  showHscBlk: boolean = false;
  showSscBlk: boolean = false;
  showEnteranceDetailsBlk: boolean = false;
  showAggregateRow: boolean = false;

  monthsList = [];
  otherActivities = [];
  streams = ['Arts', 'Science', 'Commerce'];
  nationality = ['Indian', '*Foreigner', '*N.R.I'];
  semesterArray = [1, 2, 3, 4, 5, 6, 7, 8];
  otherActivitiesList = [];
  yearAppearedList = [];
  bloodGroups = [];
  annualIncomeGroups = [];
  religionsList = [];
  castesList = [];
  examinations = [];

  courseForm: UntypedFormGroup;
  courseFormValues = [];  

  categoryForm: UntypedFormGroup;
  categoryFormValues = [];
  applyingCategoriesList = [];
  categoryCheckboxes = [];  
  subCategoryList = [];  
  subCategoryReverseArray = {};  
  subCategoryBunch = [];
  selectedCatName = '';
  categoryError: boolean = false;
  subCategoryError: boolean = false;
  showMkclNo: boolean = false;
  jobDescAddMaxReached: boolean = false;
  addtnlQltnAddMaxReached: boolean = false;
  universityApplicationFormNo = new UntypedFormControl();

  personalInfoForm: UntypedFormGroup;
  personalInfoFormValues = [];

  addressInfoForm: UntypedFormGroup;
  addressInfoFormValues = [];  

  guardianInfoForm: UntypedFormGroup;
  guardianInfoFormValues = [];

  branchingQuestionForm: UntypedFormGroup;
  branchingQuestionFormValues = [];

  educationInfoForm: UntypedFormGroup;
  educationInfoFormValues = [];

  additionalQualificationForm: UntypedFormGroup;
  additionalQualificationFormValues = [];

  softwareInfoForm: UntypedFormGroup;
  softwareInfoFormValues = [];

  workExperienceForm: UntypedFormGroup;
  workExperienceFormValues = [];

  bankInfoForm: UntypedFormGroup;
  bankInfoFormValues = [];

  extraCurriculumForm: UntypedFormGroup;
  extraCurriculumFormValues = [];

  questionnaireForm: UntypedFormGroup;
  questionnaireFormValues = [];

  additionalCertificationForm: UntypedFormGroup;
  additionalCertificationFormValues = [];

  documentsForm: UntypedFormGroup;
  documentsFormValues = [];  
  defaultPdfImage = '../assets/images/users/default-pdf.png';
  defaultDocImage = '../assets/images/users/default-doc.jpg';

  declarationForm: UntypedFormGroup;
  declarationFormValues = [];  
  defaultImage = '../assets/images/users/default-user.jpg';

  isFatherBrowsedPassportSizePhoto: boolean = false;
  isMotherBrowsedPassportSizePhoto: boolean = false;
  isBrotherBrowsedPassportSizePhoto: boolean = false;
  isSisterBrowsedPassportSizePhoto: boolean = false;
  isGuardianBrowsedPassportSizePhoto: boolean = false;
  isGuardianBrowsedSignaturePhoto: boolean = false;
  isSisterBrowsedSignaturePhoto: boolean = false;
  isBrotherBrowsedSignaturePhoto: boolean = false;
  isMotherBrowsedSignaturePhoto: boolean = false;
  isFatherBrowsedSignaturePhoto: boolean = false;
  isBrowsedPassportSizePhoto: boolean = false;
  isUploadedPassportSizePhoto: boolean = false;
  uploadedPassportSizePhoto: any;

  fatherPassportSizePhotoError: boolean = false;
  motherPassportSizePhotoError: boolean = false;
  brotherPassportSizePhotoError: boolean = false;
  sisterPassportSizePhotoError: boolean = false;
  guardianPassportSizePhotoError: boolean = false;
  guardianSignaturePhotoError: boolean = false;

  isFatherUploadedPassportSizePhoto:boolean = false;
  isMotherUploadedPassportSizePhoto:boolean = false;
  isBrotherUploadedPassportSizePhoto:boolean = false;
  isSisterUploadedPassportSizePhoto:boolean = false;
  isGuardianUploadedPassportSizePhoto:boolean = false;
  isGuardianUploadedSignaturePhoto:boolean = false;
  isFatherUploadedSignaturePhoto:boolean = false
  isMotherUploadedSignaturePhoto:boolean = false
  isBrotherUploadedSignaturePhoto:boolean = false
  isSisterUploadedSignaturePhoto:boolean = false

  isBrowsedSignatureImage: boolean = false;
  isBrowsedParentSignatureImage: boolean = false;
  isUploadedSignatureImage: boolean = false;
  isUploadedParentSignatureImage: boolean = false;
  showSubCategories: any = false;
  uploadedSignatureImage: any;
  uploadedParentSignatureImage: any;
  uploadedFatherPassportSizePhoto: any;
  uploadedMotherPassportSizePhoto: any;
  uploadedBrotherPassportSizePhoto: any;
  uploadedSisterPassportSizePhoto: any;
  uploadedGuardianPassportSizePhoto: any;
  uploadedGuardianSignaturePhoto: any;
  uploadedFatherSignaturePhoto: any;
  uploadedMotherSignaturePhoto: any;
  uploadedBrotherSignaturePhoto: any;
  uploadedSisterSignaturePhoto: any;

  fatherPassportSizePhotoToUpload: any = '';
  motherPassportSizePhotoToUpload: any = '';
  brotherPassportSizePhotoToUpload: any = '';
  sisterPassportSizePhotoToUpload: any = '';
  guardianPassportSizePhotoToUpload: any = '';
  guardianSignaturePhotoToUpload: any = '';
  fatherSignaturePhotoToUpload: any = '';
  motherSignaturePhotoToUpload: any = '';
  brotherSignaturePhotoToUpload: any = '';
  sisterSignaturePhotoToUpload: any = '';


  fatherSignaturePhotoError: boolean = false;
  motherSignaturePhotoError: boolean = false;
  brotherSignaturePhotoError: boolean = false;
  sisterSignaturePhotoError: boolean = false;

  hasPassportSizePhoto: any;
  hasSignatureImage: any;
  hasParentSignatureImage: any;
  hasFatherPassportSizePhoto: any;
  hasMotherPassportSizePhoto: any;
  hasBrotherPassportSizePhoto: any;
  hasSisterPassportSizePhoto: any;
  hasGuardianPassportSizePhoto: any;
  hasGuardianSignaturePhoto: any;
  hasFatherSignaturePhoto: any;
  hasMotherSignaturePhoto: any;
  hasBrotherSignaturePhoto: any;
  hasSisterSignaturePhoto: any;

  passportSizePhotoToUpload: any = '';
  signatureImageToUpload: any = '';
  parentSignatureImageToUpload: any = '';
  formPolicyId: any = 0;
  showEnrollmentNumber: boolean = false;

  @ViewChild('passportSizePhotoFileInput') passportSizePhotoFileInput: ElementRef;
  @ViewChild('signatureImageFileInput') signatureImageFileInput: ElementRef;
  @ViewChild('parentSignatureImageFileInput') parentSignatureImageFileInput: ElementRef;
  @ViewChild('fatherPassportSizePhotoFileInput') fatherPassportSizePhotoFileInput: ElementRef;
  @ViewChild('motherPassportSizePhotoFileInput') motherPassportSizePhotoFileInput: ElementRef;
  @ViewChild('brotherPassportSizePhotoFileInput') brotherPassportSizePhotoFileInput: ElementRef;
  @ViewChild('sisterPassportSizePhotoFileInput') sisterPassportSizePhotoFileInput: ElementRef;
  @ViewChild('guardianPassportSizePhotoFileInput') guardianPassportSizePhotoFileInput: ElementRef;
  @ViewChild('guardianSignaturePhotoFileInput') guardianSignaturePhotoFileInput: ElementRef;
  @ViewChild('fatherSignaturePhotoFileInput') fatherSignaturePhotoFileInput: ElementRef;
  @ViewChild('motherSignaturePhotoFileInput') motherSignaturePhotoFileInput: ElementRef;
  @ViewChild('brotherSignaturePhotoFileInput') brotherSignaturePhotoFileInput: ElementRef;
  @ViewChild('sisterSignaturePhotoFileInput')  sisterSignaturePhotoFileInput: ElementRef;
  maxSize:number = 1;
  fileExt: string = "JPG, JPEG, PNG";
  docFileExt: string = "JPG, JPEG, PNG, PDF";
  passportSizePhotoError: boolean = false;
  signatureImageError: boolean = false;
  parentSignatureImageError: boolean = false;

  fromInstitute: boolean = false;
  headerImage: any = '';
  inHouse: string = '';
  disableInHouseInfo: string = '';
  disableInHouse: boolean = false;
  showInHouseOptions: boolean = false;
  underGraduateHeaders: any = {boardName:false, cgpi:false, creditsEarned: false, grade: false, liveAtkt:false, marksObtained:false, marksOutof: false, monthAppeared:false, percentage: false, percentageOrCgpa: false, percentageOrSgpa:false, schoolName:false, seatNo:false, class:false, studyDuration:false, minPassGrade:false, maxPassGrade:false, sgpa: false, stream: false, yearAppeared: false, gradingSystem: false, document: false};
  graduateHeaders: any = {boardName:false, cgpi:false, creditsEarned: false, grade: false, liveAtkt:false, marksObtained:false, marksOutof: false, monthAppeared:false, percentage: false, percentageOrCgpa: false, percentageOrSgpa:false, schoolName:false, seatNo:false, class:false, studyDuration:false, minPassGrade:false, maxPassGrade:false, creditPoints:false, creditGrade:false, sgpa: false, stream: false, yearAppeared: false, document: false};
  postGraduateHeaders: any = {boardName:false, cgpi:false, creditsEarned: false, grade: false, liveAtkt:false, marksObtained:false, marksOutof: false, monthAppeared:false, percentage: false, percentageOrCgpa: false, percentageOrSgpa:false, schoolName:false, seatNo:false, class:false, studyDuration:false, minPassGrade:false, maxPassGrade:false, sgpa: false, stream: false, yearAppeared: false, document: false};
  masterGraduateHeaders: any = { boardName: false, cgpi: false, creditsEarned: false, grade: false, liveAtkt: false, marksObtained: false, marksOutof: false, monthAppeared: false, percentage: false, percentageOrCgpa: false, percentageOrSgpa: false, schoolName: false, seatNo: false, class: false, studyDuration: false, minPassGrade: false, maxPassGrade: false, sgpa: false, stream: false, yearAppeared: false, document: false };
  
  formData: any;
  admissionClosed: boolean = false;
  admissionClosedMessage: string = 'Admissions are closed';

  subjectCompulsoryArray = [];
  subjectLanguagesOptionalArray = [];
  subjectOptionalArray = [];

  appearedForArray = [];

  formSetup = [];
  uploadedFileNames = [];
  documentsBunch = [];
  coursesList = [];
  coursesListValues = [];
  coursesBunch = [];
  preferenceAray = [];
  
  subjectSelectionList = [];
  
  parentsDeclarationArray = [];
  studentDeclarationArray = [];
  
  studentDeclaration: any;

  formType: any = '';
  documentsUpload: boolean = true;
  courseSelection: boolean = true;
  optPayment: boolean = true;
  guardianName = '';

  formLock: boolean = false;
  formLockNote = '';
  showTopNote: boolean = false;
  topNote = '';

  showCategoryQuestions: boolean = false;
  smallScreen: boolean = true;
  showHorizontalStepper: boolean  = false;
  showEntranceExamFor: boolean = false;
  showEntranceExamYear: boolean = false;
  showEntranceExamMonth: boolean = false;
  showEntranceAllIndiaRank: boolean = false;
  showEntranceBranchName: boolean = false;
  showEntrancePresentOrganisation: boolean = false;
  showEntranceDesignation: boolean = false;
  showEntranceWorkingYears: boolean = false;
  showStudentPresentStatus: boolean = false;

  constructor(
    private breakpointObserver: BreakpointObserver,    
    private _formBuilder: UntypedFormBuilder, 
    private atp: AmazingTimePickerService,   
    private router: Router, 
    private datePipe: DatePipe,
    public dialog: MatDialog,
    private _admissionService: AdmissionService,
    private _institutesService: InstitutesService,    
    private _commonService: CommonService, 
    public _snackBarMsgComponent: SnackBarMsgComponent,    
    private allEventEmitters: AllEventEmitters,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any
  ) {

    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      let smallScreen = result.matches;
      if (!this.showHorizontalStepper) {
        smallScreen = true;
      }
      this.smallScreen = smallScreen;
    });

    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('instituteId'))) {

      let userProf = globalFunctions.getUserProf();
      this.headerImage = userProf.headerImage;
      this.formType = userProf.formType;
      this.courseSelection = userProf.courseSelection;
      this.documentsUpload = userProf.documentsUpload;
      this.optPayment = userProf.optPayment;
      this.formPolicyId = userProf.formPolicyId;

      if (this.formPolicyId == 1) {
        this.showEnrollmentNumber = true;
      }
      this.inHouse = '';
      if (userProf.inHouse) {
        this.inHouse = 'yes';
      }

      this.fromInstitute = true;
    }

    this.maxDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));
    this.fromDateMinDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));    
    this.toDateMinDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));    
  }

  ngOnInit(): void {
    this.categoryFormControls();
    this.createPersonalInfoFormControls();
    this.addressInfoFormControls();
    this.guardianInfoFormControls();
    this.educationInfoFormControls();
    this.additionalQualificationFormControls();
    this.softwareInfoFormControls();
    this.workExperienceFormControls();
    this.extraCurriculumFormControls();
    this.additionalCertificationFormControls();
    this.questionnaireFormControls();
    this.branchingQuestionFormControls();
    this.bankInfoFormControls();
    this.declarationFormControls();
    this.documentsFormControls();

    this.fetchMotherTongue();
    this.fetchyearAppeared();
    this.fetchReligions();
    this.fetchCastes();
    this.fetchMonths((data) => {
      this.monthsList = data;
    });
    this.fetchBloodGroup((data) => {
      this.bloodGroups = data;
    });
    this.fetchAnnualIncomeGroup((data) => {
      this.annualIncomeGroups = data;
    });
    this.fetchExaminations((data) => {
      this.examinations = data;
    });

    if (this.panelMode == 'admission') {
      this.getAdmissionFormDetails();
    } else if (this.panelMode == 'admission-form-b') {
      this.getAdmissionFormBDetails();
    } else if (this.panelMode == 'institute-form-b') {
      this.getInstitutesFormsBDetails();
    } else {
      this.getInstitutesFormsDetails();
    }

    globalFunctions.setLocalStorage('panelMode', this.panelMode);
  }

  getAdmissionFormDetails() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._admissionService.getAdmissionFormDetails().subscribe(data => {
      
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.setFormValues(data.dataJson);

        } else if (data.status == 101) {

          globalFunctions.setUserProf('applicantId', data.dataJson.newApplicantId);
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
          location.reload();

        } else if (data.status == 102) {

          this.router.navigate(['/cart']);
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);        
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  getAdmissionFormBDetails() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._admissionService.getAdmissionFormBDetails().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.setFormValues(data.dataJson);

        } else if (data.status == 101) {

          globalFunctions.setUserProf('applicantId', data.dataJson.newApplicantId);
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
          location.reload();

        } else if (data.status == 102) {

          this.router.navigate(['/cart']);
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);        
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  getInstitutesFormsDetails() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._institutesService.getAdmissionFormsDetails(this.formDetails.formId).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.setFormValues(data.dataJson);

        } else if (data.status == 101) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

        } else if (data.status == 102) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);        
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  getInstitutesFormsBDetails() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._institutesService.getAdmissionFormsBDetails(this.formDetails.formId).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.setFormValues(data.dataJson);

        } else if (data.status == 101) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

        } else if (data.status == 102) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);        
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }
  
  setFormValues(formData) {
  
    if (formData.formFillingInstructions.display) {
      this.openInfoDialog(formData.formFillingInstructions);
    }

    if (formData.showHorizontalStepper) {
      this.showHorizontalStepper = formData.showHorizontalStepper;
      this.smallScreen = false;
    }

    if (!globalFunctions.isEmpty(formData.formTitle)) {
      this.showFormTitle = true;
    }

    globalFunctions.setUserProf('instituteName', formData.instituteName);
    setTimeout(() => { this.allEventEmitters.setHeaderImage.emit(true); }, 2);
    
    this.boardList = formData.educationInfo.boardList;
    this.filteredBoardList = formData.educationInfo.boardList;

    this.formData = formData;

    this.formSetup = formData.formSetup;
    this.formLock = formData.formLock;
    this.formLockNote = formData.formLockNote;
    this.showTopNote = formData.showTopNote;
    this.topNote = formData.topNote;

    let stepperIndex = 0;
    this.formSetup.forEach((tab) => {
      if (tab.display) {
        tab.stepperIndex = stepperIndex;
        stepperIndex++;
      }
    });

    this.admissionClosed = formData.admissionClosed;
    if (this.admissionClosed) {
      this.showEnrollmentNumber = false;
    }

    this.showMkclNo         = formData.showMkclNo;
    this.universityApplicationFormNo.setValue(formData.universityApplicationFormNo, {emitEvent: false});
    this.showSubCategories  = formData.optAdmissionSubCategories;
    this.showBank           = formData.showBank;
    this.showInHouseOptions = formData.showInHouseOptions;
    this.disableInHouse     = formData.disableInHouse;
    this.disableInHouseInfo = formData.disableInHouseInfo;

    this.setSubjectSelectionValues(formData);
    this.setEducationInfoValues(formData);
    this.setCoursesListValues(formData);
    this.setCategoryFormValues(formData);
    this.setBankInfoValues(formData);
    this.setBranchingQuestionValues(formData);
    this.setPersonalInfoValues(formData);
    this.setExtraCertificateValues(formData,'');
    this.setAddressInfoValues(formData);
    this.setGuardianInfoValues(formData);
    
    this.setAdditionalQualificationValues(formData);
    this.setWorkExpDetailsValues(formData);
    this.setSoftwareKnowledgeValues(formData);
    this.setExtraCurriculumActivitiesValues(formData);
    this.setQuestionnaireValues(formData);
    this.setDocumentsValues(formData);
    this.setDeclarationInfoValues(formData);
  }

  categoryFormControls() {

    this.categoryForm = this._formBuilder.group({
      applyingCategories: [null],
      otherCategory: [null],
      showCatDocumentUpload: [false],
      catDocumentUploadObj: [null],
      showDocResetBtn: [false],
      catDocumentUrl: [null],
      catDocToUpload: [null],
      catHasUploadedDoc: [false],
      catDocReq: [false],
      catDocError: [false],
      catDocBrowsed: [false],
      catDocUploadPercent: [null],
      catDocUploading: [false],
      applyingSubCategories: [null],
      admissionType: [null],
      candidateFrom: [null],
      showSubCatInRadio: [false],
      isInHouse: [null]
    });
  }

  createPersonalInfoFormControls() {

    this.personalInfoForm = this._formBuilder.group({
      grNo: [null],
      instituteStudentId: [null],
      fullNameMarksheet: [null],
      MaindenName: [null],
      changeInName: [null],
      nameChange: [null],
      abcId: [null],
      firstName: [null],
      middleName: [null],
      lastName: [null],
      fatherName: [null],
      motherName: [null],
      dob: [null],
      aadharDob: [null],
      aadharAge: [null],
      age: [null],
      bloodGroup: [null],
      email: ['', Validators.compose([emailValidator])],
      gender: [null],
      nationality: new UntypedFormControl({ value: this.nationality, disabled: false }),
      motherTounge: [null],
      sssMid: [null],
      familyId: [null],
      placeOfBirth: [null],
      talukaOfBirth: [null],
      stateOfBirth: [null],
      countryOfBirth: [null],
      districtOfBirth: [null],
      religionId: [null],
      domicile: [null],
      casteId: [null],
      subCaste: [null],
      weight: [null],
      height: [null],
      aadharNo: [null, Validators.compose([Validators.minLength(12), Validators.maxLength(12)])],
      mobileNo: [null],
      udiseNo: [null],
      maritalStatus: [null],
      alternateNo: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
      nadId: [null],
      isDisability: ['no'],
      isScholarship: ['no'], 
      scholarship: this._formBuilder.group({
        scholarshipType: [null],
        percentage: [null],
        percentageReq: [false],
        certificate: [null],
        scholarshipDoc: [null],
        scholarshipDocReq: [false],
        scholarshipDocError: [false],
        scholarshipDocBrowsed: [false],
        showDocResetBtn: [false],
        scholarshipDocumentUrl: [null],
        scholarshipDocToUpload: [null],
        scholarshipHasUploadedDoc: [false],
      }),
      hostelRequired: ['no'],
      disability: this._formBuilder.group({
        disabilityType: [null],
        percentage: [null],
        percentageReq: [false],
        certificate: [null],
        disabilityDoc: [null],
        disabilityDocReq: [false],
        disabilityDocError: [false],
        disabilityDocBrowsed: [false],
        showDocResetBtn: [false],
        disabilityDocumentUrl: [null],
        disabilityDocToUpload: [null],
        disabilityHasUploadedDoc: [false],
      }),
      isForeignStudent: [null],
      passportDetails: this._formBuilder.group({
        expiryDate: [null],
        issueDate: [null],
        passportNo: [null],
      }),
      residentialAddress: this._formBuilder.group({
        isForeignStudent: [null],
        street: [null],
        area: [null],
        address: [null],
        district: [null],
        state: new UntypedFormControl({ value: null, disabled: true }),
        city: new UntypedFormControl({ value: null, disabled: true }),
        title: [null],
        showNearByRailwayStation: [false],
        nearByRailwayStation: [null],
        pincode: [null, Validators.compose([Validators.minLength(6), Validators.maxLength(6)])],
      }),
      nativeAddress: this._formBuilder.group({
        address: [null],
        state: new UntypedFormControl({ value: null, disabled: true }),
        city: new UntypedFormControl({ value: null, disabled: true }),
        title: [null],
        area: [null],
        street: [null],
        district: [null],
        showNearByRailwayStation: [false],
        nearByRailwayStation: [null],
        pincode: [null, Validators.compose([Validators.minLength(6), Validators.maxLength(6)])],
      }),
      candidateFrom: [null],
      category: this._formBuilder.group({
        applyingCategories: [null],
        categoryText: [null],
      }),
      categoryQuestions: this._formBuilder.array([
        this.categoryQuestionsRows()
      ]),
      studentPresentStatus: this._formBuilder.array([
        this.studentPresentStatusRows()
      ]),
    });
  }

  addressInfoFormControls() {

    this.addressInfoForm = this._formBuilder.group({
      residentialAddress: this._formBuilder.group({
        address: [null],
        area: [null],
        street: [null],
        isForeignStudent:[null],
        state : new UntypedFormControl({value: null, disabled: true}),
        city : new UntypedFormControl({value: null, disabled: true}),
        district: [null],
        title: [null],
        showNearByRailwayStation: [false],
        nearByRailwayStation: [null],
        pincode: [null, Validators.compose([Validators.minLength(6), Validators.maxLength(6) ])],
      }),
      nativeAddress: this._formBuilder.group({
        address: [null],
        area: [null],
        street: [null],
        isForeignStudent:[null],
        state : new UntypedFormControl({value: null, disabled: true}),
        city : new UntypedFormControl({value: null, disabled: true}),
        district: [null],
        title: [null],        
        showNearByRailwayStation: [false],
        nearByRailwayStation: [null],
        pincode: [null, Validators.compose([Validators.minLength(6), Validators.maxLength(6) ])],
      })
    });
  }

  guardianInfoFormControls() {

    this.guardianInfoForm = this._formBuilder.group({
      showGuardianDetails: [false],
      note: [null],
      familyInfo: this._formBuilder.group({
        familyAnualIncome: [null],
        totalMembers: [null],
      }),
      membersInfo: this._formBuilder.group({
        guardian: [null],
        showMemberDetails: [true],
        fatherDetails: this._formBuilder.group({
          aadharNo: [null, Validators.compose([Validators.minLength(12), Validators.maxLength(12)])],
          panCard: [null],
          annualIncome: [null],
          companyName: [null],
          designation: [null],
          email: [null, Validators.compose([emailValidator])],
          fullName: [null],
          mobileNo: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
          occupation: [null],
          officeAddress: [null],
          officeArea: [null],
          officeDist: [null],
          officeStreet: [null],
          officeCity: new UntypedFormControl({ value: null, disabled: true }),
          officePincode: [null, Validators.compose([Validators.minLength(6), Validators.maxLength(6)])],
          officeState: new UntypedFormControl({ value: null, disabled: true }),
          officeTel: [null],
          qualification: [null],
          residentTel: [null],
        }),
        motherDetails: this._formBuilder.group({
          aadharNo: [null, Validators.compose([Validators.minLength(12), Validators.maxLength(12)])],
          panCard: [null],
          annualIncome: [null],
          companyName: [null],
          designation: [null],
          email: [null, Validators.compose([emailValidator])],
          fullName: [null],
          mobileNo: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
          occupation: [null],
          officeAddress: [null],
          officeDist: [null],
          officeArea: [null],
          officeStreet: [null],
          officeCity: new UntypedFormControl({ value: null, disabled: true }),
          officePincode: [null, Validators.compose([Validators.minLength(6), Validators.maxLength(6)])],
          officeState: new UntypedFormControl({ value: null, disabled: true }),
          officeTel: [null],
          qualification: [null],
          residentTel: [null],
        }),
        sisterDetails: this._formBuilder.group({
          aadharNo: [null, Validators.compose([Validators.minLength(12), Validators.maxLength(12)])],
          panCard: [null],
          annualIncome: [null],
          companyName: [null],
          designation: [null],
          email: [null, Validators.compose([emailValidator])],
          fullName: [null],
          mobileNo: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
          occupation: [null],
          officeAddress: [null],
          officeDist: [null],
          officeArea: [null],
          officeStreet: [null],
          officeCity: new UntypedFormControl({ value: null, disabled: true }),
          officePincode: [null, Validators.compose([Validators.minLength(6), Validators.maxLength(6)])],
          officeState: new UntypedFormControl({ value: null, disabled: true }),
          officeTel: [null],
          qualification: [null],
          residentTel: [null],
        }),
        brotherDetails: this._formBuilder.group({
          aadharNo: [null, Validators.compose([Validators.minLength(12), Validators.maxLength(12)])],
          panCard: [null],
          annualIncome: [null],
          companyName: [null],
          designation: [null],
          email: [null, Validators.compose([emailValidator])],
          fullName: [null],
          mobileNo: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
          occupation: [null],
          officeAddress: [null],
          officeDist: [null],
          officeArea: [null],
          officeStreet: [null],
          officeCity: new UntypedFormControl({ value: null, disabled: true }),
          officePincode: [null, Validators.compose([Validators.minLength(6), Validators.maxLength(6)])],
          officeState: new UntypedFormControl({ value: null, disabled: true }),
          officeTel: [null],
          qualification: [null],
          residentTel: [null],
        }),
        guardianDetails: this._formBuilder.group({
          aadharNo: [null, Validators.compose([Validators.minLength(12), Validators.maxLength(12)])],
          panCard: [null],
          annualIncome: [null],
          companyName: [null],
          designation: [null],
          email: [null, Validators.compose([emailValidator])],
          fullName: [null],
          relation: [null],
          mobileNo: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
          occupation: [null],
          officeAddress: [null],
          officeDist: [null],
          officeArea: [null],
          officeStreet: [null],
          officeCity: new UntypedFormControl({ value: null, disabled: true }),
          officePincode: [null, Validators.compose([Validators.minLength(6), Validators.maxLength(6)])],
          officeState: new UntypedFormControl({ value: null, disabled: true }),
          officeTel: [null],
          qualification: [null],
          residentTel: [null],
        })
      })
    });
  }


  educationInfoFormControls() {

    this.educationInfoForm = this._formBuilder.group({
      eduInfo: this._formBuilder.group({
        underGraduate: this._formBuilder.group({
          filter: this._formBuilder.group({
            display: [false]
          }),          
          list: this._formBuilder.array([
            this.initItemRows()
          ])
        }),
        graduate: this._formBuilder.group({
          filter: this._formBuilder.group({
            display: [false],
            graduateDesc: [null],
            appearing: [null],
            degree: [null],
            otherText: [null],
            specialization: [null],
            yearSemesterWise: [null],
            semesterNo: [null],
            monthOfPassing: [null],
            yearOfPassing: [null],
            yearNo: [null],
            boardName: [null],
            schoolName: [null],
            marksObtained: [null],
            marksOutof: [null],
            percentage: [null],
            cgpa: [null],
            grade: [null],
          }),
          list: this._formBuilder.array([
            this.initItemRows()
          ])
        }),
        postGraduate: this._formBuilder.group({
          postGraduation: [null], 
          filter: this._formBuilder.group({
            display: [false],            
            appearing: [null],
            degree: [null],
            otherText: [null],
            specialization: [null],            
          }),
          list: this._formBuilder.array([
            this.initItemRows()
          ])
        }),
        masterGraduate: this._formBuilder.group({
          masterGraduation: [null],
          filter: this._formBuilder.group({
            display: [false],
            appearing: [null],
            degree: [null],
            otherText: [null],
            specialization: [null],
          }),
          list: this._formBuilder.array([
            this.initItemRows()
          ])
        }),
        enggInfo: this._formBuilder.group({
          showCet: [false],
          showDiploma: [false],
          cet: this._formBuilder.group({
            subjectHeading : [null],
            subjectInfoReq : [false],
            subjectInfo: this._formBuilder.group({
              maths: [null],
              mathsHeader: [null],
              physics: [null],
              physicsHeader: [null],
              chemistry: [null],
              chemistryHeader: [null],
              cetTotal: [null],
              cetTotalHeader: [null],
              jeeTotal: [null],
              jeeTotalHeader: [null]
            })
          }),
          diploma: this._formBuilder.group({
            subjectHeading : [null],
            subjectInfoReq : [false],
            subjectInfo: this._formBuilder.group({
              instituteName: [null],
              instituteNameHeader: [null],
              yearOfPassing: [null],
              yearOfPassingHeader: [null],
              totalOfMSBTE: [null],
              totalOfMSBTEHeader: [null],
              totalOthers: [null],
              totalOthersHeader: [null]
            })
          }),
          hsc: this._formBuilder.group({
            subjectInfo: this._formBuilder.group({
              subject1: this._formBuilder.group({
                marksObtained: [null],
                marksOutof: [null],
                totalPercentage: [null],
              }),
              subject2: this._formBuilder.group({
                marksObtained: [null],
                marksOutof: [null],
                totalPercentage: [null],
              }),
              subject3: this._formBuilder.group({
                marksObtained: [null],
                marksOutof: [null],
                totalPercentage: [null],
              }),
              totalMarks: this._formBuilder.group({
                marksObtained: [null],
                marksOutof: [null],
                totalPercentage: [null],
              }),
            })
          }),
          ssc: this._formBuilder.group({
            subjectInfo: this._formBuilder.group({
              maths: this._formBuilder.group({
                marksObtained: [null],
                marksOutof: [null],
                totalPercentage: [null],
              })
            })
          })
        }),
      }),
      stream: [null], 
      showPrnNo: [false], 
      prnNo: [null], 
      passedHscWith: [null], 
      mathsMarks: [null, Validators.compose([Validators.min(35)])], 
      passedHscExemption: [false], 
      hscRepeater: [false], 
      showMediumOfEducation: [false], 
      mediumOfEducation: [null], 
      showSubjectCompulsory: [false],
      showSubjectInfo: [false],
      showSubjectLanguagesOptional: [false],
      showSubjectOptional: [false],
      subjectInfo: this._formBuilder.group({
        subjectLanguagesOptionalSelected : [null],
        subjectOptionalSelected : [null]
      }),
      
      showLlbMhCet: [false],
      llbMhCetInfo: this._formBuilder.group({
        cetMarks : [null],
        cetFormNo : [null],
        admissionRound : [null],
        cetSeatNo : [null],
        provisionalAdmissionLetterNo : [null],
      }),
      showOtherEduInfo: [false],      
      otherEduInfo: this._formBuilder.group({
        courseType: [null],
        courseName: [null],
        instituteName: [null],
        timings: [null]
      }),
      enteranceDetails: this._formBuilder.group({
        enteranceExam: [null],
        examFor: [null],
        seatNo: [null],
        allIndiaRank: [null],
        branchName: [null],
        presentOrganisation: [null],
        designation: [null],
        workingYears: [null],
        percentile: [null],
        score: [null],
        year: [null],
        month: [null],
        subjectsInfo: this._formBuilder.group({
          maths: [null],
          physics: [null],
          chemistry: [null],
          totalMarks: [0],
        })
      })
    });
  }

  additionalQualificationFormControls() {

    this.additionalQualificationForm = this._formBuilder.group({
      listInfo: this._formBuilder.group({
        list: this._formBuilder.array([
          this.initAddQlfRows()
        ])
      })
    });
  }

  initAddQlfRows() : UntypedFormGroup {
    return this._formBuilder.group({
      courseName: [null],
      instName: [null],
      monthAppeared: [null],
      yearAppeared: [null],
      marksObtained: [null],
      marksOutof: [null],
      percentage: [null],
      creditsEarned: [null],
      sgpa: [null],
      percentageOrCgpa: [null],
      percentageOrSgpa: [null],
      seatNo: [null],
      cgpi: [null],
      grade: [null],
    });
  }

  setAdditionalQualificationValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.additionalQualification)) {

      this.additionalQualificationForm = this._formBuilder.group({
        listInfo: this._formBuilder.group({
          list: this._formBuilder.array([
            this.initAddQlfRows()
          ])
        })
      });

      this.setListInfoValues(formData.additionalQualification.listInfo.list);

      this.additionalQualificationFormValues = this.additionalQualificationForm.controls.listInfo.value;
    }
  }

  setListInfoValues(listData: any) {

    const control = <UntypedFormArray>this.additionalQualificationForm.controls.listInfo['controls'].list;
    control.controls = [];

    if (!globalFunctions.isEmpty(listData) && listData.constructor === Array) {

      let reqFields = this.formData.additionalQualification.listInfo.requiredFields;

      let courseNameReq:any;
      if (reqFields.courseName) {
        courseNameReq = Validators.required;
      }
      let instNameReq:any;
      if (reqFields.instName) {
        instNameReq = Validators.required;
      }
      let monthAppearedReq:any;
      if (reqFields.monthAppeared) {
        monthAppearedReq = Validators.required;
      }
      let yearAppearedReq:any;
      if (reqFields.yearAppeared) {
        yearAppearedReq = Validators.required;
      }
      let marksObtainedReq:any;
      if (reqFields.marksObtained) {
        marksObtainedReq = Validators.required;
      }
      let marksOutofReq:any;
      if (reqFields.marksOutof) {
        marksOutofReq = Validators.required;
      }
      let percentageReq:any;
      if (reqFields.percentage) {
        percentageReq = Validators.required;
      }
      let creditsEarnedReq:any;
      if (reqFields.creditsEarned) {
        creditsEarnedReq = Validators.required;
      }
      let sgpaReq:any;
      if (reqFields.sgpa) {
        sgpaReq = Validators.required;
      }
      let percentageOrSgpaReq:any;
      if (reqFields.percentageOrSgpa) {
        percentageOrSgpaReq = Validators.required;
      }
      let percentageOrCgpaReq:any;
      if (reqFields.percentageOrCgpa) {
        percentageOrCgpaReq = Validators.required;
      }
      let seatNoReq:any;
      if (reqFields.seatNo) {
        seatNoReq = Validators.required;
      }
      let cgpiReq:any;
      if (reqFields.cgpi) {
        cgpiReq = Validators.required;
      }
      let gradeReq:any;
      if (reqFields.grade) {
        gradeReq = Validators.required;
      }

      listData.forEach((itemRow) => {

        const control = <UntypedFormArray>this.additionalQualificationForm.controls.listInfo['controls'].list;

        let row = this._formBuilder.group({
          courseName: [itemRow.courseName, courseNameReq],
          instName: [itemRow.instName, instNameReq],
          monthAppeared: [itemRow.monthAppeared, monthAppearedReq],
          yearAppeared: [itemRow.yearAppeared, yearAppearedReq],
          marksObtained: [itemRow.marksObtained, marksObtainedReq],
          marksOutof: [itemRow.marksOutof, marksOutofReq],
          percentage: [itemRow.percentage, percentageReq],
          creditsEarned: [itemRow.creditsEarned, creditsEarnedReq],
          sgpa: [itemRow.sgpa, sgpaReq],
          percentageOrSgpa: [itemRow.percentageOrSgpa, percentageOrSgpaReq],
          percentageOrCgpa: [itemRow.percentageOrCgpa, percentageOrCgpaReq],
          seatNo: [itemRow.seatNo, seatNoReq],
          cgpi: [itemRow.cgpi, cgpiReq],
          grade: [itemRow.grade, gradeReq],
        });

        control.push(row);
      });
    }
  }

  onChangeEnggInfoSscMarks(mode) {
    const control = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].ssc.controls.subjectInfo.controls[mode];
    let perc = globalFunctions.calculatePercentage(control.get('marksObtained').value, control.get('marksOutof').value);
    control.controls['totalPercentage'].setValue(perc);
  }

  onChangeEnggInfoHscMarks(mode) {
    const control = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls[mode];
    let perc = globalFunctions.calculatePercentage(control.get('marksObtained').value, control.get('marksOutof').value);
    control.controls['totalPercentage'].setValue(perc);

    this.calcEnggInfoHscMarks();
  }

  calcEnggInfoHscMarks() {

    let educationInfoFormVal = this.educationInfoForm.getRawValue();
    let subjectInfo = educationInfoFormVal.eduInfo.enggInfo.hsc.subjectInfo;

    let totalMarksObtained = 0;
    if (!globalFunctions.isEmpty(subjectInfo.subject1.marksObtained)) {
      totalMarksObtained = totalMarksObtained + parseFloat(subjectInfo.subject1.marksObtained);
    }
    if (!globalFunctions.isEmpty(subjectInfo.subject2.marksObtained)) {
      totalMarksObtained = totalMarksObtained + parseFloat(subjectInfo.subject2.marksObtained);
    }    
    if (!globalFunctions.isEmpty(subjectInfo.subject3.marksObtained)) {
      totalMarksObtained = totalMarksObtained + parseFloat(subjectInfo.subject3.marksObtained);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject.marksObtained)) {
      totalMarksObtained = totalMarksObtained + parseFloat(subjectInfo.optionalSubject.marksObtained);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject1.marksObtained)) {
      totalMarksObtained = totalMarksObtained + parseFloat(subjectInfo.optionalSubject1.marksObtained);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject2.marksObtained)) {
      totalMarksObtained = totalMarksObtained + parseFloat(subjectInfo.optionalSubject2.marksObtained);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject3.marksObtained)) {
      totalMarksObtained = totalMarksObtained + parseFloat(subjectInfo.optionalSubject3.marksObtained);
    }

    let totalmarksOutof = 0;
    if (!globalFunctions.isEmpty(subjectInfo.subject1.marksOutof)) {
      totalmarksOutof = totalmarksOutof + parseFloat(subjectInfo.subject1.marksOutof);
    }
    if (!globalFunctions.isEmpty(subjectInfo.subject2.marksOutof)) {
      totalmarksOutof = totalmarksOutof + parseFloat(subjectInfo.subject2.marksOutof);
    }    
    if (!globalFunctions.isEmpty(subjectInfo.subject3.marksOutof)) {
      totalmarksOutof = totalmarksOutof + parseFloat(subjectInfo.subject3.marksOutof);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject.marksOutof)) {
      totalmarksOutof = totalmarksOutof + parseFloat(subjectInfo.optionalSubject.marksOutof);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject1.marksOutof)) {
      totalmarksOutof = totalmarksOutof + parseFloat(subjectInfo.optionalSubject1.marksOutof);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject2.marksOutof)) {
      totalmarksOutof = totalmarksOutof + parseFloat(subjectInfo.optionalSubject2.marksOutof);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject3.marksOutof)) {
      totalmarksOutof = totalmarksOutof + parseFloat(subjectInfo.optionalSubject3.marksOutof);
    }

    let totaltotalPercentage = 0;
    let totaltotalSubjects = 0;
    if (!globalFunctions.isEmpty(subjectInfo.subject1.totalPercentage)) {
      totaltotalSubjects++;
      totaltotalPercentage = totaltotalPercentage + parseFloat(subjectInfo.subject1.totalPercentage);
    }
    if (!globalFunctions.isEmpty(subjectInfo.subject2.totalPercentage)) {
      totaltotalSubjects++;
      totaltotalPercentage = totaltotalPercentage + parseFloat(subjectInfo.subject2.totalPercentage);
    }    
    if (!globalFunctions.isEmpty(subjectInfo.subject3.totalPercentage)) {
      totaltotalSubjects++;
      totaltotalPercentage = totaltotalPercentage + parseFloat(subjectInfo.subject3.totalPercentage);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject.totalPercentage)) {
      totaltotalSubjects++;
      totaltotalPercentage = totaltotalPercentage + parseFloat(subjectInfo.optionalSubject.totalPercentage);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject1.totalPercentage)) {
      totaltotalSubjects++;
      totaltotalPercentage = totaltotalPercentage + parseFloat(subjectInfo.optionalSubject1.totalPercentage);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject2.totalPercentage)) {
      totaltotalSubjects++;
      totaltotalPercentage = totaltotalPercentage + parseFloat(subjectInfo.optionalSubject2.totalPercentage);
    }
    if (!globalFunctions.isEmpty(subjectInfo.optionalSubject3.totalPercentage)) {
      totaltotalSubjects++;
      totaltotalPercentage = totaltotalPercentage + parseFloat(subjectInfo.optionalSubject3.totalPercentage);
    }
   
    let totalPercentage;
    if (!globalFunctions.isEmpty(totaltotalPercentage) && !globalFunctions.isEmpty(totaltotalSubjects)) {
      totalPercentage = (totaltotalPercentage / totaltotalSubjects).toFixed(2);
    }

    const totalMarks = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls['totalMarks'];
    totalMarks.controls['marksObtained'].setValue(totalMarksObtained);
    totalMarks.controls['marksOutof'].setValue(totalmarksOutof);
    totalMarks.controls['totalPercentage'].setValue(totalPercentage);
  }

  onChangeEntranceSubjectsMarks() {

    const maths = <UntypedFormGroup>this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.maths;
    const physics = <UntypedFormGroup>this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.physics;
    const chemistry = <UntypedFormGroup>this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.chemistry;

    let mathsMrks = 0;
    if (!globalFunctions.isEmpty(maths.value)) {
      mathsMrks = parseFloat(maths.value);
    }
    let physicsMrks = 0;
    if (!globalFunctions.isEmpty(physics.value)) {
      physicsMrks = parseFloat(physics.value);
    }
    let chemistryMrks = 0;
    if (!globalFunctions.isEmpty(chemistry.value)) {
      chemistryMrks = parseFloat(chemistry.value);
    }    

    let totalMrks = (mathsMrks + physicsMrks + chemistryMrks);

    this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.totalMarks.setValue(totalMrks);
  }

  onChangeOtherQlfMarks(index) {
    const control = <UntypedFormArray>this.additionalQualificationForm.controls.listInfo['controls'].list.at(index);
    let perc = globalFunctions.calculatePercentage(control.get('marksObtained').value, control.get('marksOutof').value);
    control.controls['percentage'].setValue(perc);
    control.controls['percentageOrCgpa'].setValue(perc);
    control.controls['percentageOrSgpa'].setValue(perc);
  }

  addNewOtherQlfRow(): void {
    let rowCnt = <UntypedFormArray>this.additionalQualificationForm.controls.listInfo['controls'].list.length;
    this.addtnlQltnAddMaxReached = false;
    if (rowCnt < this.formData.additionalQualification.addMoreInfo.maxUpto) {
      const list = <UntypedFormArray>this.additionalQualificationForm.controls.listInfo['controls'].list;
      list.push(this.initAddQlfRows());
    } else {
      this.addtnlQltnAddMaxReached = true;
    }
  }  

  deleteOtherQlfRow(i: number): void {
    const list = <UntypedFormArray>this.additionalQualificationForm.controls.listInfo['controls'].list;
    list.removeAt(i);
    let rowCnt = <UntypedFormArray>this.additionalQualificationForm.controls.listInfo['controls'].list.length;
    this.addtnlQltnAddMaxReached = false;
    if (rowCnt == this.formData.additionalQualification.addMoreInfo.maxUpto) {
      this.addtnlQltnAddMaxReached = true;
    }
  }

  softwareInfoFormControls() {
    this.softwareInfoForm = this._formBuilder.group({
      appSoftware: [null],
      os: [null],
      programmingLang: [null],
    })
    this.softwareInfoForm.disable();
  }

  initItemRows() : UntypedFormGroup {
    return this._formBuilder.group({
      fieldsLabel: [null],
      boardName: [null],
      cgpi: [null],
      cgpiObtained: [null],
      cgpiOutof: [null],
      cgpiOutofArray: [null],
      confNamesArray: [null],
      note: [null],
      confNameSelected: [null],
      confName: [null],
      gradingSystem: [null],
      showMarksBlk: [false],
      showCollegeTransferQuestion: [null],
      collegeTransferQuestionObj: [null],
      collegeTransferQuestionAns: [null],
      showSemesterCompleted: [null],
      semesterCompletedObj: [null],
      semesterCompleted: [null],
      showCgpaBlk: [false],
      creditsEarned: [null],
      grade: [null],
      liveAtkt: [null],
      marksObtained: [null],
      marksOutof: [null],
      monthAppeared: [null],
      percentage: [null],
      classObj: [null],
      class: [null],
      studyDuration: [null],
      minPassGrade: [null],
      maxPassGrade: [null],
      percentageOrCgpa: [null],
      percentageOrSgpa: [null],
      reqConfId: [null],
      schoolName: [null],
      seatNo: [null],
      creditPoints: [null],
      creditGrade: [null],
      sgpa: [null],
      stream: [null],
      yearAppeared: [null],
      showDocumentUpload: [false],
      docReq: [false],
      documentUploadObj: [null],
      documentUrl: [null],
      docToUpload: [null],
      hasUploadedDoc: [false],
      showDocResetBtn: [false],
      docError: [false],
      docBrowsed: [false],
      docUploadPercent: [null],
      docUploading: [false],
    });
  }

  questionnaireFormControls() {
    this.questionnaireForm = this._formBuilder.group({
      questionnaire: this._formBuilder.array([
        this.questionnaireRows()
      ])
    });
  }

  questionnaireRows() : UntypedFormGroup {
    return this._formBuilder.group({
      fieldType: [null],
      options: [null],
      answer : [null],
      question : [null],
      questionId : [null],
      isCompulsory : [false],
    });
  }

  
  branchingQuestionFormControls() {
    this.branchingQuestionForm = this._formBuilder.group({
      questions: this._formBuilder.array([])
    });
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  private setBranchingQuestionValues(data: any): void {
    const questionArray = this._formBuilder.array([]);
    if (!globalFunctions.isEmpty(data.branchingQuestion)) {

      data.branchingQuestion.forEach((question: any) => {
        const subQuestionsGroup = this._formBuilder.group({});

        if (question.subquestion) {
          Object.keys(question.subquestion).forEach((key) => {
            const subQuestionArray = this._formBuilder.array(
              question.subquestion[key].map((subQ: any) =>
                this._formBuilder.group({
                  questionId: [subQ.questionId],
                  isCompulsory: [subQ.isCompulsory],
                  question: [subQ.question],
                  answer: [subQ.answer, subQ.isCompulsory ? Validators.required : []],
                  fieldType: [subQ.fieldType],
                })
              )
            );
            subQuestionsGroup.addControl(key, subQuestionArray);
          });
        }

        questionArray.push(
          this._formBuilder.group({
            questionId: [question.questionId],
            question: [question.question],
            answer: [question.answer],
            isCompulsory: [question.isCompulsory],
            fieldType: [question.fieldType],
            options: this._formBuilder.array(
              question.options.map((option: any) =>
                this._formBuilder.group({
                  key: [option.key],
                  label: [option.label],
                })
              )
            ),
            subquestion: subQuestionsGroup
          })
        );
      });

      this.branchingQuestionForm.setControl('questions', questionArray);
      this.branchingQuestionForm.disable();

    }
  }

  bankInfoFormControls() {
    this.bankInfoForm = this._formBuilder.group({
      accountNo: [null],
      bankName: [null],
      bankHolderName: [null],
      branch: [null],
      ifsc: [null],
      micr: [null]
    });
  }

  documentsFormControls() {
    this.documentsForm = this._formBuilder.group({
      bunch: this._formBuilder.array([
      ]),
      documents: this._formBuilder.array([
        this.documentsRows()
      ])
    });
  }

  documentsRows() : UntypedFormGroup {
    return this._formBuilder.group({
      breakRow: [false],
      docId: [null],
      docTitle: [null],
      docError: [false],
      isBrowsed: [false],
      isUploaded: [false],
      hasPhoto: [null],
      docToUpload: [null],
      required: [false],
      uploadedFile: [null]
    });
  }  

  declarationFormControls() {
    this.declarationForm = this._formBuilder.group({
      declarationByStudent: [null],
      declarationByGuardian: [null],
      declarationByStudentParent: [null],
      isConfidential: [null],
      declarationPlace: [null],
    });
  }

  openInfoDialog(data:any) {

    let dialogRef = this.dialog.open(InfoDialogComponent, {
      disableClose: data.required,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });

    let modalTitle = 'Form Filling Instructions';
    if (!globalFunctions.isEmpty(data.label)) {
      modalTitle = data.label;
    }

    let yesText = 'OK';
    if (!globalFunctions.isEmpty(data.confirmLabel)) {
      yesText = data.confirmLabel;
    }

    dialogRef.componentInstance.modalTitle = modalTitle;
    dialogRef.componentInstance.innerHtmlMsg = data.value;
    dialogRef.componentInstance.yesText = yesText;
    dialogRef.componentInstance.dialogRef = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'ok') {

      }
    });
  }  

  _openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
    setTimeout(() => this._input.nativeElement.focus());
  }

  _closeCalendar(e) {
    setTimeout(() => this._input.nativeElement.blur());
  }

  _openCalendarAddhar(picker: MatDatepicker<Date>) {
    picker.open();
    setTimeout(() => this._inputAdhar.nativeElement.focus());
  }

  _closeCalendarAddhar(e) {
    setTimeout(() => this._inputAdhar.nativeElement.blur());
  }

  _openIssueDateCalendar(picker: MatDatepicker<Date>) {
    picker.open();
    setTimeout(() => this._issueDateInput.nativeElement.focus());
  }

  _closeIssueDateCalendar(e) {
    setTimeout(() => this._issueDateInput.nativeElement.blur());
  }

  _openExpiryDateCalendar(picker: MatDatepicker<Date>) {
    picker.open();
    setTimeout(() => this._expiryDateInput.nativeElement.focus());
  }

  _closeExpiryDateCalendar(e) {
    setTimeout(() => this._expiryDateInput.nativeElement.blur());
  }

  setCoursesListValues(formData:any) {

    this.coursesList = formData.coursesList.list;
    this.coursesBunch = [];
    this.preferenceAray = [];

    let loopIdx = 0;
    let preference = 0;
    this.coursesList.forEach((course, index) => {
     
      preference = preference+1;
     
      this.preferenceAray.push(preference);

      if (index != 0 && index % 2 == 0) {
        loopIdx = loopIdx + 1;
      }
      if (typeof this.coursesBunch[loopIdx] === 'undefined') {
        this.coursesBunch[loopIdx] = [];
      }
      course.courseErr = false;
      this.coursesBunch[loopIdx].push(course);
    });
  }

  setSubjectSelectionValues(formData:any) {

    this.subjectSelectionList = formData.subjectSelection;

    this.subjectSelectionList.forEach((details, index) => {

      details.subjSelctnErr = false;
      
      let preference = 0;
      let preferenceAray;
      preferenceAray = [];
      details.subjectsList.forEach((subj, subjIndex) => {

        subj.subjectErr = false;
        preference = preference+1;
        preferenceAray.push(preference);
      });

      details.preferenceAray = preferenceAray;

      if (details.type == 'singleChoice') {

        let allSubjectsList = [];
        let loopIdx = 0;
        details.subjectsList.forEach((subj, subjIndex) => {

          if (subjIndex != 0 && subjIndex % 4 == 0) {
            loopIdx = loopIdx + 1;
          }
          if (typeof allSubjectsList[loopIdx] === 'undefined') {
            allSubjectsList[loopIdx] = [];
          }
          allSubjectsList[loopIdx].push(subj);
        });

        details.subjectsListBunch = allSubjectsList;
      }
    });
  }

  onSelectSubject(subjSelectnIndex:number, subjIndex:number, checked) {

    this.subjectSelectionList[subjSelectnIndex]['subjSelctnErr'] = false;
    this.subjectSelectionList[subjSelectnIndex]['maxChoices'] = false;

    this.subjectSelectionList[subjSelectnIndex]['subjectsList'][subjIndex].isSelected = checked; 
  }

  onSelectRadioSubject(subjSelectnIndex:number, subjBunchIndx:number, subjIndx:number) {

    this.subjectSelectionList[subjSelectnIndex]['subjSelctnErr'] = false;

    this.subjectSelectionList[subjSelectnIndex]['subjectsListBunch'].forEach((subjSelectn, subjSelectnInx) => {
   
      subjSelectn.forEach((subj, subjInx) => {
        subj.isSelected = false;
      });
    });

    this.subjectSelectionList[subjSelectnIndex]['subjectsListBunch'][subjBunchIndx][subjIndx].isSelected = true;
    
    // this.subjectSelectionList[subjSelectnIndex]['subjSelctnErr'] = false;

    // this.subjectSelectionList[subjSelectnIndex]['subjectsList'].forEach((subj, subjInx) => {

    //   subj.isSelected = false;

    //   if ( subjIndex == subjInx) {
    //     subj.isSelected = true;
    //   }
    // });
  }

  onSelectSubjectPreference(preference: number, subjIndex: number, subjSelectnIndex: number) {

    this._snackBarMsgComponent.closeSnackBar();
    this.subjectSelectionList[subjSelectnIndex]['firstPrefNotSeltd'] = false;
    this.subjectSelectionList[subjSelectnIndex]['subjSelctnErr'] = false;
    this.subjectSelectionList[subjSelectnIndex]['minReqPreference'] = false;
    this.subjectSelectionList[subjSelectnIndex]['maxReqPreference'] = false;
    this.subjectSelectionList[subjSelectnIndex]['subjectsList'][subjIndex]['subjectErr'] = false;
    this.subjectSelectionList[subjSelectnIndex]['subjectsList'][subjIndex]['preference'] = preference;
  }

  onSubjectSelectionSubmit(stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    let validate = this.validateSubjectSelection();
    if (validate.err) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    } else {
      this.goToNextStep(stepper, tab);
    }
  }

  validateSubjectSelection() {

    let err = false;
    
    this.subjectSelectionList.forEach((details) => {
   
      details.subjSelctnErr = false;

      if (details.type == 'singleChoice') {
        
        // let subjSelected = false;
        // details.subjectsList.forEach((subj) => {
      
        //   if (subj.isSelected) {
        //     subjSelected = true;
        //   }
        // });

        // if (!subjSelected) {
        //   err = true;
        //   details.subjSelctnErr = true;
        // }

        let subjSelected = false;
        details.subjectsListBunch.forEach((subjectsLst, subjectsListBunchInx) => {
        
          subjectsLst.forEach((subj, subjInx) => {

            if (subj.isSelected) {
              subjSelected = true;
            }
          });
        });

        if (!subjSelected) {
          err = true;
          details.subjSelctnErr = true;
        }

      } else if (details.type == 'multichoicePreference') {

        let preferenceArray = {};
        let selectedPreference = 0;
        details.doublePreference = false;
        details.subjectsList.forEach((subj) => {
      
          subj.subjectErr = false;
          if (!globalFunctions.isEmpty(subj.preference)) {
      
            selectedPreference++;

            if (preferenceArray[subj.preference]) {
      
              err = true;      
              details.doublePreference = true;
            
            } else {
      
              preferenceArray[subj.preference] = subj.preference;
            }
          }
        });

        if (selectedPreference == 0) {
          err = true;
          details.subjSelctnErr = true;
        }

        details.firstPrefNotSeltd = false;
        let firstPrefNotSeltd = true
        Object.keys(preferenceArray).forEach(pref => {
          if (pref == '1') {
            firstPrefNotSeltd = false;
          }
        });

        if (firstPrefNotSeltd) {
          err = true;          
          details.firstPrefNotSeltd = true;
        }

        details.minReqPreference = false;
        let selectedPreferences = Object.keys(preferenceArray).length;
        if (selectedPreferences < details.typeConfig.minSelections) {
          err = true;
          details.minReqPreference = true;
          details.minReqPreferenceMsg = 'Minimum ' + details.typeConfig.minSelections + ' preferences are required';
        }

        details.maxReqPreference = false;
        if (selectedPreferences > details.typeConfig.maxSelections) {
          err = true;
          details.maxReqPreference = true;
          details.maxReqPreferenceMsg = 'Maximum ' + details.typeConfig.maxSelections + ' preferences are allowed';
        }

      } else if (details.type == 'multichoice') {

        let selectedSubjcts = 0;
        let subjSelected = false;        
        details.subjectsList.forEach((subj) => {
      
          if (subj.isSelected) {
            selectedSubjcts++;
            subjSelected = true;
          }
        });

        if (!subjSelected) {
          err = true;
          details.subjSelctnErr = true;
        }        

        details.maxChoices = false;
        if (details.typeConfig.totalChoiceMatch !== undefined) {
          details.typeConfig.totalChoices = details.typeConfig.totalChoiceMatch;
          if (selectedSubjcts < details.typeConfig.totalChoiceMatch) {
            err = true;
            details.maxChoices = true;
            details.maxChoicesMsg = 'Maximum ' + details.typeConfig.totalChoices + ' choice/s are allowed';
          }
        }
        if (selectedSubjcts > details.typeConfig.totalChoices) {
          err = true;
          details.maxChoices = true;
          details.maxChoicesMsg = 'Maximum ' + details.typeConfig.totalChoices + ' choice/s are allowed';
        }
      }
    });

    return {
     err: err, 
    }
  }    

  setCategoryFormValues(formData:any) {

    this.subCategoryList = formData?.categories?.admissionSubCategories?.list;

    if (this.showSubCategories && !globalFunctions.isEmpty(this.subCategoryList)) {

      this.subCategoryBunch = [];
      this.subCategoryReverseArray = {};

      let loopIdx = 0;
      let listInColumns = parseInt(formData?.categories?.admissionSubCategories?.listInColumns);
      this.subCategoryList.forEach((details, index) => {

        this.subCategoryReverseArray[details?.admissionSubCategoryId] = details;

        details.showSubCatDocumentUpload = false;
        details.subCatHasUploadedDoc = false;
        details.showDocResetBtn = false;
        details.subCatDocError = false;
        details.subCatDocReq = false;
        details.subCatDocBrowsed = false;
        details.subCatDocUploading = false;
        details.subCatDocToUpload = null;
        details.subCatDocUploadPercent = null;

        if (index != 0 && index % listInColumns == 0) {
          loopIdx = loopIdx + 1;
        }
        if (typeof this.subCategoryBunch[loopIdx] === 'undefined') {
          this.subCategoryBunch[loopIdx] = [];
        }
        this.subCategoryBunch[loopIdx].push(details);
      });
  
      if (!globalFunctions.isEmpty(formData?.applyingSubCategories)) {

        formData.applyingSubCategories.forEach((appliedSubCategory) => {

          this.subCategoryList.forEach((details, index) => {

            if (details.admissionSubCategoryId == appliedSubCategory) {
              details.isSelected = true;
              if (details.documentUpload.display) {
                details.showSubCatDocumentUpload = true;
                if (details.documentUpload.required) {
                  details.subCatDocReq = true;
                }
                if (!globalFunctions.isEmpty(details.documentUpload.documentUrl)) {
                  details.subCatHasUploadedDoc = true;
                }
              }
            }
          });
        });
      }
    }

    let candidateFromReq:any;
    if (formData?.candidateFromRequired && formData?.candidateFromDisplay) {
      candidateFromReq = Validators.required;
    }

    let inhouseInfoReq:any;
    if (formData?.inhouseInfo?.display && formData?.inhouseInfo?.required) {
      inhouseInfoReq = Validators.required;
    }

    let showCatDocumentUpload = false;
    let catHasUploadedDoc = false;
    let catDocReq = false;
    let catDocumentUrl = null;
    let catDocumentUploadObj = null;
    if (!globalFunctions.isEmpty(formData?.categories?.admissionCategories?.groups)) {

      formData.categories.admissionCategories.groups.forEach((catGrp) => {
      
        catGrp?.list.forEach((details) => {

          details.isSelected = false;
          if (formData?.applyingCategories == details.admissionCategoryId) {
            
            details.isSelected = true;
            this.selectedCatName = details.admissionCategoryName;

            if (details.documentUpload.display) {
              
              showCatDocumentUpload = true;
              catDocumentUploadObj = details?.documentUpload;
              
              if (details.documentUpload.required) {
                catDocReq = true;
              }

              if (!globalFunctions.isEmpty(details?.documentUpload?.documentUrl)) {
                catDocumentUrl = details.documentUpload.documentUrl;
                catHasUploadedDoc = true;
              }
            }

            if (details.askQuestion) {
              this.showCategoryQuestions = true;
              this.setCategoryQuestionsRows(true);
            }
          }
        });
      });
    }

    this.categoryForm = this._formBuilder.group({
      applyingCategories: [formData?.applyingCategories, Validators.required],
      otherCategory: [formData?.categoryText],
      showCatDocumentUpload: [showCatDocumentUpload],
      catDocReq: [catDocReq],
      catDocumentUploadObj: [catDocumentUploadObj],
      catDocumentUrl: [catDocumentUrl],
      catDocToUpload: [null],
      catHasUploadedDoc: [catHasUploadedDoc],
      showDocResetBtn: [false],
      catDocError: [false],
      catDocBrowsed: [false],
      catDocUploadPercent: [null],
      catDocUploading: [false], 
      applyingSubCategories: [formData?.applyingSubCategories],
      admissionType: [formData?.admissionType],
      candidateFrom: [formData?.candidateFrom, candidateFromReq],
      showSubCatInRadio: [formData?.showSubCatInRadio],
      isInHouse: [formData?.inhouseInfo?.value, inhouseInfoReq]
    });

    this.categoryFormValues = this.categoryForm.getRawValue();    
  }

  setBankInfoValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.bankInfo)) {
      this.bankInfoForm = this._formBuilder.group({
        accountNo: [formData.bankInfo.accountNo, Validators.required],
        bankName: [formData.bankInfo.bankName, Validators.required],
        bankHolderName: [formData.bankInfo.bankHolderName, Validators.required],
        branch: [formData.bankInfo.branch, Validators.required],
        ifsc: [formData.bankInfo.ifsc, Validators.required],
        micr: [formData.bankInfo.micr]
      });

      this.bankInfoFormValues = this.bankInfoForm.value;
    }
    this.bankInfoForm.disable();
  }

  setPersonalInfoValues(formData: any) {
    if (!globalFunctions.isEmpty(formData.personalInfo)) {

      let grNoReq: any;
      if (formData.personalInfo.showGrNo && formData.personalInfo.grNoReq) {
        grNoReq = Validators.required;
      }
      let instituteStudentIdReq: any;
      if (formData.personalInfo.showInstituteStudentId && formData.personalInfo.instituteStudentIdReq) {
        instituteStudentIdReq = Validators.required;
      }

      let fullNameMarksheetReq: any;
      if (formData.personalInfo.showFullNameMarksheet && formData.personalInfo.fullNameMarksheetReq) {
        fullNameMarksheetReq = Validators.required;
      }

      let MaindenNameReq: any;
      if (formData.personalInfo.showMaindenName && formData.personalInfo.MaindenNameReq) {
        MaindenNameReq = Validators.required;
      }

      let firstNameReq: any;
      if (formData.personalInfo.firstNameShow && formData.personalInfo.firstNameReq) {
        firstNameReq = Validators.required;
      }

      let abcIdReq: any;
      if (formData.personalInfo.abcIdShow && formData.personalInfo.abcIdRequired) {
        abcIdReq = Validators.required;
      }
      let middleNameReq: any;
      if (formData.personalInfo.middleNameShow && formData.personalInfo.middleNameReq) {
        middleNameReq = Validators.required;
      }
      let lastNameReq: any;
      if (formData.personalInfo.lastNameShow && formData.personalInfo.lastNameReq) {
        lastNameReq = Validators.required;
      }
      let fatherNameReq: any;
      if (formData.personalInfo.fatherNameShow && formData.personalInfo.fatherNameReq) {
        fatherNameReq = Validators.required;
      }
      let motherNameReq: any;
      if (formData.personalInfo.motherNameShow && formData.personalInfo.motherNameReq) {
        motherNameReq = Validators.required;
      }

      let changeInName: string = 'no';
      if (formData.personalInfo.nameChange) {
        changeInName = 'yes';
      }

      let bloodGroupReq: any;
      if (formData.personalInfo.bloodGroup.required) {
        bloodGroupReq = Validators.required;
      }
      let aadharNoReq: any;
      if (formData.personalInfo.aadharNo.required && formData.personalInfo.aadharNo.display) {
        aadharNoReq = Validators.required;
      }

      let udiseNoReq: any;
      if (formData.personalInfo.showUdiseNo && formData.personalInfo.udiseNoReq) {
        udiseNoReq = Validators.required;
      }

      let emailReq: any;
      if (formData.personalInfo.emailShow && formData.personalInfo.emailRequired) {
        emailReq = Validators.required;
      }
      let genderReq: any;
      if (formData.personalInfo.gender.required && formData.personalInfo.gender.display) {
        genderReq = Validators.required;
      }

      let nationalityReq: any;
      if (formData.personalInfo.showNationality && formData.personalInfo.nationalityRequired) {
        nationalityReq = Validators.required;
      }
      let domicileReq: any;
      if (formData.personalInfo.domicile.required && formData.personalInfo.domicile.display) {
        domicileReq = Validators.required;
      }
      let motherToungeReq: any;
      if (formData.personalInfo.showMotherTounge && formData.personalInfo.motherToungeReq) {
        motherToungeReq = Validators.required;
      }
      let sssMidReq: any;
      if (formData.personalInfo.showSssMid && formData.personalInfo.sssMidReq) {
        sssMidReq = Validators.required;
      }
      let familyIdReq: any;
      if (formData.personalInfo.showFamilyId && formData.personalInfo.familyIdReq) {
        familyIdReq = Validators.required;
      }

      let placeOfBirthReq: any;
      if (formData.personalInfo.placeOfBirth.required && formData.personalInfo.placeOfBirth.display) {
        placeOfBirthReq = Validators.required;
      }

      let talukaOfBirthReq: any;
      if (formData.personalInfo.talukaOfBirth.required && formData.personalInfo.talukaOfBirth.display) {
        talukaOfBirthReq = Validators.required;
      }
      let stateOfBirthReq: any;
      if (formData.personalInfo.stateOfBirth.required && formData.personalInfo.stateOfBirth.display) {
        stateOfBirthReq = Validators.required;
      }
      let countryOfBirthReq: any;
      if (formData.personalInfo.countryOfBirth.required && formData.personalInfo.countryOfBirth.display) {
        countryOfBirthReq = Validators.required;
      }
      let districtOfBirthReq: any;
      if (formData.personalInfo.districtOfBirth.required && formData.personalInfo.districtOfBirth.display) {
        districtOfBirthReq = Validators.required;
      }

      let dobReq: any;
      if (formData.personalInfo.dobShow && formData.personalInfo.dobReq) {
        dobReq = Validators.required;
      }

      let aadharDobReq: any;
      if (formData.personalInfo.aadharAgeShow && formData.personalInfo.aadharDobReq) {
        aadharDobReq = Validators.required;
      }

      let categoryReq: any;
      if (formData.personalInfo.category.required && formData.personalInfo.category.display) {
        categoryReq = Validators.required;
      }

      let religionReq: any;
      if (formData.personalInfo.showReligion && formData.personalInfo.religionReq) {
        religionReq = Validators.required;
      }
      let casteReq: any;
      if (formData.personalInfo.showCaste && formData.personalInfo.casteRequired) {
        casteReq = Validators.required;
      }
      let subCasteReq: any;
      if (formData.personalInfo.showSubCaste && formData.personalInfo.subCasteReq) {
        subCasteReq = Validators.required;
      }
      let heightReq: any;
      if (formData.personalInfo.showHeight && formData.personalInfo.heightReq) {
        heightReq = Validators.required;
      }
      let weightReq: any;
      if (formData.personalInfo.showweight && formData.personalInfo.weightReq) {
        weightReq = Validators.required;
      }

      let nadIdReq: any;
      if (formData.personalInfo.nadId.display && formData.personalInfo.nadId.required) {
        nadIdReq = Validators.required;
      }
      let alternateNoReq: any;
      if (formData.personalInfo.alternateNo.display && formData.personalInfo.alternateNo.required) {
        alternateNoReq = Validators.required;
      }
      let maritalStatusReq: any;
      if (formData.personalInfo.maritalStatus.display && formData.personalInfo.maritalStatus.required) {
        maritalStatusReq = Validators.required;
      }
      let isForeignStudentReq: any;
      if (formData.personalInfo.showPassportDetails && formData.personalInfo.isForeignStudentReq) {
        isForeignStudentReq = Validators.required;
      }

      let disabilityReq: any;
      if (formData.personalInfo.disability.display && formData.personalInfo.disability.required) {
        disabilityReq = Validators.required;
      }

      let scholarshipReq: any;
      if (formData.personalInfo.scholarship.display && formData.personalInfo.scholarship.required) {
        scholarshipReq = Validators.required;
      }
      this.disabilityArray = formData.personalInfo.disability.list;
      this.disabilityList = formData.personalInfo.disability.list;

      let candidateFromReq: any;
      if (formData.personalInfo.candidate.candidateFromDisplay && formData.personalInfo.candidate.candidateFromRequired) {
        candidateFromReq = Validators.required;
      }

      let hostelRequiredReq: any;
      if (formData.personalInfo.hostelRequired.display && formData.personalInfo.hostelRequired.required) {
        hostelRequiredReq = Validators.required;
      }

      let mobileNoReq: any;
      if (formData.personalInfo.showMobileNo && formData.personalInfo.mobileNoReq) {
        mobileNoReq = Validators.required;
      }

      let resAddress = formData.personalInfo.addressInfo.fields.residentialAddress.fields;
      let resAddressReq: any;
      let pincodeValidator: any;
      let resStateReq: any;
      let resStreetReq: any;
      let resAreaReq: any;
      let resDistrictReq: any;
      let rescityReq: any;
      let resIsForeignStudentReq: any;
      let resnearByRailwayStationReq: any;
      let respincodeReq: any;
      let natAddress = formData.personalInfo.addressInfo.fields.nativeAddress.fields;
      let natnearByRailwayStationReq: any;
      let natAddressReq: any;
      let natStateReq: any;
      let natStreetReq: any;
      let natcityReq: any;
      let natpincodeReq: any;
      let natAreaReq: any;
      let natDistrictReq: any;

      if (formData.personalInfo.addressInfo.display) {

        if (formData.personalInfo.addressInfo.fields.residentialAddress.display) {

          if (resAddress.isForeignStudent.required && resAddress.isForeignStudent.display) {
            resIsForeignStudentReq = Validators.required;
          }
          if (resAddress.address.required && resAddress.address.display) {
            resAddressReq = Validators.required;
          }
          if (resAddress.street.required && resAddress.street.display) {
            resStreetReq = Validators.required;
          }
          if (resAddress.state.required && resAddress.state.display) {
            resStateReq = Validators.required;
          }
          if (resAddress.city.required && resAddress.city.display) {
            rescityReq = Validators.required;
          }
          if (resAddress.district.required && resAddress.district.display) {
            resDistrictReq = Validators.required;
          }
          if (resAddress.area.required && resAddress.area.display) {
            resAreaReq = Validators.required;
          }
          if (resAddress.nearByRailwayStation.required && resAddress.nearByRailwayStation.display) {
            resnearByRailwayStationReq = Validators.required;
          }
          if (resAddress.pincode.required && resAddress.pincode.display) {
            respincodeReq = Validators.required;
          }
          let pincodeValidator: any;
          if (resAddress.isForeignStudent.required && resAddress.isForeignStudent.display && resAddress.isForeignStudent.value == 'no') {
            pincodeValidator = Validators.minLength(6), Validators.maxLength(6);
          }
        }

        if (formData.personalInfo.addressInfo.fields.nativeAddress.display) {

          if (natAddress.address.required && natAddress.address.display) {
            natAddressReq = Validators.required;
          }
          if (natAddress.area.required && natAddress.area.display) {
            natAreaReq = Validators.required;
          }
          if (natAddress.district.required && natAddress.district.display) {
            natDistrictReq = Validators.required;
          }
          if (natAddress.street.required && natAddress.street.display) {
            natStreetReq = Validators.required;
          }
          if (natAddress.state.required && natAddress.state.display) {
            natStateReq = Validators.required;
          }
          if (natAddress.city.required && natAddress.city.display) {
            natcityReq = Validators.required;
          }
          if (natAddress.nearByRailwayStation.required && natAddress.nearByRailwayStation.display) {
            natnearByRailwayStationReq = Validators.required;
          }
          if (natAddress.pincode.required && natAddress.pincode.display) {
            natpincodeReq = Validators.required;
          }
        }
      }

      this.personalInfoForm = this._formBuilder.group({
        grNo: [formData.personalInfo.grNo, Validators.compose([grNoReq, Validators.minLength(formData.personalInfo.grNoMinLength)])],
        instituteStudentId: [formData.personalInfo.instituteStudentId, instituteStudentIdReq],
        fullNameMarksheet: new UntypedFormControl({ value: formData.personalInfo.fullNameMarksheet, disabled: !formData.personalInfo.isFullNameMarksheetEditable }, Validators.compose([fullNameMarksheetReq])),
        MaindenName: new UntypedFormControl({ value: formData.personalInfo.MaindenName, disabled: !formData.personalInfo.isMaindenNameEditable }, Validators.compose([MaindenNameReq])),
        changeInName: [changeInName],
        nameChange: [formData.personalInfo.nameChange],
        abcId: [formData.personalInfo.abcId, abcIdReq],
        firstName: new UntypedFormControl({ value: formData.personalInfo.firstName, disabled: !formData.personalInfo.isFirstNameEditable }, Validators.compose([firstNameReq])),
        middleName: new UntypedFormControl({ value: formData.personalInfo.middleName, disabled: !formData.personalInfo.isMiddleNameEditable }, Validators.compose([middleNameReq])),
        lastName: new UntypedFormControl({ value: formData.personalInfo.lastName, disabled: !formData.personalInfo.isLastNameEditable }, Validators.compose([lastNameReq])),
        fatherName: new UntypedFormControl({ value: formData.personalInfo.fatherName, disabled: !formData.personalInfo.isFatherNameEditable }, Validators.compose([fatherNameReq])),
        motherName: new UntypedFormControl({ value: formData.personalInfo.motherName, disabled: !formData.personalInfo.isMotherNameEditable }, Validators.compose([motherNameReq])),
        bloodGroup: [formData.personalInfo.bloodGroup.value, bloodGroupReq],
        email: new UntypedFormControl({ value: formData.personalInfo.email, disabled: !formData.personalInfo.isEmailEditable }, Validators.compose([emailReq, emailValidator])),
        // email: [formData.personalInfo.email, Validators.compose([emailReq, emailValidator])],
        gender: new UntypedFormControl({ value: formData.personalInfo.gender.value, disabled: !formData.personalInfo.gender.isEditable }, Validators.compose([genderReq])),
        nationality: new UntypedFormControl({ value: this.nationality, disabled: false }, Validators.compose([nationalityReq])),
        motherTounge: [formData.personalInfo.motherTounge, motherToungeReq],
        sssMid: [formData.personalInfo.sssMid, sssMidReq],
        familyId: [formData.personalInfo.familyId, familyIdReq],
        placeOfBirth: [formData.personalInfo.placeOfBirth.value, placeOfBirthReq],
        talukaOfBirth: [formData.personalInfo.talukaOfBirth.value, talukaOfBirthReq],
        stateOfBirth: [formData.personalInfo.stateOfBirth.value, stateOfBirthReq],
        countryOfBirth: [formData.personalInfo.countryOfBirth.value, countryOfBirthReq],
        districtOfBirth: [formData.personalInfo.districtOfBirth.value, districtOfBirthReq],
        dob: new UntypedFormControl({ value:  moment(formData.personalInfo.dob), disabled: !formData.personalInfo.isDobEditable }, Validators.compose([dobReq])),
        aadharDob: [moment(formData.personalInfo.aadharDob), aadharDobReq],
        age: [formData.personalInfo.age],
        aadharAge: [formData.personalInfo.aadharAge],
        religionId: [formData.personalInfo.religionId, religionReq],
        casteId: [formData.personalInfo.casteId, casteReq],
        subCaste: [formData.personalInfo.subCaste, subCasteReq],
        weight: [formData.personalInfo.weight, weightReq],
        height: [formData.personalInfo.height, heightReq],
        domicile: [formData.personalInfo.domicile.value, domicileReq],
        aadharNo: [formData.personalInfo.aadharNo.value, Validators.compose([aadharNoReq, Validators.minLength(12), Validators.maxLength(12)])],
        mobileNo: new UntypedFormControl({ value: formData.personalInfo.mobileNo, disabled: !formData.personalInfo.isMobileEditable }, Validators.compose([mobileNoReq])),
        udiseNo: [formData.personalInfo.udiseNo, udiseNoReq],
        nadId: [formData.personalInfo.nadId.value,Validators.compose([nadIdReq, Validators.minLength(formData.personalInfo.nadId.minLength)])],
        alternateNo: [formData.personalInfo.alternateNo.value, Validators.compose([alternateNoReq, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
        maritalStatus: [formData.personalInfo.maritalStatus.value, maritalStatusReq],
        isForeignStudent: [formData.personalInfo.isForeignStudent, isForeignStudentReq],
        passportDetails: this._formBuilder.group({
          expiryDate: [moment(formData.personalInfo.passportDetails.expiryDate)],
          issueDate: [moment(formData.personalInfo.passportDetails.issueDate)],
          passportNo: [formData.personalInfo.passportDetails.passportNo]
        }),
        isDisability: [formData.personalInfo.disability.selectedValue, disabilityReq],
        isScholarship: [formData.personalInfo.scholarship.selectedValue, scholarshipReq],
        scholarship: this._formBuilder.group({
          scholarshipType: formData.personalInfo.scholarship.value,
          certificate: null,
          scholarshipDoc: null,
          scholarshipDocReq: formData.personalInfo.scholarship.documentUpload.required,
          scholarshipDocError: formData.personalInfo.scholarship.documentUpload.required,
          scholarshipDocBrowsed: [false],
          showDocResetBtn: [false],
          scholarshipDocumentUrl: formData.personalInfo.scholarship.documentUpload.value,
          scholarshipDocToUpload: [null],
          scholarshipHasUploadedDoc: [false],
        }),
        disability: this._formBuilder.group({
          disabilityType: formData.personalInfo.disability.value,
          percentage: formData.personalInfo.disability.percentage.value,
          percentageReq: formData.personalInfo.disability.percentage.required,
          certificate: null,
          disabilityDoc: null,
          disabilityDocReq: formData.personalInfo.disability.documentUpload.required,
          disabilityDocError: formData.personalInfo.disability.documentUpload.required,
          disabilityDocBrowsed: [false],
          showDocResetBtn: [false],
          disabilityDocumentUrl: formData.personalInfo.disability.documentUpload.value,
          disabilityDocToUpload: [null],
          disabilityHasUploadedDoc: [false],
        }),
        candidateFrom: [formData.personalInfo.candidate.candidateFrom, candidateFromReq],
        hostelRequired: [formData.personalInfo.hostelRequired.value, hostelRequiredReq],
        residentialAddress: this._formBuilder.group({
          address: [resAddress.address.value, resAddressReq],
          street: [resAddress.street.value, resStreetReq],
          district: [resAddress.district.value, resDistrictReq],
          area: [resAddress.area.value, resAreaReq],
          state: new UntypedFormControl({ value: resAddress.state.value, disabled: true }, resStateReq),
          city: new UntypedFormControl({ value: resAddress.city.value, disabled: true }, rescityReq),
          nearByRailwayStation: [resAddress.nearByRailwayStation.value, resnearByRailwayStationReq],
          pincode: [resAddress.pincode.value, Validators.compose([pincodeValidator])],
        }),
        nativeAddress: this._formBuilder.group({
          address: [natAddress.address.value, natAddressReq],
          area: [natAddress.area.value, natAreaReq],
          district: [natAddress.district.value, natDistrictReq],
          street: [natAddress.street.value, natDistrictReq],
          state: new UntypedFormControl({ value: natAddress.state.value, disabled: true }, natStateReq),
          city: new UntypedFormControl({ value: natAddress.city.value, disabled: true }, natcityReq),
          nearByRailwayStation: [natAddress.nearByRailwayStation.value, natnearByRailwayStationReq],
          pincode: [natAddress.pincode.value, Validators.compose([pincodeValidator])],
        }),
        category: this._formBuilder.group({
          applyingCategories: [formData.personalInfo.category.applyingCategories, categoryReq],
          categoryText: [formData.personalInfo.category.categoryText],
        }),
        categoryQuestions: this._formBuilder.array([
          this.categoryQuestionsRows()
        ]),
        studentPresentStatus: this._formBuilder.array([
          this.studentPresentStatusRows()
        ]),
      });

      if (!globalFunctions.isEmpty(formData.personalInfo.dob)) {
        let calculatedAge = globalFunctions.calculate_age(formData.personalInfo.dob);
        if (!globalFunctions.isEmpty(calculatedAge) && (calculatedAge.status == 1) && (!globalFunctions.isEmpty(calculatedAge.years))) {
          this.personalInfoForm.controls['age'].setValue(calculatedAge.years, { emitEvent: false });
        } else {
          this.personalInfoForm.controls['age'].setValue('', { emitEvent: false });
        }
      }

      if (!globalFunctions.isEmpty(formData.personalInfo.aadharDob)) {
        let calculatedAadharAge = globalFunctions.calculate_age(formData.personalInfo.aadharDob);
        if (!globalFunctions.isEmpty(calculatedAadharAge) && (calculatedAadharAge.status == 1) && (!globalFunctions.isEmpty(calculatedAadharAge.years))) {
          this.personalInfoForm.controls['aadharAge'].setValue(calculatedAadharAge.years, { emitEvent: false });
        } else {
          this.personalInfoForm.controls['aadharAge'].setValue('', { emitEvent: false });
        }
      }

      if (!globalFunctions.isEmpty(formData.personalInfo.nationality)) {
        this.personalInfoForm.controls['nationality'].setValue(formData.personalInfo.nationality);
      }

      if (!globalFunctions.isEmpty(formData.personalInfo.disability.documentUpload.value)) {
        this.personalInfoForm.controls['disability']['controls'].disabilityHasUploadedDoc.setValue(true, { emitEvent: false });
      }

      if (!globalFunctions.isEmpty(formData.personalInfo.scholarship.documentUpload.value)) {
        this.personalInfoForm.controls['scholarship']['controls'].scholarshipHasUploadedDoc.setValue(true, { emitEvent: false });
      }

      this.personalInfoFormValues = this.personalInfoForm.getRawValue();
    }

    this.personalInfoFormValueChanged();

    if (formData.personalInfo.categoryQuestions.display) {
      this.showCategoryQuestions = true;
      this.setCategoryQuestionsRows(true);
    }

    if (formData?.personalInfo?.studentPresentStatus?.display) {
      this.setStudentPresentStatusRows();
      this.showStudentPresentStatus = true;
    }
  }
  
  categoryQuestionsRows() : UntypedFormGroup {
    return this._formBuilder.group({
      label: [null],
      chkBoxErr: [false],
      requiredRow: [false],
      options: [null],
      chkBox: [null],
      radioBtn: [null],
      value: [null],
    });
  }

  studentPresentStatusRows() : UntypedFormGroup {
    return this._formBuilder.group({
          label: [null],
          display: [false],
          requiredRow: [false],
          options: [null],
          chkBox: [null],
      chkBoxErr: [false],
          radioBtn: [null],
          input: [null],
          txtArea: [null],
          selectBox: [null],
      fieldValue: [null],
    });
  }

  setStudentPresentStatusRows() {
   
    if (!globalFunctions.isEmpty(this.formData?.personalInfo?.studentPresentStatus?.fields)) {
      
      const control = <UntypedFormArray>this.personalInfoForm.controls.studentPresentStatus;
      control.controls = [];

      this.formData?.personalInfo?.studentPresentStatus?.fields.forEach((itemRow) => {
        let isRequired:any;
        let itemRowReq:boolean = false;
        if (itemRow?.required) {
          itemRowReq = true;
          isRequired = Validators.required;
        }

        const control = <UntypedFormArray>this.personalInfoForm.controls.studentPresentStatus;

        let row = this._formBuilder.group({
          fieldValue    : [itemRow.value, isRequired],
              requiredRow   : [itemRowReq],
              label         : [itemRow.lable],
              options       : [itemRow.options],
              radioBtn      : [itemRow.radioBtn],
              chkBox        : [itemRow.chkBox],
          chkBoxErr     : [false],
              input         : [itemRow.input],
              txtArea       : [itemRow.txtArea],
              selectBox     : [itemRow.selectBox],
              display       : [itemRow.display],
        });

        control.push(row);
      });
    }
} 

  setCategoryQuestionsRows(setRequired:boolean = false) {

    if (!globalFunctions.isEmpty(this.formData.personalInfo.categoryQuestions.list)) {

      const control = <UntypedFormArray>this.personalInfoForm.controls.categoryQuestions;
      control.controls = [];

      this.formData.personalInfo.categoryQuestions.list.forEach((itemRow) => {

        let isRequired:any;
        let itemRowReq:boolean = false;
        if (itemRow.required && setRequired) {
          itemRowReq = true;
          isRequired = Validators.required;
        }

        if (!globalFunctions.isEmpty(itemRow.replaceLabelWith)) {
          // itemRow.label = itemRow.replaceLabelWith.replace(/ *\([^)]*\) */g, " ("+this.selectedCatName+") ");
          itemRow.label = itemRow.replaceLabelWith.replace('{{catName}}', this.selectedCatName);
        }

        const control = <UntypedFormArray>this.personalInfoForm.controls.categoryQuestions;

        let row = this._formBuilder.group({
          requiredRow: [itemRowReq],
          label: [itemRow.label],
          options: [itemRow.options],
          radioBtn: [itemRow.radioBtn],
          chkBox: [itemRow.chkBox],
          chkBoxErr: [false],
          value: [itemRow.value, isRequired],
        });

        control.push(row);
      });
    }
  }  

  onChangeQuestions(qstIndx:number, optIndx:number, checked: boolean) {

    this.personalInfoForm.controls.categoryQuestions['controls'][qstIndx]['controls']['options']['value'][optIndx].isSelected = checked;
  }

  onChangePresentStatus(qstIndx:number, optIndx:number, checked: boolean) {

    this.personalInfoForm.controls.studentPresentStatus['controls'][qstIndx]['controls']['options']['value'][optIndx].isSelected = checked;
  }

  personalInfoFormValueChanged() {

    const nameChange = this.personalInfoForm.get('nameChange');
    this.personalInfoForm.get('changeInName').valueChanges.subscribe((mode: string) => {
      if (mode === 'yes') {
        nameChange.setValidators([Validators.required]);
      } else {
        nameChange.clearValidators();
      }
      nameChange.updateValueAndValidity();
    });

    const disability = this.personalInfoForm.get('disability');
   
    this.personalInfoForm.get('isDisability').valueChanges.subscribe((mode: string) => {
      if (mode === 'yes') {
        disability['controls'].disabilityType.setValidators([Validators.required]);

        if(disability['controls'].percentageReq.value == true){
        disability['controls'].percentage.setValidators([Validators.required]);
        }

        if( disability['controls'].disabilityDocReq.value == true){
          this.personalInfoForm.controls['disability']['controls'].disabilityDoc.setValue(true, {emitEvent: false});
        }
      } else {
        disability['controls'].percentage.clearValidators();
        disability['controls'].disabilityType.clearValidators();
        this.personalInfoForm.controls['disability']['controls'].disabilityDoc.setValue(false, {emitEvent: false});
      }

      disability['controls'].percentage.updateValueAndValidity();
      disability['controls'].disabilityType.updateValueAndValidity();
    });

    if (this.personalInfoForm.get('isDisability').value == 'yes') {
      disability['controls'].disabilityType.setValidators([Validators.required]);
      
      if(disability['controls'].percentageReq  == true){
        disability['controls'].percentage.setValidators([Validators.required]);
      }

      if( disability['controls'].disabilityDocReq.value == true){
        this.personalInfoForm.controls['disability']['controls'].disabilityDoc.setValue(true, {emitEvent: false});
      }
      
      disability['controls'].percentage.updateValueAndValidity();
      disability['controls'].disabilityType.updateValueAndValidity();
    }else{
      disability['controls'].percentage.clearValidators();
      disability['controls'].disabilityType.clearValidators();
      this.personalInfoForm.controls['disability']['controls'].disabilityDoc.setValue(false, {emitEvent: false});

      disability['controls'].percentage.updateValueAndValidity();
      disability['controls'].disabilityType.updateValueAndValidity();
      }

    const passportNo = this.personalInfoForm.controls.passportDetails.get('passportNo');
    const issueDate = this.personalInfoForm.controls.passportDetails.get('issueDate');
    const expiryDate = this.personalInfoForm.controls.passportDetails.get('expiryDate');
    this.personalInfoForm.get('isForeignStudent').valueChanges.subscribe((mode: string) => {
      if (mode === 'yes') {
        passportNo.setValidators([Validators.required]);
        issueDate.setValidators([Validators.required]);
        expiryDate.setValidators([Validators.required]);
      } else {
        passportNo.clearValidators();
        issueDate.clearValidators();
        expiryDate.clearValidators();
      }
      passportNo.updateValueAndValidity();
      issueDate.updateValueAndValidity();
      expiryDate.updateValueAndValidity();
    });
  }

  setAddressInfoValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.addressInfo)) {
    
      let resAddress = formData.addressInfo.fields.residentialAddress.fields;
      let resAddressReq:any;
      let isForeignStudentReq: any;
      let resStateReq:any;
      let resAreaReq: any;
      let resStreetReq: any;
      let pincodeValidator: any;
      let rescityReq:any;
      let resdistrictReq: any;
      let resnearByRailwayStationReq:any;
      let respincodeReq:any;
      let natAddress = formData.addressInfo.fields.nativeAddress.fields;      
      let natIsForeignStudentReq:any;   
      let natnearByRailwayStationReq:any;   
      let natAddressReq:any;
      let natStateReq:any;
      let natAreaReq: any;
      let natStreetReq: any;
      let natcityReq:any;
      let natdistrictReq: any;
      let natpincodeReq:any;
      let adhAddress = formData.addressInfo.fields.aadharAddress.fields;    
      let adhnearByRailwayStationReq:any;  
      let adhAddressReq:any;
      let adhStateReq:any;
      let adhcityReq:any;
      let adhpincodeReq:any;
      let adhdistrictReq:any;
     
      if (formData.addressInfo.display) {

        if (formData.addressInfo.fields.residentialAddress.display) {

          if (resAddress.isForeignStudent.required && resAddress.isForeignStudent.display) {
            isForeignStudentReq = Validators.required;
          }       
          if (resAddress.address.required && resAddress.address.display) {
            resAddressReq = Validators.required;
          }
          if (resAddress.area.required && resAddress.area.display) {
            resAreaReq = Validators.required;
          }
          if (resAddress.street.required && resAddress.street.display) {
            resStreetReq = Validators.required;
          }
          if (resAddress.state.required && resAddress.state.display) {
            resStateReq = Validators.required;
          }
          if (resAddress.city.required && resAddress.city.display) {
            rescityReq = Validators.required;
          }
          if (resAddress.district.required && resAddress.district.display) {
            resdistrictReq = Validators.required;
          }
          if (resAddress.nearByRailwayStation.required && resAddress.nearByRailwayStation.display) {
            resnearByRailwayStationReq = Validators.required;
          }
          if (resAddress.pincode.required && resAddress.pincode.display) {
            respincodeReq = Validators.required;
          }
          let pincodeValidator: any;
          if (resAddress.isForeignStudent.required && resAddress.isForeignStudent.display && resAddress.isForeignStudent.value == 'no') {
             pincodeValidator =  Validators.minLength(6), Validators.maxLength(6);
          }
        }
       
        if (formData.addressInfo.fields.nativeAddress.display) { 

          if (natAddress.address.required && natAddress.address.display) {
            natAddressReq = Validators.required;
          }
          if (natAddress.area.required && resAddress.area.display) {
            natAreaReq = Validators.required;
          }
          if (natAddress.street.required && resAddress.street.display) {
            natStreetReq = Validators.required;
          }
          if (natAddress.state.required && natAddress.state.display) {
            natStateReq = Validators.required;
          }
          if (natAddress.city.required && natAddress.city.display) {
            natcityReq = Validators.required;
          }
          if (natAddress.district.required && natAddress.district.display) {
            natdistrictReq = Validators.required;
          }
          if (natAddress.nearByRailwayStation.required && natAddress.nearByRailwayStation.display) {
            natnearByRailwayStationReq = Validators.required;
          }
          if (natAddress.pincode.required && natAddress.pincode.display) {
            natpincodeReq = Validators.required;
          }
        }

        if (formData.addressInfo.fields.aadharAddress.display) {

          if (adhAddress.address.required && adhAddress.address.display) {
            adhAddressReq = Validators.required;
          }
          if (adhAddress.state.required && adhAddress.state.display) {
            adhStateReq = Validators.required;
          }
          if (adhAddress.city.required && adhAddress.city.display) {
            adhcityReq = Validators.required;
          }
          if (adhAddress.pincode.required && adhAddress.pincode.display) {
            adhpincodeReq = Validators.required;
          }
        }
      }

      this.addressInfoForm = this._formBuilder.group({
        residentialAddress: this._formBuilder.group({
          isForeignStudent: [resAddress.isForeignStudent.value, isForeignStudentReq],
          address: [resAddress.address.value, resAddressReq],
          area: [resAddress.area.value, resAreaReq],
          street: [resAddress.street.value, resStreetReq],
          state : new UntypedFormControl({value: resAddress.state.value, disabled: true}, resStateReq),
          city : new UntypedFormControl({value: resAddress.city.value, disabled: true}, rescityReq),
          district: [resAddress.district.value, resdistrictReq],
          nearByRailwayStation: [resAddress.nearByRailwayStation.value, resnearByRailwayStationReq],
          pincode: [resAddress.pincode.value, Validators.compose([pincodeValidator])],
        }),
        nativeAddress: this._formBuilder.group({
          address:[natAddress.address.value, natAddressReq],
          area: [natAddress.area.value, natAreaReq],
          street: [natAddress.street.value, natStreetReq],
          // isForeignStudent: [natAddress.isForeignStudent.value, natIsForeignStudentReq],
          state : new UntypedFormControl({value: natAddress.state.value, disabled: true}, natStateReq),
          city : new UntypedFormControl({value: natAddress.city.value, disabled: true}, natcityReq),
          district: [resAddress.district.value, natdistrictReq],
          nearByRailwayStation: [natAddress.nearByRailwayStation.value, natnearByRailwayStationReq],
          pincode:[natAddress.pincode.value, Validators.compose([pincodeValidator])],
        }),
        aadharAddress: this._formBuilder.group({
          address:[adhAddress.address.value, adhAddressReq],
          state : new UntypedFormControl({value: adhAddress.state.value, disabled: true}, adhStateReq),
          city : new UntypedFormControl({value: adhAddress.city.value, disabled: true}, adhcityReq),
          pincode:[adhAddress.pincode.value, Validators.compose([adhpincodeReq, Validators.minLength(6), Validators.maxLength(6) ])],
        })
      });
      
      this.addressInfoFormValues = this.addressInfoForm.value;
      this.addressInfoForm.disable();
    }
  }


  setGuardianInfoValues(formData: any) {

    if (!globalFunctions.isEmpty(formData.guardianInfo)) {
      let fatherDetails = formData?.guardianInfo?.membersInfo?.fatherDetails;

      let fatherAnnualIncomeReq: any;
      if (fatherDetails?.annualIncomeRequired && fatherDetails?.annualIncomeDisplay) {
        fatherAnnualIncomeReq = Validators.required;
      }
      let fatherAadharNoReq: any;
      if (fatherDetails?.aadharNoRequired && fatherDetails?.aadharNoDisplay) {
        fatherAadharNoReq = Validators.required;
      }
      let fatherPanCardReq: any;
      if (fatherDetails?.panCardRequired && fatherDetails?.panCardDisplay) {
        fatherPanCardReq = Validators.required;
      }
      let fatherCompanyNameReq: any;
      if (fatherDetails?.companyNameRequired && fatherDetails?.companyNameDisplay) {
        fatherCompanyNameReq = Validators.required;
      }
      let fatherDesignationReq: any;
      if (fatherDetails?.designationRequired && fatherDetails?.designationDisplay) {
        fatherDesignationReq = Validators.required;
      }
      let fatherEmailReq: any;
      if (fatherDetails?.emailRequired && fatherDetails?.emailDisplay) {
        fatherEmailReq = Validators.required;
      }
      let fatherFullNameReq: any;
      if (fatherDetails?.fullNameRequired && fatherDetails?.fullNameDisplay) {
        fatherFullNameReq = Validators.required;
      }
      let fatherMobileNoReq: any;
      if (fatherDetails?.mobileNoRequired && fatherDetails?.mobileNoDisplay) {
        fatherMobileNoReq = Validators.required;
      }
      let fatherOccupationReq: any;
      if (fatherDetails?.occupationRequired && fatherDetails?.occupationDisplay) {
        fatherOccupationReq = Validators.required;
      }
      let fatherOfficeAddressReq: any;
      if (fatherDetails?.officeAddressRequired && fatherDetails?.officeAddressDisplay) {
        fatherOfficeAddressReq = Validators.required;
      }
      let fatherOfficeDistReq: any;
      if (fatherDetails?.officeDistRequired && fatherDetails?.officeDistDisplay) {
        fatherOfficeDistReq = Validators.required;
      }
      let fatherOfficeCityReq: any;
      if (fatherDetails?.officeCityRequired && fatherDetails?.officeCityDisplay) {
        fatherOfficeCityReq = Validators.required;
      }
      let fatherOfficeAreaReq: any;
      if (fatherDetails?.officeAreaRequired && fatherDetails?.officeAreaDisplay) {
        fatherOfficeAreaReq = Validators.required;
      }
      let fatherOfficeStreetReq: any;
      if (fatherDetails?.officeStreetRequired && fatherDetails?.officeStreetDisplay) {
        fatherOfficeStreetReq = Validators.required;
      }
      let fatherOfficePincodeReq: any;
      if (fatherDetails?.officePincodeRequired && fatherDetails?.officePincodeDisplay) {
        fatherOfficePincodeReq = Validators.required;
      }
      let fatherOfficeStateReq: any;
      if (fatherDetails?.officeStateRequired && fatherDetails?.officeStateDisplay) {
        fatherOfficeStateReq = Validators.required;
      }
      let fatherOfficeTelReq: any;
      if (fatherDetails?.officeTelRequired && fatherDetails?.officeTelDisplay) {
        fatherOfficeTelReq = Validators.required;
      }
      let fatherQualificationReq: any;
      if (fatherDetails?.qualificationRequired && fatherDetails?.qualificationDisplay) {
        fatherQualificationReq = Validators.required;
      }
      let fatherResidentTelReq: any;
      if (fatherDetails?.residentTelRequired && fatherDetails?.residentTelDisplay) {
        fatherResidentTelReq = Validators.required;
      }
      let fatherPassportSizeReq: any;
      if (fatherDetails?.fatherPhotoRequired && fatherDetails?.fatherPhotoDisplay) {
        fatherPassportSizeReq = Validators.required;
      }

      let fatherSignatureReq: any;
      if (fatherDetails?.fatherSignatureRequired && fatherDetails?.fatherSignatureDisplay) {
        fatherSignatureReq = Validators.required;
      }

      if (!globalFunctions.isEmpty(fatherDetails.fatherPhoto)) {
        this.isFatherUploadedPassportSizePhoto = true;
        this.uploadedFatherPassportSizePhoto = fatherDetails.fatherPhoto;
        this.hasFatherPassportSizePhoto = fatherDetails.fatherPhoto;
      }

      if (!globalFunctions.isEmpty(fatherDetails.fatherSignature)) {
        this.isFatherUploadedSignaturePhoto = true;
        this.uploadedFatherSignaturePhoto = fatherDetails.fatherSignature;
        this.hasFatherSignaturePhoto = fatherDetails.fatherSignature;
      }

      let motherDetails = formData.guardianInfo.membersInfo.motherDetails;

      let motherAnnualIncomeReq: any;
      if (motherDetails?.annualIncomeRequired) {
        motherAnnualIncomeReq = Validators.required;
      }
      let motherAadharNoReq: any;
      if (motherDetails?.aadharNoRequired && motherDetails?.aadharNoDisplay) {
        motherAadharNoReq = Validators.required;
      }
      let motherPanCardReq: any;
      if (motherDetails?.panCardRequired && motherDetails?.panCardDisplay) {
        motherPanCardReq = Validators.required;
      }
      let motherCompanyNameReq: any;
      if (motherDetails?.companyNameRequired) {
        motherCompanyNameReq = Validators.required;
      }
      let motherDesignationReq: any;
      if (motherDetails?.designationRequired) {
        motherDesignationReq = Validators.required;
      }
      let motherEmailReq: any;
      if (motherDetails?.emailRequired) {
        motherEmailReq = Validators.required;
      }
      let motherFullNameReq: any;
      if (motherDetails?.fullNameRequired) {
        motherFullNameReq = Validators.required;
      }
      let motherMobileNoReq: any;
      if (motherDetails?.mobileNoRequired) {
        motherMobileNoReq = Validators.required;
      }
      let motherOccupationReq: any;
      if (motherDetails?.occupationRequired) {
        motherOccupationReq = Validators.required;
      }
      let motherOfficeAddressReq: any;
      if (motherDetails?.officeAddressRequired) {
        motherOfficeAddressReq = Validators.required;
      }
      let motherOfficeDistReq: any;
      if (motherDetails?.officeDistRequired) {
        motherOfficeDistReq = Validators.required;
      }
      let motherOfficeCityReq: any;
      if (motherDetails?.officeCityRequired) {
        motherOfficeCityReq = Validators.required;
      }
      let motherOfficePincodeReq: any;
      if (motherDetails?.officePincodeRequired) {
        motherOfficePincodeReq = Validators.required;
      }
      let motherOfficeStateReq: any;
      if (motherDetails?.officeStateRequired) {
        motherOfficeStateReq = Validators.required;
      }
      let motherOfficeStreetReq: any;
      if (motherDetails?.officeAreaRequired) {
        motherOfficeStreetReq = Validators.required;
      }
      let motherOfficeAreaReq: any;
      if (motherDetails?.officeStreetRequired) {
        motherOfficeAreaReq = Validators.required;
      }
      
      let motherOfficeTelReq: any;
      if (motherDetails?.officeTelRequired) {
        motherOfficeTelReq = Validators.required;
      }
      let motherQualificationReq: any;
      if (motherDetails?.qualificationRequired) {
        motherQualificationReq = Validators.required;
      }
      let motherResidentTelReq: any;
      if (motherDetails?.residentTelRequired) {
        motherResidentTelReq = Validators.required;
      }
      if (!globalFunctions.isEmpty(motherDetails.motherPhoto)) {
        this.isMotherUploadedPassportSizePhoto = true;
        this.uploadedMotherPassportSizePhoto = motherDetails.motherPhoto;
        this.hasMotherPassportSizePhoto = motherDetails.motherPhoto;
      }
      if (!globalFunctions.isEmpty(motherDetails.motherSignature)) {
        this.isMotherUploadedSignaturePhoto = true;
        this.uploadedMotherSignaturePhoto = motherDetails.motherSignature;
        this.hasMotherSignaturePhoto = motherDetails.motherSignature;
      }

      var sisterDetailsForm: any = [];

      if (!globalFunctions.isEmpty(formData.guardianInfo.membersInfo.sisterDetails)) {
        let sisterDetails = formData.guardianInfo.membersInfo.sisterDetails;

        let sisterAnnualIncomeReq: any;
        if (sisterDetails?.annualIncomeRequired) {
          sisterAnnualIncomeReq = Validators.required;
        }
        let sisterAadharNoReq: any;
        if (sisterDetails?.aadharNoRequired && sisterDetails?.aadharNoDisplay) {
          sisterAadharNoReq = Validators.required;
        }
        let sisterPanCardReq: any;
        if (sisterDetails?.panCardRequired && sisterDetails?.panCardDisplay) {
          sisterPanCardReq = Validators.required;
        }
        let sisterCompanyNameReq: any;
        if (sisterDetails?.companyNameRequired) {
          sisterCompanyNameReq = Validators.required;
        }
        let sisterDesignationReq: any;
        if (sisterDetails?.designationRequired) {
          sisterDesignationReq = Validators.required;
        }
        let sisterEmailReq: any;
        if (sisterDetails?.emailRequired) {
          sisterEmailReq = Validators.required;
        }
        let sisterFullNameReq: any;
        if (sisterDetails?.fullNameRequired) {
          sisterFullNameReq = Validators.required;
        }
        let sisterPassPhotoReq: any;
        if (sisterDetails?.sisterPhotoRequired) {
          sisterPassPhotoReq = Validators.required;
        }
        let sisterMobileNoReq: any;
        if (sisterDetails?.mobileNoRequired) {
          sisterMobileNoReq = Validators.required;
        }
        let sisterOccupationReq: any;
        if (sisterDetails?.occupationRequired) {
          sisterOccupationReq = Validators.required;
        }
        let sisterOfficeAddressReq: any;
        if (sisterDetails?.officeAddressRequired) {
          sisterOfficeAddressReq = Validators.required;
        }
        let sisterOfficeDistReq: any;
        if (sisterDetails?.officeDistRequired) {
          sisterOfficeDistReq = Validators.required;
        }
        let sisterOfficeCityReq: any;
        if (sisterDetails?.officeCityRequired) {
          sisterOfficeCityReq = Validators.required;
        }
        let sisterOfficePincodeReq: any;
        if (sisterDetails?.officePincodeRequired) {
          sisterOfficePincodeReq = Validators.required;
        }
        let sisterOfficeAreaReq: any;
        if (sisterDetails?.officeAreaRequired) {
          sisterOfficeAreaReq = Validators.required;
        }
        let sisterOfficeStreetReq: any;
        if (sisterDetails?.officeStreetRequired) {
          sisterOfficeStreetReq = Validators.required;
        }
        let sisterOfficeStateReq: any;
        if (sisterDetails?.officeStateRequired) {
          sisterOfficeStateReq = Validators.required;
        }
        let sisterOfficeTelReq: any;
        if (sisterDetails?.officeTelRequired) {
          sisterOfficeTelReq = Validators.required;
        }
        let sisterQualificationReq: any;
        if (sisterDetails?.qualificationRequired) {
          sisterQualificationReq = Validators.required;
        }
        let sisterResidentTelReq: any;
        if (sisterDetails?.residentTelRequired) {
          sisterResidentTelReq = Validators.required;
        }
        if (!globalFunctions.isEmpty(sisterDetails.sisterPhoto)) {
          this.isSisterUploadedPassportSizePhoto = true;
          this.uploadedSisterPassportSizePhoto = sisterDetails.sisterPhoto;
          this.hasSisterPassportSizePhoto = sisterDetails.sisterPhoto;
        }
        if (!globalFunctions.isEmpty(sisterDetails.sisterSignature)) {
          this.isSisterUploadedSignaturePhoto = true;
          this.uploadedSisterSignaturePhoto = sisterDetails.sisterSignature;
          this.hasSisterSignaturePhoto = sisterDetails.sisterSignature;
        }

        sisterDetailsForm = this._formBuilder.group({
          aadharNo: [sisterDetails?.aadharNo, Validators.compose([sisterAadharNoReq, Validators.minLength(12), Validators.maxLength(12)])],
          panCard: [sisterDetails?.panCard, sisterPanCardReq],
          annualIncome: [sisterDetails?.annualIncome, sisterAnnualIncomeReq],
          companyName: [sisterDetails?.companyName, sisterCompanyNameReq],
          designation: [sisterDetails?.designation, sisterDesignationReq],
          email: [sisterDetails?.email, Validators.compose([sisterEmailReq, emailValidator])],
          fullName: [sisterDetails?.fullName, sisterFullNameReq],
          mobileNo: [sisterDetails?.mobileNo, Validators.compose([sisterMobileNoReq, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
          occupation: [sisterDetails?.occupation, sisterOccupationReq],
          officeAddress: [sisterDetails?.officeAddress, sisterOfficeAddressReq],
          officeDist: [sisterDetails?.officeDist, sisterOfficeDistReq],
          officeArea: [sisterDetails?.officeArea, sisterOfficeAreaReq],
          officeStreet: [sisterDetails?.officeStreet, sisterOfficeStreetReq],
          officeCity: new UntypedFormControl({ value: sisterDetails?.officeCity, disabled: true }, sisterOfficeCityReq),
          officePincode: [sisterDetails?.officePincode, Validators.compose([sisterOfficePincodeReq, Validators.minLength(6), Validators.maxLength(6)])],
          officeState: new UntypedFormControl({ value: sisterDetails?.officeState, disabled: true }, sisterOfficeStateReq),
          officeTel: [sisterDetails?.officeTel, sisterOfficeTelReq],
          qualification: [sisterDetails?.qualification, sisterQualificationReq],
          residentTel: [sisterDetails?.residentTel, sisterResidentTelReq],
          sisterPhoto: [sisterDetails?.sisterPhoto],
          sisterSignature: [sisterDetails?.sisterSignature],

        });

      }
      var brotherDetailsForms: any = [];
      if (!globalFunctions.isEmpty(formData.guardianInfo.membersInfo.brotherDetails)) {
        let brotherDetails = formData.guardianInfo.membersInfo.brotherDetails;
        let brotherAnnualIncomeReq: any;
        if (brotherDetails?.annualIncomeRequired) {
          brotherAnnualIncomeReq = Validators.required;
        }
        let brotherAadharNoReq: any;
        if (brotherDetails?.aadharNoRequired && brotherDetails?.aadharNoDisplay) {
          brotherAadharNoReq = Validators.required;
        }
        let brotherPanCardReq: any;
        if (brotherDetails?.panCardRequired && brotherDetails?.panCardDisplay) {
          brotherPanCardReq = Validators.required;
        }
        let brotherCompanyNameReq: any;
        if (brotherDetails?.companyNameRequired) {
          brotherCompanyNameReq = Validators.required;
        }
        let brotherDesignationReq: any;
        if (brotherDetails?.designationRequired) {
          brotherDesignationReq = Validators.required;
        }
        let brotherEmailReq: any;
        if (brotherDetails?.emailRequired) {
          brotherEmailReq = Validators.required;
        }
        let brotherFullNameReq: any;
        if (brotherDetails?.fullNameRequired) {
          brotherFullNameReq = Validators.required;
        }
        let brotherMobileNoReq: any;
        if (brotherDetails?.mobileNoRequired) {
          brotherMobileNoReq = Validators.required;
        }
        let brotherOccupationReq: any;
        if (brotherDetails?.occupationRequired) {
          brotherOccupationReq = Validators.required;
        }
        let brotherOfficeAddressReq: any;
        if (brotherDetails?.officeAddressRequired) {
          brotherOfficeAddressReq = Validators.required;
        }
        let brotherOfficeDistReq: any;
        if (brotherDetails?.officeDistRequired) {
          brotherOfficeDistReq = Validators.required;
        }
        let brotherOfficeCityReq: any;
        if (brotherDetails?.officeCityRequired) {
          brotherOfficeCityReq = Validators.required;
        }
        let brotherOfficeStreetReq: any;
        if (brotherDetails?.officeStreetRequired) {
          brotherOfficeStreetReq = Validators.required;
        }
        let brotherOfficeAreaReq: any;
        if (brotherDetails?.officeAreaRequired) {
          brotherOfficeAreaReq = Validators.required;
        }
        let brotherOfficePincodeReq: any;
        if (brotherDetails?.officePincodeRequired) {
          brotherOfficePincodeReq = Validators.required;
        }
        let brotherOfficeStateReq: any;
        if (brotherDetails?.officeStateRequired) {
          brotherOfficeStateReq = Validators.required;
        }
        let brotherOfficeTelReq: any;
        if (brotherDetails?.officeTelRequired) {
          brotherOfficeTelReq = Validators.required;
        }
        let brotherQualificationReq: any;
        if (brotherDetails?.qualificationRequired) {
          brotherQualificationReq = Validators.required;
        }
        let brotherResidentTelReq: any;
        if (brotherDetails?.residentTelRequired) {
          brotherResidentTelReq = Validators.required;
        }
        let brotherSignatureReq: any;
        if (brotherDetails?.brotherSignatureRequired) {
          brotherSignatureReq = Validators.required;
        }
        if (!globalFunctions.isEmpty(brotherDetails.brotherPhoto)) {
          this.isBrotherUploadedPassportSizePhoto = true;
          this.uploadedBrotherPassportSizePhoto = brotherDetails.brotherPhoto;
          this.hasBrotherPassportSizePhoto = brotherDetails.brotherPhoto;
        }
        if (!globalFunctions.isEmpty(brotherDetails.brotherSignature)) {
          this.isBrotherUploadedSignaturePhoto = true;
          this.uploadedBrotherSignaturePhoto = brotherDetails.brotherSignature;
          this.hasBrotherSignaturePhoto = brotherDetails.brotherSignature;
        }

        brotherDetailsForms = this._formBuilder.group({
          aadharNo: [brotherDetails?.aadharNo, Validators.compose([brotherAadharNoReq, Validators.minLength(12), Validators.maxLength(12)])],
          panCard: [brotherDetails?.panCard, brotherPanCardReq],
          annualIncome: [brotherDetails?.annualIncome, brotherAnnualIncomeReq],
          companyName: [brotherDetails?.companyName, brotherCompanyNameReq],
          designation: [brotherDetails?.designation, brotherDesignationReq],
          email: [brotherDetails?.email, Validators.compose([brotherEmailReq, emailValidator])],
          fullName: [brotherDetails?.fullName, brotherFullNameReq],
          mobileNo: [brotherDetails?.mobileNo, Validators.compose([brotherMobileNoReq, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
          occupation: [brotherDetails?.occupation, brotherOccupationReq],
          officeAddress: [brotherDetails?.officeAddress, brotherOfficeAddressReq],
          officeDist: [brotherDetails?.officeDist, brotherOfficeDistReq],
          officeArea: [brotherDetails?.officeArea, brotherOfficeAreaReq],
          officeStreet: [brotherDetails?.officeStreet, brotherOfficeStreetReq],
          officeCity: new UntypedFormControl({ value: brotherDetails?.officeCity, disabled: true }, brotherOfficeCityReq),
          officePincode: [brotherDetails?.officePincode, Validators.compose([brotherOfficePincodeReq, Validators.minLength(6), Validators.maxLength(6)])],
          officeState: new UntypedFormControl({ value: brotherDetails?.officeState, disabled: true }, brotherOfficeStateReq),
          officeTel: [brotherDetails?.officeTel, brotherOfficeTelReq],
          qualification: [brotherDetails?.qualification, brotherQualificationReq],
          residentTel: [brotherDetails?.residentTel, brotherResidentTelReq],
          brotherPhoto: [brotherDetails?.brotherPhoto],
          brotherSignature: [brotherDetails?.brotherSignature],
        });
      }

      let guardianDetails = this.formData?.guardianInfo?.membersInfo?.guardianDetails;

      let guardianAnnualIncomeReq: any;
      if (guardianDetails?.annualIncomeRequired && guardianDetails?.annualIncomeDisplay) {
        guardianAnnualIncomeReq = Validators.required;
      }
      let guardianAadharNoReq: any;
      if (guardianDetails?.aadharNoRequired && guardianDetails?.aadharNoDisplay) {
        guardianAadharNoReq = Validators.required;
      }
      let guardianPanCardReq: any;
      if (guardianDetails?.panCardRequired && guardianDetails?.panCardDisplay) {
        guardianPanCardReq = Validators.required;
      }
      let guardianCompanyNameReq: any;
      if (guardianDetails?.companyNameRequired && guardianDetails?.companyNameDisplay) {
        guardianCompanyNameReq = Validators.required;
      }
      let guardianDesignationReq: any;
      if (guardianDetails?.designationRequired && guardianDetails?.designationDisplay) {
        guardianDesignationReq = Validators.required;
      }
      let guardianEmailReq: any;
      if (guardianDetails?.emailRequired && guardianDetails?.emailDisplay) {
        guardianEmailReq = Validators.required;
      }
      let guardianFullNameReq: any;
      if (guardianDetails?.fullNameRequired && guardianDetails?.fullNameDisplay) {
        guardianFullNameReq = Validators.required;
      }
      let guardianRelationReq: any;
      if (guardianDetails?.relationRequired && guardianDetails?.relationDisplay) {
        guardianRelationReq = Validators.required;
      }
      let guardianMobileNoReq: any;
      if (guardianDetails?.mobileNoRequired && guardianDetails?.mobileNoDisplay) {
        guardianMobileNoReq = Validators.required;
      }
      let guardianOccupationReq: any;
      if (guardianDetails?.occupationRequired && guardianDetails?.occupationDisplay) {
        guardianOccupationReq = Validators.required;
      }
      let guardianOfficeAddressReq: any;
      if (guardianDetails?.officeAddressRequired && guardianDetails?.officeAddressDisplay) {
        guardianOfficeAddressReq = Validators.required;
      }
      let guardianOfficeDistReq: any;
      if (guardianDetails?.officeDistRequired && guardianDetails?.officeDistDisplay) {
        guardianOfficeDistReq = Validators.required;
      }
      let guardianOfficeCityReq: any;
      if (guardianDetails?.officeCityRequired && guardianDetails?.officeCityDisplay) {
        guardianOfficeCityReq = Validators.required;
      }
      let guardianOfficeStreetReq: any;
      if (guardianDetails?.officeStreetRequired && guardianDetails?.officeStreetDisplay) {
        guardianOfficeStreetReq = Validators.required;
      }
      let guardianOfficeAreaReq: any;
      if (guardianDetails?.officeAreaRequired && guardianDetails?.officeAreaDisplay) {
        guardianOfficeAreaReq = Validators.required;
      }
      let guardianOfficePincodeReq: any;
      if (guardianDetails?.officePincodeRequired && guardianDetails?.officePincodeDisplay) {
        guardianOfficePincodeReq = Validators.required;
      }
      let guardianOfficeStateReq: any;
      if (guardianDetails?.officeStateRequired && guardianDetails?.officeStateDisplay) {
        guardianOfficeStateReq = Validators.required;
      }
      let guardianOfficeTelReq: any;
      if (guardianDetails?.officeTelRequired && guardianDetails?.officeTelDisplay) {
        guardianOfficeTelReq = Validators.required;
      }
      let guardianQualificationReq: any;
      if (guardianDetails?.qualificationRequired && guardianDetails?.qualificationDisplay) {
        guardianQualificationReq = Validators.required;
      }
      let guardianResidentTelReq: any;
      if (guardianDetails?.residentTelRequired && guardianDetails?.residentTelDisplay) {
        guardianResidentTelReq = Validators.required;
      }
      if (!globalFunctions.isEmpty(guardianDetails.guardianPhoto)) {
        this.isGuardianUploadedPassportSizePhoto = true;
        this.uploadedGuardianPassportSizePhoto = guardianDetails.guardianPhoto;
        this.hasGuardianPassportSizePhoto = guardianDetails.guardianPhoto;
      }
      if (!globalFunctions.isEmpty(guardianDetails.guardianSignature)) {
        this.isGuardianUploadedSignaturePhoto = true;
        this.uploadedGuardianSignaturePhoto = guardianDetails.guardianSignature;
        this.hasGuardianSignaturePhoto = guardianDetails.guardianSignature;
      }


      let familyAnualIncomeReq: any;
      let totalMembersReq: any;
      if (formData?.guardianInfo?.showFamilyInfo) {
        if (formData?.guardianInfo?.familyInfo?.familyAnualIncomeObj?.rquired) {
          familyAnualIncomeReq = Validators.required;
        }
        if (formData?.guardianInfo?.familyInfo?.totalMembersObj?.rquired) {
          totalMembersReq = Validators.required;
        }
      }

      this.guardianInfoForm = this._formBuilder.group({
        showFatherDetails: [formData?.guardianInfo?.showFatherDetails],
        showMotherDetails: [formData?.guardianInfo?.showMotherDetails],
        showSisterDetails: [formData?.guardianInfo?.showSisterDetails],
        showBrotherDetails: [formData?.guardianInfo?.showBrotherDetails],
        showGuardianDetails: [formData?.guardianInfo?.showGuardianDetails],
        note: [formData.guardianInfo.note],
        familyInfo: this._formBuilder.group({
          familyAnualIncome: [formData.guardianInfo.familyInfo.familyAnualIncome, familyAnualIncomeReq],
          totalMembers: [formData.guardianInfo.familyInfo.totalMembers, totalMembersReq],
        }),
        membersInfo: this._formBuilder.group({
          anyOneBlk: [formData?.guardianInfo?.anyOneBlk],
          guardian: [null],
          showMemberDetails: [formData?.guardianInfo?.showMemberDetails],
          fatherDetails: this._formBuilder.group({
            aadharNo: [fatherDetails?.aadharNo, Validators.compose([fatherAadharNoReq, Validators.minLength(12), Validators.maxLength(12)])],
            panCard: [fatherDetails?.panCard, fatherPanCardReq],
            annualIncome: [fatherDetails?.annualIncome, fatherAnnualIncomeReq],
            companyName: [fatherDetails?.companyName, fatherCompanyNameReq],
            designation: [fatherDetails?.designation, fatherDesignationReq],
            email: [fatherDetails?.email, Validators.compose([fatherEmailReq, emailValidator])],
            fullName: [fatherDetails?.fullName, fatherFullNameReq],
            mobileNo: [fatherDetails?.mobileNo, Validators.compose([fatherMobileNoReq, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
            occupation: [fatherDetails?.occupation, fatherOccupationReq],
            officeAddress: [fatherDetails?.officeAddress, fatherOfficeAddressReq],
            officeDist: [fatherDetails?.officeDist, fatherOfficeDistReq],
            officeArea: [fatherDetails?.officeArea, fatherOfficeAreaReq],
            officeStreet: [fatherDetails?.officeStreet, fatherOfficeStreetReq],
            officeCity: new UntypedFormControl({ value: fatherDetails?.officeCity, disabled: true }, fatherOfficeCityReq),
            officePincode: [fatherDetails?.officePincode, Validators.compose([fatherOfficePincodeReq, Validators.minLength(6), Validators.maxLength(6)])],
            officeState: new UntypedFormControl({ value: fatherDetails?.officeState, disabled: true }, fatherOfficeStateReq),
            officeTel: [fatherDetails?.officeTel, fatherOfficeTelReq],
            qualification: [fatherDetails?.qualification, fatherQualificationReq],
            residentTel: [fatherDetails?.residentTel, fatherResidentTelReq],
            fatherPhoto: [fatherDetails?.fatherPhoto],
            fatherSignature: [fatherDetails?.fatherSignature],

          }),
          motherDetails: this._formBuilder.group({
            aadharNo: [motherDetails?.aadharNo, Validators.compose([motherAadharNoReq, Validators.minLength(12), Validators.maxLength(12)])],
            panCard: [motherDetails?.panCard, motherPanCardReq],
            annualIncome: [motherDetails?.annualIncome, motherAnnualIncomeReq],
            companyName: [motherDetails?.companyName, motherCompanyNameReq],
            designation: [motherDetails?.designation, motherDesignationReq],
            email: [motherDetails?.email, Validators.compose([motherEmailReq, emailValidator])],
            fullName: [motherDetails?.fullName, motherFullNameReq],
            mobileNo: [motherDetails?.mobileNo, Validators.compose([motherMobileNoReq, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
            occupation: [motherDetails?.occupation, motherOccupationReq],
            officeAddress: [motherDetails?.officeAddress, motherOfficeAddressReq],
            officeDist: [motherDetails?.officeDist, motherOfficeDistReq],
            officeArea: [motherDetails?.officeArea, motherOfficeAreaReq],
            officeStreet: [motherDetails?.officeStreet, motherOfficeStreetReq],
            officeCity: new UntypedFormControl({ value: motherDetails?.officeCity, disabled: true }, motherOfficeCityReq),
            officePincode: [motherDetails?.officePincode, Validators.compose([motherOfficePincodeReq, Validators.minLength(6), Validators.maxLength(6)])],
            officeState: new UntypedFormControl({ value: motherDetails?.officeState, disabled: true }, motherOfficeStateReq),
            officeTel: [motherDetails?.officeTel, motherOfficeTelReq],
            qualification: [motherDetails?.qualification, motherQualificationReq],
            residentTel: [motherDetails?.residentTel, motherResidentTelReq],
            motherPhoto: [motherDetails?.motherPhoto],
            motherSignature: [motherDetails?.motherSignature],

          }),
          sisterDetails: sisterDetailsForm,
          brotherDetails: brotherDetailsForms,
          guardianDetails: this._formBuilder.group({
            aadharNo: [guardianDetails?.aadharNo, Validators.compose([guardianAadharNoReq, Validators.minLength(12), Validators.maxLength(12)])],
            panCard: [guardianDetails?.panCard, guardianPanCardReq],
            annualIncome: [guardianDetails?.annualIncome, guardianAnnualIncomeReq],
            companyName: [guardianDetails?.companyName, guardianCompanyNameReq],
            designation: [guardianDetails?.designation, guardianDesignationReq],
            email: [guardianDetails?.email, Validators.compose([guardianEmailReq, emailValidator])],
            fullName: [guardianDetails?.fullName, guardianFullNameReq],
            relation: [guardianDetails?.relation, guardianRelationReq],
            mobileNo: [guardianDetails?.mobileNo, Validators.compose([guardianMobileNoReq, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
            occupation: [guardianDetails?.occupation, guardianOccupationReq],
            officeAddress: [guardianDetails?.officeAddress, guardianOfficeAddressReq],
            officeDist: [guardianDetails?.officeDist, guardianOfficeDistReq],
            officeStreet: [guardianDetails?.officeStreet, guardianOfficeStreetReq],
            officeArea: [guardianDetails?.officeArea, guardianOfficeAreaReq],
            officeCity: new UntypedFormControl({ value: guardianDetails?.officeCity, disabled: true }, guardianOfficeCityReq),
            officePincode: [guardianDetails?.officePincode, Validators.compose([guardianOfficePincodeReq, Validators.minLength(6), Validators.maxLength(6)])],
            officeState: new UntypedFormControl({ value: guardianDetails?.officeState, disabled: true }, guardianOfficeStateReq),
            officeTel: [guardianDetails?.officeTel, guardianOfficeTelReq],
            qualification: [guardianDetails?.qualification, guardianQualificationReq],
            residentTel: [guardianDetails?.residentTel, guardianResidentTelReq],
            guardianPhoto: [guardianDetails?.guardianPhoto],
            guardianSignature: [guardianDetails?.guardianSignature],
          })
        })
      });

      if (formData.guardianInfo.anyOneBlkShow) {
        let anyOneBlk = 'father';
        let showFatherDets = true;
        let showMotherDets = false;
        let showGuardianDets = false;
        let showMemberDets = true;
        if (formData.guardianInfo.membersInfo.guardianDetails.anyOneBlk == 'father') {
          anyOneBlk = 'father';
          showFatherDets = true;
          showMotherDets = false;
          showGuardianDets = false;
        } else if (formData.guardianInfo.membersInfo.guardianDetails.anyOneBlk == 'mother') {
          anyOneBlk = 'mother';
          showFatherDets = false;
          showMotherDets = true;
          showGuardianDets = false;
        } else {
          anyOneBlk = 'guardian';
          showFatherDets = false;
          showMotherDets = false;
          showGuardianDets = true;
        }
        this.guardianInfoForm.controls.showFatherDetails.setValue(showFatherDets, { emitEvent: false });
        this.guardianInfoForm.controls.showMotherDetails.setValue(showMotherDets, { emitEvent: false });
        this.guardianInfoForm.controls.showGuardianDetails.setValue(showGuardianDets, { emitEvent: false });
        this.guardianInfoForm.controls.showBrotherDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showSisterDetails.setValue(false, { emitEvent: false });
      } else {
        let guardian = 'no';
        let showGuardianDets = false;
        let showMemberDets = true;
        if (formData.guardianInfo.membersInfo.guardianDetails.guardian == 'yes') {
          showGuardianDets = true;
          guardian = 'yes';
          showMemberDets = false;
        }
        this.guardianInfoForm.controls.membersInfo['controls'].guardian.setValue(guardian, { emitEvent: false });
        this.guardianInfoForm.controls.showGuardianDetails.setValue(showGuardianDets, { emitEvent: false });
        this.guardianInfoForm.controls.membersInfo['controls'].showMemberDetails.setValue(showMemberDets, { emitEvent: false });

      }

      this.guardianInfoFormValues = this.guardianInfoForm.value;

    }

    this.guardianInfoFormValueChanged();
    this.guardianInfoForm.disable();

  }
  setGuardianName() {
    if (this.formData.guardianInfo.anyOneBlkShow) {

      let guardian = this.guardianInfoForm.controls.membersInfo.get('anyOneBlk').value;
      if (guardian != 'guardian') {
        this.guardianName = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('fullName').value;
      } else {
        // this.guardianName = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('fullName').value;
      }
    } else {

      let guardian = this.guardianInfoForm.controls.membersInfo.get('guardian').value;
      if (guardian == 'yes') {
        this.guardianName = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('fullName').value;
      }
    }
  }

  guardianInfoFormValueChanged() {
    this.setGuardianDetailsValues();
    if (this.formData.guardianInfo.anyOneBlkShow) {
      this.guardianInfoForm.controls.membersInfo.get('anyOneBlk').valueChanges.subscribe((mode: string) => {
        this.setGuardianDetailsValues();
      });
    } else {
      this.guardianInfoForm.controls.membersInfo.get('guardian').valueChanges.subscribe((mode: string) => {
        this.setGuardianDetailsValues();
      });
    }

  }

  setGuardianDetailsValues() {

    const aadharNo = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('aadharNo');
    const panCard = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('panCard');
    const annualIncome = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('annualIncome');
    const companyName = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('companyName');
    const designation = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('designation');
    const email = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('email');
    const fullName = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('fullName');
    const relation = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('relation');
    const mobileNo = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('mobileNo');
    const occupation = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('occupation');
    const officeAddress = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('officeAddress');
    const officeDist = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('officeDist');
    const officeArea = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('officeArea');
    const officeStreet = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('officeStreet');
    const officeCity = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('officeCity');
    const officePincode = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('officePincode');
    const officeState = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('officeState');
    const officeTel = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('officeTel');
    const qualification = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('qualification');
    const residentTel = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('residentTel');

    const fatherAadharNo = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('aadharNo');
    const fatherPanCard = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('panCard');
    const fatherAnnualIncome = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('annualIncome');
    const fatherCompanyName = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('companyName');
    const fatherDesignation = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('designation');
    const fatherEmail = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('email');
    const fatherFullName = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('fullName');
    const fatherMobileNo = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('mobileNo');
    const fatherOccupation = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('occupation');
    const fatherOfficeAddress = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('officeAddress');
    const fatherOfficeDist = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('officeDist');
    const fatherOfficeStreet = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('officeStreet');
    const fatherOfficeArea = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('officeArea');
    const fatherOfficeCity = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('officeCity');
    const fatherOfficePincode = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('officePincode');
    const fatherOfficeState = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('officeState');
    const fatherOfficeTel = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('officeTel');
    const fatherQualification = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('qualification');
    const fatherResidentTel = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('residentTel');

    const motherAadharNo = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('aadharNo');
    const motherPanCard = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('panCard');
    const motherAnnualIncome = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('annualIncome');
    const motherCompanyName = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('companyName');
    const motherDesignation = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('designation');
    const motherEmail = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('email');
    const motherFullName = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('fullName');
    const motherMobileNo = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('mobileNo');
    const motherOccupation = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('occupation');
    const motherOfficeAddress = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('officeAddress');
    const motherOfficeDist = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('officeDist');
    const motherOfficeArea = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('officeArea');
    const motherOfficeStreet = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('officeStreet');
    const motherOfficeCity = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('officeCity');
    const motherOfficePincode = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('officePincode');
    const motherOfficeState = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('officeState');
    const motherOfficeTel = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('officeTel');
    const motherQualification = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('qualification');
    const motherResidentTel = this.guardianInfoForm.controls.membersInfo['controls'].motherDetails.get('residentTel');

    const brotherAadharNo = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('aadharNo');
    const brotherPanCard = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('panCard');
    const brotherAnnualIncome = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('annualIncome');
    const brotherCompanyName = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('companyName');
    const brotherDesignation = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('designation');
    const brotherEmail = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('email');
    const brotherFullName = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('fullName');
    const brotherMobileNo = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('mobileNo');
    const brotherOccupation = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('occupation');
    const brotherOfficeAddress = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('officeAddress');
    const brotherOfficeDist = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('officeDist');
    const brotherOfficeStreet = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('officeStreet');
    const brotherOfficeArea = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('officeArea');
    const brotherOfficeCity = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('officeCity');
    const brotherOfficePincode = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('officePincode');
    const brotherOfficeState = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('officeState');
    const brotherOfficeTel = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('officeTel');
    const brotherQualification = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('qualification');
    const brotherResidentTel = this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails.get('residentTel');

    const sisterAadharNo = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('aadharNo');
    const sisterPanCard = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('panCard');
    const sisterAnnualIncome = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('annualIncome');
    const sisterCompanyName = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('companyName');
    const sisterDesignation = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('designation');
    const sisterEmail = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('email');
    const sisterFullName = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('fullName');
    const sisterMobileNo = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('mobileNo');
    const sisterOccupation = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('occupation');
    const sisterOfficeAddress = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('officeAddress');
    const sisterOfficeDist = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('officeDist');
    const sisterOfficeArea = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('officeArea');
    const sisterOfficeStreet = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('officeStreet');
    const sisterOfficeCity = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('officeCity');
    const sisterOfficePincode = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('officePincode');
    const sisterOfficeState = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('officeState');
    const sisterOfficeTel = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('officeTel');
    const sisterQualification = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('qualification');
    const sisterResidentTel = this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails.get('residentTel');

    const fatherName = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('fullName').value;
    if (this.formData.guardianInfo.anyOneBlkShow) {
      if (this.guardianInfoForm.controls.membersInfo.get('anyOneBlk').value == 'father') {

        let fatherDetails = this.formData?.guardianInfo?.membersInfo?.fatherDetails;

        if (fatherDetails?.annualIncomeRequired && fatherDetails?.annualIncomeDisplay) {
          fatherAnnualIncome.setValidators([Validators.required]);
        }
        if (fatherDetails?.aadharNoRequired && fatherDetails?.aadharNoDisplay) {
          fatherAadharNo.setValidators([Validators.required]);
        }
        if (fatherDetails?.panCardRequired && fatherDetails?.panCardDisplay) {
          fatherPanCard.setValidators([Validators.required]);
        }
        if (fatherDetails?.companyNameRequired && fatherDetails?.companyNameDisplay) {
          fatherCompanyName.setValidators([Validators.required]);
        }
        if (fatherDetails?.designationRequired && fatherDetails?.designationDisplay) {
          fatherDesignation.setValidators([Validators.required]);
        }
        if (fatherDetails?.emailRequired && fatherDetails?.emailDisplay) {
          fatherEmail.setValidators([Validators.required]);
        }
        if (fatherDetails?.fullNameRequired && fatherDetails?.fullNameDisplay) {
          fatherFullName.setValidators([Validators.required]);
        }
        if (fatherDetails?.mobileNoRequired && fatherDetails?.mobileNoDisplay) {
          fatherMobileNo.setValidators([Validators.required]);
        }
        if (fatherDetails?.occupationRequired && fatherDetails?.occupationDisplay) {
          fatherOccupation.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeAddressRequired && fatherDetails?.officeAddressDisplay) {
          fatherOfficeAddress.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeDistRequired && fatherDetails?.officeDistDisplay) {
          fatherOfficeDist.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeStreetRequired && fatherDetails?.officeStreetDisplay) {
          fatherOfficeStreet.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeAreaRequired && fatherDetails?.officeAreaDisplay) {
          fatherOfficeArea.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeCityRequired && fatherDetails?.officeCityDisplay) {
          fatherOfficeCity.setValidators([Validators.required]);
        }
        if (fatherDetails?.officePincodeRequired && fatherDetails?.officePincodeDisplay) {
          fatherOfficePincode.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeStateRequired && fatherDetails?.officeStateDisplay) {
          fatherOfficeState.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeTelRequired && fatherDetails?.officeTelDisplay) {
          fatherOfficeTel.setValidators([Validators.required]);
        }
        if (fatherDetails?.qualificationRequired && fatherDetails?.qualificationDisplay) {
          fatherQualification.setValidators([Validators.required]);
        }
        if (fatherDetails?.residentTelRequired && fatherDetails?.residentTelDisplay) {
          fatherResidentTel.setValidators([Validators.required]);
        }
        this.guardianInfoForm.controls.showGuardianDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showMotherDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showFatherDetails.setValue(true, { emitEvent: false });
        this.guardianInfoForm.controls.showBrotherDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showSisterDetails.setValue(false, { emitEvent: false });

        aadharNo.clearValidators();
        panCard.clearValidators();
        annualIncome.clearValidators();
        companyName.clearValidators();
        designation.clearValidators();
        email.clearValidators();
        fullName.clearValidators();
        relation.clearValidators();
        mobileNo.clearValidators();
        occupation.clearValidators();
        officeAddress.clearValidators();
        officeDist.clearValidators();
        officeArea.clearValidators();
        officeStreet.clearValidators();
        officeCity.clearValidators();
        officePincode.clearValidators();
        officeState.clearValidators();
        officeTel.clearValidators();
        qualification.clearValidators();
        residentTel.clearValidators();

        motherAadharNo.clearValidators();
        motherPanCard.clearValidators();
        motherAnnualIncome.clearValidators();
        motherCompanyName.clearValidators();
        motherDesignation.clearValidators();
        motherEmail.clearValidators();
        motherFullName.clearValidators();
        motherMobileNo.clearValidators();
        motherOccupation.clearValidators();
        motherOfficeDist.clearValidators();
        motherOfficeAddress.clearValidators();
        motherOfficeArea.clearValidators();
        motherOfficeStreet.clearValidators();
        motherOfficeCity.clearValidators();
        motherOfficePincode.clearValidators();
        motherOfficeState.clearValidators();
        motherOfficeTel.clearValidators();
        motherQualification.clearValidators();
        motherResidentTel.clearValidators();
      }
      else if ((this.guardianInfoForm.controls.membersInfo.get('anyOneBlk').value == 'mother')) {

        let motherDetails = this.formData?.guardianInfo?.membersInfo?.motherDetails;

        if (motherDetails?.annualIncomeRequired && motherDetails?.annualIncomeDisplay) {
          motherAnnualIncome.setValidators([Validators.required]);
        }
        if (motherDetails?.aadharNoRequired && motherDetails?.aadharNoDisplay) {
          motherAadharNo.setValidators([Validators.required]);
        }
        if (motherDetails?.panCardRequired && motherDetails?.panCardDisplay) {
          motherPanCard.setValidators([Validators.required]);
        }
        if (motherDetails?.companyNameRequired && motherDetails?.companyNameDisplay) {
          motherCompanyName.setValidators([Validators.required]);
        }
        if (motherDetails?.designationRequired && motherDetails?.designationDisplay) {
          motherDesignation.setValidators([Validators.required]);
        }
        if (motherDetails?.emailRequired && motherDetails?.emailDisplay) {
          motherEmail.setValidators([Validators.required]);
        }
        if (motherDetails?.fullNameRequired && motherDetails?.fullNameDisplay) {
          motherFullName.setValidators([Validators.required]);
        }
        if (motherDetails?.mobileNoRequired && motherDetails?.mobileNoDisplay) {
          motherMobileNo.setValidators([Validators.required]);
        }
        if (motherDetails?.occupationRequired && motherDetails?.occupationDisplay) {
          motherOccupation.setValidators([Validators.required]);
        }
        if (motherDetails?.officeAddressRequired && motherDetails?.officeAddressDisplay) {
          motherOfficeAddress.setValidators([Validators.required]);
        }
        if (motherDetails?.officeDistRequired && motherDetails?.officeDistDisplay) {
          motherOfficeDist.setValidators([Validators.required]);
        }
        if (motherDetails?.officeAreaRequired && motherDetails?.officeAreaDisplay) {
          motherOfficeArea.setValidators([Validators.required]);
        }
        if (motherDetails?.officeStreetRequired && motherDetails?.officeStreetDisplay) {
          motherOfficeStreet.setValidators([Validators.required]);
        }
        if (motherDetails?.officeCityRequired && motherDetails?.officeCityDisplay) {
          motherOfficeCity.setValidators([Validators.required]);
        }
        if (motherDetails?.officePincodeRequired && motherDetails?.officePincodeDisplay) {
          motherOfficePincode.setValidators([Validators.required]);
        }
        if (motherDetails?.officeStateRequired && motherDetails?.officeStateDisplay) {
          motherOfficeState.setValidators([Validators.required]);
        }
        if (motherDetails?.officeTelRequired && motherDetails?.officeTelDisplay) {
          motherOfficeTel.setValidators([Validators.required]);
        }
        if (motherDetails?.qualificationRequired && motherDetails?.qualificationDisplay) {
          motherQualification.setValidators([Validators.required]);
        }
        if (motherDetails?.residentTelRequired && motherDetails?.residentTelDisplay) {
          motherResidentTel.setValidators([Validators.required]);
        }

        let brotherDetails = this.formData?.guardianInfo?.membersInfo?.brotherDetails;

        if (brotherDetails?.annualIncomeRequired && brotherDetails?.annualIncomeDisplay) {
          brotherAnnualIncome.setValidators([Validators.required]);
        }
        if (brotherDetails?.aadharNoRequired && brotherDetails?.aadharNoDisplay) {
          brotherAadharNo.setValidators([Validators.required]);
        }
        if (brotherDetails?.panCardRequired && brotherDetails?.panCardDisplay) {
          brotherPanCard.setValidators([Validators.required]);
        }
        if (brotherDetails?.companyNameRequired && brotherDetails?.companyNameDisplay) {
          brotherCompanyName.setValidators([Validators.required]);
        }
        if (brotherDetails?.designationRequired && brotherDetails?.designationDisplay) {
          brotherDesignation.setValidators([Validators.required]);
        }
        if (brotherDetails?.emailRequired && brotherDetails?.emailDisplay) {
          brotherEmail.setValidators([Validators.required]);
        }
        if (brotherDetails?.fullNameRequired && brotherDetails?.fullNameDisplay) {
          brotherFullName.setValidators([Validators.required]);
        }
        if (brotherDetails?.mobileNoRequired && brotherDetails?.mobileNoDisplay) {
          brotherMobileNo.setValidators([Validators.required]);
        }
        if (brotherDetails?.occupationRequired && brotherDetails?.occupationDisplay) {
          brotherOccupation.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeAddressRequired && brotherDetails?.officeAddressDisplay) {
          brotherOfficeAddress.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeDistRequired && brotherDetails?.officeDistDisplay) {
          brotherOfficeDist.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeStreetRequired && brotherDetails?.officeStreetDisplay) {
          brotherOfficeStreet.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeAreaRequired && brotherDetails?.officeAreaDisplay) {
          brotherOfficeArea.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeCityRequired && brotherDetails?.officeCityDisplay) {
          brotherOfficeCity.setValidators([Validators.required]);
        }
        if (brotherDetails?.officePincodeRequired && brotherDetails?.officePincodeDisplay) {
          brotherOfficePincode.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeStateRequired && brotherDetails?.officeStateDisplay) {
          brotherOfficeState.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeTelRequired && brotherDetails?.officeTelDisplay) {
          brotherOfficeTel.setValidators([Validators.required]);
        }
        if (brotherDetails?.qualificationRequired && brotherDetails?.qualificationDisplay) {
          brotherQualification.setValidators([Validators.required]);
        }
        if (brotherDetails?.residentTelRequired && brotherDetails?.residentTelDisplay) {
          brotherResidentTel.setValidators([Validators.required]);
        }

        let sisterDetails = this.formData?.guardianInfo?.membersInfo?.sisterDetails;

        if (sisterDetails?.annualIncomeRequired && sisterDetails?.annualIncomeDisplay) {
          sisterAnnualIncome.setValidators([Validators.required]);
        }
        if (sisterDetails?.aadharNoRequired && sisterDetails?.aadharNoDisplay) {
          sisterAadharNo.setValidators([Validators.required]);
        }
        if (sisterDetails?.panCardRequired && sisterDetails?.panCardDisplay) {
          sisterPanCard.setValidators([Validators.required]);
        }
        if (sisterDetails?.companyNameRequired && sisterDetails?.companyNameDisplay) {
          sisterCompanyName.setValidators([Validators.required]);
        }
        if (sisterDetails?.designationRequired && sisterDetails?.designationDisplay) {
          sisterDesignation.setValidators([Validators.required]);
        }
        if (sisterDetails?.emailRequired && sisterDetails?.emailDisplay) {
          sisterEmail.setValidators([Validators.required]);
        }
        if (sisterDetails?.fullNameRequired && sisterDetails?.fullNameDisplay) {
          sisterFullName.setValidators([Validators.required]);
        }
        if (sisterDetails?.mobileNoRequired && sisterDetails?.mobileNoDisplay) {
          sisterMobileNo.setValidators([Validators.required]);
        }
        if (sisterDetails?.occupationRequired && sisterDetails?.occupationDisplay) {
          sisterOccupation.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeAddressRequired && sisterDetails?.officeAddressDisplay) {
          sisterOfficeAddress.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeDistRequired && sisterDetails?.officeDistDisplay) {
          sisterOfficeDist.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeAreaRequired && sisterDetails?.officeAreaDisplay) {
          sisterOfficeArea.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeStreetRequired && sisterDetails?.officeStreetDisplay) {
          sisterOfficeStreet.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeCityRequired && sisterDetails?.officeCityDisplay) {
          sisterOfficeCity.setValidators([Validators.required]);
        }
        if (sisterDetails?.officePincodeRequired && sisterDetails?.officePincodeDisplay) {
          sisterOfficePincode.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeStateRequired && sisterDetails?.officeStateDisplay) {
          sisterOfficeState.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeTelRequired && sisterDetails?.officeTelDisplay) {
          sisterOfficeTel.setValidators([Validators.required]);
        }
        if (sisterDetails?.qualificationRequired && sisterDetails?.qualificationDisplay) {
          sisterQualification.setValidators([Validators.required]);
        }
        if (sisterDetails?.residentTelRequired && sisterDetails?.residentTelDisplay) {
          sisterResidentTel.setValidators([Validators.required]);
        }

        aadharNo.clearValidators();
        panCard.clearValidators();
        annualIncome.clearValidators();
        companyName.clearValidators();
        designation.clearValidators();
        email.clearValidators();
        fullName.clearValidators();
        relation.clearValidators();
        mobileNo.clearValidators();
        occupation.clearValidators();
        officeAddress.clearValidators();
        officeDist.clearValidators();
        officeStreet.clearValidators();
        officeArea.clearValidators();
        officeCity.clearValidators();
        officePincode.clearValidators();
        officeState.clearValidators();
        officeTel.clearValidators();
        qualification.clearValidators();
        residentTel.clearValidators();

        fatherAadharNo.clearValidators();
        fatherPanCard.clearValidators();
        fatherAnnualIncome.clearValidators();
        fatherCompanyName.clearValidators();
        fatherDesignation.clearValidators();
        fatherEmail.clearValidators();
        fatherFullName.clearValidators();
        fatherMobileNo.clearValidators();
        fatherOccupation.clearValidators();
        fatherOfficeAddress.clearValidators();
        fatherOfficeDist.clearValidators();
        fatherOfficeStreet.clearValidators();
        fatherOfficeArea.clearValidators();
        fatherOfficeCity.clearValidators();
        fatherOfficePincode.clearValidators();
        fatherOfficeState.clearValidators();
        fatherOfficeTel.clearValidators();
        fatherQualification.clearValidators();
        fatherResidentTel.clearValidators();

        this.guardianInfoForm.controls.showGuardianDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showMotherDetails.setValue(true, { emitEvent: false });
        this.guardianInfoForm.controls.showFatherDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showBrotherDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showSisterDetails.setValue(false, { emitEvent: false });
        this.guardianName = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('fullName').value;

      } else {

        let guardianDetails = this.formData?.guardianInfo?.membersInfo?.guardianDetails;

        if (guardianDetails?.aadharNoRequired && guardianDetails?.aadharNoDisplay) {
          aadharNo.setValidators([Validators.required]);
        }
        if (guardianDetails?.panCardRequired && guardianDetails?.panCardDisplay) {
          panCard.setValidators([Validators.required]);
        }
        if (guardianDetails?.annualIncomeRequired && guardianDetails?.annualIncomeDisplay) {
          annualIncome.setValidators([Validators.required]);
        }
        if (guardianDetails?.companyNameRequired && guardianDetails?.companyNameDisplay) {
          companyName.setValidators([Validators.required]);
        }
        if (guardianDetails?.designationRequired && guardianDetails?.designationDisplay) {
          designation.setValidators([Validators.required]);
        }
        if (guardianDetails?.emailRequired && guardianDetails?.emailDisplay) {
          email.setValidators([Validators.required]);
        }
        if (guardianDetails?.fullNameRequired && guardianDetails?.fullNameDisplay) {
          fullName.setValidators([Validators.required]);
        }
        if (guardianDetails?.relationRequired && guardianDetails?.relationDisplay) {
          relation.setValidators([Validators.required]);
        }
        if (guardianDetails?.mobileNoRequired && guardianDetails?.mobileNoDisplay) {
          mobileNo.setValidators([Validators.required]);
        }
        if (guardianDetails?.occupationRequired && guardianDetails?.occupationDisplay) {
          occupation.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeAddressRequired && guardianDetails?.officeAddressDisplay) {
          officeAddress.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeDistRequired && guardianDetails?.officeDistDisplay) {
          officeDist.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeStreetRequired && guardianDetails?.officeStreetDisplay) {
          officeStreet.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeAreaRequired && guardianDetails?.officeAreaDisplay) {
          officeArea.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeCityRequired && guardianDetails?.officeCityDisplay) {
          officeCity.setValidators([Validators.required]);
        }
        if (guardianDetails?.officePincodeRequired && guardianDetails?.officePincodeDisplay) {
          officePincode.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeStateRequired && guardianDetails?.officeStateDisplay) {
          officeState.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeTelRequired && guardianDetails?.officeTelDisplay) {
          officeTel.setValidators([Validators.required]);
        }
        if (guardianDetails?.qualificationRequired && guardianDetails?.qualificationDisplay) {
          qualification.setValidators([Validators.required]);
        }
        if (guardianDetails?.residentTelRequired && guardianDetails?.residentTelDisplay) {
          residentTel.setValidators([Validators.required]);
        }

        fatherAadharNo.clearValidators();
        fatherPanCard.clearValidators();
        fatherAnnualIncome.clearValidators();
        fatherCompanyName.clearValidators();
        fatherDesignation.clearValidators();
        fatherEmail.clearValidators();
        fatherFullName.clearValidators();
        fatherMobileNo.clearValidators();
        fatherOccupation.clearValidators();
        fatherOfficeAddress.clearValidators();
        fatherOfficeDist.clearValidators();
        fatherOfficeStreet.clearValidators();
        fatherOfficeArea.clearValidators();
        fatherOfficeCity.clearValidators();
        fatherOfficePincode.clearValidators();
        fatherOfficeState.clearValidators();
        fatherOfficeTel.clearValidators();
        fatherQualification.clearValidators();
        fatherResidentTel.clearValidators();

        motherAadharNo.clearValidators();
        motherPanCard.clearValidators();
        motherAnnualIncome.clearValidators();
        motherCompanyName.clearValidators();
        motherDesignation.clearValidators();
        motherEmail.clearValidators();
        motherFullName.clearValidators();
        motherMobileNo.clearValidators();
        motherOccupation.clearValidators();
        motherOfficeAddress.clearValidators();
        motherOfficeDist.clearValidators();
        motherOfficeStreet.clearValidators();
        motherOfficeArea.clearValidators();
        motherOfficeCity.clearValidators();
        motherOfficePincode.clearValidators();
        motherOfficeState.clearValidators();
        motherOfficeTel.clearValidators();
        motherQualification.clearValidators();
        motherResidentTel.clearValidators();

        brotherAadharNo.clearValidators();
        brotherPanCard.clearValidators();
        brotherAnnualIncome.clearValidators();
        brotherCompanyName.clearValidators();
        brotherDesignation.clearValidators();
        brotherEmail.clearValidators();
        brotherFullName.clearValidators();
        brotherMobileNo.clearValidators();
        brotherOccupation.clearValidators();
        brotherOfficeAddress.clearValidators();
        brotherOfficeDist.clearValidators();
        brotherOfficeArea.clearValidators();
        brotherOfficeStreet.clearValidators();
        brotherOfficeCity.clearValidators();
        brotherOfficePincode.clearValidators();
        brotherOfficeState.clearValidators();
        brotherOfficeTel.clearValidators();
        brotherQualification.clearValidators();
        brotherResidentTel.clearValidators();

        sisterAadharNo.clearValidators();
        sisterPanCard.clearValidators();
        sisterAnnualIncome.clearValidators();
        sisterCompanyName.clearValidators();
        sisterDesignation.clearValidators();
        sisterEmail.clearValidators();
        sisterFullName.clearValidators();
        sisterMobileNo.clearValidators();
        sisterOccupation.clearValidators();
        sisterOfficeAddress.clearValidators();
        sisterOfficeDist.clearValidators();
        sisterOfficeStreet.clearValidators();
        sisterOfficeArea.clearValidators();
        sisterOfficeCity.clearValidators();
        sisterOfficePincode.clearValidators();
        sisterOfficeState.clearValidators();
        sisterOfficeTel.clearValidators();
        sisterQualification.clearValidators();
        sisterResidentTel.clearValidators();

        this.guardianInfoForm.controls.showGuardianDetails.setValue(true, { emitEvent: false });
        this.guardianInfoForm.controls.showFatherDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showMotherDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showBrotherDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.showSisterDetails.setValue(false, { emitEvent: false });
        this.guardianName = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('fullName').value;
      }

    } else {

      if (this.guardianInfoForm.controls.membersInfo.get('guardian').value == 'no') {

        let fatherDetails = this.formData?.guardianInfo?.membersInfo?.fatherDetails;

        if (fatherDetails?.annualIncomeRequired && fatherDetails?.annualIncomeDisplay) {
          fatherAnnualIncome.setValidators([Validators.required]);
        }
        if (fatherDetails?.aadharNoRequired && fatherDetails?.aadharNoDisplay) {
          fatherAadharNo.setValidators([Validators.required]);
        }
        if (fatherDetails?.panCardRequired && fatherDetails?.panCardDisplay) {
          fatherPanCard.setValidators([Validators.required]);
        }
        if (fatherDetails?.companyNameRequired && fatherDetails?.companyNameDisplay) {
          fatherCompanyName.setValidators([Validators.required]);
        }
        if (fatherDetails?.designationRequired && fatherDetails?.designationDisplay) {
          fatherDesignation.setValidators([Validators.required]);
        }
        if (fatherDetails?.emailRequired && fatherDetails?.emailDisplay) {
          fatherEmail.setValidators([Validators.required]);
        }
        if (fatherDetails?.fullNameRequired && fatherDetails?.fullNameDisplay) {
          fatherFullName.setValidators([Validators.required]);
        }
        if (fatherDetails?.mobileNoRequired && fatherDetails?.mobileNoDisplay) {
          fatherMobileNo.setValidators([Validators.required]);
        }
        if (fatherDetails?.occupationRequired && fatherDetails?.occupationDisplay) {
          fatherOccupation.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeAddressRequired && fatherDetails?.officeAddressDisplay) {
          fatherOfficeAddress.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeDistRequired && fatherDetails?.officeDistDisplay) {
          fatherOfficeDist.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeAreaRequired && fatherDetails?.officeAreaDisplay) {
          fatherOfficeArea.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeStreetRequired && fatherDetails?.officeStreetDisplay) {
          fatherOfficeStreet.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeCityRequired && fatherDetails?.officeCityDisplay) {
          fatherOfficeCity.setValidators([Validators.required]);
        }
        if (fatherDetails?.officePincodeRequired && fatherDetails?.officePincodeDisplay) {
          fatherOfficePincode.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeStateRequired && fatherDetails?.officeStateDisplay) {
          fatherOfficeState.setValidators([Validators.required]);
        }
        if (fatherDetails?.officeTelRequired && fatherDetails?.officeTelDisplay) {
          fatherOfficeTel.setValidators([Validators.required]);
        }
        if (fatherDetails?.qualificationRequired && fatherDetails?.qualificationDisplay) {
          fatherQualification.setValidators([Validators.required]);
        }
        if (fatherDetails?.residentTelRequired && fatherDetails?.residentTelDisplay) {
          fatherResidentTel.setValidators([Validators.required]);
        }

        let motherDetails = this.formData?.guardianInfo?.membersInfo?.motherDetails;

        if (motherDetails?.annualIncomeRequired && motherDetails?.annualIncomeDisplay) {
          motherAnnualIncome.setValidators([Validators.required]);
        }
        if (motherDetails?.aadharNoRequired && motherDetails?.aadharNoDisplay) {
          motherAadharNo.setValidators([Validators.required]);
        }
        if (motherDetails?.panCardRequired && motherDetails?.panCardDisplay) {
          motherPanCard.setValidators([Validators.required]);
        }
        if (motherDetails?.companyNameRequired && motherDetails?.companyNameDisplay) {
          motherCompanyName.setValidators([Validators.required]);
        }
        if (motherDetails?.designationRequired && motherDetails?.designationDisplay) {
          motherDesignation.setValidators([Validators.required]);
        }
        if (motherDetails?.emailRequired && motherDetails?.emailDisplay) {
          motherEmail.setValidators([Validators.required]);
        }
        if (motherDetails?.fullNameRequired && motherDetails?.fullNameDisplay) {
          motherFullName.setValidators([Validators.required]);
        }
        if (motherDetails?.mobileNoRequired && motherDetails?.mobileNoDisplay) {
          motherMobileNo.setValidators([Validators.required]);
        }
        if (motherDetails?.occupationRequired && motherDetails?.occupationDisplay) {
          motherOccupation.setValidators([Validators.required]);
        }
        if (motherDetails?.officeAddressRequired && motherDetails?.officeAddressDisplay) {
          motherOfficeAddress.setValidators([Validators.required]);
        }
        if (motherDetails?.officeDistRequired && motherDetails?.officeDistDisplay) {
          motherOfficeDist.setValidators([Validators.required]);
        }
        if (motherDetails?.officeStreetRequired && motherDetails?.officeStreetDisplay) {
          motherOfficeStreet.setValidators([Validators.required]);
        }
        if (motherDetails?.officeAreaRequired && motherDetails?.officeAreaDisplay) {
          motherOfficeArea.setValidators([Validators.required]);
        }
        if (motherDetails?.officeCityRequired && motherDetails?.officeCityDisplay) {
          motherOfficeCity.setValidators([Validators.required]);
        }
        if (motherDetails?.officePincodeRequired && motherDetails?.officePincodeDisplay) {
          motherOfficePincode.setValidators([Validators.required]);
        }
        if (motherDetails?.officeStateRequired && motherDetails?.officeStateDisplay) {
          motherOfficeState.setValidators([Validators.required]);
        }
        if (motherDetails?.officeTelRequired && motherDetails?.officeTelDisplay) {
          motherOfficeTel.setValidators([Validators.required]);
        }
        if (motherDetails?.qualificationRequired && motherDetails?.qualificationDisplay) {
          motherQualification.setValidators([Validators.required]);
        }
        if (motherDetails?.residentTelRequired && motherDetails?.residentTelDisplay) {
          motherResidentTel.setValidators([Validators.required]);
        }

        let brotherDetails = this.formData?.guardianInfo?.membersInfo?.brotherDetails;

        if (brotherDetails?.annualIncomeRequired && brotherDetails?.annualIncomeDisplay) {
          brotherAnnualIncome.setValidators([Validators.required]);
        }
        if (brotherDetails?.aadharNoRequired && brotherDetails?.aadharNoDisplay) {
          brotherAadharNo.setValidators([Validators.required]);
        }
        if (brotherDetails?.panCardRequired && brotherDetails?.panCardDisplay) {
          brotherPanCard.setValidators([Validators.required]);
        }
        if (brotherDetails?.companyNameRequired && brotherDetails?.companyNameDisplay) {
          brotherCompanyName.setValidators([Validators.required]);
        }
        if (brotherDetails?.designationRequired && brotherDetails?.designationDisplay) {
          brotherDesignation.setValidators([Validators.required]);
        }
        if (brotherDetails?.emailRequired && brotherDetails?.emailDisplay) {
          brotherEmail.setValidators([Validators.required]);
        }
        if (brotherDetails?.fullNameRequired && brotherDetails?.fullNameDisplay) {
          brotherFullName.setValidators([Validators.required]);
        }
        if (brotherDetails?.mobileNoRequired && brotherDetails?.mobileNoDisplay) {
          brotherMobileNo.setValidators([Validators.required]);
        }
        if (brotherDetails?.occupationRequired && brotherDetails?.occupationDisplay) {
          brotherOccupation.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeAddressRequired && brotherDetails?.officeAddressDisplay) {
          brotherOfficeAddress.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeDistRequired && brotherDetails?.officeDistDisplay) {
          brotherOfficeDist.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeAreaRequired && brotherDetails?.officeAreaDisplay) {
          brotherOfficeArea.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeStreetRequired && brotherDetails?.officeStreetDisplay) {
          brotherOfficeStreet.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeCityRequired && brotherDetails?.officeCityDisplay) {
          brotherOfficeCity.setValidators([Validators.required]);
        }
        if (brotherDetails?.officePincodeRequired && brotherDetails?.officePincodeDisplay) {
          brotherOfficePincode.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeStateRequired && brotherDetails?.officeStateDisplay) {
          brotherOfficeState.setValidators([Validators.required]);
        }
        if (brotherDetails?.officeTelRequired && brotherDetails?.officeTelDisplay) {
          brotherOfficeTel.setValidators([Validators.required]);
        }
        if (brotherDetails?.qualificationRequired && brotherDetails?.qualificationDisplay) {
          brotherQualification.setValidators([Validators.required]);
        }
        if (brotherDetails?.residentTelRequired && brotherDetails?.residentTelDisplay) {
          brotherResidentTel.setValidators([Validators.required]);
        }

        let sisterDetails = this.formData?.guardianInfo?.membersInfo?.sisterDetails;

        if (sisterDetails?.annualIncomeRequired && sisterDetails?.annualIncomeDisplay) {
          sisterAnnualIncome.setValidators([Validators.required]);
        }
        if (sisterDetails?.aadharNoRequired && sisterDetails?.aadharNoDisplay) {
          sisterAadharNo.setValidators([Validators.required]);
        }
        if (sisterDetails?.panCardRequired && sisterDetails?.panCardDisplay) {
          sisterPanCard.setValidators([Validators.required]);
        }
        if (sisterDetails?.companyNameRequired && sisterDetails?.companyNameDisplay) {
          sisterCompanyName.setValidators([Validators.required]);
        }
        if (sisterDetails?.designationRequired && sisterDetails?.designationDisplay) {
          sisterDesignation.setValidators([Validators.required]);
        }
        if (sisterDetails?.emailRequired && sisterDetails?.emailDisplay) {
          sisterEmail.setValidators([Validators.required]);
        }
        if (sisterDetails?.fullNameRequired && sisterDetails?.fullNameDisplay) {
          sisterFullName.setValidators([Validators.required]);
        }
        if (sisterDetails?.mobileNoRequired && sisterDetails?.mobileNoDisplay) {
          sisterMobileNo.setValidators([Validators.required]);
        }
        if (sisterDetails?.occupationRequired && sisterDetails?.occupationDisplay) {
          sisterOccupation.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeAddressRequired && sisterDetails?.officeAddressDisplay) {
          sisterOfficeAddress.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeDistRequired && sisterDetails?.officeDistDisplay) {
          sisterOfficeDist.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeStreetRequired && sisterDetails?.officeStreetDisplay) {
          sisterOfficeStreet.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeAreaRequired && sisterDetails?.officeAreaDisplay) {
          sisterOfficeArea.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeCityRequired && sisterDetails?.officeCityDisplay) {
          sisterOfficeCity.setValidators([Validators.required]);
        }
        if (sisterDetails?.officePincodeRequired && sisterDetails?.officePincodeDisplay) {
          sisterOfficePincode.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeStateRequired && sisterDetails?.officeStateDisplay) {
          sisterOfficeState.setValidators([Validators.required]);
        }
        if (sisterDetails?.officeTelRequired && sisterDetails?.officeTelDisplay) {
          sisterOfficeTel.setValidators([Validators.required]);
        }
        if (sisterDetails?.qualificationRequired && sisterDetails?.qualificationDisplay) {
          sisterQualification.setValidators([Validators.required]);
        }
        if (sisterDetails?.residentTelRequired && sisterDetails?.residentTelDisplay) {
          sisterResidentTel.setValidators([Validators.required]);
        }

        aadharNo.clearValidators();
        panCard.clearValidators();
        annualIncome.clearValidators();
        companyName.clearValidators();
        designation.clearValidators();
        email.clearValidators();
        fullName.clearValidators();
        mobileNo.clearValidators();
        occupation.clearValidators();
        officeAddress.clearValidators();
        officeDist.clearValidators();
        officeArea.clearValidators();
        officeStreet.clearValidators();
        officeCity.clearValidators();
        officePincode.clearValidators();
        officeState.clearValidators();
        officeTel.clearValidators();
        qualification.clearValidators();
        relation.clearValidators();
        residentTel.clearValidators();

        this.guardianInfoForm.controls.showGuardianDetails.setValue(false, { emitEvent: false });
        this.guardianInfoForm.controls.membersInfo['controls'].showMemberDetails.setValue(true, { emitEvent: false });
        this.guardianName = this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails.get('fullName').value;

      } else {

        let guardianDetails = this.formData?.guardianInfo?.membersInfo?.guardianDetails;

        if (guardianDetails?.aadharNoRequired && guardianDetails?.aadharNoDisplay) {
          aadharNo.setValidators([Validators.required]);
        }
        if (guardianDetails?.panCardRequired && guardianDetails?.panCardDisplay) {
          panCard.setValidators([Validators.required]);
        }
        if (guardianDetails?.annualIncomeRequired && guardianDetails?.annualIncomeDisplay) {
          annualIncome.setValidators([Validators.required]);
        }
        if (guardianDetails?.companyNameRequired && guardianDetails?.companyNameDisplay) {
          companyName.setValidators([Validators.required]);
        }
        if (guardianDetails?.designationRequired && guardianDetails?.designationDisplay) {
          designation.setValidators([Validators.required]);
        }
        if (guardianDetails?.emailRequired && guardianDetails?.emailDisplay) {
          email.setValidators([Validators.required]);
        }
        if (guardianDetails?.fullNameRequired && guardianDetails?.fullNameDisplay) {
          fullName.setValidators([Validators.required]);
        }
        if (guardianDetails?.mobileNoRequired && guardianDetails?.mobileNoDisplay) {
          mobileNo.setValidators([Validators.required]);
        }
        if (guardianDetails?.occupationRequired && guardianDetails?.occupationDisplay) {
          occupation.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeAddressRequired && guardianDetails?.officeAddressDisplay) {
          officeAddress.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeDistRequired && guardianDetails?.officeDistDisplay) {
          officeDist.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeStreetRequired && guardianDetails?.officeStreetDisplay) {
          officeStreet.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeAreaRequired && guardianDetails?.officeAreaDisplay) {
          officeArea.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeCityRequired && guardianDetails?.officeCityDisplay) {
          officeCity.setValidators([Validators.required]);
        }
        if (guardianDetails?.officePincodeRequired && guardianDetails?.officePincodeDisplay) {
          officePincode.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeStateRequired && guardianDetails?.officeStateDisplay) {
          officeState.setValidators([Validators.required]);
        }
        if (guardianDetails?.officeTelRequired && guardianDetails?.officeTelDisplay) {
          officeTel.setValidators([Validators.required]);
        }
        if (guardianDetails?.qualificationRequired && guardianDetails?.qualificationDisplay) {
          qualification.setValidators([Validators.required]);
        }
        if (guardianDetails?.residentTelRequired && guardianDetails?.residentTelDisplay) {
          residentTel.setValidators([Validators.required]);
        }
        if (guardianDetails?.realtion && guardianDetails?.relationDisplay) {
          relation.setValidators([Validators.required]);
        }

        fatherAadharNo.clearValidators();
        fatherPanCard.clearValidators();
        fatherAnnualIncome.clearValidators();
        fatherCompanyName.clearValidators();
        fatherDesignation.clearValidators();
        fatherEmail.clearValidators();
        fatherFullName.clearValidators();
        fatherMobileNo.clearValidators();
        fatherOccupation.clearValidators();
        fatherOfficeAddress.clearValidators();
        fatherOfficeDist.clearValidators();
        fatherOfficeArea.clearValidators();
        fatherOfficeStreet.clearValidators();
        fatherOfficeCity.clearValidators();
        fatherOfficePincode.clearValidators();
        fatherOfficeState.clearValidators();
        fatherOfficeTel.clearValidators();
        fatherQualification.clearValidators();
        fatherResidentTel.clearValidators();

        motherAadharNo.clearValidators();
        motherPanCard.clearValidators();
        motherAnnualIncome.clearValidators();
        motherCompanyName.clearValidators();
        motherDesignation.clearValidators();
        motherEmail.clearValidators();
        motherFullName.clearValidators();
        motherMobileNo.clearValidators();
        motherOccupation.clearValidators();
        motherOfficeAddress.clearValidators();
        motherOfficeDist.clearValidators();
        motherOfficeStreet.clearValidators();
        motherOfficeArea.clearValidators();
        motherOfficeCity.clearValidators();
        motherOfficePincode.clearValidators();
        motherOfficeState.clearValidators();
        motherOfficeTel.clearValidators();
        motherQualification.clearValidators();
        motherResidentTel.clearValidators();

        brotherAadharNo.clearValidators();
        brotherPanCard.clearValidators();
        brotherAnnualIncome.clearValidators();
        brotherCompanyName.clearValidators();
        brotherDesignation.clearValidators();
        brotherEmail.clearValidators();
        brotherFullName.clearValidators();
        brotherMobileNo.clearValidators();
        brotherOccupation.clearValidators();
        brotherOfficeAddress.clearValidators();
        brotherOfficeDist.clearValidators();
        brotherOfficeStreet.clearValidators();
        brotherOfficeArea.clearValidators();
        brotherOfficeCity.clearValidators();
        brotherOfficePincode.clearValidators();
        brotherOfficeState.clearValidators();
        brotherOfficeTel.clearValidators();
        brotherQualification.clearValidators();
        brotherResidentTel.clearValidators();

        sisterAadharNo.clearValidators();
        sisterPanCard.clearValidators();
        sisterAnnualIncome.clearValidators();
        sisterCompanyName.clearValidators();
        sisterDesignation.clearValidators();
        sisterEmail.clearValidators();
        sisterFullName.clearValidators();
        sisterMobileNo.clearValidators();
        sisterOccupation.clearValidators();
        sisterOfficeAddress.clearValidators();
        sisterOfficeDist.clearValidators();
        sisterOfficeArea.clearValidators();
        sisterOfficeStreet.clearValidators();
        sisterOfficeCity.clearValidators();
        sisterOfficePincode.clearValidators();
        sisterOfficeState.clearValidators();
        sisterOfficeTel.clearValidators();
        sisterQualification.clearValidators();
        sisterResidentTel.clearValidators();

        this.guardianInfoForm.controls.showGuardianDetails.setValue(true, { emitEvent: false });
        this.guardianInfoForm.controls.membersInfo['controls'].showMemberDetails.setValue(false, { emitEvent: false });
        this.guardianName = this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails.get('fullName').value;
      }
    }

    aadharNo.updateValueAndValidity();
    panCard.updateValueAndValidity();
    annualIncome.updateValueAndValidity();
    companyName.updateValueAndValidity();
    designation.updateValueAndValidity();
    email.updateValueAndValidity();
    fullName.updateValueAndValidity();
    relation.updateValueAndValidity();
    mobileNo.updateValueAndValidity();
    occupation.updateValueAndValidity();
    officeAddress.updateValueAndValidity();
    officeDist.updateValueAndValidity();
    officeArea.updateValueAndValidity();
    officeStreet.updateValueAndValidity();
    officeCity.updateValueAndValidity();
    officePincode.updateValueAndValidity();
    officeState.updateValueAndValidity();
    officeTel.updateValueAndValidity();
    qualification.updateValueAndValidity();
    residentTel.updateValueAndValidity();

    fatherAadharNo.updateValueAndValidity();
    fatherPanCard.updateValueAndValidity();
    fatherAnnualIncome.updateValueAndValidity();
    fatherCompanyName.updateValueAndValidity();
    fatherDesignation.updateValueAndValidity();
    fatherEmail.updateValueAndValidity();
    fatherFullName.updateValueAndValidity();
    fatherMobileNo.updateValueAndValidity();
    fatherOccupation.updateValueAndValidity();
    fatherOfficeAddress.updateValueAndValidity();
    fatherOfficeDist.updateValueAndValidity();
    fatherOfficeArea.updateValueAndValidity();
    fatherOfficeStreet.updateValueAndValidity();
    fatherOfficeCity.updateValueAndValidity();
    fatherOfficePincode.updateValueAndValidity();
    fatherOfficeState.updateValueAndValidity();
    fatherOfficeTel.updateValueAndValidity();
    fatherQualification.updateValueAndValidity();
    fatherResidentTel.updateValueAndValidity();

    motherAadharNo.updateValueAndValidity();
    motherPanCard.updateValueAndValidity();
    motherAnnualIncome.updateValueAndValidity();
    motherCompanyName.updateValueAndValidity();
    motherDesignation.updateValueAndValidity();
    motherEmail.updateValueAndValidity();
    motherFullName.updateValueAndValidity();
    motherMobileNo.updateValueAndValidity();
    motherOccupation.updateValueAndValidity();
    motherOfficeDist.updateValueAndValidity();
    motherOfficeStreet.updateValueAndValidity();
    motherOfficeArea.updateValueAndValidity();
    motherOfficeAddress.updateValueAndValidity();
    motherOfficeCity.updateValueAndValidity();
    motherOfficePincode.updateValueAndValidity();
    motherOfficeState.updateValueAndValidity();
    motherOfficeTel.updateValueAndValidity();
    motherQualification.updateValueAndValidity();
    motherResidentTel.updateValueAndValidity();

    brotherAadharNo.updateValueAndValidity();
    brotherPanCard.updateValueAndValidity();
    brotherAnnualIncome.updateValueAndValidity();
    brotherCompanyName.updateValueAndValidity();
    brotherDesignation.updateValueAndValidity();
    brotherEmail.updateValueAndValidity();
    brotherFullName.updateValueAndValidity();
    brotherMobileNo.updateValueAndValidity();
    brotherOccupation.updateValueAndValidity();
    brotherOfficeAddress.updateValueAndValidity();
    brotherOfficeDist.updateValueAndValidity();
    brotherOfficeArea.updateValueAndValidity();
    brotherOfficeStreet.updateValueAndValidity();
    brotherOfficeCity.updateValueAndValidity();
    brotherOfficePincode.updateValueAndValidity();
    brotherOfficeState.updateValueAndValidity();
    brotherOfficeTel.updateValueAndValidity();
    brotherQualification.updateValueAndValidity();
    brotherResidentTel.updateValueAndValidity();

    sisterAadharNo.updateValueAndValidity();
    sisterPanCard.updateValueAndValidity();
    sisterAnnualIncome.updateValueAndValidity();
    sisterCompanyName.updateValueAndValidity();
    sisterDesignation.updateValueAndValidity();
    sisterEmail.updateValueAndValidity();
    sisterFullName.updateValueAndValidity();
    sisterMobileNo.updateValueAndValidity();
    sisterOccupation.updateValueAndValidity();
    sisterOfficeDist.updateValueAndValidity();
    sisterOfficeArea.updateValueAndValidity();
    sisterOfficeStreet.updateValueAndValidity();
    sisterOfficeCity.updateValueAndValidity();
    sisterOfficePincode.updateValueAndValidity();
    sisterOfficeState.updateValueAndValidity();
    sisterOfficeTel.updateValueAndValidity();
    sisterQualification.updateValueAndValidity();
    sisterResidentTel.updateValueAndValidity();

  }

  setEducationInfoValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.educationInfo)) {

      this.streams = formData.educationInfo.streamArray;

      let mediumOfEducationReq:any;
      if (formData.educationInfo.showMediumOfEducation && formData.educationInfo.mediumOfEducationRequired) {
        mediumOfEducationReq = Validators.required;
      }
      let passedHscWithReq:any;
      if (formData.educationInfo.passedHscWith.display && formData.educationInfo.passedHscWith.required) {
        passedHscWithReq = Validators.required;
      }
      let mathsMarksReq:any;
      if (formData.educationInfo.mathsMarks.display && formData.educationInfo.mathsMarks.required) {
        mathsMarksReq = Validators.required;
      }
      let passedHscExemptionReq:any;
      if (formData.educationInfo.passedHscExemption.required && formData.educationInfo.passedHscExemption.display) {
        passedHscExemptionReq = Validators.required;
      }
      let hscRepeaterReq:any;
      if (formData.educationInfo.hscRepeater.required && formData.educationInfo.hscRepeater.display) {
        hscRepeaterReq = Validators.required;
      }
      let prnNoReq:any;
      if (formData.educationInfo.showPrnNo && formData.educationInfo.prnNoRequired) {
        prnNoReq = Validators.compose([Validators.required, Validators.minLength(16), Validators.maxLength(16) ]);
      }

      let cetSubjectInfoReq:any;
      if (formData.educationInfo.enggInfo.cet.subjectInfoReq) {
        cetSubjectInfoReq = Validators.required;
      }
      let diplomaSubjectInfoReq:any;
      if (formData.educationInfo.enggInfo.diploma.subjectInfoReq) {
        diplomaSubjectInfoReq = Validators.required;
      }
      let hscSubjectInfoReq:any;
      let hscSubject1Req:any;
      let hscSubject2Req:any;
      let hscSubject3Req:any;
      let hscOptionalSubjectReq:any;
      let hscOptionalSubject1Req:any;
      let hscOptionalSubject2Req:any;
      let hscOptionalSubject3Req:any;

      if (formData.educationInfo.enggInfo.hsc.subjectInfo.subject1.required) {
        hscSubject1Req = Validators.required;
      }

      if (formData.educationInfo.enggInfo.hsc.subjectInfo.subject2.required) {
        hscSubject2Req = Validators.required;
      }

      if (formData.educationInfo.enggInfo.hsc.subjectInfo.subject3.required) {
        hscSubject3Req = Validators.required;
      }

      if (formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject.required) {
          hscOptionalSubjectReq = Validators.required;
      }

      if (formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject1.required) {
          hscOptionalSubject1Req = Validators.required;
      }

      if (formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject2.required) {
          hscOptionalSubject2Req = Validators.required;
      }

      if (formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject3.required) {
          hscOptionalSubject3Req = Validators.required;
      }

      if (formData.educationInfo.enggInfo.hsc.subjectInfoReq) {
        // hscSubjectInfoReq = Validators.required;
        // if (formData.educationInfo.enggInfo.hsc.subjectInfo.subject1.display) {
        //   hscSubject1Req = Validators.required;
        // }
        // if (formData.educationInfo.enggInfo.hsc.subjectInfo.subject2.display) {
        //   hscSubject2Req = Validators.required;
        // }
        // if (formData.educationInfo.enggInfo.hsc.subjectInfo.subject3.display) {
        //   hscSubject3Req = Validators.required;
        // }
        // if (formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject.display) {
        //   hscOptionalSubjectReq = Validators.required;
        // }
      }
      let sscSubjectInfoReq:any;
      if (formData.educationInfo.enggInfo.ssc.subjectInfoReq && formData.educationInfo.enggInfo.showSsc) {
        // sscSubjectInfoReq = Validators.required;
      }
      let llbMhtCetMarksReq:any;
      if (formData.educationInfo.showLlbMhCet && formData.educationInfo.llbMhCetRequired) {
        llbMhtCetMarksReq = Validators.required;
      }

      this.showUnderGraduate = false;
      if (formData.educationInfo.eduInfo.underGraduate.filter.display) {
        this.showUnderGraduate = true;
      }

      let graduateAppearingReq:any;
      let graduateYearSemesterWiseReq:any;
      let graduateSemesterReq:any;

      let graduateAppearing = null;
      let graduateCgpa = null;
      let graduateDegree = null;
      let graduateOtherText = null;
      let graduateGrade = null;
      let graduateSpecialization = null;
      let graduateYearSemesterWise = null;
      let graduateSemesterNo = null;
      let graduateYearNo = null;
      let graduateYearOfPassing = null;
      let graduateMonthOfPassing = null;

      let boardNameReq:any;
      let schoolNameReq:any;
      let marksObtainedReq:any;
      let marksOutofReq:any;
      let percentageReq:any;

      if (formData.educationInfo.eduInfo.graduate.filter.display) {

        if (formData.educationInfo.eduInfo.graduate.filter.appearing.required && formData.educationInfo.eduInfo.graduate.filter.appearing.display) {
          graduateAppearingReq = Validators.required;
        }
        if (formData.educationInfo.eduInfo.graduate.filter.yearSemesterWise.required && formData.educationInfo.eduInfo.graduate.filter.yearSemesterWise.display) {
          graduateYearSemesterWiseReq = Validators.required;
        }
        if (formData.educationInfo.eduInfo.graduate.filter.semesterNo.required && formData.educationInfo.eduInfo.graduate.filter.semesterNo.display) {
          graduateSemesterReq = Validators.required;
        }

        if (formData.educationInfo.eduInfo.graduate.filter.boardName.required && formData.educationInfo.eduInfo.graduate.filter.boardName.display) {
          boardNameReq = Validators.required;
        }
        if (formData.educationInfo.eduInfo.graduate.filter.schoolName.required && formData.educationInfo.eduInfo.graduate.filter.schoolName.display) {
          schoolNameReq = Validators.required;
        }
        if (formData.educationInfo.eduInfo.graduate.filter.marksObtained.required && formData.educationInfo.eduInfo.graduate.filter.marksObtained.display) {
          marksObtainedReq = Validators.required;
        }
        if (formData.educationInfo.eduInfo.graduate.filter.marksOutof.required && formData.educationInfo.eduInfo.graduate.filter.marksOutof.display) {
          marksOutofReq = Validators.required;
        }
        if (formData.educationInfo.eduInfo.graduate.filter.percentage.required && formData.educationInfo.eduInfo.graduate.filter.percentage.display) {
          percentageReq = Validators.required;
        }

        graduateAppearing = formData.educationInfo.eduInfo.graduate.filter.appearing.value;
        graduateCgpa = formData.educationInfo.eduInfo.graduate.filter.cgpa.value;
        graduateDegree = formData.educationInfo.eduInfo.graduate.filter.degree.value;
        graduateOtherText = formData.educationInfo.eduInfo.graduate.filter.otherText.value;
        graduateGrade = formData.educationInfo.eduInfo.graduate.filter.grade.value;
        graduateSpecialization = formData.educationInfo.eduInfo.graduate.filter.specialization.value;
        graduateYearSemesterWise = formData.educationInfo.eduInfo.graduate.filter.yearSemesterWise.value;
        graduateSemesterNo = formData.educationInfo.eduInfo.graduate.filter.semesterNo.value;
        graduateYearNo = formData.educationInfo.eduInfo.graduate.filter.yearNo.value;
        graduateYearOfPassing = formData.educationInfo.eduInfo.graduate.filter.yearOfPassing.value;
        graduateMonthOfPassing = formData.educationInfo.eduInfo.graduate.filter.monthOfPassing.value;
      }

      this.showGraduate = false;
      if (formData.educationInfo.eduInfo.graduate.filter.display || formData.educationInfo.eduInfo.graduate.filter.listDisplay) {
        this.showGraduate = true;
      }

      let postGraduateAppearingReq:any;
      let postGraduateDegreeReq:any;
      let postGraduateSpecializationReq:any;

      let postGraduateAppearing = null;
      let postGraduateDegree = null;
      let postGraduateOtherText = null;
      let postGraduateSpecialization = null;

      this.showPostGraduate = false;
      if (formData.educationInfo.eduInfo.postGraduate.filter.display) {

        this.showPostGraduate = true;

        if (formData.educationInfo.eduInfo.postGraduate.filter.appearing.required && formData.educationInfo.eduInfo.postGraduate.filter.appearing.display) {
          postGraduateAppearingReq = Validators.required;
        }
        if (formData.educationInfo.eduInfo.postGraduate.filter.degree.required && formData.educationInfo.eduInfo.postGraduate.filter.degree.display) {
          postGraduateDegreeReq = Validators.required;
        }

        if (formData.educationInfo.eduInfo.postGraduate.filter.specialization.required && formData.educationInfo.eduInfo.postGraduate.filter.specialization.display) {
          postGraduateSpecializationReq = Validators.required;
        }

        postGraduateAppearing = formData.educationInfo.eduInfo.postGraduate.filter.appearing.value;
        postGraduateDegree = formData.educationInfo.eduInfo.postGraduate.filter.degree.value;
        postGraduateOtherText = formData.educationInfo.eduInfo.postGraduate.filter.otherText.value;
        postGraduateSpecialization = formData.educationInfo.eduInfo.postGraduate.filter.specialization.value;
      }

      let enteranceExamReq:any;
      let subjectInfoReqReq:any;
      if (formData.educationInfo.showEnteranceDetails) {

        this.showEnteranceDetailsBlk = true;

        if (formData.educationInfo.enteranceDetails.enteranceExam.required && formData.educationInfo.enteranceDetails.enteranceExam.display) {
          enteranceExamReq = Validators.required;
        }

        if (formData.educationInfo.enteranceDetails.subjectInfoReq && formData.educationInfo.enteranceDetails.showSubjects) {
          subjectInfoReqReq = Validators.required;
        }
      }

      let masterGraduateAppearingReq: any;
      let masterGraduateDegreeReq: any;
      let masterGraduateSpecializationReq: any;

      let masterGraduateAppearing = null;
      let masterGraduateDegree = null;
      let masterGraduateOtherText = null;
      let masterGraduateSpecialization = null;

      this.showMasterGraduate = false;
      if (formData.educationInfo.eduInfo.masterGraduate.filter.display) {

        this.showMasterGraduate = true;

        if (formData.educationInfo.eduInfo.masterGraduate.filter.appearing.required && formData.educationInfo.eduInfo.masterGraduate.filter.appearing.display) {
          masterGraduateAppearingReq = Validators.required;
        }
        if (formData.educationInfo.eduInfo.masterGraduate.filter.degree.required && formData.educationInfo.eduInfo.masterGraduate.filter.degree.display) {
          masterGraduateDegreeReq = Validators.required;
        }

        if (formData.educationInfo.eduInfo.masterGraduate.filter.specialization.required && formData.educationInfo.eduInfo.masterGraduate.filter.specialization.display) {
          masterGraduateSpecializationReq = Validators.required;
        }

        masterGraduateAppearing = formData.educationInfo.eduInfo.masterGraduate.filter.appearing.value;
        masterGraduateDegree = formData.educationInfo.eduInfo.masterGraduate.filter.degree.value;
        masterGraduateOtherText = formData.educationInfo.eduInfo.masterGraduate.filter.otherText.value;
        masterGraduateSpecialization = formData.educationInfo.eduInfo.masterGraduate.filter.specialization.value;
      }

      this.semesterNoList = formData.educationInfo.eduInfo.graduate.filter.semesterNo.values;
      this.yearNoList = formData.educationInfo.eduInfo.graduate.filter.yearNo.values;

      this.educationInfoForm = this._formBuilder.group({
        eduInfo: this._formBuilder.group({
          underGraduate: this._formBuilder.group({
            list: this._formBuilder.array([
              this.initItemRows()
            ])
          }),
          graduate: this._formBuilder.group({
            filter: this._formBuilder.group({
              graduateDesc: [formData.educationInfo.eduInfo.postGraduate.graduateDesc],
              appearing: [graduateAppearing, graduateAppearingReq],
              cgpa: [graduateCgpa],
              degree: [graduateDegree],
              otherText: [graduateOtherText],
              grade: [graduateGrade],
              specialization: [graduateSpecialization],
              yearSemesterWise: [graduateYearSemesterWise, graduateYearSemesterWiseReq],
              semesterNo: [graduateSemesterNo],
              yearNo: [graduateYearNo],
              yearOfPassing: [graduateYearOfPassing],
              monthOfPassing: [graduateMonthOfPassing],
              boardName: [formData.educationInfo.eduInfo.graduate.filter.boardName.value, boardNameReq],
              schoolName: [formData.educationInfo.eduInfo.graduate.filter.schoolName.value, schoolNameReq],
              marksObtained: [formData.educationInfo.eduInfo.graduate.filter.marksObtained.value],
              marksOutof: [formData.educationInfo.eduInfo.graduate.filter.marksOutof.value],
              percentage: [formData.educationInfo.eduInfo.graduate.filter.percentage.value],
            }),
            list: this._formBuilder.array([
              this.initItemRows()
            ])
          }),
          postGraduate: this._formBuilder.group({
            postGraduation: [formData.educationInfo.eduInfo.postGraduate.postGraduation], 
            filter: this._formBuilder.group({
              appearing: [postGraduateAppearing, postGraduateAppearingReq],              
              degree: [postGraduateDegree, postGraduateDegreeReq],
              otherText: [postGraduateOtherText],
              specialization: [postGraduateSpecialization, postGraduateSpecializationReq],
            }),
            list: this._formBuilder.array([
              this.initItemRows()
            ])
          }),
          masterGraduate: this._formBuilder.group({
            masterGraduation: [formData.educationInfo.eduInfo.masterGraduate.masterGraduation],
            filter: this._formBuilder.group({
              appearing: [masterGraduateAppearing, masterGraduateAppearingReq],
              degree: [masterGraduateDegree, masterGraduateDegreeReq],
              otherText: [masterGraduateOtherText],
              specialization: [masterGraduateSpecialization, masterGraduateSpecializationReq],
            }),
            list: this._formBuilder.array([
              this.initItemRows()
            ])
          }),
          enggInfo: this._formBuilder.group({
            showCet: [formData.educationInfo.enggInfo.showCet],
            showDiploma: [formData.educationInfo.enggInfo.showDiploma],
            cet: this._formBuilder.group({
              subjectHeading : [formData.educationInfo.enggInfo.cet.subjectHeading],
              subjectInfoReq : [formData.educationInfo.enggInfo.cet.subjectInfoReq],
              subjectInfo: this._formBuilder.group({
                maths: [formData.educationInfo.enggInfo.cet.subjectInfo.maths, cetSubjectInfoReq],
                mathsHeader: [formData.educationInfo.enggInfo.cet.subjectInfo.mathsHeader],
                physics: [formData.educationInfo.enggInfo.cet.subjectInfo.physics, cetSubjectInfoReq],
                physicsHeader: [formData.educationInfo.enggInfo.cet.subjectInfo.physicsHeader],
                chemistry: [formData.educationInfo.enggInfo.cet.subjectInfo.chemistry, cetSubjectInfoReq],
                chemistryHeader: [formData.educationInfo.enggInfo.cet.subjectInfo.chemistryHeader],
                cetTotal: [formData.educationInfo.enggInfo.cet.subjectInfo.cetTotal, cetSubjectInfoReq],
                cetTotalHeader: [formData.educationInfo.enggInfo.cet.subjectInfo.cetTotalHeader],
                jeeTotal: [formData.educationInfo.enggInfo.cet.subjectInfo.jeeTotal, cetSubjectInfoReq],
                jeeTotalHeader: [formData.educationInfo.enggInfo.cet.subjectInfo.jeeTotalHeader]
              })
            }),
            diploma: this._formBuilder.group({
              subjectHeading : [formData.educationInfo.enggInfo.diploma.subjectHeading],
              subjectInfoReq : [formData.educationInfo.enggInfo.diploma.subjectInfoReq],
              subjectInfo: this._formBuilder.group({
                instituteName: [formData.educationInfo.enggInfo.diploma.subjectInfo.instituteName, diplomaSubjectInfoReq],
                instituteNameHeader: [formData.educationInfo.enggInfo.diploma.subjectInfo.instituteNameHeader],
                yearOfPassing: [formData.educationInfo.enggInfo.diploma.subjectInfo.yearOfPassing, diplomaSubjectInfoReq],
                yearOfPassingHeader: [formData.educationInfo.enggInfo.diploma.subjectInfo.yearOfPassingHeader],
                totalOfMSBTE: [formData.educationInfo.enggInfo.diploma.subjectInfo.totalOfMSBTE, diplomaSubjectInfoReq],
                totalOfMSBTEHeader: [formData.educationInfo.enggInfo.diploma.subjectInfo.totalOfMSBTEHeader],
                totalOthers: [formData.educationInfo.enggInfo.diploma.subjectInfo.totalOthers, diplomaSubjectInfoReq],
                totalOthersHeader: [formData.educationInfo.enggInfo.diploma.subjectInfo.totalOthersHeader]
              })
            }),
            hsc: this._formBuilder.group({
              subjectInfo: this._formBuilder.group({
                subject1: this._formBuilder.group({
                  marksObtained: [formData.educationInfo.enggInfo.hsc.subjectInfo.subject1.marks.marksObtained, hscSubject1Req],
                  marksOutof: [formData.educationInfo.enggInfo.hsc.subjectInfo.subject1.marks.marksOutof, hscSubject1Req],
                  totalPercentage: [formData.educationInfo.enggInfo.hsc.subjectInfo.subject1.marks.totalPercentage, hscSubject1Req],
                }),
                subject2: this._formBuilder.group({
                  marksObtained: [formData.educationInfo.enggInfo.hsc.subjectInfo.subject2.marks.marksObtained, hscSubject2Req],
                  marksOutof: [formData.educationInfo.enggInfo.hsc.subjectInfo.subject2.marks.marksOutof, hscSubject2Req],
                  totalPercentage: [formData.educationInfo.enggInfo.hsc.subjectInfo.subject2.marks.totalPercentage, hscSubject2Req],
                }),
                subject3: this._formBuilder.group({
                  marksObtained: [formData.educationInfo.enggInfo.hsc.subjectInfo.subject3.marks.marksObtained, hscSubject3Req],
                  marksOutof: [formData.educationInfo.enggInfo.hsc.subjectInfo.subject3.marks.marksOutof, hscSubject3Req],
                  totalPercentage: [formData.educationInfo.enggInfo.hsc.subjectInfo.subject3.marks.totalPercentage, hscSubject3Req],
                }),
                optionalSubject: this._formBuilder.group({
                  value: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject.value, hscOptionalSubjectReq],
                  marksObtained: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject.marks.marksObtained, hscOptionalSubjectReq],
                  marksOutof: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject.marks.marksOutof, hscOptionalSubjectReq],
                  totalPercentage: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject.marks.totalPercentage, hscOptionalSubjectReq],
                }),
                optionalSubject1: this._formBuilder.group({
                  value: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject1.value, hscOptionalSubjectReq],
                  marksObtained: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject1.marks.marksObtained, hscOptionalSubjectReq],
                  marksOutof: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject1.marks.marksOutof, hscOptionalSubjectReq],
                  totalPercentage: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject1.marks.totalPercentage, hscOptionalSubjectReq],
                }),
                optionalSubject2: this._formBuilder.group({
                  value: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject2.value, hscOptionalSubjectReq],
                  marksObtained: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject2.marks.marksObtained, hscOptionalSubjectReq],
                  marksOutof: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject2.marks.marksOutof, hscOptionalSubjectReq],
                  totalPercentage: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject2.marks.totalPercentage, hscOptionalSubjectReq],
                }),
                optionalSubject3: this._formBuilder.group({
                  value: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject3.value, hscOptionalSubjectReq],
                  marksObtained: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject3.marks.marksObtained, hscOptionalSubjectReq],
                  marksOutof: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject3.marks.marksOutof, hscOptionalSubjectReq],
                  totalPercentage: [formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject3.marks.totalPercentage, hscOptionalSubjectReq],
                }),
                totalMarks: this._formBuilder.group({
                  marksObtained: [formData.educationInfo.enggInfo.hsc.subjectInfo.totalMarks.marks.marksObtained],
                  marksOutof: [formData.educationInfo.enggInfo.hsc.subjectInfo.totalMarks.marks.marksOutof],
                  totalPercentage: [formData.educationInfo.enggInfo.hsc.subjectInfo.totalMarks.marks.totalPercentage],
                })
              })
            }),
            ssc: this._formBuilder.group({
              subjectInfo: this._formBuilder.group({
                maths: this._formBuilder.group({
                  marksObtained: [formData.educationInfo.enggInfo.ssc.subjectInfo.maths.marksObtained, sscSubjectInfoReq],
                  marksOutof: [formData.educationInfo.enggInfo.ssc.subjectInfo.maths.marksOutof, sscSubjectInfoReq],
                  totalPercentage: [formData.educationInfo.enggInfo.ssc.subjectInfo.maths.totalPercentage, sscSubjectInfoReq],
                })
              })
            })
          }),
        }),        
        showPrnNo: [formData.educationInfo.showPrnNo],
        prnNo: [formData.educationInfo.prnNo, prnNoReq],
        passedHscWith: [formData.educationInfo.passedHscWith.value, passedHscWithReq],
        mathsMarks: [formData.educationInfo.mathsMarks.value, Validators.compose([mathsMarksReq, Validators.min(35)])],
        passedHscExemption: [formData.educationInfo.passedHscExemption.value, passedHscExemptionReq],
        hscRepeater: [formData.educationInfo.hscRepeater.value, hscRepeaterReq],
        showMediumOfEducation: [formData.educationInfo.showMediumOfEducation],
        mediumOfEducation: [formData.educationInfo.mediumOfEducation, mediumOfEducationReq],
        showSubjectInfo: [formData.educationInfo.subjectInfo.showSubjectInfo],
        showSubjectLanguagesOptional: [formData.educationInfo.subjectInfo.showSubjectLanguagesOptional],
        showSubjectCompulsory: [formData.educationInfo.subjectInfo.showSubjectCompulsory],
        showSubjectOptional: [formData.educationInfo.subjectInfo.showSubjectOptional],
        subjectInfo: this._formBuilder.group({
          subjectLanguagesOptionalSelected : [formData.educationInfo.subjectInfo.subjectLanguagesOptionalSelected],
          subjectOptionalSelected : [formData.educationInfo.subjectInfo.subjectOptionalSelected]
        }),
       
        showLlbMhCet: [formData.educationInfo.showLlbMhCet],
        llbMhCetInfo: this._formBuilder.group({
          cetMarks : [formData.educationInfo.llbMhCetInfo.cetMarks, llbMhtCetMarksReq],
          cetFormNo : [formData.educationInfo.llbMhCetInfo.cetFormNo, llbMhtCetMarksReq],
          admissionRound : [formData.educationInfo.llbMhCetInfo.admissionRound, llbMhtCetMarksReq],
          cetSeatNo : [formData.educationInfo.llbMhCetInfo.cetSeatNo, llbMhtCetMarksReq],
          provisionalAdmissionLetterNo : [formData.educationInfo.llbMhCetInfo.provisionalAdmissionLetterNo],
        }),
        showOtherEduInfo: [formData.educationInfo.showOtherEduInfo],      
        otherEduInfo: this._formBuilder.group({
          courseType: [formData.educationInfo.otherEduInfo.courseType],
          courseName: [formData.educationInfo.otherEduInfo.courseName],
          instituteName: [formData.educationInfo.otherEduInfo.instituteName],
          timings: [formData.educationInfo.otherEduInfo.timings]
        }),
        enteranceDetails: this._formBuilder.group({
          enteranceExam: [formData.educationInfo.enteranceDetails.enteranceExam.value, enteranceExamReq],
          examFor: [formData.educationInfo.enteranceDetails.examFor.value],
          seatNo: [formData.educationInfo.enteranceDetails.seatNo.value],
          allIndiaRank: [formData.educationInfo.enteranceDetails.allIndiaRank.value],
          branchName: [formData.educationInfo.enteranceDetails.branchName.value],
          presentOrganisation: [formData.educationInfo.enteranceDetails.presentOrganisation.value],
          designation: [formData.educationInfo.enteranceDetails.designation.value],
          workingYears: [formData.educationInfo.enteranceDetails.workingYears.value],
          year: [formData.educationInfo.enteranceDetails.year.value],
          month: [formData.educationInfo.enteranceDetails.month.value],
          score: [formData.educationInfo.enteranceDetails.score.value],
          percentile: [formData.educationInfo.enteranceDetails.percentile.value],
          subjectsInfo: this._formBuilder.group({
            maths: [formData.educationInfo.enteranceDetails.subjectsInfo.maths, subjectInfoReqReq],
            physics: [formData.educationInfo.enteranceDetails.subjectsInfo.physics, subjectInfoReqReq],
            chemistry: [formData.educationInfo.enteranceDetails.subjectsInfo.chemistry, subjectInfoReqReq],
            totalMarks: [formData.educationInfo.enteranceDetails.subjectsInfo.totalMarks],
          })
        })
      });

      if (this.showUnderGraduate) {
        this.setEduInfoValues(formData.educationInfo.eduInfo.underGraduate.list, 'underGraduate');
        this.underGraduateHeaders = formData.educationInfo.educationHeaders.underGraduate;
      }
      if (this.showGraduate && formData.educationInfo.eduInfo.graduate.filter.listDisplay) {
        this.setEduInfoValues(formData.educationInfo.eduInfo.graduate.list, 'graduate');
        this.graduateHeaders = formData.educationInfo.educationHeaders.graduate;
      }
      if (this.showPostGraduate) {
        this.setEduInfoValues(formData.educationInfo.eduInfo.postGraduate.list, 'postGraduate');
        this.postGraduateHeaders = formData.educationInfo.educationHeaders.postGraduate;
      }
      if (this.showMasterGraduate) {
        this.setEduInfoValues(formData.educationInfo.eduInfo.masterGraduate.list, 'masterGraduate');
        this.masterGraduateHeaders = formData.educationInfo.educationHeaders.masterGraduate;
      }

      this.subjectCompulsoryArray = formData.educationInfo.subjectInfo.subjectCompulsory;
      this.subjectLanguagesOptionalArray = formData.educationInfo.subjectInfo.subjectLanguagesOptional;
      this.subjectOptionalArray = formData.educationInfo.subjectInfo.subjectOptional;

      this.appearedForArray = formData.educationInfo.enteranceDetails.appearedForArray;

      this.educationInfoFormValues = this.educationInfoForm.controls.eduInfo.value;
    }
    this.educationInfoFormValueChanged();
    this.educationInfoForm.disable();
  }

  educationInfoFormValueChanged() {

    if (this.formData.educationInfo.showOtherEduInfo) {

      const courseName = this.educationInfoForm.controls.otherEduInfo.get('courseName');
      const instituteName = this.educationInfoForm.controls.otherEduInfo.get('instituteName');
      const timings = this.educationInfoForm.controls.otherEduInfo.get('timings');
      this.educationInfoForm.controls.otherEduInfo.get('courseType').valueChanges.subscribe((mode: string) => {
        if (mode === 'none') {
          courseName.clearValidators();
          instituteName.clearValidators();
          timings.clearValidators();
        } else {
          courseName.setValidators([Validators.required]);
          instituteName.setValidators([Validators.required]);
          timings.setValidators([Validators.required]);
        }
        courseName.updateValueAndValidity();
        instituteName.updateValueAndValidity();
        timings.updateValueAndValidity();
      });
    }

    if (this.formData.educationInfo.eduInfo.graduate.filter.display) {

      this.setGraduateAppearingConditions();
      this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('appearing').valueChanges.subscribe((mode: string) => {
        this.setGraduateAppearingConditions();
      });

      const semesterNo = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('semesterNo');
      const yearNo = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('yearNo');
      this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('yearSemesterWise').valueChanges.subscribe((mode: string) => {
        if (mode == 'semester') {
          yearNo.clearValidators();
          semesterNo.setValidators([Validators.required]);
        } else if (mode == 'yearly') {
          semesterNo.clearValidators();
          yearNo.setValidators([Validators.required]);
        }
        semesterNo.updateValueAndValidity();        
        yearNo.updateValueAndValidity();        
      });
    }

    if (this.formData.educationInfo.showEnteranceDetails) {
      
      this.setEnteranceExamDetailsValidations();
      
      this.educationInfoForm.controls.enteranceDetails.get('enteranceExam').valueChanges.subscribe((mode: string) => {
        this.setEnteranceExamDetailsValidations();
      });
    }
  }

  setGraduateAppearingConditions() {

    const degree = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('degree');
    const specialization = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('specialization');
    const monthOfPassing = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('monthOfPassing');
    const yearOfPassing = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('yearOfPassing');
    const cgpa = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('cgpa');
    const grade = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('grade');
    const marksObtained = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('marksObtained');
    const marksOutof = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('marksOutof');
    const percentage = this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('percentage');
    
    if (this.formData.educationInfo.eduInfo.graduate.filter.degree.required && this.formData.educationInfo.eduInfo.graduate.filter.degree.display) {
      degree.setValidators([Validators.required]);
    }

    if (this.formData.educationInfo.eduInfo.graduate.filter.specialization.required && this.formData.educationInfo.eduInfo.graduate.filter.specialization.display) {
      specialization.setValidators([Validators.required]);
    }
    
    if (this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('appearing').value == 'no') {
    
      if (this.formData.educationInfo.eduInfo.graduate.filter.grade.display) {
        grade.setValidators([Validators.required]);
      }
      if (this.formData.educationInfo.eduInfo.graduate.filter.cgpa.display && this.formData.educationInfo.eduInfo.graduate.filter.cgpa.required) {
        cgpa.setValidators([Validators.required]);
      }
      if (this.formData.educationInfo.eduInfo.graduate.filter.monthOfPassing.display && this.formData.educationInfo.eduInfo.graduate.filter.monthOfPassing.required) {
        monthOfPassing.setValidators([Validators.required]);
      }
      if (this.formData.educationInfo.eduInfo.graduate.filter.yearOfPassing.display && this.formData.educationInfo.eduInfo.graduate.filter.yearOfPassing.required) {
        yearOfPassing.setValidators([Validators.required]);
      }
      if (this.formData.educationInfo.eduInfo.graduate.filter.marksObtained.display) {
        marksObtained.setValidators([Validators.required]);
      }
      if (this.formData.educationInfo.eduInfo.graduate.filter.marksOutof.display) {
        marksOutof.setValidators([Validators.required]);
      }
      if (this.formData.educationInfo.eduInfo.graduate.filter.percentage.display) {
        percentage.setValidators([Validators.required]);
      }
   
    } else {
    
      monthOfPassing.clearValidators();
      yearOfPassing.clearValidators();
      cgpa.clearValidators();
      grade.clearValidators();
      marksObtained.clearValidators();
      marksOutof.clearValidators();
      percentage.clearValidators();
    }
    degree.updateValueAndValidity();
    specialization.updateValueAndValidity();
    monthOfPassing.updateValueAndValidity();
    yearOfPassing.updateValueAndValidity();
    cgpa.updateValueAndValidity();
    grade.updateValueAndValidity();
    marksObtained.updateValueAndValidity();
    marksOutof.updateValueAndValidity();
    percentage.updateValueAndValidity();

    const graduateDetails = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.list;

    if (this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('appearing').value == 'no') {

    } else if (this.educationInfoForm.controls.eduInfo['controls'].graduate.controls.filter.get('appearing').value == 'yes') {

      graduateDetails.controls.forEach((itemRow) => {

        const boardName = itemRow.get('boardName');
        if (this.graduateHeaders.boardName) {
          boardName.clearValidators();
        }

        const schoolName = itemRow.get('schoolName');
        if (this.graduateHeaders.schoolName) {
          schoolName.clearValidators();
        }

        const monthAppeared = itemRow.get('monthAppeared');
        if (this.graduateHeaders.monthAppeared) {
          monthAppeared.clearValidators();
        } 
    
        const yearAppeared = itemRow.get('yearAppeared');
        if (this.graduateHeaders.yearAppeared) {
          yearAppeared.clearValidators();
        }
    
        const marksObtained = itemRow.get('marksObtained');
        if (this.graduateHeaders.marksObtained) {
          marksObtained.clearValidators();
        } 
    
        const marksOutof = itemRow.get('marksOutof');
        if (this.graduateHeaders.marksOutof) {
          marksOutof.clearValidators();
        } 

        const grade = itemRow.get('grade');
        if (this.graduateHeaders.grade) {
          grade.clearValidators();
        } 
    
        boardName.updateValueAndValidity();
        schoolName.updateValueAndValidity();
        monthAppeared.updateValueAndValidity();
        yearAppeared.updateValueAndValidity();
        marksObtained.updateValueAndValidity();
        marksOutof.updateValueAndValidity();
        grade.updateValueAndValidity();
      });
    }
  }

  setEnteranceExamDetailsValidations(): void {

    const examFor = this.educationInfoForm.controls.enteranceDetails.get('examFor');
    const year = this.educationInfoForm.controls.enteranceDetails.get('year');
    const month = this.educationInfoForm.controls.enteranceDetails.get('month');
    const seatNo = this.educationInfoForm.controls.enteranceDetails.get('seatNo');
    const branchName = this.educationInfoForm.controls.enteranceDetails.get('branchName');
    const presentOrganisation = this.educationInfoForm.controls.enteranceDetails.get('presentOrganisation');
    const designation = this.educationInfoForm.controls.enteranceDetails.get('designation');
    const workingYears = this.educationInfoForm.controls.enteranceDetails.get('workingYears');
    const allIndiaRank = this.educationInfoForm.controls.enteranceDetails.get('allIndiaRank');
    const score = this.educationInfoForm.controls.enteranceDetails.get('score');
    const percentile = this.educationInfoForm.controls.enteranceDetails.get('percentile');

    const maths = this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.maths;
    const physics = this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.physics;
    const chemistry = this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.chemistry;

    if (this.showEnteranceDetailsBlk) {

      this.formData.educationInfo.enteranceDetails.enteranceExam.values.forEach((details, key) => {

        if (this.educationInfoForm.controls.enteranceDetails.get('enteranceExam').value == details.key) {

          this.showEnteranceSubjects = false;
          this.showPercentile = false;
          this.showScore = false;
          this.showSeatNo = false;
          this.showEntranceExamYear = false;
          this.showEntranceExamMonth = false;
          this.showEntranceAllIndiaRank = false;
          this.showEntranceBranchName = false;
          this.showEntrancePresentOrganisation = false;
          this.showEntranceDesignation = false;
          this.showEntranceWorkingYears = false;

          examFor.clearValidators();
          year.clearValidators();
          month.clearValidators();
          seatNo.clearValidators();
          branchName.clearValidators();
          presentOrganisation.clearValidators();
          designation.clearValidators();
          workingYears.clearValidators();
          allIndiaRank.clearValidators();
          score.clearValidators();
          percentile.clearValidators();

          maths.clearValidators();
          physics.clearValidators();
          chemistry.clearValidators();
          
          if (details.fields.showYear) {
            this.showEntranceExamYear = true;
            if (this.formData.educationInfo.enteranceDetails.year.required) {                    
              year.setValidators([Validators.required]);
            }
          }

          if (details.fields.showMonth) {
            this.showEntranceExamMonth = true;
            if (this.formData.educationInfo.enteranceDetails.month.required) {
              month.setValidators([Validators.required]);
            }
          }

          if (details.fields.showSeatNo) {
            this.showSeatNo = true;
            if (this.formData.educationInfo.enteranceDetails.seatNo.required) {
              seatNo.setValidators([Validators.required]);
            }
          }

          if (details.fields.showBranchName) {
            this.showEntranceBranchName = true;
            if (this.formData.educationInfo.enteranceDetails.branchName.required) {
              branchName.setValidators([Validators.required]);
            }
          }

          if (details.fields.showPresentOrganisation) {
            this.showEntrancePresentOrganisation = true;
            if (this.formData.educationInfo.enteranceDetails.presentOrganisation.required) {
              presentOrganisation.setValidators([Validators.required]);
            }
          }

          if (details.fields.showDesignation) {
            this.showEntranceDesignation = true;
            if (this.formData.educationInfo.enteranceDetails.designation.required) {
              designation.setValidators([Validators.required]);
            }
          }

          if (details.fields.showWorkingYears) {
            this.showEntranceWorkingYears = true;
            if (this.formData.educationInfo.enteranceDetails.workingYears.required) {
              workingYears.setValidators([Validators.required]);
            }
          }

          if (details.fields.showAllIndiaRank) {
            this.showEntranceAllIndiaRank = true;
            if (this.formData.educationInfo.enteranceDetails.allIndiaRank.required) {
              allIndiaRank.setValidators([Validators.required]);
            }
          }

          if (details.fields.showScore) {
            this.showScore = true;
            if (this.formData.educationInfo.enteranceDetails.score.required) {                    
              score.setValidators([Validators.required]);
            }
          }

          if (details.fields.showPercentile) {
            this.showPercentile = true;
            if (this.formData.educationInfo.enteranceDetails.percentile.required) {                    
              percentile.setValidators([Validators.required]);
            }
          }

          this.showEntranceExamFor = false;
          if (details.fields.showExamFor) {

            this.showEntranceExamFor = true;
            if (this.formData.educationInfo.enteranceDetails.examFor.required) {
              examFor.setValidators([Validators.required]);
            }

            if (details.fields.showSubjectInfo) {

              this.appearedForArray.forEach((value, key) => {

                if (value.name.toString().toLowerCase() == examFor.value.toLowerCase()) {

                  if (value.showSubjectInfo) {
                    this.showEnteranceSubjects = true;
                    maths.setValidators([Validators.required]);
                    physics.setValidators([Validators.required]);
                    chemistry.setValidators([Validators.required]);
                  }
                }
              });
            }
          }
        }
      });

    } else {

      examFor.clearValidators();
      year.clearValidators();
      month.clearValidators();
      seatNo.clearValidators();
      branchName.clearValidators();
      presentOrganisation.clearValidators();
      designation.clearValidators();
      workingYears.clearValidators();
      allIndiaRank.clearValidators();
      score.clearValidators();
      percentile.clearValidators();

      maths.clearValidators();
      physics.clearValidators();
      chemistry.clearValidators();
    }

    examFor.updateValueAndValidity();
    year.updateValueAndValidity();
    month.updateValueAndValidity();
    seatNo.updateValueAndValidity();
    branchName.updateValueAndValidity();
    presentOrganisation.updateValueAndValidity();
    designation.updateValueAndValidity();
    workingYears.updateValueAndValidity();
    allIndiaRank.updateValueAndValidity();
    score.updateValueAndValidity();
    percentile.updateValueAndValidity();
  
    maths.updateValueAndValidity();
    physics.updateValueAndValidity();
    chemistry.updateValueAndValidity();
  }

  onChangeExamFor(appearedFor) {

    const maths = this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.maths;
    const physics = this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.physics;
    const chemistry = this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.chemistry;

    this.formData.educationInfo.enteranceDetails.enteranceExam.values.forEach((details, key) => {

      if (this.educationInfoForm.controls.enteranceDetails.get('enteranceExam').value == details.key) {

        this.showEnteranceSubjects = false;        
        if (details.fields.showSubjectInfo && appearedFor.showSubjectInfo) {

          this.appearedForArray.forEach((value, key) => {

            if (value.name.toString().toLowerCase() == appearedFor.name.toLowerCase()) {

              if (value.showSubjectInfo) {
                this.showEnteranceSubjects = true;
                maths.setValidators([Validators.required]);
                physics.setValidators([Validators.required]);
                chemistry.setValidators([Validators.required]);
              }
            }
          });
        } else {

          maths.clearValidators();
          physics.clearValidators();
          chemistry.clearValidators();          
        }
      }
    });

    maths.updateValueAndValidity();
    physics.updateValueAndValidity();
    chemistry.updateValueAndValidity();
  }

  setEduInfoValues(formData: any, mode = '') {

    const control = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list;
    control.controls = [];

    if (!globalFunctions.isEmpty(formData) && formData.constructor === Array) {

      let testHeaders:any;
      if (mode == 'underGraduate') {
        testHeaders = this.formData.educationInfo.educationHeaders.underGraduate;
      } else if (mode == 'graduate') {
        testHeaders = this.formData.educationInfo.educationHeaders.graduate;
      } else if (mode == 'postGraduate') {
        testHeaders = this.formData.educationInfo.educationHeaders.postGraduate;
      }else if (mode == 'masterGraduate') {
        testHeaders = this.formData.educationInfo.educationHeaders.masterGraduate;
      }

      formData.forEach((itemRow, index) => {
        let boardNameRequired:any;
        if (testHeaders.boardName && itemRow.boardNameRequired) {
          boardNameRequired = Validators.required;
        }
        let minPassGradeRequired:any;
        if (!globalFunctions.isEmpty(testHeaders.minPassGradeRequired)) {
          if (testHeaders.minPassGradeRequired && itemRow.minPassGradeRequired) {
            minPassGradeRequired = Validators.required;
          }
        }
        let studyDurationRequired:any;
          if (!globalFunctions.isEmpty(testHeaders.studyDurationRequired)) {
            if (testHeaders.studyDurationRequired && itemRow.studyDurationRequired) {
              studyDurationRequired = Validators.required;
            }
          }
        let maxPassGradeRequired:any;
        if (!globalFunctions.isEmpty(testHeaders.maxPassGradeRequired)) {
          if (testHeaders.maxPassGradeRequired && itemRow.maxPassGradeRequired) {
            maxPassGradeRequired = Validators.required;
          }
        }
        let schoolNameRequired:any;
        if (testHeaders.schoolName && itemRow.schoolNameRequired) {
          schoolNameRequired = Validators.required;
        }
        let monthAppearedRequired:any;
        if (testHeaders.monthAppeared && itemRow.monthAppearedRequired) {
          monthAppearedRequired = Validators.required;
        }
        let yearAppearedRequired:any;
        if (testHeaders.yearAppeared && itemRow.yearAppearedRequired) {
          yearAppearedRequired = Validators.required;
        }
        let creditsEarnedRequired:any;
        if (testHeaders.creditsEarned && itemRow.creditsEarnedRequired) {
          creditsEarnedRequired = Validators.required;
        }
     
        let creditPointsReq:any;
        if (testHeaders.creditPoints && itemRow.creditPointsRequired) {
          creditPointsReq = Validators.required;
        }
        let creditGradeReq:any;
        if (testHeaders.creditGrade && itemRow.creditGradeRequired) {
          creditGradeReq = Validators.required;
        }
        let sgpaReq:any;
        if (testHeaders.sgpa && itemRow.sgpaRequired) {
          sgpaReq = Validators.required;
        }
     
        let seatNoRequired:any;
        if (testHeaders.seatNo && itemRow.seatNoRequired) {
          seatNoRequired = Validators.required;
        }
        let gradeRequired:any;
        if (testHeaders.grade && itemRow.gradeRequired) {
          gradeRequired = Validators.required;
        }
        let liveAtktRequired:any;
        if (testHeaders.liveAtkt && itemRow.liveAtktRequired) {
          liveAtktRequired = Validators.required;
        }

        let percentageOrSgpaRequired:any;
        if (testHeaders.percentageOrSgpa && itemRow.percentageOrSgpaRequired) {
          percentageOrSgpaRequired = Validators.required;
        }
        let percentageOrCgpaRequired:any;
        if (testHeaders.percentageOrCgpa && itemRow.percentageOrCgpaRequired) {
          percentageOrCgpaRequired = Validators.required;
        }

        let showDocumentUpload = false;
        let docReq = false;
        let hasUploadedDoc = false;
        let documentUploadObj = null;
        if (mode == 'underGraduate') {

        	itemRow.confNamesArray.forEach((conf, confIndex) => {

        		if ( (conf.ssc.checkCondition && conf.ssc.display) && itemRow.confNameSelected == conf.confName ) {

        			this.showSscBlk = true;

        			if (this.formData.educationInfo.enggInfo.ssc.subjectInfoReq) {

        				const maths = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].ssc.controls.subjectInfo.controls.maths;

        				maths.get('marksObtained').setValidators([Validators.required]);
        				maths.get('marksOutof').setValidators([Validators.required]);
        				maths.get('totalPercentage').setValidators([Validators.required]);

        				maths.get('marksObtained').updateValueAndValidity();
        				maths.get('marksOutof').updateValueAndValidity();
        				maths.get('totalPercentage').updateValueAndValidity();                
        			}
        		}

        		if ( (conf.hsc.checkCondition && conf.hsc.display) && itemRow.confNameSelected == conf.confName ) {

        			this.showHscBlk = true;

        			if (conf.enggHscTotal.checkCondition && conf.enggHscTotal.display && this.formData.educationInfo.enggInfo.hsc.subjectInfo.totalMarks.display) {

        				this.showAggregateRow = true;
        			}

        			// if (this.formData.educationInfo.enggInfo.hsc.subjectInfoReq) {

        			// 	const subject1 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.subject1;
        			// 	const subject2 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.subject2;
        			// 	const subject3 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.subject3;
        			// 	const optionalSubject = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.optionalSubject;

        			// 	if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.subject1.display) {

        			// 		subject1.get('marksObtained').setValidators([Validators.required]);
        			// 		subject1.get('marksOutof').setValidators([Validators.required]);
        			// 		subject1.get('totalPercentage').setValidators([Validators.required]);
        			// 	}

        			// 	if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.subject2.display) {

        			// 		subject2.get('marksObtained').setValidators([Validators.required]);
        			// 		subject2.get('marksOutof').setValidators([Validators.required]);
        			// 		subject2.get('totalPercentage').setValidators([Validators.required]);
        			// 	}

        			// 	if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.subject3.display) {

        			// 		subject3.get('marksObtained').setValidators([Validators.required]);
        			// 		subject3.get('marksOutof').setValidators([Validators.required]);
        			// 		subject3.get('totalPercentage').setValidators([Validators.required]);
        			// 	}

        			// 	if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject.display) {

        			// 		optionalSubject.get('value').setValidators([Validators.required]);
        			// 		optionalSubject.get('marksObtained').setValidators([Validators.required]);
        			// 		optionalSubject.get('marksOutof').setValidators([Validators.required]);
        			// 		optionalSubject.get('totalPercentage').setValidators([Validators.required]);
        			// 	}

        			// 	subject1.get('marksObtained').updateValueAndValidity();
        			// 	subject1.get('marksOutof').updateValueAndValidity();
        			// 	subject1.get('totalPercentage').updateValueAndValidity();

        			// 	subject2.get('marksObtained').updateValueAndValidity();
        			// 	subject2.get('marksOutof').updateValueAndValidity();
        			// 	subject2.get('totalPercentage').updateValueAndValidity();

        			// 	subject3.get('marksObtained').updateValueAndValidity();
        			// 	subject3.get('marksOutof').updateValueAndValidity();
        			// 	subject3.get('totalPercentage').updateValueAndValidity();

        			// 	optionalSubject.get('value').updateValueAndValidity();
        			// 	optionalSubject.get('marksObtained').updateValueAndValidity();
        			// 	optionalSubject.get('marksOutof').updateValueAndValidity();
        			// 	optionalSubject.get('totalPercentage').updateValueAndValidity();
        			// }

              if (this.formData.educationInfo.enggInfo.showHsc) {
                if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.subject1.required) {
                  const subject1 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.subject1;
                  subject1.get('marksObtained').setValidators([Validators.required]);
                  subject1.get('marksOutof').setValidators([Validators.required]);
                  subject1.get('totalPercentage').setValidators([Validators.required]);
                }

                if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.subject2.required) {
                  const subject2 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.subject2;
                  subject2.get('marksObtained').setValidators([Validators.required]);
                  subject2.get('marksOutof').setValidators([Validators.required]);
                  subject2.get('totalPercentage').setValidators([Validators.required]);
                }

                if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.subject3.required) {
                  const subject3 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.subject3;
                  subject3.get('marksObtained').setValidators([Validators.required]);
                  subject3.get('marksOutof').setValidators([Validators.required]);
                  subject3.get('totalPercentage').setValidators([Validators.required]);
                }

                if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject.required) {
                  const optionalSubject = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.optionalSubject;
                  optionalSubject.get('marksObtained').setValidators([Validators.required]);
                  optionalSubject.get('marksOutof').setValidators([Validators.required]);
                  optionalSubject.get('totalPercentage').setValidators([Validators.required]);
                }

                if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject1.required) {
                  const optionalSubject1 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.optionalSubject1;
                  optionalSubject1.get('marksObtained').setValidators([Validators.required]);
                  optionalSubject1.get('marksOutof').setValidators([Validators.required]);
                  optionalSubject1.get('totalPercentage').setValidators([Validators.required]);
                }

                if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject2.required) {
                  const optionalSubject2 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.optionalSubject2;
                  optionalSubject2.get('marksObtained').setValidators([Validators.required]);
                  optionalSubject2.get('marksOutof').setValidators([Validators.required]);
                  optionalSubject2.get('totalPercentage').setValidators([Validators.required]);
                }

                if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject3.required) {
                  const optionalSubject3 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.optionalSubject3;
                  optionalSubject3.get('marksObtained').setValidators([Validators.required]);
                  optionalSubject3.get('marksOutof').setValidators([Validators.required]);
                  optionalSubject3.get('totalPercentage').setValidators([Validators.required]);
                }
              }
        		}
        	});
        }

        if (!globalFunctions.isEmpty(itemRow.confNamesArray)) {

        	itemRow.confNamesArray.forEach((conf, confIndex) => {

        		if ( (conf.documentUpload.checkCondition && conf.documentUpload.display) && itemRow.confNameSelected == conf.confName ) {

        			showDocumentUpload = true;
        			documentUploadObj = conf.documentUpload;

              if (conf.documentUpload.required) {
                docReq = true;
              }
        		}
        	});

          if (!globalFunctions.isEmpty(itemRow.documentUrl)) {
            hasUploadedDoc = true;
          }
      	}

        let gradingSystemReq:any;
        let marksObtainedRequired:any;
        let marksOutofRequired:any;
        let percentageRequired:any;
        let cgpiReq:any;
        let cgpiObtainedReq:any;
        let cgpiOutofReq:any;
        
        if (mode == 'underGraduate' && testHeaders.gradingSystem) {
          if (itemRow.gradingSystemRequired) {
            gradingSystemReq = Validators.required;
          }

          itemRow.showMarksBlk = false;
          itemRow.showCgpaBlk = false;
          if (itemRow.gradingSystem == 'percentage') {
          
            itemRow.showMarksBlk = true;
          
            cgpiObtainedReq = null;
            cgpiOutofReq = null;
            cgpiReq = null;

          } else if (itemRow.gradingSystem == 'cgpa') {

            itemRow.showCgpaBlk = true;

            marksObtainedRequired = null;
            marksOutofRequired = null;
            percentageRequired = null;
            percentageOrCgpaRequired = null;
            percentageOrSgpaRequired = null;
          }

        } else {

          if (testHeaders.marksObtained && itemRow.marksObtainedRequired) {
            marksObtainedRequired = Validators.required;
          }
          if (testHeaders.marksOutof && itemRow.marksOutofRequired) {
            marksOutofRequired = Validators.required;
          }
          if (testHeaders.percentage && itemRow.percentageRequired) {
            percentageRequired = Validators.required;
          }
          if (testHeaders.cgpiObtained && itemRow.cgpiObtainedRequired) {
            cgpiObtainedReq = Validators.required;
          }
          if (testHeaders.cgpiOutof && itemRow.cgpiOutofRequired) {
            cgpiOutofReq = Validators.required;
          }
          if (testHeaders.cgpi && itemRow.cgpiRequired) {
            cgpiReq = Validators.required;
          }
        }

        let collegeTransferQuestionAnsReq:any;
        if (itemRow.showCollegeTransferQuestion) {
          collegeTransferQuestionAnsReq = Validators.required;
        }

        let semesterCompletedReq:any;
        if (itemRow.showSemesterCompleted && itemRow.semesterCompletedObj.required) {
          semesterCompletedReq = Validators.required;
        }

        var studyDurationForm:any = [];
        if (!globalFunctions.isEmpty(itemRow.studyDuration)) {
          studyDurationForm = [itemRow.studyDuration.value, studyDurationRequired];
        }
        var minPassGradeForm:any = [];
        if (!globalFunctions.isEmpty(itemRow.minPassGrade)) {
          minPassGradeForm = [itemRow.minPassGrade.value, minPassGradeRequired];
        }
        var maxPassGradeForm:any = [];
        if (!globalFunctions.isEmpty(itemRow.maxPassGrade)) {
          maxPassGradeForm = [itemRow.maxPassGrade.value, maxPassGradeRequired];
        }

        const control = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list;

        let row = this._formBuilder.group({
          fieldsLabel: [itemRow.fieldsLabel],
          reqConfId: [itemRow.reqConfId],
          confNamesArray: [itemRow.confNamesArray],
          note: [itemRow.note], 
          confNameSelected: [itemRow.confNameSelected],          
          confName: [itemRow.confName],
          stream: [itemRow.stream],
          boardName: [itemRow.boardName, boardNameRequired],
          schoolName: [itemRow.schoolName, schoolNameRequired],
          monthAppeared: [itemRow.monthAppeared, monthAppearedRequired],
          yearAppeared: [itemRow.yearAppeared, yearAppearedRequired],
          gradingSystem: [itemRow.gradingSystem, gradingSystemReq],
          showCollegeTransferQuestion: [itemRow.showCollegeTransferQuestion],
          collegeTransferQuestionObj: [itemRow.collegeTransferQuestion],
          collegeTransferQuestionAns: [itemRow.collegeTransferQuestionAns, collegeTransferQuestionAnsReq],
          showSemesterCompleted: [itemRow.showSemesterCompleted],
          semesterCompletedObj: [itemRow.semesterCompletedObj],
          semesterCompleted: [itemRow.semesterCompletedObj.value, semesterCompletedReq],
          showMarksBlk: [itemRow.showMarksBlk],
          showCgpaBlk: [itemRow.showCgpaBlk],
          marksObtained: [itemRow.marksObtained, marksObtainedRequired],
          marksOutof: [itemRow.marksOutof, marksOutofRequired],
          percentage: [itemRow.percentage, percentageRequired],
          classObj: [itemRow.class],
          class: [itemRow.class.value],
          studyDuration: studyDurationForm,
          minPassGrade: minPassGradeForm,
          maxPassGrade: maxPassGradeForm,
          percentageOrCgpa: [itemRow.percentageOrCgpa, percentageOrCgpaRequired],
          percentageOrSgpa: [itemRow.percentageOrSgpa, percentageOrSgpaRequired],
          cgpi: [itemRow.cgpi, cgpiReq],
          cgpiObtained: [itemRow.cgpiObtained, cgpiObtainedReq],
          cgpiOutof: [parseInt(itemRow.cgpiOutof), cgpiOutofReq],
          cgpiOutofArray: [itemRow.cgpiOutofArray],
          creditsEarned: [itemRow.creditsEarned, creditsEarnedRequired],
          grade: [itemRow.grade, gradeRequired],
          liveAtkt: [itemRow.liveAtkt, liveAtktRequired],
          seatNo: [itemRow.seatNo, seatNoRequired],
          creditPoints: [itemRow.creditPoints, creditPointsReq],
          creditGrade: [itemRow.creditGrade, creditGradeReq],
          sgpa: [itemRow.sgpa, sgpaReq],
          showDocumentUpload: [showDocumentUpload],
          docReq: [docReq],
          documentUploadObj: [documentUploadObj],
          documentUrl: [itemRow.documentUrl],
          hasUploadedDoc: [hasUploadedDoc],
          showDocResetBtn: [false],
          docError: [false],
          docBrowsed: [false],
          docUploadPercent: [null],          
          docUploading: [false],          
          docToUpload: [null],
        });

        control.push(row);
      });
    }
  }

  workExperienceFormControls() {

    this.workExperienceForm = this._formBuilder.group({
      experienceDetails: this._formBuilder.group({
        workExpType: [null],
        jobDescription: this._formBuilder.array([
          this.jobDescriptionRows()
        ])
      }),
      workExp: [null],
      expAfterGraduation: [null],
      companyType: [null],
      companyDetails: this._formBuilder.array([
        this.companyDetailsRows()
      ])
    });
    this.workExperienceForm.disable();
  }

  jobDescriptionRows() : UntypedFormGroup {

    let jobDescriptionReq:any;
    if (!globalFunctions.isEmpty(this.formData)) {
      if (this.formData.workExpDetails.experienceDetails.display) {      
        if (this.formData.workExpDetails.experienceDetails.jobDescription.display && this.formData.workExpDetails.experienceDetails.jobDescription.required) {
          jobDescriptionReq = Validators.required;
        }
      }
    }

    return this._formBuilder.group({
      description : [null, jobDescriptionReq]
    });
  }

  openTimePicker(mode:string, value) {    
    const amazingTimePicker = this.atp.open({
      time: value,
    });
    amazingTimePicker.afterClose().subscribe(time => {
      this.workExperienceForm.get('companyDetails')['controls'].forEach((itemRow) => {
        itemRow.controls[mode].setValue(time, {emitEvent: false});
      });
    });
  }

  companyDetailsRows() : UntypedFormGroup {
    return this._formBuilder.group({
      companyName : [null],
      designation : [null],
      durationFrom : [null],
      durationTo : [null],
      shiftTimeFrom : [null],
      shiftTimeTo : [null],
      salary : [null]
    });
  }  

  setWorkExpDetailsValues(formData:any) {

    let companyTypeReq:any;
    if (formData.workExpDetails.oldStructure.display) {    
      if (formData.workExpDetails.oldStructure.companyType.display && formData.workExpDetails.oldStructure.companyType.required) {
        companyTypeReq = Validators.required;
      }
    }

    let workExpTypeReq:any;
    if (formData.workExpDetails.experienceDetails.display) {
      if (formData.workExpDetails.experienceDetails.workExpType.display && formData.workExpDetails.experienceDetails.workExpType.required) {
        workExpTypeReq = Validators.required;
      }
    }

    this.workExperienceForm = this._formBuilder.group({
      experienceDetails: this._formBuilder.group({
        workExpType: [formData.workExpDetails.experienceDetails.workExpType.value, workExpTypeReq],
        jobDescription: this._formBuilder.array([
          this.jobDescriptionRows()
        ])
      }), 
      workExp: [formData.workExpDetails.oldStructure.workExp],
      expAfterGraduation: [formData.workExpDetails.oldStructure.expAfterGraduation],
      companyType: [formData.workExpDetails.oldStructure.companyType.value, companyTypeReq],
      companyDetails: this._formBuilder.array([
        this.companyDetailsRows()
      ])
    });

    if (!globalFunctions.isEmpty(formData.workExpDetails.experienceDetails.jobDescription.list)) {

      const jobDescription = <UntypedFormArray>this.workExperienceForm.controls.experienceDetails['controls'].jobDescription;
      jobDescription.controls.splice(0, 1);

      formData.workExpDetails.experienceDetails.jobDescription.list.forEach((itemRow) => {

        const jobDescription = <UntypedFormArray>this.workExperienceForm.controls.experienceDetails['controls'].jobDescription;

        let row = this._formBuilder.group({
          description : [itemRow.description]
        });

        jobDescription.push(row);
      });
    }

    if (!globalFunctions.isEmpty(formData.workExpDetails.oldStructure.companyDetails)) {

      const companyDetails = <UntypedFormArray>this.workExperienceForm.controls.companyDetails;
      companyDetails.controls.splice(0, 1);

      formData.workExpDetails.oldStructure.companyDetails.forEach((itemRow) => {

        const companyDetails = <UntypedFormArray>this.workExperienceForm.controls.companyDetails;

        let row = this._formBuilder.group({
          companyName : [itemRow.companyName],
          designation : [itemRow.designation],
          durationFrom : [moment(itemRow.durationFrom)],
          durationTo : [itemRow.durationTo],
          shiftTimeFrom : [itemRow.shiftTimeFrom],
          shiftTimeTo : [itemRow.shiftTimeTo],
          salary : [itemRow.salary]
        });

        companyDetails.push(row);
      });

      this.setWorkExpDetailsValidations();
    }

    this.workExperienceFormValueChanged();
  }

  workExperienceFormValueChanged() {
   
    this.workExperienceForm.get('workExp').valueChanges.subscribe((mode: string) => {
      this.setWorkExpDetailsValidations();
    });
  }

  addNewJobDescriptionRow(): void {
    let rowCnt = this.workExperienceForm.controls.experienceDetails.get('jobDescription')['controls'].length;
    this.jobDescAddMaxReached = false;
    if (rowCnt < this.formData.workExpDetails.experienceDetails.addMoreInfo.maxUpto) {
      const jobDescription = <UntypedFormArray>this.workExperienceForm.controls.experienceDetails.get('jobDescription');
      jobDescription.push(this.jobDescriptionRows());
    } else {
      this.jobDescAddMaxReached = true;
    }
  }

  deleteJobDescriptionRow(i: number): void {
    const jobDescription = <UntypedFormArray>this.workExperienceForm.controls.experienceDetails.get('jobDescription');
    jobDescription.removeAt(i);
    let rowCnt = this.workExperienceForm.controls.experienceDetails.get('jobDescription')['controls'].length;
    this.jobDescAddMaxReached = false;    
    if (rowCnt == this.formData.workExpDetails.experienceDetails.addMoreInfo.maxUpto) {
      this.jobDescAddMaxReached = true;
    }
  }  

  setSoftwareKnowledgeValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.softwareKnowledge)) {
      this.softwareInfoForm = this._formBuilder.group({
        appSoftware: [formData.softwareKnowledge.appSoftware],
        os: [formData.softwareKnowledge.os],
        programmingLang: [formData.softwareKnowledge.programmingLang],
      });
    }
  }

  extraCurriculumFormControls() {

    this.extraCurriculumForm = this._formBuilder.group({
      participationLevels: [null],
      participationDetails: [null],
      sports: [null],
      coCurricularActivity: [null],
      stateUniversityLevl: [null],
      interCollege: [null],
      extraCurriculularActivity: [null],
      otherActivities: this._formBuilder.array([]),
      onlineLearningPreparedness: this._formBuilder.array([
        this.onlineLearningPreparednessRows()
      ])
    });
  }  

  additionalCertificationFormControls() {

    this.additionalCertificationForm = this._formBuilder.group({
      additionalCertificationFields: this._formBuilder.array([
        this.additionalCertificationFormRows('')
      ])
    });
  }

  setExtraCurriculumActivitiesValues(formData:any) {

    this.otherActivitiesList = formData.extraCurriculumActivities.otherActivitiesHeaders;
    if (!globalFunctions.isEmpty(formData.extraCurriculumActivities)) {

      let participationLevelsReq:any;
      if (formData.extraCurriculumActivities.participationLevels.display && formData.extraCurriculumActivities.participationLevels.required) {
        participationLevelsReq = Validators.required;
      }

      let participationDetailsReq:any;
      if (formData.extraCurriculumActivities.participationDetails.display && formData.extraCurriculumActivities.participationDetails.required) {
        participationDetailsReq = Validators.required;
      }
      
      let extraCurriculularActivityReq: any;
      if (formData.extraCurriculumActivities.extraCurriculularActivityRequired && formData.extraCurriculumActivities.showExtraCurriculularActivity) {
        extraCurriculularActivityReq = Validators.required;
      }

      let sportsReq: any;
      if (formData.extraCurriculumActivities.sportsRequired && formData.extraCurriculumActivities.showSports) {
        sportsReq = Validators.required;
      }

      this.extraCurriculumForm = this._formBuilder.group({
        participationLevels: [formData.extraCurriculumActivities.participationLevels.value, participationLevelsReq],
        participationDetails: [formData.extraCurriculumActivities.participationDetails.value, participationDetailsReq],
        sports: [formData.extraCurriculumActivities.sports, Validators.compose([sportsReq])],
        stateUniversityLevl: [formData.extraCurriculumActivities.stateUniversityLevl],
        coCurricularActivity: [formData.extraCurriculumActivities.coCurricularActivity],
        interCollege: [formData.extraCurriculumActivities.interCollege],
        extraCurriculularActivity: [formData.extraCurriculumActivities.extraCurriculularActivity, Validators.compose([extraCurriculularActivityReq])],
        otherActivities: this._formBuilder.array([]),
        onlineLearningPreparedness: this._formBuilder.array([
          this.onlineLearningPreparednessRows()
        ])
      });

      if (!globalFunctions.isEmpty(formData.extraCurriculumActivities.otherActivities)) {

        formData.extraCurriculumActivities.otherActivities.forEach((otherActivity) => {
          this.otherActivitiesList.forEach((otherActivityList) => {
            if (otherActivityList.name.toString().toLowerCase() == otherActivity.toString().toLowerCase()) {
              otherActivityList.isSelected = true;
              this.otherActivities.push(otherActivity);
            }
          });
        });
      }

      if (formData.extraCurriculumActivities.onlineLearningPreparedness.display && !globalFunctions.isEmpty(formData.extraCurriculumActivities.onlineLearningPreparedness.questionsList)) {
        this.setOnlineLearningPreparednessRows(formData.extraCurriculumActivities.onlineLearningPreparedness.questionsList);
      }
    }

    this.extraCurriculumForm.disable();
  }

  onlineLearningPreparednessRows() : UntypedFormGroup {
    return this._formBuilder.group({
      label : [null],
      checkCondition : [false],
      condition : [false],
      options : [null],
      input : [null],
      inputVal : [null],
      chkBox : [null],
      chkBoxErr : [false],
      value : [null],
    });
  }

  additionalCertificationFormRows(itemRow): UntypedFormGroup {
    return this._formBuilder.group({
      fieldType: [null],
      options: [null],
      answer: [null],
      question: [null],
      isCompulsory: [false],
      checkCondition: [false],
      condition: [false],
      input :[false]
    });
  }

  setOnlineLearningPreparednessRows(questionsList:any) {

    if (!globalFunctions.isEmpty(questionsList)) {

      const control = <UntypedFormArray>this.extraCurriculumForm.controls.onlineLearningPreparedness;
      control.controls = [];

      questionsList.forEach((itemRow) => {

        let isRequired:any;
        if (itemRow.required) {
          isRequired = Validators.required;
        }

        let inputReq:any;
        if (itemRow.input.required) {
          inputReq = Validators.required;
        }

        const control = <UntypedFormArray>this.extraCurriculumForm.controls.onlineLearningPreparedness;

        let row = this._formBuilder.group({
          label: [itemRow.label],
          checkCondition: [itemRow.checkCondition],
          condition: [itemRow.condition],
          options: [itemRow.options],
          input: [itemRow.input],
          inputVal: [itemRow.input.value, inputReq],
          chkBox: [itemRow.chkBox],
          chkBoxErr: [false],
          value: [itemRow.value, isRequired],
        });

        control.push(row);
      });
    }
  }

  onChangeOnlineLearningPreparedness(listIndex:number):void {

    const control:any = <UntypedFormArray>this.extraCurriculumForm.controls.onlineLearningPreparedness['controls'][listIndex];

    const inputVal = control.controls.inputVal;
    inputVal.clearValidators();
    if (control.get('checkCondition').value) {
     if ( (control.get('condition').value).conditionOn ==  control.get('value').value && 
          (control.get('condition').value).show == "input" && (control.get('input').value).required ) {
        inputVal.setValidators([Validators.required]);
     }
    }
    inputVal.updateValueAndValidity();
  }

  onSelectOnlineLearningChkbx(listIndex:number, chkbx: any, checked: boolean) {

    const control:any = <UntypedFormArray>this.extraCurriculumForm.controls.onlineLearningPreparedness['controls'][listIndex];

    (control.get('chkBox').value).options.forEach((details) => {
      if (details.value == chkbx.value) {
        details.isSelected = checked;
      }
    });
  }

  setExtraCertificateValues(formData: any, mode) {
  if (!globalFunctions.isEmpty(formData.extraCertificate)) {
    this.additionalCertificationForm = this._formBuilder.group({
      additionalCertificationFields: this._formBuilder.array([])
    });

    const control = <UntypedFormArray>this.additionalCertificationForm.controls.additionalCertificationFields;

    formData.extraCertificate.forEach((itemRow1) => {
      const formGroupArray: FormGroup[] = [];

      itemRow1.forEach((itemRow) => {
        let isRequired: any;
        if (itemRow.isCompulsory) {
          isRequired = Validators.required;
        }

        const row = this._formBuilder.group({
          fieldType: [itemRow.fieldType],
          options: [itemRow.options],
          fieldObj: [itemRow],
          answer: [itemRow.answer, isRequired],
          question: [itemRow.question],
          isCompulsory: [itemRow.isCompulsory],
          checkCondition: [itemRow.checkCondition],
          condition:[itemRow.condition],
          input :[itemRow.input],
        });

        formGroupArray.push(row);
      });

      // Add the form group array to the form array
      control.push(this._formBuilder.group({
        groupArray: this._formBuilder.array(formGroupArray)
      }));
    });
    this.additionalCertificationForm.disable();
  }
}

 addNewRow1() {
  if (!globalFunctions.isEmpty(this.formData.extraCertificate[0])) {
    const control = <UntypedFormArray>this.additionalCertificationForm.controls.additionalCertificationFields;

    const formGroupArray: FormGroup[] = [];
    this.formData.extraCertificate[0].forEach((itemRow) => {
      let isRequired: any;
      if (itemRow.isCompulsory) {
        isRequired = Validators.required;
      }
      const row = this._formBuilder.group({
        fieldType: [itemRow.fieldType],
        options: [itemRow.options],
        fieldObj: [itemRow],
        answer: [itemRow.answer, isRequired],
        question: [itemRow.question],
        isCompulsory: [itemRow.isCompulsory],
        checkCondition: [itemRow.checkCondition],
        condition:[itemRow.condition],
        input :[itemRow.input],
        inputVal: [itemRow.inputVal],
      });
      formGroupArray.push(row);
    });
    control.push(this._formBuilder.group({
      groupArray: this._formBuilder.array(formGroupArray)
    }));
  }
}

  setQuestionnaireValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.questionnaire)) {

      this.questionnaireForm = this._formBuilder.group({
        questionnaire: this._formBuilder.array([
          this.questionnaireRows()
        ])
      });

      const control = <UntypedFormArray>this.questionnaireForm.controls.questionnaire;
      control.controls.splice(0, 1);

      formData.questionnaire.forEach((itemRow) => {

        let isRequired:any;
        if (itemRow.isCompulsory) {
          isRequired = Validators.required;
        }

        const control = <UntypedFormArray>this.questionnaireForm.controls.questionnaire;

        let row = this._formBuilder.group({
          fieldType: [itemRow.fieldType],
          options: [itemRow.options],
          fieldObj: [itemRow],
          answer: [itemRow.answer, isRequired],
          question: [itemRow.question],
          questionId: [itemRow.questionId],
          isCompulsory: [itemRow.isCompulsory],
          checkCondition: [itemRow.checkCondition],
          condition:[itemRow.condition],
          input :[itemRow.input],
          inputVal: [itemRow.inputVal],
        });

        control.push(row);
      });
    }
    this.questionnaireForm.disable();
  }

  setDocumentsValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.documents)) {

      this.documentsForm = this._formBuilder.group({
        bunch: this._formBuilder.array([
        ]),
        documents: this._formBuilder.array([
          this.documentsRows()
        ])
      });

      const documents = <UntypedFormArray>this.documentsForm.controls.documents;
      documents.controls.splice(0, 1);

      let loopIdx = 0;
      this.documentsBunch = [];
      formData.documents.forEach((itemRow, index) => {

        const documents = <UntypedFormArray>this.documentsForm.controls.documents;

        let isRequired:any;
        if (itemRow.required) {
          isRequired = Validators.required;
        }

        let isUploaded = false;
        if (itemRow.uploadedFile) {
          isUploaded = true;
        }

        let breakRow = false;
        if (index != 0 && index % 2 == 0) {
          loopIdx = loopIdx + 1;
          breakRow = true;
        }

        if (typeof this.documentsBunch[loopIdx] === 'undefined') {
          breakRow = true;
          this.documentsBunch[loopIdx] = [];
        }

        let row = this._formBuilder.group({
          breakRow: [breakRow],
          docId: [itemRow.docId],
          docTitle: [itemRow.docTitle],
          required: [itemRow.required],
          uploadedFile: [itemRow.uploadedFile],
          docError: [false],
          isBrowsed: [false],
          isUploaded: [isUploaded],
          hasPhoto: [itemRow.uploadedFile, isRequired],
          docToUpload: [null]
        });

        documents.push(row);
        this.documentsBunch[loopIdx].push(row);
      });
    }
  }

  setDeclarationInfoValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.declarationInfo)) {
   
      if (!globalFunctions.isEmpty(formData.declarationInfo.uploadedPassportSizePhoto)) {
        this.isUploadedPassportSizePhoto = true;
        this.uploadedPassportSizePhoto = formData.declarationInfo.uploadedPassportSizePhoto;
        this.hasPassportSizePhoto = formData.declarationInfo.uploadedPassportSizePhoto;
      }

      if (!globalFunctions.isEmpty(formData.declarationInfo.uploadedSignatureImage)) {
        this.isUploadedSignatureImage = true;
        this.uploadedSignatureImage = formData.declarationInfo.uploadedSignatureImage;
        this.hasSignatureImage = formData.declarationInfo.uploadedSignatureImage;
      }

      if (formData.declarationInfo.parentsSignatureImage.display && !globalFunctions.isEmpty(formData.declarationInfo.parentsSignatureImage.value)) {
        this.isUploadedParentSignatureImage = true;
        this.uploadedParentSignatureImage = formData.declarationInfo.parentsSignatureImage.value;
        this.hasParentSignatureImage = formData.declarationInfo.parentsSignatureImage.value;
      }

      let declarationPlaceReq:any;
      if (formData.declarationInfo.declarationPlace.display && formData.declarationInfo.declarationPlace.required) {
        declarationPlaceReq = Validators.required;
      }

      let studentDeclarationReq:any;
      if (formData.declarationInfo.showStudentDeclaration) {
        studentDeclarationReq = Validators.required;
      }
      let parentsDeclarationReq:any;
      if (formData.declarationInfo.showParentsDeclaration) {
        parentsDeclarationReq = Validators.required;
      }

      let studentParentsDeclarationReq: any;
      if (formData.declarationInfo.showStudentParentDeclaration) {
        studentParentsDeclarationReq = Validators.required;
      }

      this.declarationForm = this._formBuilder.group({
        declarationByStudent: [true, studentDeclarationReq],
        declarationByGuardian: [true, parentsDeclarationReq],
        declarationByStudentParent: [true, studentParentsDeclarationReq],
        isConfidential: [formData.declarationInfo.isConfidential],
        declarationPlace: [formData.declarationInfo.declarationPlace.value, declarationPlaceReq],
      });

      if (!globalFunctions.isEmpty(formData.declarationInfo.studentDeclaration)) {
        this.studentDeclarationArray = formData.declarationInfo.studentDeclaration;
        this.studentDeclaration = formData.declarationInfo.studentDeclaration;
      }
      if (!globalFunctions.isEmpty(formData.declarationInfo.parentsDeclaration)) {
        this.parentsDeclarationArray = formData.declarationInfo.parentsDeclaration;
      }
    }
    this.declarationForm.disable();
  }

  onSelectCategory(selectedCatId: any) {

    const otherCategory = this.categoryForm.get('otherCategory');

    this.showCategoryQuestions = false;
    let showCatDocumentUpload = false;
    let catDocReq = false;
    let catDocError = false;
    let catHasUploadedDoc = false;
    let catDocumentUploadObj = null;
    let catDocumentUrl = null;
    this.formData.categories.admissionCategories.groups.forEach((catGrp) => {
      
      catGrp.list.forEach((details) => {

        details.isSelected = false;
        catDocError = false;
        if (details.admissionCategoryId == selectedCatId) {

          details.isSelected = true;
          this.selectedCatName = details.admissionCategoryName;

          if (details.documentUpload.display) {
            
            showCatDocumentUpload = true;
            catDocumentUploadObj = details.documentUpload;
            
            if (details.documentUpload.required) {
              catDocReq = true;
            }

            if (!globalFunctions.isEmpty(details.documentUpload.documentUrl)) {
              catDocumentUrl = details.documentUpload.documentUrl;
              catHasUploadedDoc = true;
            }
          }

          if (details.otherCategory) {
            otherCategory.setValidators([Validators.required]);
          } else {
            otherCategory.clearValidators();
          }

          if (details.askQuestion) {
            this.showCategoryQuestions = true;
            this.setCategoryQuestionsRows(true);
          } else {
            this.setCategoryQuestionsRows(false);
          }
        }
      });
     });
  
    otherCategory.updateValueAndValidity();

    this.categoryError = false;
    this.categoryForm.controls['applyingCategories'].setValue(selectedCatId, {emitEvent: false});
    this.categoryForm.controls['showCatDocumentUpload'].setValue(showCatDocumentUpload, {emitEvent: false});
    this.categoryForm.controls['catDocError'].setValue(catDocError, {emitEvent: false});
    this.categoryForm.controls['catDocReq'].setValue(catDocReq, {emitEvent: false});
    this.categoryForm.controls['catHasUploadedDoc'].setValue(catHasUploadedDoc, {emitEvent: false});
    this.categoryForm.controls['catDocumentUploadObj'].setValue(catDocumentUploadObj, {emitEvent: false});
    this.categoryForm.controls['catDocumentUrl'].setValue(catDocumentUrl, {emitEvent: false});
  }

  onSelectSubCategory(optn: any, checked: boolean) {

    this._snackBarMsgComponent.closeSnackBar();

    this.subCategoryReverseArray[optn.admissionSubCategoryId].isSelected = checked;

    if (this.subCategoryReverseArray[optn.admissionSubCategoryId].documentUpload.display) {
  
      this.subCategoryReverseArray[optn.admissionSubCategoryId].showSubCatDocumentUpload = checked;
      
      if (this.subCategoryReverseArray[optn.admissionSubCategoryId].documentUpload.required) {
        this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatDocReq = checked;
      }
 
      if (!globalFunctions.isEmpty(this.subCategoryReverseArray[optn.admissionSubCategoryId].documentUpload.documentUrl)) {
        this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatHasUploadedDoc = checked;
      }
    }
  }

  onSelectRadioSubCategory(optn: any) {

    this.subCategoryList.forEach((details) => {

      details.isSelected = false;
      details.showSubCatDocumentUpload = false;
      details.subCatDocReq = false;
      details.subCatHasUploadedDoc = false;
      if (details.admissionSubCategoryId == optn.admissionSubCategoryId) {
        details.isSelected = true;
        if (details.documentUpload.display) {
          details.showSubCatDocumentUpload = true;
          if (details.documentUpload.required) {
            details.subCatDocReq = true;
          }
          if (!globalFunctions.isEmpty(details.documentUpload.documentUrl)) {
            details.subCatHasUploadedDoc = true;
          }
        }
      }
    });
  }

  validateCourseSequence() {

    let err = false;
    let preferenceArray = {};
    let minReqPreference = false;
    let doublePreference = false;
    let firstPrefNotSeltd = true;
    let selectedSequence = 0;
    this.coursesBunch.forEach((courses) => {
      courses.forEach((course) => {
        course.courseErr = false;
        if (!globalFunctions.isEmpty(course.sequence)) {
          if (preferenceArray[course.sequence]) {
            doublePreference = true;
          } else {
            preferenceArray[course.sequence] = course.sequence;
            if (course.sequence == 1) {
              firstPrefNotSeltd = false;
            }
          }
          selectedSequence++;
          err = false;
        } else if (selectedSequence == 0) {
          err = true;
        }
      });
    });

    let selectedPreferences = Object.keys(preferenceArray).length;
    if (selectedPreferences < this.formData.coursesList.minCount) {
      minReqPreference = true;
    }

    return {
     err: err, 
     minReqPreference: minReqPreference,
     doublePreference: doublePreference,
     firstPrefNotSeltd: firstPrefNotSeltd,
    }
  }

  onCourseSelectionSubmit(stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    let result = this.courseSelectionComponent.validateForm();

    if (result.submitErr) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    } else {
      this.courseSelectionValues = result.finalArray;
      this.goToNextStep(stepper, tab);
    }
  }

  onCourseSubmit(stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    let validate = this.validateCourseSequence();
    if (validate.err) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_PREFERENCE, 'x', 'error-snackbar', 5000);
    } else if (validate.firstPrefNotSeltd) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.FIRST_PREFERENCE_REQUIRED, 'x', 'error-snackbar', 5000);
    } else if (validate.doublePreference) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.PREFERENCE_REPEATED, 'x', 'error-snackbar', 5000);
    } else if (validate.minReqPreference) {
      this._snackBarMsgComponent.openSnackBar('Minimum ' + this.formData.coursesList.minCount + ' preferences are required', 'x', 'error-snackbar', 5000);
    } else {
      this.goToNextStep(stepper, tab);
    }
  }

  validateCategoryForm() {

    this.categoryError = false;
    this.subCategoryError = false;
    let uploadErr = false;

    let values = this.categoryForm.getRawValue();

    if (values.showCatDocumentUpload && values.catDocReq && globalFunctions.isEmpty(values.catDocToUpload) && values.catHasUploadedDoc == false) {

      this.categoryForm.controls['catDocError'].setValue(true, {emitEvent: false});
      uploadErr = true;
    }

    if (globalFunctions.isEmpty(this.categoryForm.value.applyingCategories)) {
      this.categoryError = true;
    }

    if (this.showSubCategories) {

      this.subCategoryList.forEach((details) => {
        
        if (details.isSelected && details.showSubCatDocumentUpload && details.subCatDocReq && globalFunctions.isEmpty(details.subCatDocToUpload) && details.subCatHasUploadedDoc == false) {
          details.subCatDocError = true;
          uploadErr = true;
        }
      });
    }

    if (uploadErr) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.FILE_NOT_FOUND, 'x', 'error-snackbar', 5000);
      return false;
    } else if (this.categoryError) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.CATEGORY_NOT_SELECTED, 'x', 'error-snackbar', 5000);
      return false;
    } else if (this.subCategoryError) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SUB_CATEGORY_NOT_SELECTED, 'x', 'error-snackbar', 5000);
      return false;
    } else {
      return true;
    }
  }

  onCategoryFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.categoryForm.valid) {
      if (this.validateCategoryForm()) {
        this.goToNextStep(stepper, tab);
      }
    } else {
      this.validateCategoryForm();
      this.validateAllFormFields(this.categoryForm);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onPersonalInfoSubmit(values:any, stepper: MatStepper, tab:any):void {
    this._snackBarMsgComponent.closeSnackBar();

    let validate = this.validatePersonalInfoForm();

    if (this.personalInfoForm.valid && !validate.err) {
      this.goToNextStep(stepper, tab);
    } else {
      this.validateAllFormFields(this.personalInfoForm);
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  validatePersonalInfoForm() {

    let error = false;
    if (this.showCategoryQuestions) {

      this.personalInfoForm.controls.categoryQuestions['controls'].forEach((itemRow, index) => {

        if (itemRow.get('chkBox').value) {

          let optSelected = false;
          itemRow.controls['chkBoxErr'].setValue(false, {emitEvent: false});

          itemRow.get('options').value.forEach((optnRow, optIndx) => {
            if (optnRow.isSelected) {
              optSelected = true;
            }
          });

          if (!optSelected && itemRow.get('requiredRow').value) {
            itemRow.controls['chkBoxErr'].setValue(true, {emitEvent: false});
            error = true;
          }
        }
      });
    }

    if (this.showStudentPresentStatus) {

      this.personalInfoForm.controls.studentPresentStatus['controls'].forEach((itemRow, index) => {
        if (itemRow.get('chkBox').value) {

          let optSelected = false;
          itemRow.controls['chkBoxErr'].setValue(false, {emitEvent: false});

          itemRow.get('options').value.forEach((optnRow, optIndx) => {
            if (optnRow.isSelected) {
              optSelected = true;
            }
          });

          if (!optSelected && itemRow.get('requiredRow').value) {
            itemRow.controls['chkBoxErr'].setValue(true, {emitEvent: false});
            error = true;
          }

        }
      })
    }
   
    if (this.personalInfoForm.controls['disability']['controls'].disabilityDoc.value == true && this.personalInfoForm.controls['disability']['controls'].disabilityHasUploadedDoc.value == false) {
      error = true;
    }

    if (this.personalInfoForm.controls['scholarship']['controls'].scholarshipDoc.value == true && this.personalInfoForm.controls['scholarship']['controls'].scholarshipHasUploadedDoc.value == false) {
      error = true;
    }

    return {
     err: error
    }    
  }

  onChangeDob(eve) {

    let calculatedAge = globalFunctions.calculate_age(globalFunctions.format(new Date(eve._d), 'input'));

    if (!globalFunctions.isEmpty(calculatedAge) && (calculatedAge.status == 1) && (!globalFunctions.isEmpty(calculatedAge.years))) {
      this.personalInfoForm.controls['age'].setValue(calculatedAge.years, {emitEvent: false});
    } else {
      this.personalInfoForm.controls['age'].setValue('', {emitEvent: false});
    }
  }

  onChangeAadharDob(eve) {

    let calculatedAge = globalFunctions.calculate_age(globalFunctions.format(new Date(eve._d), 'input'));

    if (!globalFunctions.isEmpty(calculatedAge) && (calculatedAge.status == 1) && (!globalFunctions.isEmpty(calculatedAge.years))) {
      this.personalInfoForm.controls['aadharAge'].setValue(calculatedAge.years, {emitEvent: false});
    } else {
      this.personalInfoForm.controls['aadharAge'].setValue('', {emitEvent: false});
    }
  }

  onAddressInfoFormSubmit(values:any, stepper: MatStepper, tab:any):void {
    if (this.formData.personalInfo.addressInfo.display == false) {
      this.personalInfoForm.controls.residentialAddress['controls'].address.setValue(this.addressInfoForm.controls.residentialAddress['controls'].address.value);
      this.personalInfoForm.controls.residentialAddress['controls'].city.setValue(this.addressInfoForm.controls.residentialAddress['controls'].city.value);
      this.personalInfoForm.controls.residentialAddress['controls'].area.setValue(this.addressInfoForm.controls.residentialAddress['controls'].area.value);
      this.personalInfoForm.controls.residentialAddress['controls'].pincode.setValue(this.addressInfoForm.controls.residentialAddress['controls'].pincode.value);
      this.personalInfoForm.controls.residentialAddress['controls'].street.setValue(this.addressInfoForm.controls.residentialAddress['controls'].street.value);
      this.personalInfoForm.controls.residentialAddress['controls'].nearByRailwayStation.setValue(this.addressInfoForm.controls.residentialAddress['controls'].nearByRailwayStation.value);
      this.personalInfoForm.controls.residentialAddress['controls'].district.setValue(this.addressInfoForm.controls.residentialAddress['controls'].district.value);

      this.personalInfoForm.controls.nativeAddress['controls'].address.setValue(this.addressInfoForm.controls.nativeAddress['controls'].address.value);
      this.personalInfoForm.controls.nativeAddress['controls'].area.setValue(this.addressInfoForm.controls.nativeAddress['controls'].area.value);
      this.personalInfoForm.controls.nativeAddress['controls'].city.setValue(this.addressInfoForm.controls.nativeAddress['controls'].city.value);
      this.personalInfoForm.controls.nativeAddress['controls'].pincode.setValue(this.addressInfoForm.controls.nativeAddress['controls'].pincode.value);
      this.personalInfoForm.controls.nativeAddress['controls'].street.setValue(this.addressInfoForm.controls.nativeAddress['controls'].street.value);
      this.personalInfoForm.controls.nativeAddress['controls'].nearByRailwayStation.setValue(this.addressInfoForm.controls.nativeAddress['controls'].nearByRailwayStation.value);
      this.personalInfoForm.controls.nativeAddress['controls'].district.setValue(this.addressInfoForm.controls.nativeAddress['controls'].district.value);
    }

    this._snackBarMsgComponent.closeSnackBar();

    if (this.addressInfoForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this.validateAllFormFields(this.addressInfoForm);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onGuardianInfoFormSubmit(values:any, stepper: MatStepper, tab:any):void {
  
    this._snackBarMsgComponent.closeSnackBar();

    if (this.guardianInfoForm.controls.membersInfo.get('guardian').value == 'no') {

      this.fatherPassportSizePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.fatherDetails.fatherPhotoRequired && !this.isFatherBrowsedPassportSizePhoto && !this.isFatherUploadedPassportSizePhoto) {
        this.fatherPassportSizePhotoError = true;
      }
  
      this.fatherSignaturePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.fatherDetails.fatherSignatureRequired && !this.isFatherBrowsedSignaturePhoto && !this.isFatherUploadedSignaturePhoto) {
        this.fatherSignaturePhotoError = true;
      }
  
      this.motherPassportSizePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.motherDetails.motherPhotoRequired && !this.isMotherBrowsedPassportSizePhoto && !this.isMotherUploadedPassportSizePhoto) {
        this.motherPassportSizePhotoError = true;
      }
  
      this.motherSignaturePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.motherDetails.motherSignatureRequired && !this.isMotherBrowsedSignaturePhoto && !this.isMotherUploadedSignaturePhoto) {
        this.motherSignaturePhotoError = true;
      }
  
      this.brotherPassportSizePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.brotherDetails.brotherPhotoRequired && !this.isBrotherBrowsedPassportSizePhoto && !this.isBrotherUploadedPassportSizePhoto) {
        this.brotherPassportSizePhotoError = true;
      }
  
      this.brotherSignaturePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.brotherDetails.brotherSignatureRequired && !this.isBrotherBrowsedSignaturePhoto && !this.isBrotherUploadedSignaturePhoto) {
        this.brotherSignaturePhotoError = true;
      }
  
      this.sisterPassportSizePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.sisterDetails.sisterPhotoRequired && !this.isSisterBrowsedPassportSizePhoto && !this.isSisterUploadedPassportSizePhoto) {
        this.sisterPassportSizePhotoError = true;
      }
  
      this.sisterSignaturePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.sisterDetails.sisterSignatureRequired && !this.isSisterBrowsedSignaturePhoto && !this.isSisterUploadedSignaturePhoto) {
        this.sisterSignaturePhotoError = true;
      }
  
      if (!this.motherPassportSizePhotoError && !this.motherSignaturePhotoError) {
  
        this.uploadsInfoFormValues['motherPassportSizePhoto'] = '';
        if (this.isMotherBrowsedPassportSizePhoto) {
          this.uploadsInfoFormValues['motherPassportSizePhoto'] = this.motherPassportSizePhotoToUpload;
        }
  
        this.uploadsInfoFormValues['motherSignaturePhoto'] = '';
        if (this.isMotherBrowsedSignaturePhoto) {
          this.uploadsInfoFormValues['motherSignaturePhoto'] = this.motherSignaturePhotoToUpload;
        }
      }
      
      if (!this.fatherPassportSizePhotoError && !this.fatherSignaturePhotoError) {
  
        this.uploadsInfoFormValues['fatherPassportSizePhoto'] = '';
        if (this.isFatherBrowsedPassportSizePhoto) {
          this.uploadsInfoFormValues['fatherPassportSizePhoto'] = this.fatherPassportSizePhotoToUpload;
        }
  
        this.uploadsInfoFormValues['fatherSignaturePhoto'] = '';
        if (this.isFatherBrowsedSignaturePhoto) {
          this.uploadsInfoFormValues['fatherSignaturePhoto'] = this.fatherSignaturePhotoToUpload;
        }
      }
  
      if (!this.brotherPassportSizePhotoError && !this.brotherSignaturePhotoError) {
  
        this.uploadsInfoFormValues['brotherPassportSizePhoto'] = '';
        if (this.isBrotherBrowsedPassportSizePhoto) {
          this.uploadsInfoFormValues['brotherPassportSizePhoto'] = this.brotherPassportSizePhotoToUpload;
        }
  
        this.uploadsInfoFormValues['brotherSignaturePhoto'] = '';
        if (this.isBrotherBrowsedSignaturePhoto) {
          this.uploadsInfoFormValues['brotherSignaturePhoto'] = this.brotherSignaturePhotoToUpload;
        }
      }
  
      if (!this.sisterPassportSizePhotoError && !this.sisterSignaturePhotoError) {
  
        this.uploadsInfoFormValues['sisterPassportSizePhoto'] = '';
        if (this.isSisterBrowsedPassportSizePhoto) {
          this.uploadsInfoFormValues['sisterPassportSizePhoto'] = this.sisterPassportSizePhotoToUpload;
        }
  
        this.uploadsInfoFormValues['sisterSignaturePhoto'] = '';
        if (this.isSisterBrowsedSignaturePhoto) {
          this.uploadsInfoFormValues['sisterSignaturePhoto'] = this.sisterSignaturePhotoToUpload;
        }
  
        this.guardianPassportSizePhotoError = false;
        this.guardianSignaturePhotoError = false;
  
      }
    } else {
  
      this.guardianPassportSizePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.guardianDetails.guardianPhotoRequired && !this.isGuardianBrowsedPassportSizePhoto && !this.isGuardianUploadedPassportSizePhoto) {
        this.guardianPassportSizePhotoError = true;
      }
  
      this.guardianSignaturePhotoError = false;
      if (this.formData.guardianInfo.membersInfo.guardianDetails.guardianSignatureRequired && !this.isGuardianBrowsedSignaturePhoto && !this.isGuardianUploadedSignaturePhoto) {
        this.guardianSignaturePhotoError = true;
      }
  
      if (!this.guardianPassportSizePhotoError && !this.guardianSignaturePhotoError) {
  
        this.uploadsInfoFormValues['guardianPassportSizePhoto'] = '';
        if (this.isGuardianBrowsedPassportSizePhoto) {
          this.uploadsInfoFormValues['guardianPassportSizePhoto'] = this.guardianPassportSizePhotoToUpload;
        }
  
        this.uploadsInfoFormValues['guardianSignaturePhoto'] = '';
        if (this.isGuardianBrowsedSignaturePhoto) {
          this.uploadsInfoFormValues['guardianSignaturePhoto'] = this.guardianSignaturePhotoToUpload;
        }
      }
  
      this.fatherPassportSizePhotoError = false;
      this.fatherSignaturePhotoError = false;
      this.motherPassportSizePhotoError = false;
      this.motherSignaturePhotoError = false;
      this.brotherPassportSizePhotoError = false;
      this.brotherSignaturePhotoError = false;
      this.sisterPassportSizePhotoError = false;
      this.sisterSignaturePhotoError = false;
  
    }

    this.passportSizePhotoError = false;
    
    if (this.formData.uploadsInfo.passportSizePhotoRequired && !this.isBrowsedPassportSizePhoto && !this.isUploadedPassportSizePhoto) {
      this.passportSizePhotoError = true;
    }

    this.signatureImageError = false;
    if (this.formData.uploadsInfo.signatureImageRequired && !this.isBrowsedSignatureImage && !this.isUploadedSignatureImage) {
      this.signatureImageError = true;
    }

    if (!this.passportSizePhotoError && !this.signatureImageError) {

      this.uploadsInfoFormValues['passportSizePhoto'] = '';
      if (this.isBrowsedPassportSizePhoto) {
        this.uploadsInfoFormValues['passportSizePhoto'] = this.passportSizePhotoToUpload;
      }

      this.uploadsInfoFormValues['signatureImage'] = '';
      if (this.isBrowsedSignatureImage) {
        this.uploadsInfoFormValues['signatureImage'] = this.signatureImageToUpload;
      }
    }

  
    if (this.guardianInfoForm.valid && !this.motherPassportSizePhotoError && !this.motherSignaturePhotoError && !this.fatherPassportSizePhotoError && !this.fatherSignaturePhotoError && !this.sisterPassportSizePhotoError && !this.sisterSignaturePhotoError && !this.brotherPassportSizePhotoError && !this.brotherSignaturePhotoError && !this.guardianPassportSizePhotoError && !this.guardianSignaturePhotoError) {
      if (this.validateGuardianInfoForm()) {
        this.goToNextStep(stepper, tab);
      }      
    } else {
      this.validateAllFormFields(this.guardianInfoForm);
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  validateGuardianInfoForm() {

    let familyAnualIncomeErr = false;
    if (this.formData.guardianInfo.familyInfo.familyAnualIncomeObj.rquired) {
      if (globalFunctions.checkIfAllzero(this.guardianInfoForm.controls.familyInfo.get('familyAnualIncome').value)) {
        familyAnualIncomeErr = true;
      }
    }

    if (familyAnualIncomeErr) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.WRONG_INCOME_ENTERED, 'x', 'error-snackbar', 5000);
      return false;
    } else {
      return true;
    }
  }

  validateEduForm() {
    let wrongMarksErr = false;
    let stopFormSubmitErr = false;
    let uploadErr = false;    
    let alertMsg = '';

    if (this.showUnderGraduate) {

      this.educationInfoForm.controls.eduInfo['controls']['underGraduate'].controls.list.value.forEach((itemRow, index) => {

        if (Number(itemRow.marksObtained) > Number(itemRow.marksOutof)) {
          wrongMarksErr = true;
        }

        if (itemRow.showCollegeTransferQuestion) {
          if (itemRow.collegeTransferQuestionObj.stopFormSubmit && (itemRow.collegeTransferQuestionObj.stopFormSubmitIf == itemRow.collegeTransferQuestionAns) ) {
            stopFormSubmitErr = true;
            alertMsg = itemRow.collegeTransferQuestionObj.alertMsg;
          }
        }

        if (itemRow.showDocumentUpload && itemRow.docReq && globalFunctions.isEmpty(itemRow.docToUpload) && itemRow.hasUploadedDoc == false) {

          const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls']['underGraduate'].controls.list.controls[index];

          control.controls.docError.setValue(true, {emitEvent: false});
          uploadErr = true;
        }
      });
    }

    if (this.showGraduate && this.formData.educationInfo.eduInfo.graduate.filter.listDisplay) {

      this.educationInfoForm.controls.eduInfo['controls']['graduate'].controls.list.value.forEach((itemRow, index) => {

        if (Number(itemRow.marksObtained) > Number(itemRow.marksOutof)) {
          wrongMarksErr = true;
        }

        if (itemRow.showDocumentUpload && itemRow.docReq && globalFunctions.isEmpty(itemRow.docToUpload) && itemRow.hasUploadedDoc == false) {

          const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls']['graduate'].controls.list.controls[index];

          control.controls.docError.setValue(true, {emitEvent: false});
          uploadErr = true;
        }
      });
    }

    if (this.showPostGraduate) {

      this.educationInfoForm.controls.eduInfo['controls']['postGraduate'].controls.list.value.forEach((itemRow, index) => {

        if (Number(itemRow.marksObtained) > Number(itemRow.marksOutof)) {
          wrongMarksErr = true;
        }

        if (itemRow.showDocumentUpload && itemRow.docReq && globalFunctions.isEmpty(itemRow.docToUpload) && itemRow.hasUploadedDoc == false) {

          const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls']['postGraduate'].controls.list.controls[index];

          control.controls.docError.setValue(true, {emitEvent: false});
          uploadErr = true;
        }        
      });
    }

    if (this.showMasterGraduate) {

      this.educationInfoForm.controls.eduInfo['controls']['masterGraduate'].controls.list.value.forEach((itemRow, index) => {

        if (Number(itemRow.marksObtained) > Number(itemRow.marksOutof)) {
          wrongMarksErr = true;
        }

        if (itemRow.showDocumentUpload && itemRow.docReq && globalFunctions.isEmpty(itemRow.docToUpload) && itemRow.hasUploadedDoc == false) {

          const control: any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls']['masterGraduate'].controls.list.controls[index];

          control.controls.docError.setValue(true, { emitEvent: false });
          uploadErr = true;
        }
      });
    }

    if (wrongMarksErr) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.WRONG_MARKS_ENTERED, 'x', 'error-snackbar', 5000);
      return false;
    } else if (uploadErr) {
      this._snackBarMsgComponent.openSnackBar(allMsgs.FILE_NOT_FOUND, 'x', 'error-snackbar', 5000);
      return false;
    } else if (stopFormSubmitErr) {
      this._snackBarMsgComponent.openSnackBar(alertMsg, 'x', 'error-snackbar', 5000);
      return false;
    } else {
      return true;
    }
  }

  onEducationInfoFormSubmit(values:any, stepper: MatStepper, tab:any):void {
    this._snackBarMsgComponent.closeSnackBar();
    if (this.educationInfoForm.valid) {
      if (this.validateEduForm()) {
        this.goToNextStep(stepper, tab);
      }
    } else {
      this.validateAllFormFields(this.educationInfoForm);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onAdditionalQualificationFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.additionalQualificationForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this.validateAllFormFields(this.additionalQualificationForm);
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onAdditionalCertificationFormSubmit(values: any, stepper: MatStepper, tab: any): void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.additionalCertificationForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this.validateAllFormFields(this.additionalCertificationForm);
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onExtraCurriculumFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.extraCurriculumForm.valid) {

      let validate = this.validateExtraCurriculum();
      if (validate.err) {
        this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
      } else {
        this.goToNextStep(stepper, tab);
      }

    } else {
      this.validateAllFormFields(this.extraCurriculumForm);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  validateExtraCurriculum() {

    let error = false;

    const controls:any = <UntypedFormArray>this.extraCurriculumForm.controls.onlineLearningPreparedness['controls'];

    controls.forEach((details) => {

      details.controls.chkBoxErr.setValue(false);
      let chkBoxChecked = false;
      if (details.get('checkCondition').value) {
       if ( (details.get('condition').value).conditionOn ==  details.get('value').value && 
            (details.get('condition').value).show == "chkBox" && (details.get('chkBox').value).required ) {
      
          (details.get('chkBox').value).options.forEach((details) => {
            if (details.isSelected) {
              chkBoxChecked = true;
            }
          });

          if (!chkBoxChecked) {
            details.controls.chkBoxErr.setValue(true);
            error = true;
          }
        }
      }
    });

    return {
     err: error
    }
  }  

  onQuestionnaireFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.questionnaireForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this.validateAllFormFields(this.questionnaireForm);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onSoftwareInfoFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.softwareInfoForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this.validateAllFormFields(this.softwareInfoForm);
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onWorkExperienceSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.workExperienceForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this.validateAllFormFields(this.workExperienceForm);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onBankInfoFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.bankInfoForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this.validateAllFormFields(this.bankInfoForm);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onDocumentsFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    let err = false;
    this.documentsForm.controls.documents.value.forEach((itemRow, index) => {
      if ( itemRow.required && globalFunctions.isEmpty(itemRow.docToUpload) && globalFunctions.isEmpty(itemRow.uploadedFile)) {
        const documents = (<UntypedFormArray>this.documentsForm.controls['documents']).at(index);
        documents['controls'].docError.setValue(true);
        err = true;
      }
    });

    if (!err) {
      this.goToNextStep(stepper, tab);
    } else {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onDeclarationFormSubmit(values:any, stepper: MatStepper):void {
    this.saveForm('finalSave');
    this.dialogRef.close();
   // this.openConfirmDialog();

  }

  openConfirmDialog() {

    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: 'auto',
      width: '500px',
      autoFocus: false
    });

    dialogRef.componentInstance.modalTitle = 'Do you wish to Submit ?';
    dialogRef.componentInstance.yesText = 'YES';
    dialogRef.componentInstance.noText = 'NO';
    dialogRef.componentInstance.dialogRef = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'ok') {
        this.saveForm('finalSave');
      }
    });
  }  

  readUrl(event:any, mode='') {

    this._snackBarMsgComponent.closeSnackBar();

    if (event.target.files && event.target.files[0]) {

      let file = event.target.files[0];

      if (!globalFunctions.isValidFileExtension(file, this.fileExt)) {

        let ext = file.name.toUpperCase().split('.').pop() || file.name;

        this._snackBarMsgComponent.openSnackBar(ext + " file extension is not valid, Valid extensions are: ( " + this.fileExt + " )", 'x', 'error-snackbar');

        if (mode == 'passportSizePhoto') {
          this.isBrowsedPassportSizePhoto = false;
        } else if (mode == 'signatureImage') {
          this.isBrowsedSignatureImage = false;
        } else if (mode == 'parentSignatureImage') {
          this.isBrowsedParentSignatureImage = false;
        }

      } else if (!globalFunctions.isValidFileSize(file, this.maxSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');

        if (mode == 'passportSizePhoto') {
          this.isBrowsedPassportSizePhoto = false;
        } else if (mode == 'signatureImage') {
          this.isBrowsedSignatureImage = false;
        } else if (mode == 'parentSignatureImage') {
          this.isBrowsedParentSignatureImage = false;
        } else if (mode == 'fatherPassportSizePhoto') {
          this.isFatherBrowsedPassportSizePhoto = false;
        } else if (mode == 'fatherSignaturePhoto') {
          this.isFatherBrowsedSignaturePhoto = false;
        } else if (mode == 'motherPassportSizePhoto') {
          this.isMotherBrowsedPassportSizePhoto = false;
        } else if (mode == 'motherSignaturePhoto') {
          this.isMotherBrowsedSignaturePhoto = false;
        } else if (mode == 'brotherPassportSizePhoto') {
          this.isBrotherBrowsedPassportSizePhoto = false;
        } else if (mode == 'brotherSignaturePhoto') {
          this.isBrotherBrowsedSignaturePhoto = false;
        } else if (mode == 'sisterPassportSizePhoto') {
          this.isSisterBrowsedPassportSizePhoto = false;
        } else if (mode == 'sisterSignaturePhoto') {
          this.isSisterBrowsedSignaturePhoto = false;
        }
      } else {
        let postParam = {
          'mode': mode,
        }
        this.openImageCropperDialog(event, postParam);
      }
    }
  }

  docBunchUrl(event:any, docIndex=0, bunchIndex=0) {

    this._snackBarMsgComponent.closeSnackBar();

    if (event.target.files && event.target.files[0]) {

      let file = event.target.files[0];
      let ext = file.name.toUpperCase().split('.').pop() || file.name;
      
      const documents = this.documentsBunch[docIndex][bunchIndex];

      if (!globalFunctions.isValidFileExtension(file, this.docFileExt)) {

        this._snackBarMsgComponent.openSnackBar(ext + " file extension is not valid, Valid extensions are: ( " + this.fileExt + " )", 'x', 'error-snackbar');
        documents['controls'].isBrowsed.setValue(false);

      } else if (!globalFunctions.isValidFileSize(file, this.maxSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');
        documents['controls'].isBrowsed.setValue(false);

      } else {

        if (ext.toUpperCase() == 'PDF') {
          let fileList: FileList = event.target.files;
          let file: File = fileList[0];

          this.browsedDocData(file, docIndex, bunchIndex, ext);
        } else {
          let postParam = {
            'mode': 'documents',
            'docIndex': docIndex,
            'bunchIndex': bunchIndex,
          }
          this.openImageCropperDialog(event, postParam);
        }
      }
    }
  }

  browsedDocData(data, docIndex, bunchIndex, ext = '') {

    const documents = this.documentsBunch[docIndex][bunchIndex];
    documents['controls'].docError.setValue(false);
    documents['controls'].isBrowsed.setValue(true);
    documents['controls'].docToUpload.setValue(data);

    let postData = {
      docId: documents['controls'].docId.value,
      docValue: data
    }
    
    if (ext == 'PDF') {
      documents['controls'].hasPhoto.setValue(this.defaultPdfImage);
      this.uploadPdf(postData);
    } else {
      documents['controls'].hasPhoto.setValue(data);
      this.uploadDocImage(postData);
    }
  }

  uploadPdf(values:any) {

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.uploadPdf(values.docValue, values.docId).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.uploadedFileNames.push(data.dataJson.fileName); 
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);        
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  uploadDocImage(values:any) {

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.uploadDocImage(values).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.uploadedFileNames.push(data.dataJson.fileName); 
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);        
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  openImageCropperDialog(imageEvent, postParam:any) {

    let dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      height: '550px',
      minHeight: '400px',
      width: '500px',
    });

    let modalTitle = '';
    if (postParam.mode == 'passportSizePhoto') {
      modalTitle = 'Crop applicant passport size photo to fit on the form';
    } else if (postParam.mode == 'signatureImage') {
      modalTitle = 'Crop applicant signature image to fit on the form';
    } else if (postParam.mode == 'parentSignatureImage') {
      modalTitle = 'Crop applicant parent signature image to fit on the form';
    } else if (postParam.mode == 'fatherPassportSizePhoto') {
      modalTitle = 'Crop father passport size photo to fit on the form';
    } else if (postParam.mode == 'fatherSignaturePhoto') {
      modalTitle = 'Crop father signature photo to fit on the form';
    } else if (postParam.mode == 'motherPassportSizePhoto') {
      modalTitle = 'Crop mother passport size photo to fit on the form';
    } else if (postParam.mode == 'motherSignaturePhoto') {
      modalTitle = 'Crop mother signature photo to fit on the form';
    } else if (postParam.mode == 'sisterPassportSizePhoto') {
      modalTitle = 'Crop sister passport size photo to fit on the form';
    } else if (postParam.mode == 'sisterSignaturePhoto') {
      modalTitle = 'Crop sister signature photo to fit on the form';
    } else if (postParam.mode == 'brotherPassportSizePhoto') {
      modalTitle = 'Crop brother passport size photo to fit on the form';
    } else if (postParam.mode == 'brotherSignaturePhoto') {
      modalTitle = 'Crop brother Signature photo to fit on the form';
    } else if (postParam.mode == 'guardianPassportSizePhoto') {
      modalTitle = 'Crop guardian passport size photo to fit on the form';
    } else if (postParam.mode == 'guardianSignaturePhoto') {
      modalTitle = 'Crop guardian signature photo to fit on the form';
    } else if (postParam.mode == 'documents') {
      modalTitle = 'Crop Document';
    } else if (postParam.mode == 'eduDocuments') {
      modalTitle = 'Crop Document';
    } else if (postParam.mode == 'catDocuments') {
      modalTitle = 'Crop Document';
    } else if (postParam.mode == 'subCatDocuments') {
      modalTitle = 'Crop Document';
    }else if (postParam.mode == 'DisabilityDocuments') {
      modalTitle = 'Crop Document';
    }

    dialogRef.componentInstance.mode       = postParam.mode;
    dialogRef.componentInstance.modalTitle = modalTitle;
    dialogRef.componentInstance.imageEvent = imageEvent;

    const sub = dialogRef.componentInstance.onOk.subscribe((data:any) => {

      if (postParam.mode == 'passportSizePhoto') {

        this.passportSizePhotoError = false;

        this.passportSizePhotoToUpload = data.base64;
        this.hasPassportSizePhoto = data.base64;
        this.isBrowsedPassportSizePhoto = true;

      } else if (postParam.mode == 'signatureImage') {

        this.signatureImageError = false;

        this.signatureImageToUpload = data.base64;
        this.hasSignatureImage = data.base64;
        this.isBrowsedSignatureImage = true;
      
      } else if (postParam.mode == 'parentSignatureImage') {

        this.parentSignatureImageError = false;

        this.parentSignatureImageToUpload = data.base64;
        this.hasParentSignatureImage = data.base64;
        this.isBrowsedParentSignatureImage = true;
      } else if (postParam.mode == 'fatherPassportSizePhoto') {

        this.fatherPassportSizePhotoError = false;
        
        this.fatherPassportSizePhotoToUpload = data.base64;       
        this.hasFatherPassportSizePhoto = data.base64;
        this.isFatherBrowsedPassportSizePhoto = true;

      } else if (postParam.mode == 'fatherSignaturePhoto') {

        this.fatherSignaturePhotoError = false;
        
        this.fatherSignaturePhotoToUpload = data.base64;       
        this.hasFatherSignaturePhoto = data.base64;
        this.isFatherBrowsedSignaturePhoto = true;

      } else if (postParam.mode == 'motherPassportSizePhoto') {

        this.motherPassportSizePhotoError = false;
        
        this.motherPassportSizePhotoToUpload = data.base64;       
        this.hasMotherPassportSizePhoto = data.base64;
        this.isMotherBrowsedPassportSizePhoto = true;

      } else if (postParam.mode == 'motherSignaturePhoto') {

        this.motherSignaturePhotoError = false;
        
        this.motherSignaturePhotoToUpload = data.base64;       
        this.hasMotherSignaturePhoto = data.base64;
        this.isMotherBrowsedSignaturePhoto = true;

      } else if (postParam.mode == 'brotherPassportSizePhoto') {

        this.brotherPassportSizePhotoError = false;
        
        this.brotherPassportSizePhotoToUpload = data.base64;       
        this.hasBrotherPassportSizePhoto = data.base64;
        this.isBrotherBrowsedPassportSizePhoto = true;

      } else if (postParam.mode == 'brotherSignaturePhoto') {

        this.brotherSignaturePhotoError = false;
        
        this.brotherSignaturePhotoToUpload = data.base64;       
        this.hasBrotherSignaturePhoto = data.base64;
        this.isBrotherBrowsedSignaturePhoto = true;

      } else if (postParam.mode == 'sisterPassportSizePhoto') {

        this.sisterPassportSizePhotoError = false;
        
        this.sisterPassportSizePhotoToUpload = data.base64;       
        this.hasSisterPassportSizePhoto = data.base64;
        this.isSisterBrowsedPassportSizePhoto = true;

      } else if (postParam.mode == 'sisterSignaturePhoto') {

        this.sisterSignaturePhotoError = false;
        
        this.sisterSignaturePhotoToUpload = data.base64;       
        this.hasSisterSignaturePhoto = data.base64;
        this.isSisterBrowsedSignaturePhoto = true;

      } else if (postParam.mode == 'guardianPassportSizePhoto') {

        this.guardianPassportSizePhotoError = false;
        
        this.guardianPassportSizePhotoToUpload = data.base64;       
        this.hasGuardianPassportSizePhoto = data.base64;
        this.isGuardianBrowsedPassportSizePhoto = true;

      } else if (postParam.mode == 'guardianSignaturePhoto') {

        this.guardianSignaturePhotoError = false;
        
        this.guardianSignaturePhotoToUpload = data.base64;       
        this.hasGuardianSignaturePhoto = data.base64;
        this.isGuardianBrowsedSignaturePhoto = true;
      
      } else if (postParam.mode == 'documents') {
        
        this.browsedDocData(data.base64, postParam.docIndex, postParam.bunchIndex);

      } else if (postParam.mode == 'eduDocuments') {
        
        let file = imageEvent.target.files[0];

        let _this = this;
        this.urltoFile(data.base64, file.name, 'image/png').then(function(file) {
          _this.browsedEduDocData(file, postParam.eduMode, postParam.docIndex);
        });

      } else if (postParam.mode == 'catDocuments') {
        
        let file = imageEvent.target.files[0];

        let _this = this;
        this.urltoFile(data.base64, file.name, 'image/png').then(function(file) {
          _this.browsedCatDocData(file);          
        });

      } else if (postParam.mode == 'subCatDocuments') {
        
        let file = imageEvent.target.files[0];

        let _this = this;
        this.urltoFile(data.base64, file.name, 'image/png').then(function(file) {
          _this.browsedSubCatDocData(file, postParam.optn);          
        });
      }else if (postParam.mode == 'DisabilityDocuments') {
        
        let file = imageEvent.target.files[0];
        
        let _this = this;
        this.urltoFile(data.base64, file.name, 'image/png').then(function(file) {
          _this.browsedDisabilityDocData(file);          
        });
      }

    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  urltoFile(url, filename, mimeType){
  
    return (fetch(url)
      .then(function(res){return res.arrayBuffer();})
      .then(function(buf){return new File([buf], filename, {type:mimeType});})
    );
  }  

  removeImage(mode='') {
    if (mode == 'passportSizePhoto') {
      this.hasPassportSizePhoto = null;
      this.passportSizePhotoToUpload = null;
      this.isBrowsedPassportSizePhoto = false;
      this.isUploadedPassportSizePhoto = false;
      this.passportSizePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'signatureImage') {
      this.hasSignatureImage = null;
      this.signatureImageToUpload = null;
      this.isBrowsedSignatureImage = false;
      this.isUploadedSignatureImage = false;
      this.signatureImageFileInput.nativeElement.value = '';
    } else if (mode == 'parentSignatureImage') {
      this.hasParentSignatureImage = null;
      this.parentSignatureImageToUpload = null;
      this.isBrowsedParentSignatureImage = false;
      this.isUploadedParentSignatureImage = false;
      this.parentSignatureImageFileInput.nativeElement.value = '';
    } else if (mode == 'fatherPassportSizePhoto') {
      this.hasFatherPassportSizePhoto = null;
      this.fatherPassportSizePhotoToUpload = null;
      this.isFatherBrowsedPassportSizePhoto = false;
      this.isFatherUploadedPassportSizePhoto = false;
      this.fatherPassportSizePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'fatherSignaturePhoto') {
      this.hasFatherSignaturePhoto = null;
      this.fatherSignaturePhotoToUpload = null;
      this.isFatherBrowsedSignaturePhoto = false;
      this.isFatherUploadedSignaturePhoto = false;
      this.fatherSignaturePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'motherPassportSizePhoto') {
      this.hasMotherPassportSizePhoto = null;
      this.motherPassportSizePhotoToUpload = null;
      this.isMotherBrowsedPassportSizePhoto = false;
      this.isMotherUploadedPassportSizePhoto = false;
      this.motherPassportSizePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'motherSignaturePhoto') {
      this.hasMotherSignaturePhoto = null;
      this.motherSignaturePhotoToUpload = null;
      this.isMotherBrowsedSignaturePhoto = false;
      this.isMotherUploadedSignaturePhoto = false;
      this.motherSignaturePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'brotherPassportSizePhoto') {
      this.hasBrotherPassportSizePhoto = null;
      this.brotherPassportSizePhotoToUpload = null;
      this.isBrotherBrowsedPassportSizePhoto = false;
      this.isBrotherUploadedPassportSizePhoto = false;
      this.brotherPassportSizePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'brotherSignaturePhoto') {
      this.hasBrotherSignaturePhoto = null;
      this.brotherSignaturePhotoToUpload = null;
      this.isBrotherBrowsedSignaturePhoto = false;
      this.isBrotherUploadedSignaturePhoto = false;
      this.brotherSignaturePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'sisterPassportSizePhoto') {
      this.hasSisterPassportSizePhoto = null;
      this.sisterPassportSizePhotoToUpload = null;
      this.isSisterBrowsedPassportSizePhoto = false;
      this.isSisterUploadedPassportSizePhoto = false;
      this.sisterPassportSizePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'sisterSignaturePhoto') {
      this.hasSisterSignaturePhoto = null;
      this.sisterSignaturePhotoToUpload = null;
      this.isSisterBrowsedSignaturePhoto = false;
      this.isSisterUploadedSignaturePhoto = false;
      this.sisterSignaturePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'guardianPassportSizePhoto') {
      this.hasGuardianPassportSizePhoto = null;
      this.guardianPassportSizePhotoToUpload = null;
      this.isGuardianBrowsedPassportSizePhoto = false;
      this.isGuardianUploadedPassportSizePhoto = false;
      this.guardianPassportSizePhotoFileInput.nativeElement.value = '';
    } else if (mode == 'guardianSignaturePhoto') {
      this.hasGuardianSignaturePhoto = null;
      this.guardianSignaturePhotoToUpload = null;
      this.isGuardianBrowsedSignaturePhoto = false;
      this.isGuardianUploadedSignaturePhoto = false;
      this.guardianSignaturePhotoFileInput.nativeElement.value = '';
    }
  }

  resetImage(mode='') {
    if (mode == 'passportSizePhoto') {
      this.isBrowsedPassportSizePhoto = false;
      this.passportSizePhotoToUpload = null;      
      this.hasPassportSizePhoto = this.uploadedPassportSizePhoto;
    } else if (mode == 'signatureImage') {
      this.isBrowsedSignatureImage = false;
      this.signatureImageToUpload = null;      
      this.hasSignatureImage = this.uploadedSignatureImage;
    } else if (mode == 'parentSignatureImage') {
      this.isBrowsedParentSignatureImage = false;
      this.parentSignatureImageToUpload = null;      
      this.hasParentSignatureImage = this.uploadedSignatureImage;
    } else if (mode == 'fatherPassportSizePhoto') {
      this.isFatherBrowsedPassportSizePhoto = false;
      this.fatherPassportSizePhotoToUpload = null;      
      this.hasFatherPassportSizePhoto = this.uploadedFatherPassportSizePhoto;
    } else if (mode == 'fatherSignaturePhoto') {
      this.isFatherBrowsedSignaturePhoto = false;
      this.fatherSignaturePhotoToUpload = null;      
      this.hasFatherSignaturePhoto = this.uploadedFatherSignaturePhoto;
    } else if (mode == 'motherPassportSizePhoto') {
      this.isMotherBrowsedPassportSizePhoto = false;
      this.motherPassportSizePhotoToUpload = null;      
      this.hasMotherPassportSizePhoto = this.uploadedMotherPassportSizePhoto;
    } else if (mode == 'motherSignaturePhoto') {
      this.isMotherBrowsedSignaturePhoto = false;
      this.motherSignaturePhotoToUpload = null;      
      this.hasMotherSignaturePhoto = this.uploadedMotherSignaturePhoto;
    } else if (mode == 'brotherPassportSizePhoto') {
      this.isBrotherBrowsedPassportSizePhoto = false;
      this.brotherPassportSizePhotoToUpload = null;      
      this.hasMotherPassportSizePhoto = this.uploadedMotherPassportSizePhoto;
    } else if (mode == 'brotherSignaturePhoto') {
      this.isBrotherBrowsedSignaturePhoto = false;
      this.brotherSignaturePhotoToUpload = null;      
      this.hasMotherSignaturePhoto = this.uploadedMotherSignaturePhoto;
    } else if (mode == 'sisterPassportSizePhoto') {
      this.isSisterBrowsedPassportSizePhoto = false;
      this.sisterPassportSizePhotoToUpload = null;      
      this.hasSisterPassportSizePhoto = this.uploadedSisterPassportSizePhoto;
    } else if (mode == 'sisterSignaturePhoto') {
      this.isSisterBrowsedSignaturePhoto = false;
      this.sisterSignaturePhotoToUpload = null;      
      this.hasSisterSignaturePhoto = this.uploadedSisterSignaturePhoto;
    } else if (mode == 'guardianPassportSizePhoto') {
      this.isGuardianBrowsedPassportSizePhoto = false;
      this.guardianPassportSizePhotoToUpload = null;      
      this.hasGuardianPassportSizePhoto = this.uploadedGuardianPassportSizePhoto;
    } else if (mode == 'guardianSignaturePhoto') {
      this.isGuardianBrowsedSignaturePhoto = false;
      this.guardianSignaturePhotoToUpload = null;      
      this.hasGuardianSignaturePhoto = this.uploadedGuardianSignaturePhoto;
    }
  }

  onSameAsResidentialAddress(checked, mode = '') {

    if (checked) {

      if (mode == 'personalInfo') {

        let residentialAddress = this.personalInfoForm.getRawValue().residentialAddress;
        this.personalInfoForm.controls.nativeAddress.patchValue({
          address: residentialAddress.address, 
          state: residentialAddress.state, 
          city: residentialAddress.city, 
          pincode: residentialAddress.pincode, 
        });

      } else {
  
        let residentialAddress = this.addressInfoForm.getRawValue().residentialAddress;
        this.addressInfoForm.controls.nativeAddress.patchValue({
          address: residentialAddress.address, 
          street: residentialAddress.street, 
          area: residentialAddress.area, 
          state: residentialAddress.state, 
          city: residentialAddress.city, 
          district: residentialAddress.district,           
          pincode: residentialAddress.pincode, 
          nearByRailwayStation: residentialAddress.nearByRailwayStation, 
        });
      }
    }
  }

  onChangeMarks(mode = '', index) {
    const control = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list.at(index);
    let perc = globalFunctions.calculatePercentage(control.get('marksObtained').value, control.get('marksOutof').value);
    control.controls['percentage'].setValue(perc);
    control.controls['percentageOrCgpa'].setValue(perc);
    control.controls['percentageOrSgpa'].setValue(perc);
  }

  onChangeCreditPointsGrade(mode = '', index) {

    const control = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list.at(index);

    if (!globalFunctions.isEmpty(control.get('creditPoints').value) && !globalFunctions.isEmpty(control.get('creditsEarned').value)) {
      let creditGrade = parseInt(control.get('creditPoints').value) * parseInt(control.get('creditsEarned').value);
      let perc = (control.get('creditGrade').value / control.get('creditPoints').value).toFixed(2);

      control.controls['creditGrade'].setValue(creditGrade);
      control.controls['sgpa'].setValue(perc);
    }
  }

  onChangeFilterMarks(mode = '', index) {
    const control = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.filter;
    let perc = globalFunctions.calculatePercentage(control.get('marksObtained').value, control.get('marksOutof').value);
    control.controls['percentage'].setValue(perc);
  }

  onChangeCgpa(mode = '', index) {
    
    const control = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list.at(index);
    
    if (!globalFunctions.isEmpty(control.get('cgpiObtained').value) && !globalFunctions.isEmpty(control.get('cgpiOutof').value)) {

      let perc = ((control.get('cgpiObtained').value / control.get('cgpiOutof').value) * 10).toFixed(2);
      control.controls['cgpi'].setValue(perc);
    }
  }  

  onChangeOtherActivities(otherActivity:string, checked: boolean) {
    this.otherActivitiesList.forEach((otherActivityList) => {
      if (otherActivityList.name.toString().toLowerCase() == otherActivity.toString().toLowerCase()) {
        otherActivityList.isSelected = checked;
      }
    });
  }

  filterBoardNames(event: any) {
    let text: string = event.target.value;
    this.filteredBoardList = this.boardList.filter(obj => obj.toLowerCase().indexOf(text.toString().toLowerCase()) === 0);
  }

  filterMotherTongues(event: any) {
    let text: string = event.target.value;
    this.filteredMotherTongues = this.motherTongueList.filter(obj => obj.motherTongueName.toLowerCase().indexOf(text.toString().toLowerCase()) === 0);
  }

  filterMedium(event: any) {
    let text: string = event.target.value;
    this.filteredMediumOfEducation = this.mediumOfEducationList.filter(obj => obj.mediumOfEducation.toLowerCase().indexOf(text.toString().toLowerCase()) === 0);
  }

  filterDisability(event: any) {
    let text: string = event.target.value;
    this.disabilityArray = this.disabilityList.filter(obj => obj.toLowerCase().indexOf(text.toString().toLowerCase()) === 0);
  }

  fetchMotherTongue() {
    this._commonService.getMotherTongue().subscribe(data => {
      if (data.status != undefined) {
        if (data.status == 1) {
          data.dataJson.forEach((motherTongue) => {
            motherTongue.mediumOfEducation = motherTongue.motherTongueName + ' Medium';
          });
          this.motherTongueList = data.dataJson;
          this.filteredMotherTongues = data.dataJson;
          this.mediumOfEducationList = data.dataJson;
          this.filteredMediumOfEducation = data.dataJson;
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  fetchReligions() {
    this._commonService.getReligion().subscribe(data => {
      if (data.status != undefined) {
        if (data.status == 1) {
          this.religionsList = data.dataJson;
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  fetchyearAppeared() {
    this._commonService.getYearsList().subscribe(data => {
      if (data.status != undefined) {
        if (data.status == 1) {
          this.yearAppearedList = data.dataJson;
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  fetchCastes() {
    this._commonService.getCaste().subscribe(data => {
      if (data.status != undefined) {
        if (data.status == 1) {
          this.castesList = data.dataJson;
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  fetchMonths(data) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/months.json');
    req.onload = () => {
      data(JSON.parse(req.response));
    };
    req.send();
  }

  fetchBloodGroup(data) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/bloodGroups.json');
    req.onload = () => {
      data(JSON.parse(req.response));
    };
    req.send();
  }

  fetchAnnualIncomeGroup(data) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/annualIncomeGroups.json');
    req.onload = () => {
      data(JSON.parse(req.response));
    };
    req.send();
  }

  fetchExaminations(data) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/examinations.json');
    req.onload = () => {
      data(JSON.parse(req.response));
    };
    req.send();
  }

  _closeFromDatepicker(e, i) {
    const companyDetails = <UntypedFormArray>this.workExperienceForm.controls.companyDetails;
    if (!globalFunctions.isEmpty(companyDetails.controls[i].get("durationFrom").value)) {
      let fromDate = globalFunctions.format(new Date(companyDetails.controls[i].get("durationFrom").value), 'input');
      this.toDateMinDate = new Date(this.datePipe.transform(new Date(fromDate), 'yyyy, MM, dd'));
      this.calcWorkExpTotalMonths();
    }
  }

  _closeToDatepicker(e, i) {
    this.calcWorkExpTotalMonths();
  }

  calcWorkExpTotalMonths(): void {

    this.workExperienceFormValues = this.workExperienceForm.value;
    let monhts = 0;
    this.workExperienceFormValues['companyDetails'].forEach((itemRow) => {

      if (!globalFunctions.isEmpty(itemRow.durationFrom) && !globalFunctions.isEmpty(itemRow.durationTo)) {
        let durationFrom = globalFunctions.format(new Date(itemRow.durationFrom), 'input');
        let durationTo = globalFunctions.format(new Date(itemRow.durationTo), 'input');

        let calcMonhts = globalFunctions.monthsDiff(durationFrom, durationTo);
        monhts = monhts + calcMonhts;
      }
    });
    
    this.workExperienceForm.controls.expAfterGraduation.setValue(monhts, {emitEvent: false});
  }

  addNewRow(): void {
    const companyDetails = <UntypedFormArray>this.workExperienceForm.controls.companyDetails;
    companyDetails.push(this.companyDetailsRows());
    this.setWorkExpDetailsValidations();
  }

  deleteRow(i: number): void {
    const companyDetails = <UntypedFormArray>this.workExperienceForm.controls.companyDetails;
    companyDetails.removeAt(i);
    this.setWorkExpDetailsValidations();
  }

  setWorkExpDetailsValidations(): void {

    const companyType = this.workExperienceForm.get('companyType');
    const expAfterGraduation = this.workExperienceForm.get('expAfterGraduation');
    const companyDetails = <UntypedFormArray>this.workExperienceForm.controls.companyDetails;

    if (this.workExperienceForm.get('workExp').value == 'yes') {
      companyType.setValidators([Validators.required]);
      expAfterGraduation.setValidators([Validators.required]);
      companyDetails.controls.forEach((itemRow) => {
        const companyName = itemRow.get('companyName');
        companyName.setValidators([Validators.required]);
        const designation = itemRow.get('designation');
        designation.setValidators([Validators.required]);
        const durationFrom = itemRow.get('durationFrom');
        durationFrom.setValidators([Validators.required]);
        const durationTo = itemRow.get('durationTo');
        durationTo.setValidators([Validators.required]);
        const shiftTimeFrom = itemRow.get('shiftTimeFrom');
        shiftTimeFrom.setValidators([Validators.required]);
        const shiftTimeTo = itemRow.get('shiftTimeTo');
        shiftTimeTo.setValidators([Validators.required]);
        const salary = itemRow.get('salary');
        salary.setValidators([Validators.required]);
      });
    } else {
      companyType.clearValidators();
      expAfterGraduation.clearValidators();
      companyDetails.controls.forEach((itemRow) => {
        const companyName = itemRow.get('companyName');
        companyName.clearValidators();
        companyName.updateValueAndValidity();        
        const designation = itemRow.get('designation');
        designation.clearValidators();
        designation.updateValueAndValidity();        
        const durationFrom = itemRow.get('durationFrom');
        durationFrom.clearValidators();
        durationFrom.updateValueAndValidity();        
        const durationTo = itemRow.get('durationTo');
        durationTo.clearValidators();
        durationTo.updateValueAndValidity();
        const shiftTimeFrom = itemRow.get('shiftTimeFrom');
        shiftTimeFrom.clearValidators();
        shiftTimeFrom.updateValueAndValidity();
        const shiftTimeTo = itemRow.get('shiftTimeTo');
        shiftTimeTo.clearValidators();
        shiftTimeTo.updateValueAndValidity();        
        const salary = itemRow.get('salary');
        salary.clearValidators();
        salary.updateValueAndValidity();        
      });
    }

    companyType.updateValueAndValidity();
    expAfterGraduation.updateValueAndValidity();
    companyDetails.updateValueAndValidity();
  }

  onSelectCourse(preference: number, bunchId: number, courseIndex: number) {
    this._snackBarMsgComponent.closeSnackBar();
    this.coursesBunch[bunchId][courseIndex]['courseErr'] = false;
    this.coursesBunch[bunchId][courseIndex]['sequence'] = preference;
  }

  getFromPincode(event:any, mode, form = ''):void {

    let pincode = event.target.value;
    if (pincode.length == 6) {

      this.allEventEmitters.showLoader.emit(true);
      this._commonService.getFromPincode(pincode).subscribe(data => {

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {

          if (data.status == 1) {

            if (form == 'personalInfo') {

              if (mode == 'residentialAddress') {
                let residentialAddress = <UntypedFormGroup> this.personalInfoForm.controls.residentialAddress;
                residentialAddress.controls.state.setValue(data.dataJson.stateName, {emitEvent: false});
                residentialAddress.controls.state.disable();              
                residentialAddress.controls.city.setValue(data.dataJson.cityName, {emitEvent: false});
                residentialAddress.controls.city.disable();
              } else if (mode == 'nativeAddress') {
                let nativeAddress = <UntypedFormGroup> this.personalInfoForm.controls.nativeAddress;
                nativeAddress.controls.state.setValue(data.dataJson.stateName, {emitEvent: false});
                nativeAddress.controls.state.disable();
                nativeAddress.controls.city.setValue(data.dataJson.cityName, {emitEvent: false});
                nativeAddress.controls.city.disable();
              }

            } else {

              if (mode == 'residentialAddress') {
                let residentialAddress = <UntypedFormGroup> this.addressInfoForm.controls.residentialAddress;
                residentialAddress.controls.state.setValue(data.dataJson.stateName, {emitEvent: false});
                residentialAddress.controls.state.disable();              
                residentialAddress.controls.city.setValue(data.dataJson.cityName, {emitEvent: false});
                residentialAddress.controls.city.disable();
              } else if (mode == 'nativeAddress') {
                let nativeAddress = <UntypedFormGroup> this.addressInfoForm.controls.nativeAddress;
                nativeAddress.controls.state.setValue(data.dataJson.stateName, {emitEvent: false});
                nativeAddress.controls.state.disable();
                nativeAddress.controls.city.setValue(data.dataJson.cityName, {emitEvent: false});
                nativeAddress.controls.city.disable();
              } else if (mode == 'aadharAddress') {
                let aadharAddress = <UntypedFormGroup> this.addressInfoForm.controls.aadharAddress;
                aadharAddress.controls.state.setValue(data.dataJson.stateName, {emitEvent: false});
                aadharAddress.controls.state.disable();
                aadharAddress.controls.city.setValue(data.dataJson.cityName, {emitEvent: false});
                aadharAddress.controls.city.disable();
              } else if (mode == 'fatherDetails') {
                let fatherDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails;
                fatherDetails.controls.officeState.setValue(data.dataJson.stateName, {emitEvent: false});
                fatherDetails.controls.officeState.disable();
                fatherDetails.controls.officeCity.setValue(data.dataJson.cityName, {emitEvent: false});
                fatherDetails.controls.officeCity.disable();
              } else if (mode == 'motherDetails') {
                let motherDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].motherDetails;
                motherDetails.controls.officeState.setValue(data.dataJson.stateName, {emitEvent: false});
                motherDetails.controls.officeState.disable();
                motherDetails.controls.officeCity.setValue(data.dataJson.cityName, {emitEvent: false});
                motherDetails.controls.officeCity.disable();
              } else if (mode == 'sisterDetails') {
                let sisterDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails;
                sisterDetails.controls.officeState.setValue(data.dataJson.stateName, {emitEvent: false});
                sisterDetails.controls.officeState.disable();
                sisterDetails.controls.officeCity.setValue(data.dataJson.cityName, {emitEvent: false});
                sisterDetails.controls.officeCity.disable();
              } else if (mode == 'brotherDetails') {
                let brotherDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails;
                brotherDetails.controls.officeState.setValue(data.dataJson.stateName, {emitEvent: false});
                brotherDetails.controls.officeState.disable();
                brotherDetails.controls.officeCity.setValue(data.dataJson.cityName, {emitEvent: false});
                brotherDetails.controls.officeCity.disable();
              }else if (mode == 'guardianDetails') {
                let guardianDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails;
                guardianDetails.controls.officeState.setValue(data.dataJson.stateName, {emitEvent: false});
                guardianDetails.controls.officeState.disable();
                guardianDetails.controls.officeCity.setValue(data.dataJson.cityName, {emitEvent: false});
                guardianDetails.controls.officeCity.disable();
              }
            }

          } else if (data.status == 0) {

            if (form == 'personalInfo') {

              if (mode == 'residentialAddress') {
                let residentialAddress = <UntypedFormGroup> this.personalInfoForm.controls.residentialAddress;
                residentialAddress.controls.state.enable();
                residentialAddress.controls.city.enable();
              } else if (mode == 'nativeAddress') {
                let nativeAddress = <UntypedFormGroup> this.personalInfoForm.controls.nativeAddress;
                nativeAddress.controls.state.enable();
                nativeAddress.controls.city.enable();
              }

            } else {

              if (mode == 'residentialAddress') {
                let residentialAddress = <UntypedFormGroup> this.addressInfoForm.controls.residentialAddress;
                residentialAddress.controls.state.enable();
                residentialAddress.controls.city.enable();
              } else if (mode == 'nativeAddress') {
                let nativeAddress = <UntypedFormGroup> this.addressInfoForm.controls.nativeAddress;
                nativeAddress.controls.state.enable();
                nativeAddress.controls.city.enable();
              } else if (mode == 'aadharAddress') {
                let aadharAddress = <UntypedFormGroup> this.addressInfoForm.controls.aadharAddress;
                aadharAddress.controls.state.enable();
                aadharAddress.controls.city.enable();
              } else if (mode == 'fatherDetails') {
                let fatherDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].fatherDetails;              
                fatherDetails.controls.officeState.enable();
                fatherDetails.controls.officeCity.enable();
              } else if (mode == 'motherDetails') {
                let motherDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].motherDetails;
                motherDetails.controls.officeState.enable();
                motherDetails.controls.officeCity.enable();
              }else if (mode == 'sisterDetails') {
                let sisterDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].sisterDetails;
                sisterDetails.controls.officeState.enable();
                sisterDetails.controls.officeCity.enable();
              } else if (mode == 'brotherDetails') {
                let brotherDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].brotherDetails;
                brotherDetails.controls.officeState.enable();
                brotherDetails.controls.officeCity.enable();
              } else if (mode == 'guardianDetails') {
                let guardianDetails = <UntypedFormGroup> this.guardianInfoForm.controls.membersInfo['controls'].guardianDetails;
                guardianDetails.controls.officeState.enable();
                guardianDetails.controls.officeCity.enable();
              }
            }
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
          }
        } else {
          this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }, err => {
        this.allEventEmitters.showLoader.emit(false);
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      });
    }
  }
  
  onChangeSemesterYear():void {

    let yearSemesterWise = this.educationInfoForm.controls.eduInfo['controls'].graduate['controls'].filter.get('yearSemesterWise').value;
    let semesterNo = this.educationInfoForm.controls.eduInfo['controls'].graduate['controls'].filter.get('semesterNo').value;
    let yearNo = this.educationInfoForm.controls.eduInfo['controls'].graduate['controls'].filter.get('yearNo').value;
    let appearing = this.educationInfoForm.controls.eduInfo['controls'].graduate['controls'].filter.get('appearing').value;

    if ( !globalFunctions.isEmpty(yearSemesterWise) && (!globalFunctions.isEmpty(semesterNo) || !globalFunctions.isEmpty(yearNo) )) {

      let postParam: any = {
        'yearSemesterWise': yearSemesterWise,
        'semesterNo': semesterNo,
        'yearNo': yearNo,
        'appearing': appearing,
        'applicantId': this.formDetails.applicantId,
        'formPolicyId': this.formDetails.formPolicyId,
        'formId': this.formDetails.formId,
        'page': this.panelMode, 
      };

      this.allEventEmitters.showLoader.emit(true);
      this._admissionService.getFilteredGraduationEducationInfo(postParam).subscribe(data => {

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {
          if (data.status == 1) {
            this.setEduInfoValues(data.dataJson, 'graduate');
          } else if (data.status == 0) {
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
          }
        } else {
          this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }, err => {
        this.allEventEmitters.showLoader.emit(false);
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      });
    }

    if (!globalFunctions.isEmpty(yearSemesterWise) && !globalFunctions.isEmpty(appearing)) {

      let postParam: any = {
        'yearSemesterWise': yearSemesterWise,
        'appearing': appearing,
        'applicantId': this.formDetails.applicantId,
        'formPolicyId': this.formDetails.formPolicyId,
        'formId': this.formDetails.formId,
        'page': this.panelMode, 
      };

      this.allEventEmitters.showLoader.emit(true);
      this._admissionService.getYearSemesterWiseDropdown(postParam).subscribe(data => {

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {
          if (data.status == 1) {
            if (data.dataJson.semesterNo != undefined) {
              this.semesterNoList = data.dataJson.semesterNo.values;
            }
            if (data.dataJson.yearNo != undefined) {
              this.yearNoList = data.dataJson.yearNo.values;
            }
          } else if (data.status == 0) {
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
          }
        } else {
          this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }, err => {
        this.allEventEmitters.showLoader.emit(false);
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      });
    }    
  }

  onChangeConfName(conf:any, mode, listIndex:number):void {

    let confName = conf.confName;

    const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list.controls[listIndex];

    control.controls.documentUploadObj.setValue(conf.documentUpload, {emitEvent: false});

    control.controls.showDocumentUpload.setValue(false, {emitEvent: false});
    control.controls.docReq.setValue(false, {emitEvent: false});
    if (conf.documentUpload.checkCondition) {
      if (conf.documentUpload.display) {
        control.controls.showDocumentUpload.setValue(true, {emitEvent: false});
      }
      if (conf.documentUpload.required) {
        control.controls.docReq.setValue(true, {emitEvent: false});
      }
    }

    if (conf.hsc.checkCondition) {
    
      const subject1 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.subject1;
      const subject2 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.subject2;
      const subject3 = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.subject3;
      const totalMarks = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.totalMarks;
      const optionalSubject = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].hsc.controls.subjectInfo.controls.optionalSubject;

      this.showHscBlk = conf.hsc.display;

      if (this.showHscBlk) {

        this.showAggregateRow = false;
        if (conf.enggHscTotal.checkCondition && conf.enggHscTotal.display && this.formData.educationInfo.enggInfo.hsc.subjectInfo.totalMarks.display) {

          this.showAggregateRow = true;
        }

        if (this.formData.educationInfo.enggInfo.hsc.subjectInfoReq) {
        
          if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.subject1.display) {

            subject1.get('marksObtained').setValidators([Validators.required]);
            subject1.get('marksOutof').setValidators([Validators.required]);
            subject1.get('totalPercentage').setValidators([Validators.required]);
          }

          if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.subject2.display) {

            subject2.get('marksObtained').setValidators([Validators.required]);
            subject2.get('marksOutof').setValidators([Validators.required]);
            subject2.get('totalPercentage').setValidators([Validators.required]);
          }

          if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.subject3.display) {

            subject3.get('marksObtained').setValidators([Validators.required]);
            subject3.get('marksOutof').setValidators([Validators.required]);
            subject3.get('totalPercentage').setValidators([Validators.required]);
          }

          if (this.formData.educationInfo.enggInfo.hsc.subjectInfo.optionalSubject.display) {

            optionalSubject.get('value').setValidators([Validators.required]);
            optionalSubject.get('marksObtained').setValidators([Validators.required]);
            optionalSubject.get('marksOutof').setValidators([Validators.required]);
            optionalSubject.get('totalPercentage').setValidators([Validators.required]);
          }
        }

      } else {

        subject1.get('marksObtained').clearValidators();
        subject1.get('marksOutof').clearValidators();
        subject1.get('totalPercentage').clearValidators();

        subject2.get('marksObtained').clearValidators();
        subject2.get('marksOutof').clearValidators();
        subject2.get('totalPercentage').clearValidators();

        subject3.get('marksObtained').clearValidators();
        subject3.get('marksOutof').clearValidators();
        subject3.get('totalPercentage').clearValidators();

        optionalSubject.get('value').clearValidators();
        optionalSubject.get('marksObtained').clearValidators();
        optionalSubject.get('marksOutof').clearValidators();
        optionalSubject.get('totalPercentage').clearValidators();
      }
  
      subject1.get('marksObtained').updateValueAndValidity();
      subject1.get('marksOutof').updateValueAndValidity();
      subject1.get('totalPercentage').updateValueAndValidity();

      subject2.get('marksObtained').updateValueAndValidity();
      subject2.get('marksOutof').updateValueAndValidity();
      subject2.get('totalPercentage').updateValueAndValidity();

      subject3.get('marksObtained').updateValueAndValidity();
      subject3.get('marksOutof').updateValueAndValidity();
      subject3.get('totalPercentage').updateValueAndValidity();

      optionalSubject.get('value').updateValueAndValidity();
      optionalSubject.get('marksObtained').updateValueAndValidity();
      optionalSubject.get('marksOutof').updateValueAndValidity();
      optionalSubject.get('totalPercentage').updateValueAndValidity();
    }

    if (conf.ssc.checkCondition) {

      const maths = <UntypedFormGroup>this.educationInfoForm.controls.eduInfo['controls'].enggInfo['controls'].ssc.controls.subjectInfo.controls.maths;

      this.showSscBlk = conf.ssc.display;

      if (this.showSscBlk) {

        if (this.formData.educationInfo.enggInfo.ssc.subjectInfoReq) {
        
          maths.get('marksObtained').setValidators([Validators.required]);
          maths.get('marksOutof').setValidators([Validators.required]);
          maths.get('totalPercentage').setValidators([Validators.required]);
        }

      } else {

        maths.get('marksObtained').clearValidators();
        maths.get('marksOutof').clearValidators();
        maths.get('totalPercentage').clearValidators();
      }
      maths.get('marksObtained').updateValueAndValidity();
      maths.get('marksOutof').updateValueAndValidity();
      maths.get('totalPercentage').updateValueAndValidity();
    }

    if (conf.enterance.checkCondition) {

      this.showEnteranceDetailsBlk = conf.enterance.display;

      if (this.showEnteranceDetailsBlk) {

        this.setEnteranceExamDetailsValidations();

      } else {

        const enteranceExam = this.educationInfoForm.controls.enteranceDetails.get('enteranceExam');
        const examFor = this.educationInfoForm.controls.enteranceDetails.get('examFor');
        const year = this.educationInfoForm.controls.enteranceDetails.get('year');
        const seatNo = this.educationInfoForm.controls.enteranceDetails.get('seatNo');
        const score = this.educationInfoForm.controls.enteranceDetails.get('score');
        const percentile = this.educationInfoForm.controls.enteranceDetails.get('percentile');

        const maths = this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.maths;
        const physics = this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.physics;
        const chemistry = this.educationInfoForm.controls.enteranceDetails['controls'].subjectsInfo.controls.chemistry;

        enteranceExam.clearValidators();
        examFor.clearValidators();
        year.clearValidators();
        seatNo.clearValidators();
        score.clearValidators();
        percentile.clearValidators();
        maths.clearValidators();
        physics.clearValidators();
        chemistry.clearValidators();

        enteranceExam.updateValueAndValidity();
        examFor.updateValueAndValidity();
        seatNo.updateValueAndValidity();
        year.updateValueAndValidity();
        score.updateValueAndValidity();
        percentile.updateValueAndValidity();
        maths.updateValueAndValidity();
        physics.updateValueAndValidity();
        chemistry.updateValueAndValidity();
      }
    }

    if (conf.collegeTransfer.checkCondition) {

      const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list.controls[listIndex];
      control.controls.showCollegeTransferQuestion.setValue(false, {emitEvent: false});
      control.controls.showSemesterCompleted.setValue(false, {emitEvent: false});
      if (conf.collegeTransfer.display) {

        control.controls.showCollegeTransferQuestion.setValue(true, {emitEvent: false});
        control.get('collegeTransferQuestionAns').setValidators([Validators.required]);
        
        if (control.get('semesterCompletedObj').value.display) {
          control.controls.showSemesterCompleted.setValue(true, {emitEvent: false});          
          if (control.get('semesterCompletedObj').value.required) {
            control.get('semesterCompleted').setValidators([Validators.required]);
          }
        }

      } else {
        control.get('collegeTransferQuestionAns').clearValidators();
        control.get('semesterCompleted').clearValidators();
      }
      control.get('collegeTransferQuestionAns').updateValueAndValidity();
      control.get('semesterCompleted').updateValueAndValidity();
    }
  }

  onChangeGradingSystem(val: string, mode, listIndex: number): void {

    let gradingSystem = val.toLowerCase();

    const control: any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list.controls[listIndex];

    const marksObtained = control.controls.marksObtained;
    const marksOutof = control.controls.marksOutof;
    const percentage = control.controls.percentage;
    const percentageOrCgpa = control.controls.percentageOrCgpa;
    const percentageOrSgpa = control.controls.percentageOrSgpa;
    const className = control.controls.class;

    const grade = control.controls.grade;
    const cgpiObtained = control.controls.cgpiObtained;
    const cgpiOutof = control.controls.cgpiOutof;
    const cgpi = control.controls.cgpi;

    control.controls.showMarksBlk.setValue(false, { emitEvent: false });
    control.controls.showCgpaBlk.setValue(false, { emitEvent: false });
    if (gradingSystem == 'percentage') {

      control.controls.showMarksBlk.setValue(true, { emitEvent: false });
     
        if (this.formData.educationInfo.eduInfo[mode].list[listIndex].marksObtainedRequired) {
          marksObtained.setValidators([Validators.required]);
        }
        if (this.formData.educationInfo.eduInfo[mode].list[listIndex].marksOutofRequired) {
          marksOutof.setValidators([Validators.required]);
        }
        if (this.formData.educationInfo.eduInfo[mode].list[listIndex].percentageRequired) {
          percentage.setValidators([Validators.required]);
        }
        if (this.formData.educationInfo.eduInfo[mode].list[listIndex].percentageOrCgpaRequired) {
          percentageOrCgpa.setValidators([Validators.required]);
        }
        if (this.formData.educationInfo.eduInfo[mode].list[listIndex].percentageOrSgpaRequired) {
          percentageOrSgpa.setValidators([Validators.required]);
        }
        if (control.controls.classObj.value.display && control.controls.classObj.value.required) {
          className.setValidators([Validators.required]);
        }

      cgpiObtained.clearValidators();
      cgpiOutof.clearValidators();
      cgpi.clearValidators();

    } else if (gradingSystem == 'cgpa') {

      control.controls.showCgpaBlk.setValue(true, { emitEvent: false });
         
        if (this.formData.educationInfo.eduInfo[mode].list[listIndex].cgpiObtainedRequired) {
          cgpiObtained.setValidators([Validators.required]);
        }
        if (this.formData.educationInfo.eduInfo[mode].list[listIndex].cgpiOutofRequired) {
          cgpiOutof.setValidators([Validators.required]);
        }
        if (this.formData.educationInfo.eduInfo[mode].list[listIndex].cgpiRequired) {
          cgpi.setValidators([Validators.required]);
        }

      marksObtained.clearValidators();
      marksOutof.clearValidators();
      percentage.clearValidators();
      percentageOrCgpa.clearValidators();
      percentageOrSgpa.clearValidators();
      className.clearValidators();
    }

    marksObtained.updateValueAndValidity();
    marksOutof.updateValueAndValidity();
    percentage.updateValueAndValidity();
    percentageOrCgpa.updateValueAndValidity();
    percentageOrSgpa.updateValueAndValidity();
    className.updateValueAndValidity();

    cgpiObtained.updateValueAndValidity();
    cgpiOutof.updateValueAndValidity();
    cgpi.updateValueAndValidity();
  }

  onChangeDegree(degree, mode):void {

    this.formData.educationInfo.eduInfo[mode].filter.otherText.display = false;
    const otherText = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.filter.controls.otherText;
    if (degree.toString().toLowerCase() == 'others') {
      this.formData.educationInfo.eduInfo[mode].filter.otherText.display = true;
      otherText.setValidators([Validators.required]);
    } else {
      otherText.clearValidators();
    }
    otherText.updateValueAndValidity();
  }

  goToNextStep(stepper, tab) {
    if (this.formLock) {
      this.openEditAlert(stepper);
    } else {
      this.saveForm('', tab);
      stepper.next();
    }
  }

  openEditAlert(stepper, data:any = {}, mode = '') {

    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: 'auto',
      width: '500px',
      autoFocus: false
    });

    let modalTitle = '';
    let noText = '';
    if (mode != 'finalSave') {
      modalTitle = this.formLockNote;
      noText = 'CLOSE';
    }

    dialogRef.componentInstance.modalTitle = modalTitle;
    dialogRef.componentInstance.yesText = 'OK';
    dialogRef.componentInstance.noText = noText;
    dialogRef.componentInstance.dialogRef = dialogRef;
    if (mode == 'finalSave') {
      dialogRef.componentInstance.innerHtmlMsg = data.messageText;
    }

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'ok') {
        if (mode == 'finalSave') {
          this.afterAdmissionFormSave(data);
        } else {
          stepper.next();
        }
      }
    });
  }

  saveForm(mode = '', tab:any = '') {
       
    if (this.formData.personalInfo.addressInfo.display == false) {
      this.personalInfoForm.controls.residentialAddress['controls'].address.setValue(this.addressInfoForm.controls.residentialAddress['controls'].address.value);
      this.personalInfoForm.controls.residentialAddress['controls'].city.setValue(this.addressInfoForm.controls.residentialAddress['controls'].city.value);
      this.personalInfoForm.controls.residentialAddress['controls'].area.setValue(this.addressInfoForm.controls.residentialAddress['controls'].area.value);
      this.personalInfoForm.controls.residentialAddress['controls'].pincode.setValue(this.addressInfoForm.controls.residentialAddress['controls'].pincode.value);
      this.personalInfoForm.controls.residentialAddress['controls'].street.setValue(this.addressInfoForm.controls.residentialAddress['controls'].street.value);
      this.personalInfoForm.controls.residentialAddress['controls'].nearByRailwayStation.setValue(this.addressInfoForm.controls.residentialAddress['controls'].nearByRailwayStation.value);
      this.personalInfoForm.controls.residentialAddress['controls'].district.setValue(this.addressInfoForm.controls.residentialAddress['controls'].district.value);

      this.personalInfoForm.controls.nativeAddress['controls'].address.setValue(this.addressInfoForm.controls.nativeAddress['controls'].address.value);
      this.personalInfoForm.controls.nativeAddress['controls'].area.setValue(this.addressInfoForm.controls.nativeAddress['controls'].area.value);
      this.personalInfoForm.controls.nativeAddress['controls'].city.setValue(this.addressInfoForm.controls.nativeAddress['controls'].city.value);
      this.personalInfoForm.controls.nativeAddress['controls'].pincode.setValue(this.addressInfoForm.controls.nativeAddress['controls'].pincode.value);
      this.personalInfoForm.controls.nativeAddress['controls'].street.setValue(this.addressInfoForm.controls.nativeAddress['controls'].street.value);
      this.personalInfoForm.controls.nativeAddress['controls'].nearByRailwayStation.setValue(this.addressInfoForm.controls.nativeAddress['controls'].nearByRailwayStation.value);
      this.personalInfoForm.controls.nativeAddress['controls'].district.setValue(this.addressInfoForm.controls.nativeAddress['controls'].district.value);
    }

    this.subjectSelectionList.forEach((details, subjSelectnInx) => {

      if (details.type == "singleChoice") {

        let allSubjectsList = [];
        details.subjectsListBunch.forEach((subjBunch) => {

          subjBunch.forEach((subj) => {

            allSubjectsList.push(subj);
          });
        });

        details.subjectsList = allSubjectsList;        
      }
    });

    this.coursesListValues = [];
    this.coursesBunch.forEach((courses) => {
      courses.forEach((course) => {
        this.coursesListValues.push(course);
      });
    });

    let subCategoryValues = [];
    this.subCategoryList.forEach((details) => {
      if (details.isSelected) {
        subCategoryValues.push(details);
      }
    });
    this.categoryForm.controls['applyingSubCategories'].setValue(subCategoryValues, {emitEvent: false});

    this.categoryFormValues = this.categoryForm.getRawValue();

    this.personalInfoFormValues = this.personalInfoForm.getRawValue();
    this.personalInfoFormValues['dob'] = globalFunctions.format(new Date(this.personalInfoForm.get("dob").value), 'input');
    this.personalInfoFormValues['aadharDob'] = globalFunctions.format(new Date(this.personalInfoForm.get("aadharDob").value), 'input');
    this.personalInfoFormValues['passportDetails']['issueDate'] = globalFunctions.format(new Date(this.personalInfoForm.controls.passportDetails.get('issueDate').value), 'input');
    this.personalInfoFormValues['passportDetails']['expiryDate'] = globalFunctions.format(new Date(this.personalInfoForm.controls.passportDetails.get('expiryDate').value), 'input');

    this.addressInfoFormValues = this.addressInfoForm.getRawValue();
    this.guardianInfoFormValues = this.guardianInfoForm.getRawValue();
    this.bankInfoFormValues = this.bankInfoForm.value;
    this.educationInfoFormValues = this.educationInfoForm.value;
    this.additionalQualificationFormValues = this.additionalQualificationForm.getRawValue();
    this.softwareInfoFormValues = this.softwareInfoForm.value;

    this.workExperienceFormValues = this.workExperienceForm.value;
    if (this.workExperienceFormValues['workExp'] == 'yes') {
      this.workExperienceFormValues['companyDetails'].forEach((itemRow) => {
        itemRow.durationFrom = globalFunctions.format(new Date(itemRow.durationFrom), 'input');
        itemRow.durationTo = globalFunctions.format(new Date(itemRow.durationTo), 'input');
      });
    }

    this.extraCurriculumFormValues = this.extraCurriculumForm.value;
    this.additionalCertificationFormValues = this.additionalCertificationForm.value;
    this.otherActivities = [];
    this.otherActivitiesList.forEach((otherActivityList) => {
      if (otherActivityList.isSelected) {
        this.otherActivities.push(otherActivityList.name);
      }
    });
    this.extraCurriculumFormValues['otherActivities'] = this.otherActivities;

    this.questionnaireFormValues = this.questionnaireForm.get('questionnaire').value;

    this.branchingQuestionFormValues = this.branchingQuestionForm.get('questions').value;

    this.documentsFormValues = this.documentsForm.controls.documents.value;

    this.additionalCertificationFormValues[0] = this.additionalCertificationForm.get('additionalCertificationFields').value;

    if (this.panelMode == 'admission' || this.panelMode == 'admission-form-b') {
      this.saveAdmissionForm(mode, tab);
    } else {
      this.saveInstitutesForm(mode, tab);
    }
  }
  
  saveAdmissionForm(mode = '', tab:any = '') {

    let finalSave = false;
    if (mode == 'finalSave') {
      finalSave = true;
      this.allEventEmitters.showLoader.emit(true);
    }

    let postParam: any = {
      'coursesList': this.coursesListValues,
      'categories': this.categoryFormValues,
      'personalInfo': this.personalInfoFormValues,
      'addressInfo': this.addressInfoFormValues,
      'guardianInfo': this.guardianInfoFormValues,
      'educationInfo': this.educationInfoFormValues,
      'additionalQualification': this.additionalQualificationFormValues,
      'extraCurriculumActivities': this.extraCurriculumFormValues,
      'extraCertificate': this.additionalCertificationFormValues,
      'bankInfo': this.bankInfoFormValues,
      'questionnaire': this.questionnaireFormValues,
      'branchingQuestion': this.branchingQuestionFormValues,
      'softwareKnowledge': this.softwareInfoFormValues,
      'workExpDetails': this.workExperienceFormValues,
      'uploadedFileNames': this.uploadedFileNames,
      'courseSelectionValues': this.courseSelectionValues,
      'subjectSelectionValues': this.subjectSelectionList,
      'declarationFormValues': this.declarationFormValues,
      'finalSave': finalSave,
      'stepName': tab.stepName,
      'page': this.panelMode,
    };

    this._admissionService.saveForm(postParam,this.fatherPassportSizePhotoToUpload,this.motherPassportSizePhotoToUpload,this.sisterPassportSizePhotoToUpload,this.brotherPassportSizePhotoToUpload,this.guardianPassportSizePhotoToUpload, this.passportSizePhotoToUpload, this.signatureImageToUpload, this.parentSignatureImageToUpload,this.fatherSignaturePhotoToUpload, this.motherSignaturePhotoToUpload, this.sisterSignaturePhotoToUpload, this.brotherSignaturePhotoToUpload, this.guardianSignaturePhotoToUpload).subscribe(data => {

      if (mode == 'finalSave') {
        this.allEventEmitters.showLoader.emit(false);
      }

      if (data.status != undefined) {

        if (data.status == 1) {

          if (mode == 'finalSave') {

            globalFunctions.setUserProf('formStatus', 1);
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);

            if (data.dataJson.showMsg) {
              setTimeout(() => { this.openEditAlert('', data.dataJson, 'finalSave'); }, 1);
            } else {
              this.afterAdmissionFormSave(data.dataJson);
            }
          }
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);        
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  afterAdmissionFormSave(data) {

    if (this.documentsUpload && data.documentsUpload) {
      globalFunctions.setLocalStorage('authUrl', data.authUrl);
      this.router.navigate(['/uploadDocuments']);
    } else if (!globalFunctions.isEmpty(data.authUrl)) {
      globalFunctions.setLocalStorage('authUrl', data.authUrl);
      window.location.href = data.authUrl;
    } else if (!this.courseSelection && !this.documentsUpload && !this.optPayment) {
      this.directFormGenerate();
    } else if (data.showFormB) {
      this.router.navigate(['/admissionFormB']);
    } else if (this.formType == 'preReg' && !this.documentsUpload) {
      this.router.navigate(['/downloadForms']);
    } else if (this.courseSelection) {
      this.router.navigate(['/courseSelection']);
    } else {
      this.router.navigate(['/cart']);
    }
  }

  directFormGenerate() {

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.directFormGenerate({}, this.panelMode).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {

        if (data.status == 1) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);

          if (!globalFunctions.isEmpty(data.dataJson.newApplicantId)) {
            globalFunctions.setUserProf('applicantId', data.dataJson.newApplicantId);
          }

          this.router.navigate(['/downloadForms']);

        } else if (data.status == 101) {

            globalFunctions.setUserProf('applicantId', data.dataJson.newApplicantId);

            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

            this.router.navigate(['/admissionForm']);

        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);          
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  saveInstitutesForm(mode = '', tab:any = '') {

    let finalSave = false;
    if (mode == 'finalSave') {
      finalSave = true;
      this.allEventEmitters.showLoader.emit(true);
    }

    let postParam: any = {
      'coursesList': this.coursesListValues,
      'categories': this.categoryFormValues,
      'personalInfo': this.personalInfoFormValues,
      'addressInfo': this.addressInfoFormValues,
      'guardianInfo': this.guardianInfoFormValues,
      'educationInfo': this.educationInfoFormValues,
      'additionalQualification': this.additionalQualificationFormValues,      
      'extraCurriculumActivities': this.extraCurriculumFormValues,
      'bankInfo': this.bankInfoFormValues,
      'questionnaire': this.questionnaireFormValues,
      'branchingQuestion': this.branchingQuestionFormValues,
      'extraCertificate': this.additionalCertificationFormValues,
      'softwareKnowledge': this.softwareInfoFormValues,
      'workExpDetails': this.workExperienceFormValues,
      'uploadedFileNames': this.uploadedFileNames,
      'declarationFormValues': this.declarationFormValues, 
      'courseSelectionValues': this.courseSelectionValues, 
      'subjectSelectionValues': this.subjectSelectionList,      
      'finalSave': finalSave,
      'stepName': tab.stepName,
      'page': this.panelMode,
      'formId': this.formDetails.formId,
      'universityApplicationFormNo': this.universityApplicationFormNo.value,
    };

    this._institutesService.saveAdmissionForm(postParam, this.passportSizePhotoToUpload, this.signatureImageToUpload, this.parentSignatureImageToUpload).subscribe(data => {

      if (mode == 'finalSave') {
        this.allEventEmitters.showLoader.emit(false);
      }

      if (data.status != undefined) {

        if (data.status == 1) {

          if (mode == 'finalSave') {
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);            
           // this.sharedDialogRef.close();
          }

        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);        
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  validateAllFormFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(field => {

      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);
      } else if (control instanceof UntypedFormArray) {
        this.validateAllFormArrayFields(control);
      }
    });
  }

  validateAllFormArrayFields(formGroup: UntypedFormArray) {

    Object.keys(formGroup.controls).forEach(field => {

      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);
      } else if (control instanceof UntypedFormArray) {
        this.validateAllFormArrayFields(control);
      }
    });
  }

  onEduDocReadFile(event:any, eduMode, listIndex:number) {

    this._snackBarMsgComponent.closeSnackBar();

    if (event.target.files && event.target.files[0]) {

      let file = event.target.files[0];
      let ext = file.name.toLowerCase().split('.').pop() || file.name;
      
      const documents:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][eduMode].controls.list.controls[listIndex];

      if (!globalFunctions.isValidFileExtension(file, this.attachmentFileExt)) {

        this._snackBarMsgComponent.openSnackBar(ext + " file extension is not valid, Valid extensions are: ( " + this.attachmentFileExt + " )", 'x', 'error-snackbar');
     
        documents['controls'].docBrowsed.setValue(false);

      } else if (!globalFunctions.isValidFileSize(file, this.attachmentMaxFileSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.attachmentMaxFileSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');

        documents['controls'].docBrowsed.setValue(false);

      } else {

        if (ext == 'png' || ext == 'jpeg' || ext == 'jpg') {

          let postParam = {
            'mode': 'eduDocuments',
            'docIndex': listIndex,
            'eduMode': eduMode,
          }
          this.openImageCropperDialog(event, postParam);

        } else {
  
          this.browsedEduDocData(file, eduMode, listIndex);
        }
      }
    }
  }

  removeEduDocFile(mode, listIndex) {
 
    const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list.controls[listIndex];

    control.controls.docError.setValue(false, {emitEvent: false});
    control.controls.docBrowsed.setValue(false, {emitEvent: false});
    control.controls.docToUpload.setValue(null, {emitEvent: false});

    if (!globalFunctions.isEmpty(control.get('documentUrl').value)) {
      control.controls.showDocResetBtn.setValue(true, {emitEvent: false});      
    }
  }

  removeUploadedEduDocFile(mode, listIndex) {
 
    const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list.controls[listIndex];

    control.controls.hasUploadedDoc.setValue(false, {emitEvent: false});
    control.controls.docBrowsed.setValue(false, {emitEvent: false});
    control.controls.showDocResetBtn.setValue(true, {emitEvent: false});
  }

  onResetEduDocFile(mode, listIndex) {
 
    const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][mode].controls.list.controls[listIndex];

    control.controls.showDocResetBtn.setValue(false, {emitEvent: false});
    control.controls.hasUploadedDoc.setValue(true, {emitEvent: false});
  }

  browsedEduDocData(data, eduMode, listIndex) {

    const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][eduMode].controls.list.controls[listIndex];

    control.controls.docError.setValue(false, {emitEvent: false});
    control.controls.docBrowsed.setValue(true, {emitEvent: false});
    control.controls.showDocResetBtn.setValue(false, {emitEvent: false});

    let postParam = {
      'mode': 'eduDocuments',
      'eduMode': eduMode,
      'listIndex': listIndex,
    }
    this.uploadFile(data, postParam);
  }

  onDisabilityDocReadFile(event:any) {
    
    this._snackBarMsgComponent.closeSnackBar();

    if (event.target.files && event.target.files[0]) {

      let file = event.target.files[0];
      let ext = file.name.toLowerCase().split('.').pop() || file.name;
      
      if (!globalFunctions.isValidFileExtension(file, this.attachmentFileExt)) {

        this._snackBarMsgComponent.openSnackBar(ext + " file extension is not valid, Valid extensions are: ( " + this.attachmentFileExt + " )", 'x', 'error-snackbar');
     
        this.personalInfoForm.controls['disability']['controls'].certificate.setValue(false, {emitEvent: false});

      } else if (!globalFunctions.isValidFileSize(file, this.attachmentMaxFileSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.attachmentMaxFileSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');

        this.personalInfoForm.controls['disability']['controls'].certificate.setValue(false, {emitEvent: false});

      } else {

        if (ext == 'png' || ext == 'jpeg' || ext == 'jpg' || ext == 'pdf') {

          let postParam = {
            'mode': 'DisabilityDocuments',
          }
          this.openImageCropperDialog(event, postParam);

        } else {
  
          this.browsedDisabilityDocData(file);
        }
      }
    }
  }

  browsedDisabilityDocData(data) {
    this.personalInfoForm.controls['disability']['controls'].disabilityDocError.setValue(false, {emitEvent: false});
    this.personalInfoForm.controls['disability']['controls'].disabilityDocBrowsed.setValue(true, {emitEvent: false});
   
    let postParam = {
      'mode': 'DisabilityDocuments',
    }
    this.uploadFile(data, postParam);
  }

  removeDisabilityDocFile() {
 
    this.personalInfoForm.controls['disability']['controls'].disabilityDocError.setValue(false, {emitEvent: false});
    this.personalInfoForm.controls['disability']['controls'].disabilityDocBrowsed.setValue(false, {emitEvent: false});
  }

  removeUploadedDisabilityDocFile() {

    this.personalInfoForm.controls['disability']['controls'].disabilityHasUploadedDoc.setValue(false, {emitEvent: false});
    this.personalInfoForm.controls['disability']['controls'].disabilityDocBrowsed.setValue(false, {emitEvent: false});
    this.personalInfoForm.controls['disability']['controls'].showDocResetBtn.setValue(true, {emitEvent: false});    
  }

  onResetDisabilityDocFile() {

    this.personalInfoForm.controls['disability']['controls'].showDocResetBtn.setValue(false, {emitEvent: false});
    this.personalInfoForm.controls['disability']['controls'].disabilityHasUploadedDoc.setValue(true, {emitEvent: false});
  }

    onScholarshipDocReadFile(event: any) {

    this._snackBarMsgComponent.closeSnackBar();

    if (event.target.files && event.target.files[0]) {

      let file = event.target.files[0];
      let ext = file.name.toLowerCase().split('.').pop() || file.name;

      if (!globalFunctions.isValidFileExtension(file, this.attachmentFileExt)) {

        this._snackBarMsgComponent.openSnackBar(ext + " file extension is not valid, Valid extensions are: ( " + this.attachmentFileExt + " )", 'x', 'error-snackbar');

        this.personalInfoForm.controls['scholarship']['controls'].certificate.setValue(false, { emitEvent: false });

      } else if (!globalFunctions.isValidFileSize(file, this.attachmentMaxFileSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.attachmentMaxFileSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');

        this.personalInfoForm.controls['scholarship']['controls'].certificate.setValue(false, { emitEvent: false });

      } else {
        this.browsedScholarshipDocData(file);
      }
    }
  }

  browsedScholarshipDocData(data) {

    this.personalInfoForm.controls['scholarship']['controls'].scholarshipDocError.setValue(false, { emitEvent: false });
    this.personalInfoForm.controls['scholarship']['controls'].scholarshipDocBrowsed.setValue(true, { emitEvent: false });
    let postParam = {
      'mode': 'scholarshipDocuments',
    }
    this.uploadFile(data, postParam);
  }

  removeScholarshipDocFile() {

    this.personalInfoForm.controls['scholarship']['controls'].scholarshipDocError.setValue(false, { emitEvent: false });
    this.personalInfoForm.controls['scholarship']['controls'].scholarshipDocBrowsed.setValue(false, { emitEvent: false });
  }

  removeUploadedScholarshipDocFile() {

    this.personalInfoForm.controls['scholarship']['controls'].scholarshipHasUploadedDoc.setValue(false, { emitEvent: false });
    this.personalInfoForm.controls['scholarship']['controls'].scholarshipDocBrowsed.setValue(false, { emitEvent: false });
    this.personalInfoForm.controls['scholarship']['controls'].showDocResetBtn.setValue(true, { emitEvent: false });
  }

  onResetScholarshipDocFile() {

    this.personalInfoForm.controls['scholarship']['controls'].showDocResetBtn.setValue(false, { emitEvent: false });
    this.personalInfoForm.controls['scholarship']['controls'].scholarshipHasUploadedDoc.setValue(true, { emitEvent: false });
  }  

  onCatDocReadFile(event:any) {

    this._snackBarMsgComponent.closeSnackBar();

    if (event.target.files && event.target.files[0]) {

      let file = event.target.files[0];
      let ext = file.name.toLowerCase().split('.').pop() || file.name;
      
      if (!globalFunctions.isValidFileExtension(file, this.attachmentFileExt)) {

        this._snackBarMsgComponent.openSnackBar(ext + " file extension is not valid, Valid extensions are: ( " + this.attachmentFileExt + " )", 'x', 'error-snackbar');
     
        this.categoryForm.controls['catDocBrowsed'].setValue(false, {emitEvent: false});

      } else if (!globalFunctions.isValidFileSize(file, this.attachmentMaxFileSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.attachmentMaxFileSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');

        this.categoryForm.controls['catDocBrowsed'].setValue(false, {emitEvent: false});

      } else {

        if (ext == 'png' || ext == 'jpeg' || ext == 'jpg') {

          let postParam = {
            'mode': 'catDocuments',
          }
          this.openImageCropperDialog(event, postParam);

        } else {
  
          this.browsedCatDocData(file);
        }
      }
    }
  }

  removeCatDocFile() {
 
    this.categoryForm.controls['catDocError'].setValue(false, {emitEvent: false});
    this.categoryForm.controls['catDocBrowsed'].setValue(false, {emitEvent: false});
    this.categoryForm.controls['catDocToUpload'].setValue(null, {emitEvent: false});
    
    if (!globalFunctions.isEmpty(this.categoryForm.get('catDocumentUploadObj').value.documentUrl)) {
      this.categoryForm.controls['showDocResetBtn'].setValue(true, {emitEvent: false});      
    }
  }

  removeUploadedCatDocFile() {

    this.categoryForm.controls['catHasUploadedDoc'].setValue(false, {emitEvent: false});
    this.categoryForm.controls['catDocBrowsed'].setValue(false, {emitEvent: false});
    this.categoryForm.controls['showDocResetBtn'].setValue(true, {emitEvent: false});    
  }

  onResetCatDocFile() {

    this.categoryForm.controls['showDocResetBtn'].setValue(false, {emitEvent: false});
    this.categoryForm.controls['catHasUploadedDoc'].setValue(true, {emitEvent: false});
  }

  browsedCatDocData(data) {

    this.categoryForm.controls['catDocError'].setValue(false, {emitEvent: false});
    this.categoryForm.controls['catDocBrowsed'].setValue(true, {emitEvent: false});
    this.categoryForm.controls['showDocResetBtn'].setValue(false, {emitEvent: false});

    let postParam = {
      'mode': 'catDocuments',
    }
    this.uploadFile(data, postParam);
  }

  onSubCatDocReadFile(event:any, optn:any) {

    this._snackBarMsgComponent.closeSnackBar();

    if (event.target.files && event.target.files[0]) {

      let file = event.target.files[0];
      let ext = file.name.toLowerCase().split('.').pop() || file.name;
      
      if (!globalFunctions.isValidFileExtension(file, this.attachmentFileExt)) {

        this._snackBarMsgComponent.openSnackBar(ext + " file extension is not valid, Valid extensions are: ( " + this.attachmentFileExt + " )", 'x', 'error-snackbar');
     
        this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatDocBrowsed = false;

      } else if (!globalFunctions.isValidFileSize(file, this.attachmentMaxFileSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.attachmentMaxFileSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');

        this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatDocBrowsed = false;

      } else {

        if (ext == 'png' || ext == 'jpeg' || ext == 'jpg') {

          let postParam = {
            'mode': 'subCatDocuments',
            'optn': optn,
          }
          this.openImageCropperDialog(event, postParam);

        } else {
  
          this.browsedSubCatDocData(file, optn);
        }
      }
    }
  }

  removeSubCatDocFile(optn:any) {
 
    this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatDocError = false;
    this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatDocBrowsed = false;
    this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatDocToUpload = null;

    if (!globalFunctions.isEmpty(this.subCategoryReverseArray[optn.admissionSubCategoryId].documentUpload.documentUrl)) {
      this.subCategoryReverseArray[optn.admissionSubCategoryId].showDocResetBtn = true;
    }
  }

  removeUploadedSubCatDocFile(optn:any) {

    this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatHasUploadedDoc = false;
    this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatDocBrowsed = false;
    this.subCategoryReverseArray[optn.admissionSubCategoryId].showDocResetBtn = true;
  }

  onResetSubCatDocFile(optn:any) {

    this.subCategoryReverseArray[optn.admissionSubCategoryId].showDocResetBtn = false;
    this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatHasUploadedDoc = true;
  }

  browsedSubCatDocData(data, optn) {

    this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatDocError = false;
    this.subCategoryReverseArray[optn.admissionSubCategoryId].showDocResetBtn = false;
    this.subCategoryReverseArray[optn.admissionSubCategoryId].subCatDocBrowsed = true;

    let postParam = {
      'mode': 'subCatDocuments',
      'optn': optn,
    }
    this.uploadFile(data, postParam);
  }

  uploadFile(file, postVal:any) {

    if (postVal.mode == 'eduDocuments') {    
    
      const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][postVal.eduMode].controls.list.controls[postVal.listIndex];
      control.controls.docUploading.setValue(true, {emitEvent: false});
    
    } else if (postVal.mode == 'catDocuments') {

      this.categoryForm.controls['catDocUploading'].setValue(true, {emitEvent: false});

    } else if (postVal.mode == 'subCatDocuments') {

      this.subCategoryReverseArray[postVal.optn.admissionSubCategoryId].subCatDocUploading = true;
    }

    let postParam: any = {
      'fileFormat': 'documents',
    }

    this.allEventEmitters.showLoader.emit(true);
    this._commonService.uploadFile(file, postParam).subscribe(event => {

      if (event.type === HttpEventType.UploadProgress) {

        let perc = Math.round(100 * event.loaded / event.total);

        if (postVal.mode == 'eduDocuments') {
          
          const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][postVal.eduMode].controls.list.controls[postVal.listIndex];
          control.controls.docUploadPercent.setValue(perc, {emitEvent: false});

        } else if (postVal.mode == 'catDocuments') {

          this.categoryForm.controls['catDocUploadPercent'].setValue(perc, {emitEvent: false});

        } else if (postVal.mode == 'subCatDocuments') {

          this.subCategoryReverseArray[postVal.optn.admissionSubCategoryId].subCatDocUploadPercent = perc;
        }

      } else if (event instanceof HttpResponse) {

        if (postVal.mode == 'eduDocuments') {

          const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][postVal.eduMode].controls.list.controls[postVal.listIndex];
          control.controls.docUploading.setValue(false, {emitEvent: false});

        } else if (postVal.mode == 'catDocuments') {

          this.categoryForm.controls['catDocUploading'].setValue(false, {emitEvent: false});

        } else if (postVal.mode == 'subCatDocuments') {

          this.subCategoryReverseArray[postVal.optn.admissionSubCategoryId].subCatDocUploading = false;
        }
        
        let data = event.body;

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {
          
          if ((data.status == 1) && (!globalFunctions.isEmpty(data.dataJson.fileNames))) {

            data.dataJson.fileNames.forEach((fileName) => {
              
              if (postVal.mode == 'eduDocuments') {
              
                const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][postVal.eduMode].controls.list.controls[postVal.listIndex];
                control.controls.docToUpload.setValue(fileName, {emitEvent: false});
              
              } else if (postVal.mode == 'catDocuments') {

                this.categoryForm.controls['catDocToUpload'].setValue(fileName, {emitEvent: false});

              } else if (postVal.mode == 'subCatDocuments') {

                this.subCategoryReverseArray[postVal.optn.admissionSubCategoryId].subCatDocToUpload = fileName;
              } else if (postVal.mode == 'DisabilityDocuments') {
                this.personalInfoForm.controls['disability']['controls'].disabilityHasUploadedDoc.setValue(true, {emitEvent: false});
                this.personalInfoForm.controls['disability']['controls'].certificate.setValue(fileName, {emitEvent: false});
            } else if (postVal.mode == 'scholarshipDocuments') {
              this.personalInfoForm.controls['scholarship']['controls'].scholarshipHasUploadedDoc.setValue(true, { emitEvent: false });
              this.personalInfoForm.controls['scholarship']['controls'].certificate.setValue(fileName, { emitEvent: false });
            }
            });

            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);
         
          } else if (data.status == 0) {

            if (postVal.mode == 'eduDocuments') {

              const control:any = <UntypedFormArray>this.educationInfoForm.controls.eduInfo['controls'][postVal.eduMode].controls.list.controls[postVal.listIndex];
              control.controls.docBrowsed.setValue(false);

            } else if (postVal.mode == 'catDocuments') {

              this.categoryForm.controls['catDocBrowsed'].setValue(false, {emitEvent: false});
          
            } else if (postVal.mode == 'subCatDocuments') {

              this.subCategoryReverseArray[postVal.optn.admissionSubCategoryId].subCatDocBrowsed = false;
            }

            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
          }
        } else {
          this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  viewDoc(docUrl) {
    if (!globalFunctions.isEmpty(docUrl)) {
      var win = window.open(docUrl, '_blank');
      if (win) {
        win.focus();
      } else {
        alert('Please allow popups for this website');
      }
    } else {
      alert('Doc Url not found!');
    }
  }  

  onCloseClick(): void {
    this.dialogRef.close();
  }


}
