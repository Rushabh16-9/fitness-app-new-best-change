import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';

import { commonApiUrls } from 'app/resta-api-urls';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { environment } from 'environments/environment';

import { AppSettings } from 'app/app.settings';
import { Settings } from 'app/app.settings.model';

// import { CookieService } from 'ngx-cookie';

@Injectable()
export class AuthService {

  public settings: Settings;

  PRODUCTION: boolean = environment.production;
  DOMAIN_NAME: string = environment.DOMAIN_NAME;

  // localStorage.setItem("roleId", "John");
  // var roleId = localStorage.getItem('roleId');
  // var user = JSON.parse(localStorage.getItem('user'));
  // this.token = user && user.token;
  // **** to get current page location **** // 
  // import { Location } from '@angular/common';
  // this.router.url;
  // this.location.path();

  private isloggedIn:boolean = false;
  private logoutPostData:any;

  constructor(
    private router: Router,
    private _snackBarMsgComponent: SnackBarMsgComponent,
    // private _cookieService: CookieService,
    public appSettings:AppSettings,     
    private http: HttpClient
  ) { 

    this.settings = this.appSettings.settings;
  }

  isUserLoggedIn(): boolean {

    let userProf = globalFunctions.getUserProf();
    let userId = userProf.userId;
    let userTypeId = userProf.userTypeId;
    let adminUserId = userProf.adminUserId;
    let instituteId = userProf.instituteId;
    let studentId = userProf.studentId;
    let admissionId = userProf.admissionId;

    // userTypeId
    // 1 = Admin 
    // 2 = Institute
    // 3 = Student
    // 5 = Admission

    if (!globalFunctions.isEmpty(userId) && !globalFunctions.isEmpty(userTypeId)) {
      if (userTypeId == 1 && !globalFunctions.isEmpty(adminUserId)) {
        return true;
      } else if (userTypeId == 2 && !globalFunctions.isEmpty(instituteId)) {
        return true;
      } else if (userTypeId == 3 && !globalFunctions.isEmpty(studentId)) {
        return true;
      } else if (userTypeId == 5 && !globalFunctions.isEmpty(admissionId)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getConfig(): void {

    this.callConfig().subscribe(data => {

      if (data.status != undefined) {
        if (data.status == 1) {
          this.setDeviceInfo(data);
        } else if (data.status == 2) {
          this.sessionExpired();
        }
      }
    }, err => {
      console.error('callConfig err============>'); 
      console.error(err); 
    });
  }

  setDeviceInfo(data) : void {
    if (data.dataJson.deviceId != undefined) {
      globalFunctions.setBrowserProf('deviceId', data.dataJson.deviceId);
    }
  }

  callConfig() : Observable<any> {

    const url = commonApiUrls.getDeviceConfig;

    let userProf = globalFunctions.getUserProf();
    let userId = userProf.userId;

    let browserProf = globalFunctions.getBrowserProf();
    let uuId = browserProf.uuId;
    let deviceId = browserProf.deviceId;

    if (globalFunctions.isEmpty(uuId)) {
      uuId = globalFunctions.generateUuid();
      globalFunctions.setBrowserProf('uuId', uuId)
    }

    let postData = {
      userId: userId,
      uuId: uuId,
      deviceId: deviceId
    }

    return this.http.post<any>(url, postData);
  }

  clearOnRegistrationLocalStorage(): void {
    this.clearLocalStorage();
  }

  clearLocalStorage(): void {
    let browserProf = localStorage.getItem('browserProf');
    localStorage.clear();
    localStorage.setItem('browserProf', browserProf);
  }

  sessionExpired(): void {
    this._snackBarMsgComponent.openSnackBar(allMsgs.SESSION_EXPIRED, 'x', 'error-snackbar');
    this.logout();
  }

  setLocalStorage(data:any):void {
    globalFunctions.setUserProfInfo(data);
    setTimeout(() => { this.router.navigate([data.landingPage]); }, 2);
  }

  getAfterLoginPage() {
    let afterLoginPage = globalFunctions.getUserProf('afterLoginPage');
    return afterLoginPage;
  }

  setMenus(data:any):void {
    globalFunctions.setMenus(data);
  }

  logout(): void {

    let previousUrl = globalFunctions.getUserProf('previousUrl');
    let userProf = globalFunctions.getUserProf();
    let userTypeId = userProf.userTypeId;
    // userTypeId
    // 1 = Admin 
    // 2 = Institute
    // 3 = Student
    // 5 = Admission

    this.clearLocalStorage();
    this.isloggedIn = false;

    if (!globalFunctions.isEmpty(previousUrl)) {
      window.location.href = previousUrl;
    } else if (!this.PRODUCTION) {
      this.router.navigate(['/login']);
    } else {
      if (userTypeId == 5) {
        this.router.navigate(['/login']);
      } else {
        window.location.href = this.DOMAIN_NAME;
      }
    }
  }

  getToken() {
    return globalFunctions.base64Decode(localStorage.getItem('token'));
  }

  internetConnectionError(): void {
    this._snackBarMsgComponent.openSnackBar(allMsgs.CHECK_INTERNET_CONNECTION, 'x', 'warning-snackbar');
  }

  getPermissions() {
    let menusParsed = globalFunctions.getMenus();
    let index = menusParsed.findIndex(x => x.routerLink == this.router.url);
    let permissions = {
      add:false, delete:false, view:false, edit:false, export:false, import: false
    };
    if (index >= 0) {
      permissions = menusParsed[index].permissions;
    }
    return permissions;
  }

  setThemeColor() {

    let theme = 'brand-color';
    let themeColor = globalFunctions.getUserProf('themeColor');
    let integratedThemes = globalFunctions.integratedThemes();

    let currentPage = globalFunctions.getCurrentPageInfo();
    if (currentPage.domain == 'onfees' && globalFunctions.isEmpty(themeColor)) {
      themeColor = 'onfees-color';
    } else if (currentPage.domain == 'edfly' && globalFunctions.isEmpty(themeColor)) {
      themeColor = 'edfly-color';
    }

    if ( !globalFunctions.isEmpty(integratedThemes) && !globalFunctions.isEmpty(themeColor) ) {
      themeColor = themeColor.toLowerCase().trim();
      if (integratedThemes.indexOf(themeColor) > -1) {
        theme = themeColor;
      }
    }

    // theme = 'blue-dark';
    this.settings.theme = theme;    
  }  
}
