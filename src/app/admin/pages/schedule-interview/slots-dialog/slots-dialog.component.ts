import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Inject } from '@angular/core';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { ConfirmDialogComponent } from 'app-shared-components/confirm-dialog/confirm-dialog.component';

import { InterviewSlotsService } from 'app-shared-services/interviewSlots.service';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'slots-dialog',
  templateUrl: './slots-dialog.component.html',
  styleUrls: ['./slots-dialog.component.css'],
  providers: [
    SnackBarMsgComponent, 
    InterviewSlotsService,
  ],  
  encapsulation: ViewEncapsulation.None
})
export class SlotsDialogComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  modalTitle: string;
  mode: string;
  
  slotsArray:any = [];

  constructor(
    public dialog: MatDialog,     
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters, 
    private _interviewSlotsService: InterviewSlotsService, 
    @Inject(MAT_DIALOG_DATA) public slots: any,
    @Inject(MAT_DIALOG_DATA) public rowDetails: any,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any,
  ) {

  }

  ngOnInit() {

  }

  onBookSlot(row: any) {

    if (row.availableSlots < 0) {
      alert('availableSlots not found');
    } else {

      let dialogRef = this.dialog.open(ConfirmDialogComponent, {
        height: 'auto',
        width: '500px',
        autoFocus: false        
      });

      dialogRef.componentInstance.modalTitle = "Are you sure, you want to Book Slot for Date: " + this.rowDetails.dateDisplay + ", Time: " + row.timeDisplay +" ?";
      dialogRef.componentInstance.yesText = 'OK';
      dialogRef.componentInstance.noText = 'CLOSE';
      dialogRef.componentInstance.dialogRef = dialogRef;

      dialogRef.afterClosed().subscribe(result => {
        if (result == 'ok') {
          this.bookSlot(row);
        }
      });
    }
  }

  bookSlot(row) {

    let postValues: any = {
      'date': this.rowDetails.date, 
      'fromTime': row.fromTime, 
      'toTime': row.toTime, 
    };

    this.allEventEmitters.showLoader.emit(true);
    this._interviewSlotsService.bookSlot(postValues).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);
          this.dialogRef.close('loadPage');
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
