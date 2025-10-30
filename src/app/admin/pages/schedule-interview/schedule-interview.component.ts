import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { ConfirmDialogComponent } from 'app-shared-components/confirm-dialog/confirm-dialog.component';
import { SlotsDialogComponent } from './slots-dialog/slots-dialog.component';

import { InterviewSlotsService } from 'app-shared-services/interviewSlots.service';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { environment } from 'environments/environment';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'schedule-interview',
  templateUrl: './schedule-interview.component.html',
  styleUrls: ['./schedule-interview.component.css'],
  providers: [SnackBarMsgComponent, InterviewSlotsService],  
  encapsulation: ViewEncapsulation.None
})
export class ScheduleInterviewComponent implements OnInit {

  showAvailableSlots: boolean = false;
  allAvailableSlots = [];

  @ViewChild('pageTable') pageTable: any;    
  allBookedSlots:any = [];
  tableData:any = [];
  pageColumns = [];    
  pagination = {
    pageStart: 0,
    pageEnd: 0,
    limit: 50,
    totalRecords: 0,
    offset: 0,
    sortProp: '',
    sortOrder: ''
  };
  rowsPerPageArray = [5, 10, 15, 20, 50, 100];
  showBookedSlots: boolean = false;

  showEmptyBox: boolean = false;
  showEmptyBoxTxt: string = '';

  constructor(
    public dialog: MatDialog,     
    private allEventEmitters: AllEventEmitters,
    public _snackBarMsgComponent: SnackBarMsgComponent, 
    private _interviewSlotsService: InterviewSlotsService,
  ) {

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME + 
      ' | Schedule Interview'
    );
  }

  ngOnInit() {

    this.getScheduleSlots();
  }

  getScheduleSlots() {

    this.allAvailableSlots = [];
    this.showAvailableSlots = false;
    this.allBookedSlots = [];
    this.tableData = [];
    this.showBookedSlots = false;
    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._interviewSlotsService.getScheduleSlots().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          if (!globalFunctions.isEmpty(data.dataJson.availableSlots)) {
            this.allAvailableSlots = data.dataJson.availableSlots;
            this.showAvailableSlots = true;
          }

          if (!globalFunctions.isEmpty(data.dataJson.bookedSlots)) {

            this.allBookedSlots = [...data.dataJson.bookedSlots];
            this.tableData = data.dataJson.bookedSlots;
            setTimeout(() => { this.pageTable.rowDetail.expandAllRows(); }, 2);

            this.showBookedSlots = true;
          }

        } else if (data.status == 0) {

          this.showEmptyBox = true;
          this.showEmptyBoxTxt = data.message;
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);      
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  toggleExpandRow(row) {
    this.pageTable.rowDetail.toggleExpandRow(row);
  }

  changeRows(limit) {
    this.pagination.offset = 0;
    this.pagination.limit = limit;
  }  

  onViewSlot(row:any) {

    if (row.availableSlots < 0) {
      alert('availableSlots not found');
    } else {

      let dialogRef = this.dialog.open(SlotsDialogComponent, {
        height: "calc(100% - 30px)",
        width: "calc(100% - 30px)",
        maxWidth: "100%",
        maxHeight: "100%",
        autoFocus: false
      });

      dialogRef.componentInstance.modalTitle = 'View Slots: ' + row.dateDisplay;
      dialogRef.componentInstance.slots      = row.slots;
      dialogRef.componentInstance.rowDetails = row;
      dialogRef.componentInstance.dialogRef  = dialogRef;

      dialogRef.afterClosed().subscribe(result => {
        if (result == 'loadPage') {
          this.getScheduleSlots();
        }
      });
    }
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

      dialogRef.componentInstance.modalTitle = "Are you sure, you want to Book Slot for Date: " + row.dateDisplay + ", Time: " + row.timeDisplay +" ?";
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

    this.allEventEmitters.showLoader.emit(true);
    this._interviewSlotsService.bookSlot(row).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);
          this.getScheduleSlots();
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

  onOpenLink(url) {
    
    if (!globalFunctions.isEmpty(url)) {
      var win = window.open(url, '_blank');
      if (win) {
        win.focus();
      } else {
        alert('Please allow popups for this website');
      }
    } else {
      alert('Join Url not found!');
    }
  }  
}