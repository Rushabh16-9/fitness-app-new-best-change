import { Component, ViewEncapsulation, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { DatePipe } from '@angular/common';
import { MatStepper } from '@angular/material/stepper';
import { MatDatepicker } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { CommonService } from 'app-shared-services/common.service';
import { InstitutesService } from 'app-shared-services/institutes.service';
import { AtktService } from 'app-shared-services/atkt.service';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { ConfirmDialogComponent } from 'app-shared-components/confirm-dialog/confirm-dialog.component';

import { ImageCropperDialogComponent } from 'app-shared-components/image-cropper-dialog/image-cropper-dialog.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
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
  selector: 'shared-atkt-form',
  templateUrl: 'shared-atkt-form.component.html',
  styleUrls: ['shared-atkt-form.component.css'],
  providers: [
    SnackBarMsgComponent,
    AtktService, 
    CommonService, 
    InstitutesService,
    DatePipe,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},    
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}          
  ],
  encapsulation: ViewEncapsulation.None
})
export class SharedAtktFormComponent implements OnInit {

  @Input('panelMode') panelMode;
  @Input('formDetails') formDetails;
  @Input('sharedDialogRef') sharedDialogRef;

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('elementToFocus') _input: ElementRef;

  isLinear = false;

  minDate = new Date(1970, 0, 1);
  maxDate = new Date(2018, 1, 1);

  months = [];
  yearAppearedList = [];

  instituteId: number = 0;
  atktFormId: number = 0;

  categoryForm: UntypedFormGroup;
  categoryFormValues = [];
  categoriesObj:any = {};  
  categoryGrps = [];
  categoryError: boolean = false;

  subCategoryValues = [];
  subCategoryObj:any = {};
  subCategoryList = [];
  subCategoryBunch = [];
  subCategoryError: boolean = false;

  studentType: boolean = false;

  personalInfoForm: UntypedFormGroup;
  personalInfoFormValues = [];

  addressInfoForm: UntypedFormGroup;
  addressInfoFormValues = [];  

  educationInfoForm: UntypedFormGroup;
  educationInfoFormValues = [];

  subjectInfoForm: UntypedFormGroup;
  subjectInfoFormValues: any = [];
  showExamMarksPatterns: boolean = false;
  maxSubjectSelection:number = 0;

  uploadsInfoForm: UntypedFormGroup;
  uploadsInfoFormValues = [];  
  defaultImage = '../assets/images/users/default-user.jpg';

  isBrowsedPassportSizePhoto: boolean = false;
  isUploadedPassportSizePhoto: boolean = false;
  uploadedPassportSizePhoto: any;

  isBrowsedSignatureImage: boolean = false;
  isUploadedSignatureImage: boolean = false;
  showSubCategories: boolean = false;
  uploadedSignatureImage: any;

  hasPassportSizePhoto: any;
  hasSignatureImage: any;

  passportSizePhotoToUpload: any = '';
  signatureImageToUpload: any = '';
  isConfidential: string = '';
  formPolicyId: number = 0;
  showEnrollmentNumber: boolean = false;

  @ViewChild('passportSizePhotoFileInput') passportSizePhotoFileInput: ElementRef;
  @ViewChild('signatureImageFileInput') signatureImageFileInput: ElementRef;
  maxSize:number = 1;
  fileExt: string = "JPG, JPEG, PNG";
  passportSizePhotoError: boolean = false;
  signatureImageError: boolean = false;

  fromInstitute: boolean = false;
  instituteName: string = 'college';
  educationHeaders: any = {courseName:true, termExam:true, seatNo:true, monthAppeared:true, yearAppeared: true, marksObtained:true, status:true, internalFailed:true, externalFailed:true, sgpiCgpi:true};
  subjectHeaders: any = {checkedStatus:true, subjectConfId:true, subjectCode:true, subjectName:true, answeringLanguage:true, marksObtained:true, examTypes: true, marksInternal: true, marksTheory: true,marksPractical:true};
  answeringLanguagesArray: any = [];

  formData: any;
  admissionClosed: boolean = false;
  admissionClosedMessage: string = 'Admissions are closed';

  subjectCompulsoryArray = [];
  subjectLanguagesOptionalArray = [];
  subjectOptionalArray = [];

  passFailStatusesArray = [];
  
  showAdmissionType: boolean = true;
  admissionTypesArray = [];  
  showExamSession: boolean = true;
  examSessionsArray = [];
  showExamPattern: boolean = true;
  examPatternsArray = [];

  repeatersInfoShow: boolean = false;
  subjectGroupArray = [];
  showSubjectGroup: boolean = false;

  serverData = {};

  formSetup = [];
  formType: any = '';
  documentsUpload: boolean = true;
  courseSelection: boolean = true;
  optPayment: boolean = true;
  guardianName = '';

  formLock: boolean = false;
  formLockNote = '';

  constructor(
    private _formBuilder: UntypedFormBuilder, 
    private router: Router, 
    private datePipe: DatePipe,
    public dialog: MatDialog,
    private allEventEmitters: AllEventEmitters,
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private _atktService: AtktService,
    private _institutesService: InstitutesService,    
    private _commonService: CommonService,         
  ) {

    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('instituteId'))) {

      let userProf = globalFunctions.getUserProf();
      this.formType = userProf.formType;
      this.courseSelection = userProf.courseSelection;
      this.documentsUpload = userProf.documentsUpload;
      this.optPayment = userProf.optPayment;
      this.formPolicyId = userProf.formPolicyId;

      if (this.formPolicyId == 1) {
        this.showEnrollmentNumber = true;
      }

      this.fromInstitute = true;
    }

    this.maxDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));
  }

  ngOnInit(): void {

    this.categoryFormControls();
    this.createPersonalInfoFormControls();
    this.addressInfoFormControls();
    this.subjectInfoFormControls();
    this.educationInfoFormControls();

    this.fetchCategories();
    this.fetchSubCategories();
    this.fetchyearAppeared();
    this.fetchMonths((data) => {
      this.months = data;
    });

    if (this.panelMode == 'admission') {
      this.getFormDetails();
    } else {
      this.getAtktFormDetails();
    }
  }

  getFormDetails() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._atktService.getFormDetails().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.setFormValues(data.dataJson);

        } else if (data.status == 101) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);        
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  getAtktFormDetails() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._institutesService.getAtktFormDetails(this.formDetails.atktFormId, this.formDetails.atktApplicantId).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.setFormValues(data.dataJson);

        } else if (data.status == 101) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

        } else if (data.status == 102) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
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

    globalFunctions.setUserProf('headerImage', formData.headerImage);
    globalFunctions.setUserProf('instituteName', formData.instituteName);
    setTimeout(() => { this.allEventEmitters.setHeaderImage.emit(true); }, 2);

    this.formData = formData;
    this.formSetup = formData.formSetup;
    this.admissionClosed = formData.admissionClosed;
    if (this.admissionClosed) {
      this.showEnrollmentNumber = false;
    }

    let stepperIndex = 0;
    this.formSetup.forEach((tab) => {
      if (tab.display) {
        tab.stepperIndex = stepperIndex;
        stepperIndex++;
      }
    });
 
    this.setCategoryFormValues(formData);
    this.setApplyingSubCategoriesValues(formData);
    this.setPersonalInfoValues(formData.personalInfo);
    this.setAddressInfoValues(formData);
    this.setSubjectInfoValues(formData.subjectInfo);
    this.setEducationInfoValues(formData);
    this.setDeclarationInfoValues(formData);
  }

  setCategoryFormValues(formData:any) {

    this.showExamPattern     = formData.categoryInfo.examPattern.show;
    this.examPatternsArray   = formData.categoryInfo.examPattern.fromArray;
    this.showSubCategories   = formData.categoryInfo.optAdmissionSubCategories;
    this.showAdmissionType   = formData.categoryInfo.admissionType.show;
    this.admissionTypesArray = formData.categoryInfo.admissionType.fromArray;
    this.showExamSession     = formData.categoryInfo.examSession.show;
    this.examSessionsArray   = formData.categoryInfo.examSession.fromArray;

    let admissionTypeReq:any;
    if (formData.categoryInfo.admissionType.required) {
      admissionTypeReq = Validators.required;
    }
    let examSessionReq:any;
    if (formData.categoryInfo.examSession.required) {
      examSessionReq = Validators.required;
    }
    let examPatternReq:any;
    if (formData.categoryInfo.examPattern.required) {
      examPatternReq = Validators.required;
    }

    let applyingSubCategoriesReq:any;
    if (this.showSubCategories) {
      applyingSubCategoriesReq = Validators.required;
    }

    let studentTypeReq:any;
    if (formData.categoryInfo.showStudentType) {
      studentTypeReq = Validators.required;
    }

    this.categoryForm = this._formBuilder.group({
      applyingCategories: [formData.categoryInfo.applyingCategories, Validators.required],
      otherCategory: [null],
      applyingSubCategories: [formData.categoryInfo.applyingSubCategories, applyingSubCategoriesReq],
      showSubCatInRadio: [formData.categoryInfo.showSubCatInRadio],
      studentType: [formData.categoryInfo.studentType, studentTypeReq],
      admissionTypeValue: [formData.categoryInfo.admissionTypeValue, admissionTypeReq],
      examSessionValue: [formData.categoryInfo.examSessionValue, examSessionReq],
      examPatternValue: [formData.categoryInfo.examPatternValue, examPatternReq],
    });

    this.categoryFormValues = this.categoryForm.value;

    const otherCategory = this.categoryForm.get('otherCategory');

    this.categoryGrps.forEach((cateGrp) => {
      cateGrp.list.forEach((cat) => {
        cat.isSelected = false;
        if (cat.admissionCategoryId == formData.categoryInfo.applyingCategories) {
          cat.isSelected = true;
          if (cat.otherCategory) {
            otherCategory.setValidators([Validators.required]);            
          } else {
            otherCategory.clearValidators();
          }
        }
      });
    });
  
    otherCategory.updateValueAndValidity();

    this.categoryError = false;
  }    

  setApplyingSubCategoriesValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.applyingSubCategories)) {
      formData.applyingSubCategories.forEach((appliedSubCategory) => {
        this.subCategoryList.forEach((details) => {
          if (details.admissionSubCategoryId == appliedSubCategory) {
            details.isSelected = true;
          }
        });
      });
    }
  }

  setPersonalInfoValues(personalInfo:any) {

    if (!globalFunctions.isEmpty(personalInfo)) {

      let fullNameMarksheetReq:any;
      if (personalInfo.fullNameMarksheet.display && personalInfo.fullNameMarksheet.isRequired) {
        fullNameMarksheetReq = Validators.required;
      }
      let firstNameReq:any;
      if (personalInfo.firstName.display && personalInfo.firstName.isRequired) {
        firstNameReq = Validators.required;
      }
      let middleNameReq:any;
      if (personalInfo.middleName.display && personalInfo.middleName.isRequired) {
        middleNameReq = Validators.required;
      }
      let lastNameReq:any;
      if (personalInfo.lastName.display && personalInfo.lastName.isRequired) {
        lastNameReq = Validators.required;
      }
      let motherNameReq:any;
      if (personalInfo.motherName.display && personalInfo.motherName.isRequired) {
        motherNameReq = Validators.required;
      }
      let genderReq:any;
      if (personalInfo.gender.display && personalInfo.gender.isRequired) {
        genderReq = Validators.required;
      }
      let emailReq:any;
      if (personalInfo.email.display && personalInfo.email.isRequired) {
        emailReq = Validators.required;
      }
      let mobileNoReq:any;
      if (personalInfo.mobileNo.display && personalInfo.mobileNo.isRequired) {
        mobileNoReq = Validators.required;
      }
      let prnNoReq:any;
      if (personalInfo?.prnNo?.display && personalInfo?.prnNo?.isRequired) {
        prnNoReq = Validators.compose([Validators.required, Validators.minLength(personalInfo?.prnNo?.minLength), Validators.maxLength(personalInfo?.prnNo?.maxLength) ]);
      }
      let seatNoReq:any;
      if (personalInfo.seatNo.display && personalInfo.seatNo.isRequired) {
        seatNoReq = Validators.required;
      }
      let eligibilityNoReq:any;
      if (personalInfo.eligibilityNo.display && personalInfo.eligibilityNo.isRequired) {
        eligibilityNoReq = Validators.required;
      }
      let divyangReq:any;
      if (personalInfo.divyang.display && personalInfo.divyang.isRequired) {
        divyangReq = Validators.required;
      }
      let mediumInstructionReq:any;
      if (personalInfo.mediumInstruction.display && personalInfo.mediumInstruction.isRequired) {
        mediumInstructionReq = Validators.required;
      }

      this.personalInfoForm = this._formBuilder.group({
        fullNameMarksheet: new UntypedFormControl({value: personalInfo.fullNameMarksheet.value, disabled: personalInfo.fullNameMarksheet.isDisabled}, Validators.compose([fullNameMarksheetReq]) ),
        firstName: new UntypedFormControl({value: personalInfo.firstName.value, disabled: personalInfo.firstName.isDisabled}, Validators.compose([firstNameReq])),
        middleName: new UntypedFormControl({value: personalInfo.middleName.value, disabled: personalInfo.middleName.isDisabled}, Validators.compose([middleNameReq])),
        lastName: new UntypedFormControl({value: personalInfo.lastName.value, disabled: personalInfo.lastName.isDisabled}, Validators.compose([lastNameReq])),
        motherName: new UntypedFormControl({value: personalInfo.motherName.value, disabled: personalInfo.motherName.isDisabled}, Validators.compose([motherNameReq])),
        gender: new UntypedFormControl({value: personalInfo.gender.value, disabled: personalInfo.gender.isDisabled}, Validators.compose([genderReq])),
        email: new UntypedFormControl({value: personalInfo.email.value, disabled: personalInfo.email.isDisabled}, Validators.compose([emailReq, emailValidator])),
        mobileNo: new UntypedFormControl({value: personalInfo.mobileNo.value, disabled: personalInfo.mobileNo.isDisabled}, Validators.compose([mobileNoReq]) ),
        prnNo: new UntypedFormControl({value: personalInfo?.prnNo?.value, disabled: personalInfo?.prnNo?.isDisabled}, prnNoReq),
        seatNo: new UntypedFormControl({value: personalInfo.seatNo.value, disabled: personalInfo.seatNo.isDisabled}, Validators.compose([seatNoReq])),
        eligibilityNo: new UntypedFormControl({value: personalInfo.eligibilityNo.value, disabled: personalInfo.eligibilityNo.isDisabled}, Validators.compose([eligibilityNoReq])),
        divyang: new UntypedFormControl({value: personalInfo.divyang.value, disabled: personalInfo.divyang.isDisabled}, Validators.compose([divyangReq])),
        mediumInstruction: new UntypedFormControl({value: personalInfo.mediumInstruction.value, disabled: personalInfo.mediumInstruction.isDisabled}, Validators.compose([mediumInstructionReq])),
      });

      this.personalInfoFormValues = this.personalInfoForm.getRawValue();
    }
  }

  onPrnNoKeypress(event) {
    if (this.formData?.personalInfo?.prnNo?.isNumeric) {
      return globalFunctions.onlyNumberKey(event);
    }
  }

  setAddressInfoValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.addressInfo)) {

      this.addressInfoForm = this._formBuilder.group({
        residentialAddress: this._formBuilder.group({
          address: [formData.addressInfo.residentialAddress.address, Validators.required],
          state : new UntypedFormControl({value: formData.addressInfo.residentialAddress.state, disabled: true}, Validators.required),
          city : new UntypedFormControl({value: formData.addressInfo.residentialAddress.city, disabled: true}, Validators.required),
          district: [formData.addressInfo.residentialAddress.district],
          nearByRailwayStation: [formData.addressInfo.residentialAddress.nearByRailwayStation],
          pincode: [formData.addressInfo.residentialAddress.pincode, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
        })
      });

      this.addressInfoFormValues = this.addressInfoForm.value;
    }
  }

  setSubjectInfoValues(subjectInfo:any) {

    if ( !globalFunctions.isEmpty(subjectInfo) ) {

      this.subjectHeaders          = subjectInfo.subjectHeaders;
      this.answeringLanguagesArray = subjectInfo.answeringLanguages;
      this.maxSubjectSelection     = subjectInfo.maxSubjectSelection;

      if (!globalFunctions.isEmpty(subjectInfo.subjectGroups)) {
     
        this.showSubjectGroup = true;
        this.subjectGroupArray = subjectInfo.subjectGroups;

        this.subjectGroupArray.forEach((subjectGroup, index) => {
          subjectGroup.minErr = false;
          subjectGroup.minErrMsg = '';
          subjectGroup.maxErr = false;
          subjectGroup.maxErrMsg = '';
          subjectGroup.showInRadioBtn = false;
          if (subjectGroup.subjectRequiredCount == 1) {
            subjectGroup.showInRadioBtn = true;
          }
        });
      }

      if (!globalFunctions.isEmpty(subjectInfo.examMarksPatterns)) {
        this.showExamMarksPatterns = true;
      }

      this.subjectInfoForm = this._formBuilder.group({
        examMarksPatternSelected: [subjectInfo.examMarksPatternSelected],
        subjects: this._formBuilder.array([
          this.initSubjectInfoRows()
        ])
      });

      const control = <UntypedFormArray>this.subjectInfoForm.controls.subjects;
      control.controls.splice(0, 1);

      subjectInfo.subjects.forEach((itemRow) => {

        this.serverData[itemRow.subjectConfId] = itemRow;

        let answeringLanguageRequired:any;
        if (itemRow.answeringLanguageRequired) {
          answeringLanguageRequired = Validators.required;
        }
        let marksObtainedRequired:any;
        if (itemRow.marksObtainedRequired) {
          marksObtainedRequired = Validators.required;
        }

        let checkedStatusDisabled = false;
        if (itemRow.checkedStatus == 2) {
          checkedStatusDisabled = true;
        }

        let row = this._formBuilder.group({
          isChecked: new UntypedFormControl({value: itemRow.isChecked, disabled: itemRow.isDisabled}), 
          isDisabled: [itemRow.isDisabled],
          checkedStatus: [itemRow.checkedStatus],
          subjectConfId: [itemRow.subjectConfId],
          subjectCode: [itemRow.subjectCode],
          subjectName: [itemRow.subjectName],
          answeringLanguageRequired: [itemRow.answeringLanguageRequired],
          answeringLanguage: [itemRow.answeringLanguage, answeringLanguageRequired],
          marksObtainedRequired : [itemRow.marksObtainedRequired],
          marksObtained: new UntypedFormControl({value: itemRow.marksObtained, disabled: itemRow.isDisabled}, marksObtainedRequired), 
          marksTheory: [itemRow.marksTheory],
          marksTheoryRequired: [itemRow.marksTheoryRequired],
          marksInternal: [itemRow.marksInternal],
          marksPractical: [itemRow.marksPractical],
          marksPracticalRequired: [itemRow.marksPracticalRequired],
          marksInternalRequired: [itemRow.marksInternalRequired],
          examTypesRequired: [itemRow.examTypesRequired],
          examTypes: [itemRow.examTypes],
          examTypesError: [false],
          examTypeValue:  new UntypedFormControl({value: itemRow.examTypeValue, disabled: itemRow.examTypesDisabled}),
          examTypesDisabled : [itemRow.examTypesDisabled],
          subjectShortName: [itemRow.subjectShortName],
        });

        const control = <UntypedFormArray>this.subjectInfoForm.controls.subjects;
        control.push(row);
      });
    }
  }

  setEducationInfoValues(formData:any) {

    this.educationHeaders = formData.educationInfo.educationHeaders;
    this.passFailStatusesArray = formData.educationInfo.passFailStatuses;
    this.repeatersInfoShow   = formData.educationInfo.repeatersInfoShow;

    if (!globalFunctions.isEmpty(formData.educationInfo)) {

      let repeatersInfoReq:any;
      if (this.repeatersInfoShow) {
        repeatersInfoReq  = Validators.required;
      }

      this.educationInfoForm = this._formBuilder.group({
        repeatersInfo: this._formBuilder.group({
          heading: [formData.educationInfo.repeatersInfo.heading],
          lastSeatNo: [formData.educationInfo.repeatersInfo.lastSeatNo, repeatersInfoReq],
          month: [formData.educationInfo.repeatersInfo.month, repeatersInfoReq],
          year: [formData.educationInfo.repeatersInfo.year, repeatersInfoReq]
        }),
        eduInfo : this._formBuilder.array([
          this.initEducationInfoRows()
        ])
      });

      const control = <UntypedFormArray>this.educationInfoForm.controls.eduInfo;
      control.controls.splice(0, 1);

      formData.educationInfo.eduInfo.forEach((itemRow) => {

        let seatNoRequired:any;
        if (itemRow.seatNoRequired) {
          seatNoRequired = Validators.required;
        }
        let monthAppearedRequired:any;
        if (itemRow.monthAppearedRequired) {
          monthAppearedRequired = Validators.required;
        }
        let yearAppearedRequired:any;
        if (itemRow.yearAppearedRequired) {
          yearAppearedRequired = Validators.required;
        }
        let marksObtainedRequired:any;
        if (itemRow.marksObtainedRequired) {
          marksObtainedRequired = Validators.required;
        }
        let statusRequired:any;
        if (itemRow.statusRequired) {
          statusRequired = Validators.required;
        }
        let internalFailedReq:any;
        if (itemRow.internalFailedRequired) {
          internalFailedReq = Validators.required;
        }
        let externalFailedReq:any;
        if (itemRow.externalFailedRequired) {
          externalFailedReq = Validators.required;
        }
        let sgpiCgpiReq:any;
        if (itemRow.sgpiCgpiRequired) {
          sgpiCgpiReq = Validators.required;
        }

        let row = this._formBuilder.group({
          reqConfId: [itemRow.reqConfId],
          courseName: [itemRow.courseName],
          termExam: [itemRow.termExam],
          termExamId: [itemRow.termExamId],
          seatNo: [itemRow.seatNo, seatNoRequired],
          monthAppeared: [itemRow.monthAppeared, monthAppearedRequired],
          yearAppeared: [itemRow.yearAppeared, yearAppearedRequired],
          marksObtained: [itemRow.marksObtained, marksObtainedRequired],
          marksTheory: [itemRow.marksTheory],
          marksInternal: [itemRow.marksInternal],
          status: [itemRow.status, statusRequired],
          internalFailed: [itemRow.internalFailed, internalFailedReq],
          externalFailed: [itemRow.externalFailed, externalFailedReq],
          sgpiCgpi: [itemRow.sgpiCgpi, sgpiCgpiReq],
        });

        const control = <UntypedFormArray>this.educationInfoForm.controls.eduInfo;
        control.push(row);
      });
    }
  }

  setDeclarationInfoValues(formData:any) {

    if (!globalFunctions.isEmpty(formData.uploadsInfo)) {

      if (!globalFunctions.isEmpty(formData.uploadsInfo.uploadedPassportSizePhoto)) {
        this.isUploadedPassportSizePhoto = true;
        this.uploadedPassportSizePhoto = formData.uploadsInfo.uploadedPassportSizePhoto;
        this.hasPassportSizePhoto = formData.uploadsInfo.uploadedPassportSizePhoto;
      }

      if (!globalFunctions.isEmpty(formData.uploadsInfo.uploadedSignatureImage)) {
        this.isUploadedSignatureImage = true;
        this.uploadedSignatureImage = formData.uploadsInfo.uploadedSignatureImage;
        this.hasSignatureImage = formData.uploadsInfo.uploadedSignatureImage;
      }
    }
  }

  categoryFormControls() {
    this.categoryForm = this._formBuilder.group({
      applyingCategories: [null, Validators.required],
      otherCategory: [null],      
      applyingSubCategories: [null],
      showSubCatInRadio: [false],
      studentType: [this.studentType],
      admissionTypeValue: [null],
      examPatternValue: [null],
      examSessionValue: [null],
    });
  }

  createPersonalInfoFormControls() {
    this.personalInfoForm = this._formBuilder.group({
      fullNameMarksheet : [null],      
      firstName : [null],
      middleName : [null],
      lastName : [null],
      motherName : [null],
      email: [null, Validators.compose([emailValidator])],
      gender : [null],
      mobileNo : new UntypedFormControl({value: '', disabled: true}), 
    });
  }

  addressInfoFormControls() {
    this.addressInfoForm = this._formBuilder.group({
      residentialAddress: this._formBuilder.group({
        address: [null, Validators.required],
        state : new UntypedFormControl({value: null, disabled: true}, Validators.required),
        city : new UntypedFormControl({value: null, disabled: true}, Validators.required),
        district: [null],
        nearByRailwayStation: [null],
        pincode: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6) ])],
      })
    });
  }

  subjectInfoFormControls() {
    this.subjectInfoForm = this._formBuilder.group({
      examMarksPatternSelected: [null], 
      subjects: this._formBuilder.array([
        this.initSubjectInfoRows()
      ])
    });
  }

  initSubjectInfoRows() : UntypedFormGroup {
    return this._formBuilder.group({
      isChecked : [null],
      isDisabled : [null],
      checkedStatus : [null],
      subjectConfId : [null],
      subjectCode : [null],
      subjectName : [null],
      answeringLanguageRequired : [false],
      answeringLanguage : [null],
      examTypesRequired : [false],
      examTypes : [null],
      examTypesError : [false],
      examTypeValue : [null],
      marksObtainedRequired : [false],
      marksObtained : [null, Validators.compose([Validators.min(45)])],
      marksTheory : [false],
      marksTheoryRequired : [false],
      marksInternal : [false],
      marksPracticalRequired : [false],
      marksPractical : [false],
      marksInternalRequired : [false],
      subjectShortName : [null],
    });
  }

  educationInfoFormControls() {
    this.educationInfoForm = this._formBuilder.group({
      repeatersInfo: this._formBuilder.group({
        heading: [null],
        lastSeatNo: [null],
        month: [null],
        year: [null]
      }),
      eduInfo: this._formBuilder.array([
        this.initEducationInfoRows()
      ])
    });
  }

  initEducationInfoRows() : UntypedFormGroup {
    return this._formBuilder.group({
      reqConfId : [null],
      courseName: [null],
      termExam: [null],
      termExamId : [null],
      seatNo : [null],
      monthAppeared : [null],
      yearAppeared : [null],
      marksObtained : [null, Validators.compose([Validators.min(35)])],
      status : [null],
      internalFailed : [null],
      externalFailed : [null],
      sgpiCgpi : [null],
    });
  }

  fetchCategories() {

    let postParam: any = {
      'atktForm': true,
    }

    this._commonService.getAdmissionCategories(postParam).subscribe(data => {

      if (data.status != undefined) {
        if (data.status == 1) {
          this.categoriesObj = data.dataJson;
          if (this.categoriesObj.groups != undefined) {
            this.categoryGrps = this.categoriesObj.groups;
            let loopIdx = 0;
            this.categoriesObj.groups.forEach((catGrp, index) => {
              catGrp.list.forEach((category, catIndex) => {
                category.isSelected = false;
              });
            });
          }
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

  fetchSubCategories() {

    let postParam: any = {
      'atktForm': true,
    }

    this._commonService.getAdmissionSubCategories(postParam).subscribe(data => {
          
      if (data.status != undefined) {
        if (data.status == 1) {
          this.subCategoryObj = data.dataJson;
          this.subCategoryList = data.dataJson.list;
          let loopIdx = 0;
          this.subCategoryBunch = [];
          this.subCategoryList.forEach((details, index) => {
            details.isSelected = false;
            if (index != 0 && index % 4 == 0) {
              loopIdx = loopIdx + 1;
            }
            if (typeof this.subCategoryBunch[loopIdx] === 'undefined') {
              this.subCategoryBunch[loopIdx] = [];
            }
            this.subCategoryBunch[loopIdx].push(details);
          });
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

  fetchMonths(data) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/months.json');
    req.onload = () => {
      data(JSON.parse(req.response));
    };
    req.send();
  }

  _openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
    setTimeout(() => this._input.nativeElement.focus());
  }

  _closeCalendar(e) {
    setTimeout(() => this._input.nativeElement.blur());
  }

  onSelectSubCategory(selectedSubCat: any, checked: boolean) {
    this._snackBarMsgComponent.closeSnackBar();
    this.subCategoryList.forEach((details) => {
      if (details.admissionSubCategoryId == selectedSubCat.admissionSubCategoryId) {
        details.isSelected = checked;
      }
    });
  }

  onSelectRadioSubCategory(selectedSubCat: any) {
    this.subCategoryList.forEach((details) => {
      details.isSelected = false;
      if (details.admissionSubCategoryId == selectedSubCat.admissionSubCategoryId) {
        details.isSelected = true;
      }
    });
  }

  onExamTypeChange(subjectInfoIndex, examTypeIndex: any, checked: boolean) {
    this.subjectInfoForm.controls.subjects.value.forEach((itemRow, index) => {
      if (index == subjectInfoIndex) {
        // this.subjectInfoForm.controls.subjects['examTypesError'].setValue(false, {emitEvent: false});
        itemRow.examTypes[examTypeIndex].isChecked = checked;
      }
    });
  }

  getFromPincode(event:any, mode):void {

    let pincode = event.target.value;
    if (pincode.length == 6) {

      this.allEventEmitters.showLoader.emit(true);
      this._commonService.getFromPincode(pincode).subscribe(data => {

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {
          if (data.status == 1) {
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
            }
          } else if (data.status == 0) {
            if (mode == 'residentialAddress') {
              let residentialAddress = <UntypedFormGroup> this.addressInfoForm.controls.residentialAddress;
              residentialAddress.controls.state.enable();
              residentialAddress.controls.city.enable();
            } else if (mode == 'nativeAddress') {
              let nativeAddress = <UntypedFormGroup> this.addressInfoForm.controls.nativeAddress;
              nativeAddress.controls.state.enable();
              nativeAddress.controls.city.enable();
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

  onCategorySubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    this.categoryError = false;
    this.subCategoryError = false;
    if (this.categoryForm.valid) {

      if (this.showSubCategories) {

        let selected = 0;
        this.subCategoryList.forEach((details) => {
          if (details.isSelected) {
            selected++;
          }
        });
      }

      if (!this.subCategoryError) {  
        this.goToNextStep(stepper, tab);
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
      }

    } else {

      if (globalFunctions.isEmpty(this.categoryForm.value.applyingCategories)) {
        this.categoryError = true;
      }

      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  public onPersonalInfoSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.personalInfoForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  public onAddressInfoFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.addressInfoForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  onSelectSubjectGroup(subjectGroup: any, subjectConfId: number, subjectGroupIndex, subjectIndex, checked: boolean, type:string) {
    
    if (type == "radio") {
      this.subjectGroupArray[subjectGroupIndex].subjectConfIds.forEach(subject => subject.isChecked = false);
    }

    this.subjectGroupArray[subjectGroupIndex].subjectConfIds[subjectIndex].isChecked = checked;
    this.subjectGroupArray[subjectGroupIndex].minErr = false;
    this.subjectGroupArray[subjectGroupIndex].maxErr = false;

    const checkedSubjects = this.subjectGroupArray[subjectGroupIndex].subjectConfIds
                                .filter(subject => subject.isChecked)
                                .map(subject => subject.subjectConfId);

    const groupSubjects = this.subjectGroupArray[subjectGroupIndex].subjectConfIds
                              .map(subject => subject.subjectConfId);

    if (checkedSubjects.length >= subjectGroup.subjectRequiredCount) {

      this.subjectInfoForm.controls.subjects.value.forEach((itemRow, index) => {

        const subject = this.subjectInfoForm.controls.subjects['controls'][index];

        if (groupSubjects.indexOf(itemRow.subjectConfId) === -1) {
          return;
        }

        subject.controls['isChecked'].enable();
        subject.controls['isChecked'].setValue(false, {emitEvent: false});

        subject.controls['answeringLanguageRequired'].setValue(this.serverData[itemRow.subjectConfId].answeringLanguageRequired, {emitEvent: false});
        subject.controls['answeringLanguage'].clearValidators();
        if (this.serverData[itemRow.subjectConfId].answeringLanguageRequired) {
          subject.controls['answeringLanguage'].setValidators([Validators.required]);
        }
        subject.controls['answeringLanguage'].updateValueAndValidity();
        
        subject.controls['marksObtained'].enable();
        subject.controls['marksObtainedRequired'].setValue(this.serverData[itemRow.subjectConfId].marksObtainedRequired, {emitEvent: false});
        subject.controls['marksObtained'].clearValidators();
        if (this.serverData[itemRow.subjectConfId].marksObtainedRequired) {
          subject.controls['marksObtained'].setValidators([Validators.required]);
        }
        subject.controls['marksObtained'].updateValueAndValidity();

        subject.controls['examTypesRequired'].setValue(this.serverData[itemRow.subjectConfId].examTypesRequired, {emitEvent: false});

        if (checkedSubjects.indexOf(itemRow.subjectConfId) >= 0) {
          return;
        }

        subject.controls['isChecked'].disable();

        subject.controls['answeringLanguageRequired'].setValue(false, {emitEvent: false});
        subject.controls['answeringLanguage'].clearValidators();
        subject.controls['answeringLanguage'].updateValueAndValidity();

        subject.controls['marksObtained'].disable();
        subject.controls['marksObtainedRequired'].setValue(false, {emitEvent: false});
        subject.controls['marksObtained'].clearValidators();
        subject.controls['marksObtained'].updateValueAndValidity();

        subject.controls['examTypesRequired'].setValue(false, {emitEvent: false});
      });
    
    } else {

      this.subjectInfoForm.controls.subjects.value.forEach((itemRow, index) => {

        const subject = this.subjectInfoForm.controls.subjects['controls'][index];

        if (groupSubjects.indexOf(itemRow.subjectConfId) === -1) {
          return;
        }

        subject.controls['isChecked'].enable();
        subject.controls['isChecked'].setValue(false, {emitEvent: false});

        subject.controls['answeringLanguageRequired'].setValue(this.serverData[itemRow.subjectConfId].answeringLanguageRequired, {emitEvent: false});
        subject.controls['answeringLanguage'].clearValidators();
        if (this.serverData[itemRow.subjectConfId].answeringLanguageRequired) {
          subject.controls['answeringLanguage'].setValidators([Validators.required]);
        }
        subject.controls['answeringLanguage'].updateValueAndValidity();
        
        subject.controls['marksObtained'].enable();
        subject.controls['marksObtainedRequired'].setValue(this.serverData[itemRow.subjectConfId].marksObtainedRequired, {emitEvent: false});
        subject.controls['marksObtained'].clearValidators();
        if (this.serverData[itemRow.subjectConfId].marksObtainedRequired) {
          subject.controls['marksObtained'].setValidators([Validators.required]);
        }
        subject.controls['marksObtained'].updateValueAndValidity();

        subject.controls['examTypesRequired'].setValue(this.serverData[itemRow.subjectConfId].examTypesRequired, {emitEvent: false});
      });
    }
  }

  onSelectSubject(itemrow: any, subjectConfId: number, index, checked: boolean) {

    this.subjectInfoForm.controls.subjects['controls'][index].controls['marksObtained'].setValidators([Validators.min(45)]);
    if (checked) {
      this.subjectInfoForm.controls.subjects['controls'][index].controls['marksObtained'].setValidators([Validators.min(0)]);
    }
    this.subjectInfoForm.controls.subjects['controls'][index].controls['marksObtained'].updateValueAndValidity();

    // this.validateMaxSubjectSelection();
  }

  public onSubjectInfoFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.validateSubjectInfoForm()) {
      this.goToNextStep(stepper, tab);
    }
  }

  public onEducationInfoFormSubmit(values:any, stepper: MatStepper, tab:any):void {

    this._snackBarMsgComponent.closeSnackBar();

    if (this.educationInfoForm.valid) {
      this.goToNextStep(stepper, tab);
    } else {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  public onUploadsInfoFormSubmit(stepper: MatStepper):void {

    this._snackBarMsgComponent.closeSnackBar();

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

      let tabErr = false;
      this.formSetup.forEach((tab) => {

        if (!tabErr) {

          if ((tab.display) && (tab.stepName == 'category') && (!this.categoryForm.valid)) {
            if (globalFunctions.isEmpty(this.categoryForm.value.applyingCategories)) {
              this.categoryError = true;
            }
            if (this.showSubCategories) {
              let selected = 0;
              this.subCategoryList.forEach((details) => {
                if (details.isSelected) {
                  selected++;
                }
              });
            }
            this._snackBarMsgComponent.openSnackBar(allMsgs.CATEGORY_NOT_SELECTED, 'x', 'error-snackbar', 5000);
          } else if ((tab.display) && (tab.stepName == 'personalInfo') && (!this.personalInfoForm.valid)) {
            tabErr = true;
          } else if ((tab.display) && (tab.stepName == 'addressInfo') && (!this.addressInfoForm.valid)) {
            tabErr = true;
          } else if ((tab.display) && (tab.stepName == 'subjectSelection') && ( (!this.subjectInfoForm.valid) || (!this.validateSubjectInfoForm()) ) ) {
            tabErr = true;
          } else if ((tab.display) && (tab.stepName == 'educationInfo') && (!this.educationInfoForm.valid) ) {
            tabErr = true;
          }

          if (tabErr) {
            this.stepper.selectedIndex = tab.stepperIndex;
            if (tab.stepName != 'subjectSelection') {
              this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
            }
          }
        }
      });

      if (!tabErr) {
        this.saveForm();
      }

    } else {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
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
        }

      } else if (!globalFunctions.isValidFileSize(file, this.maxSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');

        if (mode == 'passportSizePhoto') {
          this.isBrowsedPassportSizePhoto = false;
        } else if (mode == 'signatureImage') {
          this.isBrowsedSignatureImage = false;
        }            

      } else {

        this.openImageCropperDialog(event, mode);
      }
    }
  }

  openImageCropperDialog(imageEvent, mode = '') {

    let dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      height: '550px',
      minHeight: '400px',
      width: '500px',
    });

    let modalTitle = '';
    if (mode == 'passportSizePhoto') {
      modalTitle = 'Crop applicant passport size photo to fit on the form';
    } else if (mode == 'signatureImage') {
      modalTitle = 'Crop applicant signature image to fit on the form';
    }

    dialogRef.componentInstance.mode       = mode;
    dialogRef.componentInstance.modalTitle = modalTitle;
    dialogRef.componentInstance.imageEvent = imageEvent;

    const sub = dialogRef.componentInstance.onOk.subscribe((data:any) => {

      if (mode == 'passportSizePhoto') {

        this.passportSizePhotoError = false;
        this.passportSizePhotoToUpload = data.base64;
        this.hasPassportSizePhoto = data.base64;
        this.isBrowsedPassportSizePhoto = true;

      } else if (mode == 'signatureImage') {

        this.signatureImageError = false;
        this.signatureImageToUpload = data.base64;
        this.hasSignatureImage = data.base64;
        this.isBrowsedSignatureImage = true;
      }
    });

    dialogRef.afterClosed().subscribe(result => {

    });
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
    }
  }

  onSelectCategory(selectedCatId: any) {

    const otherCategory = this.categoryForm.get('otherCategory');

    let showCatDocumentUpload = false;
    this.categoryGrps.forEach((catGrp) => {

      catGrp.list.forEach((details) => {

        details.isSelected = false;
        if (details.admissionCategoryId == selectedCatId) {
          details.isSelected = true;
          if (details.otherCategory) {
            otherCategory.setValidators([Validators.required]);
          } else {
            otherCategory.clearValidators();
          }
        }
      });
    });

    otherCategory.updateValueAndValidity();

    this.categoryError = false;
    this.categoryForm.controls['applyingCategories'].setValue(selectedCatId, {emitEvent: false});
  }  

  // onSelectCategory(admissionCategoryId: any) {

  //   const otherCategory = this.categoryForm.get('otherCategory');

  //   this.categoryGrps.forEach((cateGrp) => {
  //     cateGrp.list.forEach((cat) => {
  //       cat.isSelected = false;
  //       if (cat.admissionCategoryId == admissionCategoryId) {
  //         cat.isSelected = true;
  //         if (cat.otherCategory) {
  //           otherCategory.setValidators([Validators.required]);            
  //         } else {
  //           otherCategory.clearValidators();
  //         }
  //       }
  //     });
  //   });
  
  //   otherCategory.updateValueAndValidity();

  //   this.categoryError = false;
  //   this.categoryForm.controls['applyingCategories'].setValue(admissionCategoryId, {emitEvent: false});
  // }

  validateSubjectInfoForm() {

    let subjectGroupErr = false;
    if (this.showSubjectGroup) {

      this.subjectGroupArray.forEach((subjectGroup, index) => {

        const checkedSubjects = subjectGroup.subjectConfIds.filter(subject => subject.isChecked).map(subject => subject.subjectConfId);

        subjectGroup.maxErr = false;
        if (checkedSubjects.length > subjectGroup.subjectRequiredCount) {
          subjectGroup.maxErr = true;
          subjectGroupErr = true;
          subjectGroup.maxErrMsg = 'Select only ' + subjectGroup.subjectRequiredCount + ' subjects';
        }

        subjectGroup.minErr = false;
        if (checkedSubjects.length < subjectGroup.subjectRequiredCount) {
          subjectGroup.minErr = true;
          subjectGroupErr = true;
          subjectGroup.minErrMsg = 'Select any ' + subjectGroup.subjectRequiredCount + ' subjects';
        }
      });
    }

    let finalErr = false;
    if (this.subjectInfoForm.valid && !subjectGroupErr) {

      let subjectInfoFormValues = this.subjectInfoForm.getRawValue();

      subjectInfoFormValues.subjects.forEach((itemRow, index) => {

        if ( itemRow.isChecked && itemRow.marksTheoryRequired && (globalFunctions.isEmpty(itemRow.marksTheory) ) ) {

          this.subjectInfoForm.controls.subjects['controls'][index].controls['marksTheory'].setValidators([Validators.required]);
          this.subjectInfoForm.controls.subjects['controls'][index].controls['marksTheory'].updateValueAndValidity();

          this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_MARKS_THEORY, 'x', 'error-snackbar', 5000);
          finalErr = true;

        } else if ( itemRow.isChecked && itemRow.marksInternalRequired && (globalFunctions.isEmpty(itemRow.marksInternal) ) ) {

          this.subjectInfoForm.controls.subjects['controls'][index].controls['marksInternal'].setValidators([Validators.required]);
          this.subjectInfoForm.controls.subjects['controls'][index].controls['marksInternal'].updateValueAndValidity();

          this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_MARKS_INTERNAL, 'x', 'error-snackbar', 5000);
          finalErr = true;

        } else if ( itemRow.isChecked && itemRow.marksPracticalRequired && (globalFunctions.isEmpty(itemRow.marksPractical) ) ) {

          this.subjectInfoForm.controls.subjects['controls'][index].controls['marksPractical'].setValidators([Validators.required]);
          this.subjectInfoForm.controls.subjects['controls'][index].controls['marksPractical'].updateValueAndValidity();

          this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_MARKS_INTERNAL, 'x', 'error-snackbar', 5000);
          finalErr = true;

        }else if ( itemRow.isChecked && itemRow.examTypesRequired && (globalFunctions.isEmpty(itemRow.examTypeValue) ) ) {

          this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_EXAM_TYPES, 'x', 'error-snackbar', 5000);
          finalErr = true;

        } else if (!itemRow.isChecked && (itemRow.marksObtainedRequired && itemRow.marksObtained < 45) ) {

          this.subjectInfoForm.controls.subjects['controls'][index].controls['marksObtained'].setValidators([Validators.min(45)]);
          this.subjectInfoForm.controls.subjects['controls'][index].controls['marksObtained'].updateValueAndValidity();
          this._snackBarMsgComponent.openSnackBar(allMsgs.WRONG_MARKS_ENTERED45, 'x', 'error-snackbar', 5000);
          finalErr = true;

        } else if (itemRow.answeringLanguageRequired && globalFunctions.isEmpty(itemRow.answeringLanguage)) {
      
          this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ANSWERING_LANGUAGE, 'x', 'error-snackbar', 5000);
          finalErr = true;

        } else if (itemRow.marksObtainedRequired && !itemRow.isChecked && globalFunctions.isEmpty(itemRow.marksObtained)) {

          this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_MARKS_ENTERED2, 'x', 'error-snackbar', 5000);
          finalErr = true;
        }
      });
    }

    if (finalErr) {
      return false;
    } else {
      if (this.validateMaxSubjectSelection()) {
        return false;
      } else {
        return true;
      }
    }
  }

  validateMaxSubjectSelection() {

    let err = false;
    if (this.maxSubjectSelection > 0) {

      let checkedSubjects = 0;
      this.subjectInfoForm.controls.subjects.value.forEach((itemRow, index) => {

        if (itemRow.isChecked || itemRow.isDisabled) {
          checkedSubjects++;
        }
      });

      if (checkedSubjects > this.maxSubjectSelection) {
        err = true;        
        this._snackBarMsgComponent.openSnackBar('You can select maximum ' + this.maxSubjectSelection + ' subjects only', 'x', 'error-snackbar', 5000);
      }
    }

    return err;
  }

  goToNextStep(stepper, tab) {
    stepper.next();
    // if (this.formLock) {
    //   this.openEditAlert(stepper);
    // } else {
    //   this.saveForm('', tab);
    //   stepper.next();
    // }
  }

  saveForm() {

    this.categoryFormValues = this.categoryForm.getRawValue();

    this.subCategoryValues = [];
    this.subCategoryList.forEach((details) => {
      if (details.isSelected) {
        this.subCategoryValues.push(details.admissionSubCategoryId);
      }
    });

    this.categoryForm.controls.applyingSubCategories.setValue(this.subCategoryValues, {emitEvent: false});

    this.personalInfoFormValues  = this.personalInfoForm.getRawValue();
    this.addressInfoFormValues   = this.addressInfoForm.getRawValue();
    this.subjectInfoFormValues   = this.subjectInfoForm.getRawValue();
    this.educationInfoFormValues = this.educationInfoForm.getRawValue();

    this.subjectInfoFormValues.subjectGroups = this.subjectGroupArray;

    let postValues:any = {};
    postValues.atktApplicantId = this.formData.atktApplicantId;
    postValues.termYear = this.formData.termYear;
    postValues.studentType = this.categoryForm.value.studentType;
  
    if (this.panelMode == 'admission') {
      this.saveAdmissionForm(postValues);
    } else {
      this.saveInstitutesForm(postValues);
    }
  }

  saveInstitutesForm(postValues) {

    this.allEventEmitters.showLoader.emit(true);
    this._institutesService.saveAtktFormDetails(postValues, this.categoryFormValues, this.personalInfoFormValues, this.addressInfoFormValues, this.subjectInfoFormValues.subjects, this.subjectInfoFormValues.examMarksPatternSelected, this.educationInfoFormValues, this.passportSizePhotoToUpload, this.signatureImageToUpload, this.formDetails.atktFormId).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {

        if (data.status == 1) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);
          this.sharedDialogRef.close();

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

  saveAdmissionForm(postValues) {

    globalFunctions.setUserProf('atktApplicantId', this.formData.atktApplicantId);

    this.allEventEmitters.showLoader.emit(true);
    this._atktService.saveFormDetails(postValues, this.categoryFormValues, this.personalInfoFormValues, this.addressInfoFormValues, this.subjectInfoFormValues.subjects, this.subjectInfoFormValues.examMarksPatternSelected, this.educationInfoFormValues, this.passportSizePhotoToUpload, this.signatureImageToUpload).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          globalFunctions.setUserProf('atktFormId', data.dataJson.atktFormId);
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);
          this.afterSubmit(data.dataJson);
        } else if (data.status == 101) {
          this.router.navigate(['/downloadForms']);
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

  afterSubmit(data) {

    if (this.documentsUpload) {
      this.router.navigate(['/uploadDocuments']);
    } else if (!this.courseSelection && !this.documentsUpload && !this.optPayment) {
      this.directFormGenerate();      
    } else {
      this.router.navigate(['/cart']);
    }
  }

  directFormGenerate() {

    this.allEventEmitters.showLoader.emit(true);
    this._atktService.directFormGenerate({}, this.panelMode).subscribe(data => {

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

            if (this.formType == 'exam') {
              this.router.navigate(['/examForm']);
            } else {
              this.router.navigate(['/atktForm']);
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