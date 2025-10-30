import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';

import { AttendanceService } from 'app-shared-services/attendance.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
  providers: [
    SnackBarMsgComponent,
    AttendanceService
  ],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDialogComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  modalTitle: string;
  mode: string;

  cancelReasonForm: UntypedFormGroup;
  showCancelReason: boolean = false;

  constructor(
    private _formBuilder: UntypedFormBuilder,     
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters,    
    private _attendanceService: AttendanceService,    
    @Inject(MAT_DIALOG_DATA) public instituteId: string,
    @Inject(MAT_DIALOG_DATA) public instituteName: string,
    @Inject(MAT_DIALOG_DATA) public boxContent: string,
    @Inject(MAT_DIALOG_DATA) public innerHtmlMsg: any,    
    @Inject(MAT_DIALOG_DATA) public yesText: string,
    @Inject(MAT_DIALOG_DATA) public noText: string,
    @Inject(MAT_DIALOG_DATA) public lectureId: string,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any
  ) { 
    
    this.cancelReasonForm = this._formBuilder.group({
      cancelReason: [null, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(200)])]
    });
  }

  ngOnInit() {

    setTimeout(() => { this._snackBarMsgComponent.closeSnackBar(); }, 1);
  }

  onYesClick(): void {

    if (this.showCancelReason) {
      Object.keys(this.cancelReasonForm.controls).forEach(field => { 
        const control = this.cancelReasonForm.get(field); 
        control.markAsTouched({ onlySelf: true });
      });
      if (this.cancelReasonForm.valid) {
        this.cancelLecture();
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
      }
    } else {
      this.dialogRef.close('ok');
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  cancelLecture() {

    this.allEventEmitters.showLoader.emit(true);
    this._attendanceService.cancelLecture(this.lectureId, this.cancelReasonForm.get("cancelReason").value).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);
      if (data.status != undefined) {
        if (data.status == 1) {
          this.dialogRef.close('loadPage');
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
