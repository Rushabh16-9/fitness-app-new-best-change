import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormControl, UntypedFormArray, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDateFormats } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import { InstitutesService } from 'app-shared-services/institutes.service';
import { StudentService } from 'app-shared-services/student.service';
import { CommonService } from 'app-shared-services/common.service';
import { AuthService } from 'app/auth/auth.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

import * as regexValidators from 'app/global/validator';
import { emailValidator } from 'app/global/app-validators';

import { AppSettings } from 'app/app.settings';
import { Settings } from 'app/app.settings.model';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { environment } from 'environments/environment';
import { AdmissionService } from 'app-shared-services/admission.service';

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
  selector: 'app-enquiry-form',
  templateUrl: './enquiry-form.component.html',
  styleUrls: ['./enquiry-form.component.css'],
  providers: [
    SnackBarMsgComponent,
    InstitutesService,
    StudentService,
    CommonService,
    AdmissionService,
    DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class EnquiryFormComponent implements OnInit {

  @ViewChild('elementToFocus') _input: ElementRef;

  public settings: Settings;

  DOMAIN_NAME: string = environment.DOMAIN_NAME;
  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  userId: string;
  studentId: string;

  regFormGroup: UntypedFormGroup;
  showRegisterForm: boolean = true;
  showSubmitBlk: boolean = false;
  showMainBlk: boolean = true;
  addMoreUsers: boolean = false;
  urlParamInstituteId: string = '0';
  instituteId: string = '0';
  instituteName: string;

  showOtpForm: boolean = false;
  otpForm: UntypedFormGroup;

  showLevelsForm: boolean = false;
  levelsFormGroup: UntypedFormGroup;
  selectedLevels: string = '';
  levelIdsArray: any = [];
  levelId: number = 0;
  lastIndex: number = 0;

  nextLevelsArray: any = [];
  matchedUsersArray: any = [];

  showMatchedUsersBox: boolean = false;

  institutesList: any = [];
  fromInstitute: boolean = false;
  isMobile: any = false;
  allCoursesList = [];
  coursesList = [];
  minDate = new Date(1970, 0, 1);
  maxDate = new Date(2018, 1, 1);
  isRa;
  ayId;
  levelIds;
  academicYearList = [];
  headerImage: string = '';
  timerObj: any;
  timeleftMsg: string;

  constructor(
    public appSettings: AppSettings,
    private datePipe: DatePipe,
    private _formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private _institutesService: InstitutesService,
    private _studentService: StudentService,
    private _commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private _admissionService: AdmissionService,
    private allEventEmitters: AllEventEmitters
  ) {

    this.maxDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));
    this.settings = this.appSettings.settings;

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME +
      ' | Registration'
    );
  }

  ngOnInit() {

    this.isMobile = globalFunctions.getLocalStorage('isMobile', 'JsonParse');

    setTimeout(() => { this._snackBarMsgComponent.closeSnackBar(); }, 1);

    this.activatedRoute.queryParams.subscribe(params => {
      this.urlParamInstituteId = params['instituteId'];
      this.instituteId = params['instituteId'];
      this.fromInstitute = params['fromInstitute'];
      this.isRa = params['ra'];
      this.levelIds = params['levelIds'];
      this.ayId = params['ayId'];
      this.instituteId = this.urlParamInstituteId;
    });

    this.createRegistrFormControls();
    // this.createLevelsFormControls();

    this.authService.clearOnRegistrationLocalStorage();
    this.getDeviceConfig();
 
  }

  ngAfterViewInit() {
    setTimeout(() => { this.settings.loadingSpinner = false; }, 1);
  }

  getFormPolicyInfo() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._admissionService.getFormPolicyInfo(this.instituteId).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1) {

          if (!globalFunctions.isEmpty(data.dataJson.headerImage)) {
            // this.showBrandLogo = false;
            this.headerImage = data.dataJson.headerImage;
            // this.showNriLogin = data.dataJson.showNriLogin;
          } else {
            // this.showNriLogin = false;
            // this.showBrandLogo = true;
          }

          //  if (this.showNriLogin) {
          //   this.loginForm.addControl('isNri', this._formBuilder.control('no', Validators.required));
          //   this.loginForm.get('isNri').valueChanges.subscribe(value => {
          //     this.updateFormBasedOnNriStatus(value);
          //   });
          //   this.updateFormBasedOnNriStatus(this.loginForm.get('isNri').value);
          // }

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

  getDeviceConfig() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this.authService.callConfig().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          if (data.dataJson.deviceId != undefined) {

            this.authService.setDeviceInfo(data);
            this.getFormPolicyInfo();
            this.getAllInstituteLevelConfsEnquiry();

          }
        } else if (data.status == 2) {
          this.authService.sessionExpired();
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar');
      }
    }, err => {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar');
    }
    );
  }

  getAllInstituteLevelConfsEnquiry() {
    // this.instituteId = '486';
    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._institutesService.getAllInstituteLevelConfsEnquiry(this.instituteId).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.allCoursesList = data.dataJson;
          this.coursesList = data.dataJson;
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  createRegistrFormControls() {

    this.regFormGroup = this._formBuilder.group({
      firstName: [null, Validators.required],
      middleName: [null],
      lastName: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, emailValidator])],
      mobileNo: [null, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone)])],
      gender: [null, Validators.required],
      confId: [null, Validators.required]
    });

    this.otpForm = this._formBuilder.group({
      otp: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(regexValidators.validate.otp)])]
    });
  }

  onCourseSearch(values: any) {
    this.coursesList = values.filteredOptions;
  }

  onRegSubmit(): void {

    let values = this.regFormGroup.getRawValue();

    let courseName;
    this.coursesList.forEach(course => {
      if (course.confId == values.confId) {
        courseName = course.courseName;
      }
    });

    if (this.regFormGroup.valid) {
      this.allEventEmitters.showLoader.emit(true);
      this._studentService.insertLeadData(values, this.instituteId, courseName).subscribe(data => {
        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {
          if (data.status == 1) {
            this.showRegisterForm = false;
            this.showSubmitBlk = true;
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar');

          } else if (data.status == 0) {
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
          }
        } else {
          this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }, err => {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      });
      // this.sendOtp();
    }
  }

}
