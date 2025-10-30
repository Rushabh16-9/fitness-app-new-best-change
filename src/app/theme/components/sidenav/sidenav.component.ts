import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { AppSettings } from 'app/app.settings';
import { Settings } from 'app/app.settings.model';
import { MenuService } from '../menu/menu.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';

import { CommonService } from 'app-shared-services/common.service';
import { AuthService } from 'app/auth/auth.service';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';
import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ MenuService, CommonService ]
})
export class SidenavComponent implements OnInit {

  @ViewChild('sidenavPS', { static: true }) sidenavPS: PerfectScrollbarComponent;

  public userImage:string;
  public defaultImage = '../assets/images/users/default-user.jpg';
  public menuItems:Array<any>;
  public settings: Settings;

  public fullName: string;
  public instituteName: string;
  public email: string;
  public mobileNo: string;
  public instituteShortName: string;
  public memberSince: Date;
  public userTypeId: number;
  public companyLogo: string = 'assets/images/logo/logo.png';
  public instLogo: string = '';

  constructor(
    private _commonService: CommonService, 
    private authService: AuthService,    
    public appSettings:AppSettings, 
    public menuService:MenuService,
    public _snackBarMsgComponent: SnackBarMsgComponent,     
    private allEventEmitters: AllEventEmitters    
  ) {
      this.settings = this.appSettings.settings; 

      allEventEmitters.setLeftSideUserInfoBlock.subscribe(
        (flag:boolean) => {
          if (flag) {
            this.setUserInfoBlock();
          }
        }
      );
  }

  ngOnInit() {

    this.menuItems = this.menuService.getVerticalMenuItems();
    this.setUserInfoBlock();
    this.checkUserInfoExist();
  }

  checkUserInfoExist() {

    let userProf = globalFunctions.getUserProf();
    this.userTypeId = userProf.userTypeId;

    if (!globalFunctions.isEmpty(userProf.userId) && 
      ( globalFunctions.isEmpty(userProf.fullName) || 
       globalFunctions.isEmpty(userProf.mobileNo) || 
       globalFunctions.isEmpty(userProf.memberSince )
      )
    ) {
      // this.getUserInfo();
    }
  }

  getUserInfo() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._commonService.getUserInfo().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1) {

          this.setUserInfo(data.dataJson);

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

  setUserInfo(data:any):void {

    globalFunctions.setUserProf('fullName', data.fullName);
    globalFunctions.setUserProf('mobileNo', data.mobileNo);
    globalFunctions.setUserProf('memberSince', data.memberSince);
    
    globalFunctions.setUserProf('themeColor', data.themeColor);
    this.authService.setThemeColor();

    this.allEventEmitters.setRightSideUserInfoBlock.emit(true);
    this.setUserInfoBlock();
  }

  setUserInfoBlock() {

    let instituteLogo = globalFunctions.getUserProf('instituteLogo');
    if (!globalFunctions.isEmpty(instituteLogo)) {
      this.instLogo = instituteLogo;
    } else {
      this.instLogo = this.companyLogo;
    }

    let userProf = globalFunctions.getUserProf();
    this.fullName = userProf.fullName;
    this.instituteName = userProf.instituteName;
    this.email = userProf.email;
    this.instituteShortName = userProf.instituteShortName;

    let userTypeId = userProf.userTypeId;
    // userTypeId
    // 1 = Admin 
    // 2 = Institute
    // 3 = Student
    // 5 = Admission
    if (userTypeId == 3) {
      this.mobileNo = userProf.mobileNo;
    }

    let dateString = userProf.memberSince;
    if (!globalFunctions.isEmpty(dateString)) {
      this.memberSince = new Date(dateString);
    }

    this.userImage = this.defaultImage;
    if ( !globalFunctions.isEmpty(userProf.profilePic) ) {
      this.userImage = userProf.profilePic;
    }
  }

  closeSubMenus(){
    let menu = document.querySelector(".sidenav-menu-outer");
    if(menu){
      for (let i = 0; i < menu.children[0].children.length; i++) {
        let child = menu.children[0].children[i];
        if(child){
          if(child.children[0].classList.contains('expanded')){
              child.children[0].classList.remove('expanded');
              child.children[1].classList.remove('show');
          }
        }
      }
    }
  }

  updatePS(e){
    this.sidenavPS.directiveRef.update();
  }
}
