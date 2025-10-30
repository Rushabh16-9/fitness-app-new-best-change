import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';
import { InstituteMasterService } from 'app-shared-services/instituteMaster.service';
import { InstitutesService } from 'app-shared-services/institutes.service';

import * as allMsgs from 'app/global/allMsgs';
import * as globalFunctions from 'app/global/globalFunctions';
import { emailValidator } from 'app/global/app-validators';

@Component({
  selector: 'create-term-dialog',
  templateUrl: './create-term-dialog.component.html',
  styleUrls: ['./create-term-dialog.component.css'],
  providers: [
    SnackBarMsgComponent,
    InstituteMasterService,
    InstitutesService,
  ],
  encapsulation: ViewEncapsulation.None
})
export class CreateTermDialogComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;
  modalTitle: string;
  mode: string;

  createTermForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,     
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters, 
    private _institutesService: InstitutesService,     
    private _instituteMasterService: InstituteMasterService, 
    @Inject(MAT_DIALOG_DATA) public instituteId: any,
    @Inject(MAT_DIALOG_DATA) public rowDetails: any,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any
  ) {

  }

  ngOnInit() {

    this.createTermForm = this._formBuilder.group({
      termExam: [this.rowDetails.termExam, Validators.required],
    });

    this._snackBarMsgComponent.closeSnackBar();
  }

  onSave(values:any):void {

    if (this.createTermForm.valid) {

      values.instituteId = this.instituteId;
      values.confId = this.rowDetails.confId;
      values.termExamId = this.rowDetails.termExamId;
      values.userSelectedLevels = values.levels;
      
      this.allEventEmitters.showLoader.emit(true);
      this._instituteMasterService.createUpdateTermExam(values).subscribe(data => {

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

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
