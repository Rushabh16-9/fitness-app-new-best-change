import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { CommonService } from 'app-shared-services/common.service';
import { AuthService } from 'app/auth/auth.service';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';
import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'multiple-users',
  templateUrl: './multiple-users.component.html',
  styleUrls: ['./multiple-users.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    SnackBarMsgComponent,
    CommonService, 
  ]
})
export class MultipleUsersComponent implements OnInit {  

  allMsgs: any = allMsgs;

  public multiUsers:Array<Object>;
  public defaultImage = '../assets/images/users/default-user.jpg';

  selectedMultiUserId: number = 0;

  constructor(
    private _snackBarMsgComponent: SnackBarMsgComponent,    
    private allEventEmitters: AllEventEmitters,
    public router:Router,     
    private authService: AuthService, 
    private _commonService: CommonService,
  ) {

    this.multiUsers = globalFunctions.getUserProf('multiUsers');

    allEventEmitters.setMultiUserInfoBlock.subscribe(
      (flag:boolean) => {
        if (flag) {
          this.setUserInfoBlock();
        }
      }
    );
  }

  ngOnInit() {
    this.selectedMultiUserId = globalFunctions.getUserProf('selectedMultiUserId');
  }

  setUserInfoBlock() {

    let userProf = globalFunctions.getUserProf();
    let userTypeId = userProf.userTypeId;
    // userTypeId
    // 1 = Admin 
    // 2 = Institute
    // 3 = Student
    // 5 = Admission

    if ( !globalFunctions.isEmpty(userProf.profilePic) ) {
      this.multiUsers = globalFunctions.getUserProf('multiUsers');
      if (this.multiUsers.length > 1) {
        this.multiUsers.forEach((user:any) => {
          if (userProf.selectedMultiUserId == user.id) {
            user.pic = userProf.profilePic;
          }
        });
      }
    }
  }

  onChangeUser(user) {
    if (!globalFunctions.isEmpty(user.id)) {
      this.selectedMultiUserId = globalFunctions.getUserProf('selectedMultiUserId');      
      if (this.selectedMultiUserId != user.id) {
        this.getLedgersDropDown(user.id);
      }
    }
  }

  getLedgersDropDown(multiUserId) {

    this.allEventEmitters.showLoader.emit(true);
    this._commonService.multiUserOnChange(multiUserId).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {

        if (data.status == 1) {

          localStorage.removeItem('pTrId');
          localStorage.removeItem('localPeF');
          localStorage.removeItem('localMiscF');
          localStorage.removeItem('localAdmInvoices');
          localStorage.removeItem('seltdCardsCnt');
          localStorage.removeItem('localPaF');
          localStorage.removeItem('localCoF');

          this.authService.setMenus(data.dataJson.accessControl);
          this.authService.setLocalStorage(data.dataJson);

          this.allEventEmitters.setLeftSideUserInfoBlock.emit(true);
          this.allEventEmitters.setRightSideUserInfoBlock.emit(true);

          if (this.router.url == '/pendingFees' || this.router.url == '/dashboard') {
            window.location.reload();
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
