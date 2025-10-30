import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';

import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';

import { AttendanceService } from 'app-shared-services/attendance.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.css'],
  providers: [
    SnackBarMsgComponent,
    AttendanceService
  ],
  encapsulation: ViewEncapsulation.None
})
export class InfoDialogComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  modalTitle: string;
  mode: string;

  constructor(
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters,    
    private _attendanceService: AttendanceService,    
    @Inject(MAT_DIALOG_DATA) public instituteId: string,
    @Inject(MAT_DIALOG_DATA) public instituteName: string,
    @Inject(MAT_DIALOG_DATA) public boxContent: string,
    @Inject(MAT_DIALOG_DATA) public innerHtmlMsg: any,    
    @Inject(MAT_DIALOG_DATA) public yesText: string,
    @Inject(MAT_DIALOG_DATA) public noText: string,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any
  ) { 
    
  }

  ngOnInit() {
    this._snackBarMsgComponent.closeSnackBar();
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close('ok');
  }

}
