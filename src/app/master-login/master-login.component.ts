import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { AuthService } from 'app/auth/auth.service';
import { AdmissionService } from 'app-shared-services/admission.service';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { environment } from 'environments/environment';
import * as allMsgs from 'app/global/allMsgs';
import * as globalFunctions from 'app/global/globalFunctions';
import * as regexValidators from 'app/global/validator';

@Component({
  selector: 'master-login',
  templateUrl: './master-login.component.html',
  styleUrls: ['./master-login.component.css'],
  providers: [SnackBarMsgComponent, AdmissionService]    
})
export class MasterLoginComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;
  DOMAIN_NAME: string = environment.DOMAIN_NAME;

  loginForm: UntypedFormGroup;

  hide: boolean = true;
  showLoginForm: boolean = true;

  previousUrl:string;

  instituteId: string = '';
  inHouse:boolean = false;
  formPolicyId: string = '';
  
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private _admissionService: AdmissionService,
    private activatedRoute: ActivatedRoute,     
    private router: Router,
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters
  ) { 

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME + 
      ' | Master Login'
    );

    this.activatedRoute.queryParams.subscribe(params => {
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          if (key.toLowerCase().includes('institute')) {
            this.instituteId = params[key];
          } else if (key.toLowerCase().includes('house')) {
            this.inHouse = params[key];
          } else if (key.toLowerCase().includes('formpolicyid')) {
            this.formPolicyId = params[key];
          }
        }
      }
    });

    let afterLoginPage = this.authService.getAfterLoginPage();
    if (this.authService.isUserLoggedIn()) {
      this.authService.clearLocalStorage();
    }
    
    globalFunctions.setUserProf('previousUrl', window.location.href);

    this.authService.getConfig();    
  }

  ngOnInit() {
    this.createFormGroup();
  } 

  createFormGroup() {
    this.loginForm = this._formBuilder.group({
      'phone': [null, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(regexValidators.validate.phone) ])],
      'password': [null, Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  public onLoginSubmit(values:form_elements):void {

    if (this.loginForm.valid) {

      this.allEventEmitters.showLoader.emit(true);
      this._admissionService.allowLogin(values.phone, values.password, this.instituteId, this.formPolicyId).subscribe(data => {

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {

          if (data.status == 1) {

            this._snackBarMsgComponent.closeSnackBar();

            data.dataJson['instituteId']  = this.instituteId;
            data.dataJson['inHouse']      = this.inHouse;
            data.dataJson['formPolicyId'] = this.formPolicyId;

            this.setLocalStorage(data.dataJson);
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
  }

  setLocalStorage(data:any):void {
    globalFunctions.setUserProfInfo(data);
    if (data.downloadForm == true) {
      this.router.navigate(['/downloadForms']);
    } else {
      this.router.navigate(['/admissionForm']);
    }
  }

}

export class form_elements {
  public phone = '';
  public password = '';
}

