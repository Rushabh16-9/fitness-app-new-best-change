import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';

import { AdminService } from 'app-shared-services/admin.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'approve-reject-dialog',
  templateUrl: './approve-reject-dialog.component.html',
  styleUrls: ['./approve-reject-dialog.component.css'],
  providers: [
    SnackBarMsgComponent,
    AdminService
  ],
  encapsulation: ViewEncapsulation.None
})
export class ApproveRejectDialogComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  modalTitle: string;
  mode: string;

  approveRejectForm: FormGroup;
  showCancelReason: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,     
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters,    
    private _adminService: AdminService,    
    @Inject(MAT_DIALOG_DATA) public instituteId: string,
    @Inject(MAT_DIALOG_DATA) public instituteName: string,
    @Inject(MAT_DIALOG_DATA) public type: string,
    @Inject(MAT_DIALOG_DATA) public rowDetails: any,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any
  ) { 

  }

  ngOnInit() {

    this._snackBarMsgComponent.closeSnackBar();

    let nodalMerchantCodeReq:any;
    let rejectedReasonReq:any;
    if (this.type == 'approve') {
       nodalMerchantCodeReq = Validators.required;
    } else if (this.type == 'reject') {
       rejectedReasonReq = Validators.required;
    }

    this.approveRejectForm = this._formBuilder.group({
      rejectedReason: [null, Validators.compose([rejectedReasonReq, Validators.minLength(10)])],
      nodalMerchantCode: [null, nodalMerchantCodeReq]
    });
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSubmit(values:any):void {

    if (this.approveRejectForm.valid) {

      values.instituteId = this.rowDetails.instituteId;
      values.bankAccountId = this.rowDetails.bankAccountId;
      values.type = this.type;
      
      this.allEventEmitters.showLoader.emit(true);
      this._adminService.approveRejectBankAccount(values).subscribe(data => {
   
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

}
