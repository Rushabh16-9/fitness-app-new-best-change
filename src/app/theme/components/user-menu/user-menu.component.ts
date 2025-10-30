import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AllEventEmitters } from 'app/global/all-event-emitters';
import * as globalFunctions from 'app/global/globalFunctions';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserMenuComponent implements OnInit {

  public userImage:string;
  public defaultImage = '../assets/images/users/default-user.jpg';
  public fullName: string;
  public userName: string;
  public instituteName: string;
  public instituteShortName: string;
  public email: string;
  public mobileNo: string;
  public userTypeId: number;

  constructor(
    private allEventEmitters: AllEventEmitters  	
  ) { 
    allEventEmitters.setRightSideUserInfoBlock.subscribe(
      (flag:boolean) => {
        if (flag) {
          this.setUserInfoBlock();
        }
      }
    );
  }

  ngOnInit() {
    this.setUserInfoBlock();
  }

  public setUserInfoBlock():void {

    let userProf = globalFunctions.getUserProf();

    this.fullName = userProf.fullName;
    this.instituteShortName = userProf.instituteShortName;

    this.userTypeId = userProf.userTypeId;
    // userTypeId
    // 1 = Admin 
    // 2 = Institute
    // 3 = Student
    // 5 = Admission
    if (this.userTypeId == 3 || this.userTypeId == 5) {
      this.mobileNo = userProf.mobileNo;
    } else {
      this.email = userProf.email;
    }

    this.userImage = this.defaultImage;
    if ( !globalFunctions.isEmpty(userProf.profilePic) ) {
      this.userImage = userProf.profilePic;
    }
  }

}
