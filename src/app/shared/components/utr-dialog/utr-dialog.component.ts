import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { DatePipe } from '@angular/common';
import { MatStepper } from '@angular/material/stepper';
import { MatDatepicker } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';

import { SettlementService } from 'app-shared-services/settlement.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'utr-dialog',
  templateUrl: './utr-dialog.component.html',
  styleUrls: ['./utr-dialog.component.css'],
  providers: [
    SnackBarMsgComponent,
    SettlementService,
    DatePipe,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},    
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}    
  ],
  encapsulation: ViewEncapsulation.None
})
export class UtrDialogComponent implements OnInit {

  @ViewChild('elementToFocus', { static: true }) _input: ElementRef;

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  modalTitle: string;
  mode: string;

  utrForm: UntypedFormGroup;
  maxDate = new Date(2018, 1, 1);
  rowsPerPageArray = [5, 10, 15, 20]; 

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,     
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters,    
    private _settlementService: SettlementService,    
    @Inject(MAT_DIALOG_DATA) public rowDetails: any,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any
  ) { 

    this.maxDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));

    this.utrForm = this._formBuilder.group({
      utrNo: [null, Validators.compose([Validators.required])],
      transferDate: [null, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    // this._snackBarMsgComponent.closeSnackBar();
  }

  _openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
    setTimeout(() => this._input.nativeElement.focus());
  }

  _closeCalendar(e) {
    setTimeout(() => this._input.nativeElement.blur());
  }

  onUtrFormSubmit(): void {

    Object.keys(this.utrForm.controls).forEach(field => { 
      const control = this.utrForm.get(field); 
      control.markAsTouched({ onlySelf: true });
    });
    if (this.utrForm.valid) {
      if (globalFunctions.isEmpty(this.rowDetails.instituteSettlementId)) {
        alert('instituteSettlementId not found');
      } else {
        this.utrConfirmation();
      }
    } else {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  utrConfirmation() {

    let values:any = {};
    values.instituteSettlementId = this.rowDetails.instituteSettlementId;
    values.transferDate = globalFunctions.format(new Date(this.utrForm.get("transferDate").value), 'input');
    values.utrNo = this.utrForm.get("utrNo").value;

    this.allEventEmitters.showLoader.emit(true);
    this._settlementService.utrConfirmation(values).subscribe(data => {

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

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
