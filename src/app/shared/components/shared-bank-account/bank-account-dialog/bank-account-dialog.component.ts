import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';
import { InstituteMasterService } from 'app-shared-services/instituteMaster.service';
import { InstitutesService } from 'app-shared-services/institutes.service';

import * as allMsgs from 'app/global/allMsgs';
import * as globalFunctions from 'app/global/globalFunctions';
import { emailValidator } from 'app/global/app-validators';

@Component({
  selector: 'bank-account-dialog',
  templateUrl: './bank-account-dialog.component.html',
  styleUrls: ['./bank-account-dialog.component.css'],
  providers: [
    SnackBarMsgComponent,
    InstituteMasterService,
    InstitutesService,
  ],
  encapsulation: ViewEncapsulation.None
})
export class BankAccountDialogComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;
  modalTitle: string;
  mode: string;

  bankAccountForm: FormGroup;
  institutesList = [];

  constructor(
    private _formBuilder: FormBuilder,     
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters, 
    private _institutesService: InstitutesService,     
    private _instituteMasterService: InstituteMasterService, 
    @Inject(MAT_DIALOG_DATA) public instituteId: any,
    @Inject(MAT_DIALOG_DATA) public page: any,
    @Inject(MAT_DIALOG_DATA) public rowDetails: any,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any
  ) {

  }

  ngOnInit() {

    let accountType = null;
    if (this.rowDetails.accountType) {
      accountType = this.rowDetails.accountType.toString();
    }

    let instituteIdReq:any;
    if (this.page == 'admin') {
       instituteIdReq = Validators.required;
    }

    this.bankAccountForm = this._formBuilder.group({
      instituteId: [this.rowDetails.instituteId, instituteIdReq],
      title: [this.rowDetails.title, Validators.required],
      accountNo: [this.rowDetails.accountNo, Validators.required],
      beneficiary: [this.rowDetails.beneficiary, Validators.required],
      bankName: [this.rowDetails.bankName, Validators.required],
      ifsc: [this.rowDetails.ifsc, Validators.required],
      micr: [this.rowDetails.micr],
      accountType: [accountType, Validators.required],
      emailIds : this._formBuilder.array([
        this.initItemRows()
      ])
    });

    this._snackBarMsgComponent.closeSnackBar();

    if (this.mode == 'edit') {
      this.addEmailIds(this.rowDetails.emailIds);
    }

    this.getInstitutesList();
  }

  initItemRows() : FormGroup {
    return this._formBuilder.group({
      emailId: [null, Validators.compose([Validators.required, emailValidator])],      
    });
  }

  addEmailIds(emailIdsArray) {

    if (!globalFunctions.isEmpty(emailIdsArray)) {

      const itemRows = <FormArray>this.bankAccountForm.controls.emailIds;
      itemRows.controls.splice(0, 1);

      emailIdsArray.forEach((val) => {

        const itemRows = <FormArray>this.bankAccountForm.controls.emailIds;

        let row = this._formBuilder.group({
          emailId: [val, Validators.compose([Validators.required, emailValidator])]
        });

        itemRows.push(row);
      });
    }
  }

  addNewRow() : void {
    const control = <FormArray>this.bankAccountForm.controls.emailIds;
    control.push(this.initItemRows());
  }

  deleteRow(i : number) : void {
    const control = <FormArray>this.bankAccountForm.controls.emailIds;
    control.removeAt(i);
  }

  public getInstitutesList():void {

    this._institutesService.getInstitutesList().subscribe(data => {

      if (data.status != undefined) {
        if (data.status == 1) {
          this.institutesList = data.dataJson;
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

  onSave(values:any):void {

    if (this.bankAccountForm.valid) {

      let emailIds = [];
      values.emailIds.forEach((details) => {
        emailIds.push(details.emailId);
      });

      if (this.page == 'institute') {
        values.instituteId = this.instituteId;
      }

      values.bankAccountId = this.rowDetails.bankAccountId;
      values.emailIds = emailIds;
      
      this.allEventEmitters.showLoader.emit(true);
      this._instituteMasterService.insertUpdateBankAccount(values).subscribe(data => {
   
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

  onChangeInstitute() {

  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
