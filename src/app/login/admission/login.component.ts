import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { InfoDialogComponent } from 'app-shared-components/info-dialog/info-dialog.component';
import { SubjectsInfoDialogComponent } from 'app-shared-components/subjects-info-dialog/subjects-info-dialog.component';

import { AuthService } from 'app/auth/auth.service';
import { CommonService } from 'app-shared-services/common.service';
import { AdmissionService } from 'app-shared-services/admission.service';
import { AtktService } from 'app-shared-services/atkt.service';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { environment } from 'environments/environment';
import * as allMsgs from 'app/global/allMsgs';
import * as globalFunctions from 'app/global/globalFunctions';
import * as regexValidators from 'app/global/validator';
import { emailValidator } from 'app/global/app-validators';

import { AppSettings } from 'app/app.settings';
import { Settings } from 'app/app.settings.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [SnackBarMsgComponent, CommonService, AdmissionService, AtktService]
})
export class LoginComponent implements OnInit {

  public settings: Settings;

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;
  DOMAIN_NAME: string = environment.DOMAIN_NAME;

  loginForm: UntypedFormGroup;
  otpFormGroup: UntypedFormGroup;
  identifierFormGroup: UntypedFormGroup;

  hide: boolean = true;
  signIn: boolean = true;

  showLoginForm: boolean = false;
  showOtpForm:boolean = false;
  showIdentifiersForm:boolean = false;
  showGroupSelectionForm:boolean = false;
  showLanguageGroups:boolean = false;
  lngError:boolean = false;
  grpError:boolean = false;
  languageGroups = [];
  subjectGroups = [];
  allSubjectGroups = [];
  selectedLangGroupId:number;
  selectedSubjectGroupId:number;
  showSubjectGroups:boolean = false;
  showNameSearch:boolean = false;
  showInHouseOptions:boolean = false;
  showPrnNo:boolean = false;
  showAcademicInfo:boolean = false;
  showStudentSelection:boolean = false;
  showPreRegForm:boolean = false;
  showPaymentPage:boolean = false;

  userId: string;
  authCode: string;

  mobileNo: string = '';
  email: string = '';
  otpMode: 'phone' | 'email';
  otpNo: string = '';
  previousUrl:string;

  instituteId: string = '';
  inHouse:boolean = false;
  formPolicyId: string = '';
  formType: string = '';
  isMobileLogin: string = '';
  headerImage: string = '';
  showBrandLogo:boolean = false;
  
  identifierLabel: string = 'Enter Identifier';
  otpConfirmationValues = [];
  
  studentsArray = [];
  coursesArray = [];
  courseLabel:string;
  examTermsLabel:string;
  subjectGroupsLabel:string;
  examsArray = [];
  subjectGroupsArray = [];
  showSubjectGroup: boolean = false;

  academicInfoForm: UntypedFormGroup;
  preRegForm: UntypedFormGroup;
  preRegFormValues = [];
  listOfKnowAbout = [];
  newPasswordHide: boolean = true;
  confirmPasswordHide: boolean = true;
  subjectGroupsLable:string;
  subjectGroupsLableHeading:string;
  showNriLogin: boolean = false;
  showNriLogintxt:string;
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private _commonService: CommonService,    
    private _admissionService: AdmissionService,
    private _atktService: AtktService,
    private activatedRoute: ActivatedRoute,     
    private router: Router,
    public dialog: MatDialog,     
    public _snackBarMsgComponent: SnackBarMsgComponent,
    public appSettings:AppSettings,    
    private allEventEmitters: AllEventEmitters
  ) { 

    this.settings = this.appSettings.settings;

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME + 
      ' | Login'
    );
    this.isMobileLogin = '';
    this.activatedRoute.queryParams.subscribe(params => {
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
         
          if (key.toLowerCase().includes('institute')) {
            this.instituteId = params[key];
          } else if (key.toLowerCase().includes('house')) {
            this.inHouse = params[key];
          } else if (key.toLowerCase().includes('formpolicyid')) {
            this.formPolicyId = params[key];
            globalFunctions.setUserProf('formPolicyId', this.formPolicyId);
          } else if (key.toLowerCase().includes('formtype')) {
            this.formType = params[key];
          }
          if (key == 'isMobileLogin') {
            this.isMobileLogin = params[key];
          }

        }
      }
    });

    if (this.formType == 'preReg') {
      this.showPreRegForm = true;
    } else {
      this.showLoginForm = true;
    }
    let afterLoginPage = this.authService.getAfterLoginPage();
    if (this.authService.isUserLoggedIn()) {
      this.authService.clearLocalStorage();
    }
    
    globalFunctions.setUserProf('previousUrl', window.location.href);

    this.getDeviceConfig();
  }

  ngOnInit() {
    this.createAcademicInfoFormControls();    
    this.createFormGroup();
    this.createPreRegFormControls();
  } 

  ngAfterViewInit() {

    setTimeout(() => { this.settings.loadingSpinner = false; }, 1);

    // this.activatedRoute.queryParams.subscribe(params => {
    //   let authCode = params['authCode'];
    //   if (!globalFunctions.isEmpty(authCode)) {
    //     this.settings.loadingSpinner = true;
    //   } else {
    //     this.settings.loadingSpinner = false;
    //   }
    // });
  }

  getDeviceConfig() {
    
    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this.authService.callConfig().subscribe(data => {
 
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1) {
          if (data.dataJson.deviceId != undefined) {
            this.authService.setDeviceInfo(data);
            setTimeout(() => { this.getFormPolicyInfo(); }, 2);
            setTimeout(() => { this.getListOfKnowAbout(); }, 2);
          }
        } else if (data.status == 2) {
          this.authService.sessionExpired();
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }  

  getFormPolicyInfo() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._admissionService.getFormPolicyInfo(this.instituteId, this.formPolicyId).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1) {

          if (!globalFunctions.isEmpty(data.dataJson.headerImage)) {
            this.showBrandLogo = false;
            this.headerImage = data.dataJson.headerImage;
            this.showNriLogin = data.dataJson.showNriLogin;
          } else {
            this.showNriLogin = false;
            this.showBrandLogo = true;
          }
          this.showNriLogintxt = data.dataJson.showNriLogintxt;

           if (this.showNriLogin) {
            this.loginForm.addControl('isNri', this._formBuilder.control('no', Validators.required));
            this.loginForm.get('isNri').valueChanges.subscribe(value => {
              this.updateFormBasedOnNriStatus(value);
            });
            this.updateFormBasedOnNriStatus(this.loginForm.get('isNri').value);
          }

          if (!globalFunctions.isEmpty(data.dataJson.themeColor) ) {

            globalFunctions.setUserProf('themeColor', data.dataJson.themeColor);

            this.authService.setThemeColor();
          }

        } else {
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

  updateFormBasedOnNriStatus(isNri: string) {
  if (isNri === 'yes') {
    this.loginForm.addControl('email', this._formBuilder.control('', [Validators.required, Validators.email]));
    if (this.loginForm.contains('phone')) {
      this.loginForm.removeControl('phone');
    }
  } else {
    this.loginForm.addControl('phone', this._formBuilder.control('', [Validators.required, Validators.pattern(regexValidators.validate.phone)]));
    if (this.loginForm.contains('email')) {
      this.loginForm.removeControl('email');
    }
  }
}

  getListOfKnowAbout() {

    this._admissionService.getListOfKnowAbout(this.instituteId, this.formPolicyId).subscribe(data => {

      if (data.status != undefined) {
        if (data.status == 1) {
          this.listOfKnowAbout = data.dataJson;
        } else {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  createAcademicInfoFormControls() {
    this.academicInfoForm = this._formBuilder.group({
      studentId : [null, Validators.required],      
      confId : [null, Validators.required],      
      termExamId : [null, Validators.required],
      subjectGroupId : [null],
    });
  }

  createPreRegFormControls() {
    this.preRegForm = this._formBuilder.group({
      firstName: [null, Validators.required], 
      middleName: [null], 
      lastName: [null], 
      mobileNo: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone) ])],
      email: [null, Validators.compose([Validators.required, emailValidator])], 
      pincode: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6) ])], 
      city: new UntypedFormControl({value: null, disabled: true}, Validators.required), 
      state: new UntypedFormControl({value: null, disabled: true}, Validators.required), 
      knowAbout: [null, Validators.required], 
    });
  }

  createFormGroup() {
    this.loginForm = this._formBuilder.group({
      isNri: ['no'] ,
      phone: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)]],
      email: ['']
    });
    this.loginForm.get('isNri')?.valueChanges.subscribe(value => {
      if (value === 'yes') {
        this.loginForm.get('email').setValidators([Validators.required, Validators.email]);
        this.loginForm.get('phone').clearValidators();
      } else {
        this.loginForm.get('phone').setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)]);
        this.loginForm.get('email').clearValidators();
      }
      this.loginForm.get('email').updateValueAndValidity();
      this.loginForm.get('phone').updateValueAndValidity();
    });
  
    this.otpFormGroup = this._formBuilder.group({
      'otp': [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(regexValidators.validate.otp) ])]
    });

    this.identifierFormGroup = this._formBuilder.group({
      'identifier': [null, Validators.required],
      'inHouseSelection': [null],
      'prnNo': [null],
      'nameSearch': [null]
    });

    this.identifierFormGroupValueChanged();
  }

  identifierFormGroupValueChanged() {

    const identifier = this.identifierFormGroup.get('identifier');
    const nameSearch = this.identifierFormGroup.get('nameSearch');
    this.identifierFormGroup.get('inHouseSelection').valueChanges.subscribe((mode: string) => {
      if (mode === 'yes') {
        identifier.setValidators([Validators.required]);
        nameSearch.setValidators([Validators.required]);
      } else {
        identifier.clearValidators();
        nameSearch.clearValidators();
      }
      identifier.updateValueAndValidity();
      nameSearch.updateValueAndValidity();
    });
  }

  showLoginFormBox(): void {
    this._snackBarMsgComponent.closeSnackBar();    
    this.showIdentifiersForm = false;
    this.showGroupSelectionForm = false;
    this.showOtpForm = false;
    this.showPreRegForm = false;
    this.showLoginForm = true;
  }

  showPreRegFormBox(): void {
    this._snackBarMsgComponent.closeSnackBar();    
    this.showIdentifiersForm = false;
    this.showGroupSelectionForm = false;
    this.showOtpForm = false;
    this.showLoginForm = false;
    this.showPreRegForm = true;
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      this.signIn = true;
      if (this.loginForm.value.isNri === 'yes') {
        this.loginForm.value.phone = "";
        this.email = this.loginForm.value.email;
        this.otpMode = 'email';
        this.sendOtp(this.email, false, 'email');
      } else {
        this.loginForm.value.email = "";
        this.mobileNo = this.loginForm.value.phone;
        this.otpMode = 'phone';
        this.sendOtp(this.mobileNo, false, 'phone');
      }
    }
  }


  resendOtp() {
    if (this.otpMode === 'phone') {
      this.sendOtp(this.mobileNo, true, 'phone');
    } else if (this.otpMode === 'email') {
      this.sendOtp(this.email, true, 'email');
    }
  }


  sendOtp(mobileNo:string, resend:boolean = false, mode: 'phone' | 'email') {

    let postValues:any = {
      instituteId: this.instituteId, 
      formPolicyId: this.formPolicyId,
      formType: this.formType, 
      signIn: this.signIn, 
      isMobileLogin: this.isMobileLogin, 
      resend: resend, 
    };

    if (mode === 'phone') {
      postValues.mobileNo = mobileNo;
      postValues.email = null;
    } else if (mode === 'email') {
      postValues.email = mobileNo;
      postValues.mobileNo = null;
    }

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.sendOtp(postValues, this.preRegFormValues).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {

        if (data.status == 1) {

          if (data.dataJson.otp) {
            this.otpFormGroup.setValue({otp: data.dataJson.otp});
          } else {
            this.otpFormGroup.setValue({otp: ''});
          }

          this.showLoginForm = false;
          this.showPreRegForm = false;
          this.showOtpForm = true;
          
          this._snackBarMsgComponent.openSnackBar(allMsgs.OTP_SENT+ ' ' + mobileNo, 'x', 'info-snackbar');
        
        }else if(data.status == 4){
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        } else {

          if (data.dataJson.infoModal.display && !globalFunctions.isEmpty(data.dataJson.infoModal.value)) {
            this.openInfoDialog(data.dataJson.infoModal);
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

  onOtpSubmit(values:form_elements):void {

    if (this.otpFormGroup.valid) {

      let postValues:any = {
        instituteId: this.instituteId, 
        formPolicyId: this.formPolicyId,
        mobileNo: this.mobileNo, 
        email: this.email, 
        formType: this.formType, 
        preRegFormValues: this.preRegFormValues, 
        otp: values.otp, 
        isMobileLogin: this.isMobileLogin, 
      };

      this.allEventEmitters.showLoader.emit(true);
      this._admissionService.otpConfirmation(postValues).subscribe(data => {

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {
          if (data.status == 1) {
            this._snackBarMsgComponent.closeSnackBar();
            data.dataJson['instituteId']  = this.instituteId;
            data.dataJson['inHouse']      = this.inHouse;
            data.dataJson['formPolicyId'] = this.formPolicyId;
            data.dataJson['formType']     = this.formType;
            this.otpConfirmationValues    = data.dataJson;
            if (data.dataJson.showIdentifier) {
              this.showNameSearch = data.dataJson.showNameSearch;
              this.showInHouseOptions = data.dataJson.showInHouseOptions;

              if (!this.showInHouseOptions) {
                this.identifierFormGroup.controls['inHouseSelection'].setValue('yes', {emitEvent: false});
              }

              this.showPrnNo = data.dataJson.showPrnNo;
              this.showIdentifiersForm = true;
              this.showOtpForm = false;
              this.identifierLabel = data.dataJson.identifierLable;
              this.userId = data.dataJson.userId;
            } else if (!data.dataJson.isPaymentDone && data.dataJson.prePayment) {
              this.setLocalStorage(this.otpConfirmationValues);
            } else if (this.formType == 'atkt' || this.formType == 'exam') {
              // this.getUserStudentsList();
              this.getStudentsCourses(0);
              this.academicInfoForm.controls['studentId'].setValue(0, {emitEvent: false});
            } else {
              this.setLocalStorage(this.otpConfirmationValues);
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

  onIdentifierSubmit():void {
 
    if (this.identifierFormGroup.valid) {

      let postValues:any = {
        userId: this.userId, 
        instituteId: this.instituteId, 
        mobileNo: this.mobileNo, 
        inHouseSelection: this.identifierFormGroup.get("inHouseSelection").value, 
        prnNo: this.identifierFormGroup.get("prnNo").value, 
        nameSearch: this.identifierFormGroup.get("nameSearch").value, 
        identifier: this.identifierFormGroup.get("identifier").value, 
        applicantId: this.otpConfirmationValues['applicantId'], 
        formPolicyId: this.formPolicyId,
        formType: this.formType, 
      };

      this.allEventEmitters.showLoader.emit(true);
      this._admissionService.identifierConfirmation(postValues).subscribe(data => {
 
        this.allEventEmitters.showLoader.emit(false);
 
        if (data.status != undefined) {

          if (data.status == 1) {

            this.otpConfirmationValues['admissionConfId'] = data.dataJson.admissionConfId;
            this.otpConfirmationValues['applicantId'] = data.dataJson.applicantId;
            this.otpConfirmationValues['courseSelection'] = data.dataJson.courseSelection;
            this.otpConfirmationValues['studentConfId'] = data.dataJson.studentConfId;
            this.otpConfirmationValues['studentId'] = data.dataJson.studentId;
            this._snackBarMsgComponent.closeSnackBar();

            if (data.dataJson.showCourseSelection) {
          
              this.showIdentifiersForm = false;
              this.getStudentsCourses(0);
              this.academicInfoForm.controls['studentId'].setValue(data?.dataJson?.studentId, {emitEvent: false});

            } else if (data.dataJson.groupSelection) {
              
              this.showIdentifiersForm = false;
              this.showGroupSelectionForm = true;

              this.showSubjectGroups = false;
              if ( !globalFunctions.isEmpty(data.dataJson.subjectGroups) ) {

                this.allSubjectGroups = data.dataJson.subjectGroups;
                this.subjectGroups = data.dataJson.subjectGroups;

                this.showSubjectGroups = true;  
                this.subjectGroupsLable = data.dataJson.subjectGroupsLable; 
                this.subjectGroupsLableHeading = data.dataJson.subjectGroupsLableHeading;             
              }

              this.showLanguageGroups = false;
              if ( !globalFunctions.isEmpty(data.dataJson.languageGroups) ) {

                this.languageGroups = data.dataJson.languageGroups;

                this.showSubjectGroups = false;                
                this.showLanguageGroups = true;
              }
            } else {
              this.setLocalStorage(this.otpConfirmationValues);
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

  onSelectLanguage(langGroupId: number) {

    this._snackBarMsgComponent.closeSnackBar();

    this.selectedLangGroupId = langGroupId;
    this.selectedSubjectGroupId = null;

    this.lngError = false;
    this.grpError = false;

    this.showSubjectGroups = false;
    this.subjectGroups = [];
    this.allSubjectGroups.forEach((subGrp, index) => {
      subGrp.isSelected = false;
      if (subGrp.langGroupId == langGroupId) {
        this.showSubjectGroups = true;
        this.subjectGroups.push(subGrp);
      }
    });
  }

  selectRadioGrp(subjectGroupId:number, sgIndex:number) {

    this._snackBarMsgComponent.closeSnackBar();
    
    this.selectedSubjectGroupId = subjectGroupId;
    this.grpError = false;

    this.subjectGroups.forEach((subGrp, index) => {
      subGrp.isSelected = false;
      if (sgIndex == index) {
        subGrp.isSelected = true;
      }
    });    
  }

  showSubjectInfo(subGrp:any = {}) {

    let dialogRef = this.dialog.open(SubjectsInfoDialogComponent, {
      width: '600px',
      height: 'auto',
      autoFocus: false
    });

    dialogRef.componentInstance.modalTitle = subGrp.subjectGroupName;
    dialogRef.componentInstance.subGrp     = subGrp;
    dialogRef.componentInstance.dialogRef  = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'loadPage') {
      }
    });
  }

  onSubmitGroupSelection() {

    let err = false;
    this.lngError = false;
    this.grpError = false;
    if (this.showLanguageGroups) {

      if ( globalFunctions.isEmpty(this.selectedLangGroupId) ) {
        this.lngError = true;
        err = true;
      }
    }

    if (this.showSubjectGroups) {

      if ( globalFunctions.isEmpty(this.selectedSubjectGroupId) ) {
        this.grpError = true;
        err = true;
      }
    }

    if (err) {

      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);      
    } else {

      this.updateSubjectGroup();
    }
  }

  updateSubjectGroup():void {

    let postValues:any = {
      userId: this.userId, 
      instituteId: this.instituteId, 
      mobileNo: this.mobileNo, 
      inHouseSelection: this.identifierFormGroup.get("inHouseSelection").value, 
      prnNo: this.identifierFormGroup.get("prnNo").value, 
      nameSearch: this.identifierFormGroup.get("nameSearch").value, 
      identifier: this.identifierFormGroup.get("identifier").value, 
      applicantId: this.otpConfirmationValues['applicantId'], 
      formPolicyId: this.formPolicyId,
      langGroupId: this.selectedLangGroupId,
      subjectGroupId: this.selectedSubjectGroupId,
      admissionConfId: this.otpConfirmationValues['admissionConfId']      
    };

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.updateSubjectGroup(postValues).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.setLocalStorage(this.otpConfirmationValues);
        }else if (data.status == 2) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        } else {
          this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  getUserStudentsList():void {

    let postParam = {
      userId: this.userId,
      instituteId: this.instituteId,
      mobileNo: this.mobileNo,
      formPolicyId: this.formPolicyId,
    }

    this.allEventEmitters.showLoader.emit(true);
    this._atktService.getUserStudentsList(postParam).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      this.showOtpForm = false;
      this.showAcademicInfo = true;

      if (data.status != undefined) {
        if (data.status == 1 && data.dataJson) {
          if (data.dataJson.length == 1) {
            this.getStudentsCourses(data.dataJson[0].studentId);
            this.academicInfoForm.controls['studentId'].setValue(data.dataJson[0].studentId, {emitEvent: false});
          } else {
            this.showStudentSelection = true;
            this.studentsArray = data.dataJson;
          }
        } else {
          this.getStudentsCourses(0);
          this.academicInfoForm.controls['studentId'].setValue(0, {emitEvent: false});
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  getStudentsCourses(studentId):void {

    let postParam = {
      studentId: studentId,
      instituteId: this.instituteId,
      formType: this.formType,
    }

    this.allEventEmitters.showLoader.emit(true);
    this._atktService.getStudentsCourses(postParam).subscribe(data => {
     
      this.allEventEmitters.showLoader.emit(false);

      this.showOtpForm = false;
      this.showAcademicInfo = true;

      if (data.status != undefined) {
        if (data.status == 1) {
          this.courseLabel = data.dataJson.courseLabel;
          this.examTermsLabel = data.dataJson.examTermsLabel;
          this.subjectGroupsLabel = data.dataJson.subjectGroupsLabel;
          this.coursesArray = data.dataJson.courses;
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

  getCourseExams(confId):void {

    this.showSubjectGroup = false;   
    this.allEventEmitters.showLoader.emit(true);
    this._atktService.getCourseExams(confId, this.instituteId).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.examsArray = data.dataJson.examTerms;
          this.subjectGroupsArray = data.dataJson.subjectGroups;
          if (!globalFunctions.isEmpty(data.dataJson.subjectGroups)) {
            this.subjectGroupsArray = data.dataJson.subjectGroups;
            this.showSubjectGroup = true;
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

  setLocalStorage(data:any):void {

    data['userTypeId'] = 5;
    data['afterLoginPage'] = 'admissionForm';
    data['admissionId'] = data.userId;
    globalFunctions.setUserProfInfo(data);
    if (!data.isPaymentDone && data.prePayment) {
      this.showOtpForm = false;
      this.showPaymentPage = true;
    } else if (this.formType == 'atkt') {
      this.router.navigate(['/atktForm']);
    } else if (this.formType == 'exam') {
      this.router.navigate(['/examForm']);
    } else if (data.downloadForm == true) {
      this.router.navigate(['/downloadForms']);
    } else if (data.onlyForm == true) {
      this.router.navigate(['/openAdmissionForm']);
    } else {
      this.router.navigate(['/admissionForm']);
    }
  }

  onAcademicInfoSubmit(values:any):void {

    if (this.academicInfoForm.valid) {
      this.otpConfirmationValues['studentId']  = this.academicInfoForm.get("studentId").value;
      this.otpConfirmationValues['confId']  = this.academicInfoForm.get("confId").value;
      this.otpConfirmationValues['termExamId']  = this.academicInfoForm.get("termExamId").value;
      this.otpConfirmationValues['subjectGroupId']  = this.academicInfoForm.get("subjectGroupId").value;
      this.setLocalStorage(this.otpConfirmationValues);
    }
  }

  onPreRegFormSubmit(values:any):void {

    if (this.preRegForm.valid) {
      this.preRegFormValues = values;
      this.signIn = false;
      this.mobileNo = values.mobileNo;

      if (this.otpMode === 'phone') {
        this.sendOtp(this.mobileNo, true, 'phone');
      } else if (this.otpMode === 'email') {
        this.sendOtp(this.email, true, 'email');
      }
    }
  }

  getFromPincode(event:any, mode):void {

    let pincode = event.target.value;
    if (pincode.length == 6) {

      this.allEventEmitters.showLoader.emit(true);
      this._commonService.getFromPincode(pincode).subscribe(data => {

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {
          if (data.status == 1) {
            this.preRegForm.controls.state.setValue(data.dataJson.stateName, {emitEvent: false});
            this.preRegForm.controls.state.disable();              
            this.preRegForm.controls.city.setValue(data.dataJson.cityName, {emitEvent: false});
            this.preRegForm.controls.city.disable();
          } else if (data.status == 0) {
            this.preRegForm.controls.state.enable();
            this.preRegForm.controls.city.enable();
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

  openInfoDialog(data:any) {

    let dialogRef = this.dialog.open(InfoDialogComponent, {
      disableClose: data.required,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });

    let modalTitle = 'Info';
    if (!globalFunctions.isEmpty(data.label)) {
      modalTitle = data.label;
    }

    dialogRef.componentInstance.modalTitle = modalTitle;
    dialogRef.componentInstance.innerHtmlMsg = data.value;
    dialogRef.componentInstance.dialogRef = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'ok') {

      }
    });
  }   

}

export class form_elements {
  public phone = '';
  public otp = '';
}

