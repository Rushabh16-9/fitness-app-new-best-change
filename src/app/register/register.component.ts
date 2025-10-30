import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [
    SnackBarMsgComponent, 
    InstitutesService, 
    StudentService, 
    CommonService,
    DatePipe,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},    
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class RegisterComponent implements OnInit {

  @ViewChild('elementToFocus', { static: false }) _input: ElementRef;

  public settings: Settings;

  DOMAIN_NAME: string = environment.DOMAIN_NAME;
  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  userId:string;
  studentId:string;

  regFormGroup: FormGroup;
  showRegisterForm: boolean = true;
  addMoreUsers: boolean = false;
  urlParamInstituteId: string = '0'; 
  instituteId: string = '0';
  instituteName: string;

  showOtpForm:boolean = false;
  otpForm: FormGroup;

  showLevelsForm:boolean = false;
  levelsFormGroup: FormGroup;
  selectedLevels:string = '';
  levelIdsArray: any = [];
  levelId: number = 0;
  lastIndex: number = 0;
  
  nextLevelsArray: any = [];
  matchedUsersArray: any = [];

  showMatchedUsersBox:boolean = false;

  institutesList: any = [];
  fromInstitute:boolean = false;

  minDate = new Date(1970, 0, 1);
  maxDate = new Date(2018, 1, 1);

  academicYearList = [];

  constructor(
    public appSettings:AppSettings,   
    private datePipe: DatePipe,      
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private _institutesService: InstitutesService,
    private _studentService: StudentService,
    private _commonService: CommonService,     
    private activatedRoute: ActivatedRoute,    
    public _snackBarMsgComponent: SnackBarMsgComponent,     
    private allEventEmitters: AllEventEmitters
  ) { 

    this.maxDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));

    this.settings = this.appSettings.settings;

    this._snackBarMsgComponent.closeSnackBar();

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME + 
      ' | Registration'
    );
  }

  ngAfterViewInit() {

    this.settings.loadingSpinner = false;

    // this.activatedRoute.queryParams.subscribe(params => {
    //   let authCode = params['authCode'];
    //   if (!globalFunctions.isEmpty(authCode)) {
    //     this.settings.loadingSpinner = true;
    //   } else {
    //     this.settings.loadingSpinner = false;
    //   }
    // });
  }

  ngOnInit() {

    this.activatedRoute.queryParams.subscribe(params => {
      this.urlParamInstituteId = params['instituteId'];
      this.fromInstitute = params['fromInstitute'];
      this.instituteId = this.urlParamInstituteId;
    });

    this.getAcademicYears();
    this.createRegistrFormControls();
    this.createLevelsFormControls();

    this.authService.clearOnRegistrationLocalStorage();
    this.getDeviceConfig();

    // this.setCrossOriginStorage();
  }

  setCrossOriginStorage() {

    //////////// below code should be on recieving end ////////////////    
    // document.domain = "example.com";
    // window.onmessage = function(e) {
    //     if (e.origin !== "http://example.com") {
    //         return;
    //     }
    //     var payload = JSON.parse(e.data);
        
    //     switch(payload.method) {
    //         case 'set':
    //             localStorage.setItem(payload.key, JSON.stringify(payload.data));
    //             break;
    //         case 'get':
    //             var parent = window.parent;
    //             var data = localStorage.getItem(payload.key);
    //             parent.postMessage(data, "*");
    //             break;
    //         case 'remove':
    //             localStorage.removeItem(payload.key);
    //             break;
    //     }
    // };

    //////////// below code should be on sending domain ////////////////
    // window.onload = function() {
    //     var iframe = document.getElementsByTagName('iframe')[0];
    //     var win;
    //     // some browser (don't remember which one) throw exception when you try to access
    //     // contentWindow for the first time, it work when you do that second time
    //     try {
    //         win = iframe.contentWindow;
    //     } catch(e) {
    //         win = iframe.contentWindow;
    //     }
    //     var obj = {
    //        name: "Jack"
    //     };
    //     // save obj in subdomain localStorage
    //     win.postMessage(JSON.stringify({key: 'storage', method: "set", data: obj}), "*");
    //     window.onmessage = function(e) {
    //         if (e.origin != "http://other.example.com") {
    //             return;
    //         }
    //     };
    //     // load previously saved data
    //     win.postMessage(JSON.stringify({key: 'storage', method: "get"}), "*");
    // };    
  }

  getAcademicYears() {

    this._commonService.getAcademicYears().subscribe(data => {

      if (data.status != undefined) {
        if (data.status == 1) {
          this.academicYearList = data.dataJson;
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

  createRegistrFormControls() {

    this.regFormGroup = this._formBuilder.group({
      institute: [null, Validators.required],
      firstName: [null, Validators.required],
      middleName: [null],
      lastName: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, emailValidator])],
      mobileNo: [null, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone) ])],
      gender: [null, Validators.required],
      dob: [null, Validators.required],
      residentialAddress: this._formBuilder.group({
        address: [null, Validators.required],
        pincode: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6) ])],
        state: new FormControl({value: null, disabled: true}, Validators.required),
        city: new FormControl({value: null, disabled: true}, Validators.required),
      }),
      villageName: [null]
    });

    this.otpForm = this._formBuilder.group({
      otp: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(regexValidators.validate.otp) ])]
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

              if (!globalFunctions.isEmpty(this.instituteId)) {
                this.getInstituteDetails(this.instituteId);
              }

              this.getInstitutesList();
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

  public getInstitutesList():void {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._institutesService.getInstitutesList().subscribe(data => {

        setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

        if (data.status != undefined) {

          if (data.status == 1) {

            this.institutesList = data.dataJson;

            if (!globalFunctions.isEmpty(this.urlParamInstituteId)) {
              let urlParamInstituteId = parseInt(this.urlParamInstituteId);
              this.regFormGroup.controls['institute'].setValue(urlParamInstituteId, {emitEvent: false});
            }
            this._snackBarMsgComponent.closeSnackBar();

          } else if (data.status == 0) {
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
          }
        } else {
         this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }, err => {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    );
  }

  onSelectInstitute(instituteId) {
    this.instituteId = instituteId;
  }

  public getInstituteDetails(instituteId):void {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._institutesService.getInstituteDetails(instituteId).subscribe(data => {

        setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

        if (data.status != undefined) {

          if (data.status == 1) {

            this.instituteName = data.dataJson.instituteName;
            this.instituteId = data.dataJson.instituteId;

            this.regFormGroup.controls['institute'].setValue(data.dataJson.instituteId, {emitEvent: false});

            this._snackBarMsgComponent.closeSnackBar();

          } else if (data.status == 0) {
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
          }
        } else {
         this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }, err => {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    );
  }

  showRegFormBox(): void {
    this._snackBarMsgComponent.closeSnackBar();
    this.showOtpForm = false;
    this.showRegisterForm = true;
  }

  onRegSubmit(values:any):void {
    if (this.regFormGroup.valid) {
      this.sendOtp();
    }
  }

  resendOtp(): void {
    this.sendOtp(true);
  }

  sendOtp(resend:boolean = false) {

    let values = this.regFormGroup.getRawValue();
    values['dob'] = globalFunctions.format(new Date(this.regFormGroup.get("dob").value), 'input');
    values.resend = resend;

    this.allEventEmitters.showLoader.emit(true);
    this._studentService.sendRegistrationOtp(values, this.userId).subscribe(data => {

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {

          if (data.status == 1) {

            if (data.dataJson.forOtp == true) {

              if (data.dataJson.otp) {
                this.otpForm.setValue({otp: data.dataJson.otp});
              } else {
                this.otpForm.setValue({otp: ''});
              }
              this.showRegisterForm = false;
              this.showOtpForm = true;

              this._snackBarMsgComponent.openSnackBar(allMsgs.OTP_SENT+ ' ' + this.regFormGroup.value.mobileNo, 'x', 'info-snackbar');

            } else {
              this.userId = data.dataJson.userId;
              this.studentId = data.dataJson.studentId;              
              this.getLevels(this.instituteId, '');
              this.showRegisterForm = false;
              this.showLevelsForm = true;
            }
          } else {
            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
          }
        } else {
         this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }, err => {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    );
  }

  public onOtpSubmit(values:any):void {

    if (this.otpForm.valid) {

      let values = this.regFormGroup.getRawValue();
      values['dob'] = globalFunctions.format(new Date(this.regFormGroup.get("dob").value), 'input');

      this.allEventEmitters.showLoader.emit(true);
      this._studentService.confirmRegistrationOtp(values, this.otpForm.value, this.instituteId).subscribe(data => {

          this.allEventEmitters.showLoader.emit(false);

          if (data.status != undefined) {

            if (data.status == 1) {

              this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'info-snackbar', 5000);

              if (!globalFunctions.isEmpty(data.dataJson.userId) && (!globalFunctions.isEmpty(data.dataJson.studentId)) ) {

                this.userId = data.dataJson.userId;
                this.studentId = data.dataJson.studentId;
                this.getLevels(this.instituteId, '');
                this.showOtpForm = false;
                this.showLevelsForm = true;

              } else {
                this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar');
              }
            } else if (data.status == 0) {
              this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
            }
          } else {
            this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
          }
        }, err => {
         this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      );
    }
  }

  createLevelsFormControls() {
    this.levelsFormGroup = this._formBuilder.group({
      secretNextLevels: this._formBuilder.array([]),
      academicYearId : [null, Validators.required]      
    });
  }

  get secretNextLevels(): FormArray {
    return this.levelsFormGroup.get('secretNextLevels') as FormArray;
  };

  public getLevels(instituteId, selectedLevels): void {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._institutesService.getLevels(this.instituteId, selectedLevels).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.secretNextLevels.push(this._formBuilder.group(new nextLevels()));
          this.nextLevelsArray.push(data.dataJson);

          this.levelId = 0;
          this.lastIndex = 0;

        } else if (data.status == 2) {

          this.levelId = 0;
          this.lastIndex = 0;

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

  public onChangeLevel(instituteId, levelId, lastIndex):void {

    if (!globalFunctions.isEmpty(levelId)) {

      this.nextLevelsArray.splice(lastIndex + 1);
      this.secretNextLevels.controls.splice(lastIndex + 1);

      let newLastIndex = parseInt(lastIndex + 1);
      this.levelIdsArray.length = newLastIndex;
      this.levelIdsArray[lastIndex] = levelId;

      this.selectedLevels = this.levelIdsArray.join(',');

      this.getLevels(this.instituteId, this.selectedLevels);      
    }
  }

  public onLevelsSubmit(values:any):void {

    if (this.levelsFormGroup.valid) {

      this.allEventEmitters.showLoader.emit(true);
      this._studentService.submitSelection(this.instituteId, this.selectedLevels, this.levelsFormGroup.get('academicYearId').value, this.userId, this.studentId).subscribe(data => {

          this.allEventEmitters.showLoader.emit(false);

          if (data.status != undefined) {
            if (data.status == 1) {

              this.showMatchedUsersBox = true;
              this.showLevelsForm = false;

              this.matchedUsersArray = data.dataJson;

              this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'info-snackbar', 5000);

            } else if (data.status == 0) {
              this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
            }
          } else {
            this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
          }
        }, err => {
         this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      );
    }    
  }

  public removeUser(studentConfId): void {

    this.allEventEmitters.showLoader.emit(true);
    this._studentService.removeSelection(this.userId, studentConfId).subscribe(data => {

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {
          if (data.status == 1) {

            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'info-snackbar', 5000);

            this.matchedUsersArray = data.dataJson;

          } else if (data.status == 0) {

            this.onAddMoreUsers();
            // this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar');
          }
        } else {
         this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }, err => {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    );    
  }

  public confirmUser(): void {

    this.allEventEmitters.showLoader.emit(true);
    this._studentService.confirmSelection(this.userId).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.authService.setMenus(data.dataJson.accessControl);
          this.authService.setLocalStorage(data.dataJson);
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

  public onAddMoreUsers(): void {

    this.levelsFormGroup.reset();
    this.secretNextLevels.controls.splice(0);
    this.nextLevelsArray = [];    

    this.showMatchedUsersBox = false;
    this.showRegisterForm = true;
    this.addMoreUsers = true;
  }

  public onCancelAddMoreUsers(): void {

    this.showMatchedUsersBox = true;
    this.showRegisterForm = false;
  }

  _openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
    setTimeout(() => this._input.nativeElement.focus());
  }

  _closeCalendar(e) {
    setTimeout(() => this._input.nativeElement.blur());
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
              let residentialAddress = <FormGroup> this.regFormGroup.controls.residentialAddress;
              residentialAddress.controls.state.setValue(data.dataJson.stateName, {emitEvent: false});
              residentialAddress.controls.state.disable();              
              residentialAddress.controls.city.setValue(data.dataJson.cityName, {emitEvent: false});
              residentialAddress.controls.city.disable();              
            }
          } else if (data.status == 0) {
            if (mode == 'residentialAddress') {
              let residentialAddress = <FormGroup> this.regFormGroup.controls.residentialAddress;
              residentialAddress.controls.state.enable();
              residentialAddress.controls.city.enable();
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

}

export class nextLevels {
  levelId = '';
}
