import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

import { CreateTermDialogComponent } from './create-term-dialog/create-term-dialog.component';
import { ConfirmDialogComponent } from 'app-shared-components/confirm-dialog/confirm-dialog.component';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import { InstituteMasterService } from 'app-shared-services/instituteMaster.service';

import { AllEventEmitters } from 'app/global/all-event-emitters';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'exam-term-dialog',
  templateUrl: './exam-term-dialog.component.html',
  styleUrls: ['./exam-term-dialog.component.css'],
  providers: [
    SnackBarMsgComponent, 
    InstituteMasterService,
  ],
  encapsulation: ViewEncapsulation.None
})
export class ExamTermDialogComponent implements OnInit {

  @ViewChild('termTable', { static: true }) termTable: any;

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  modalTitle: string;
  mode: string;

  page = {
    pageStart: 0,
    pageEnd: 0,    
    limit: 5,
    totalRecords: 0,
    offset: 0,
    orderBy: '',
    orderDir: ''
  };

  dateRange = {
    fromDate: '',
    toDate: ''
  };
  filter: string;
  
  rowsPerPageArray = [5, 10, 15, 20];

  tableData:any;
  tempData:any;
  columns = [];

  constructor(
    public dialog: MatDialog,    
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private _instituteMasterService: InstituteMasterService,
    private allEventEmitters: AllEventEmitters,    
    @Inject(MAT_DIALOG_DATA) public instituteId: string,
    @Inject(MAT_DIALOG_DATA) public rowDetails: any,
    @Inject(MAT_DIALOG_DATA) public dialogRef: any,
    @Inject(MAT_DIALOG_DATA) public permissions: any,
  ) { 

  }

  ngOnInit() {

    this._snackBarMsgComponent.closeSnackBar();

    this.listExamTerms();
  }

  listExamTerms() {

    this.tableData = [];
    this.tempData = [];

    let postParam: any = {
      'instituteId': this.instituteId, 
      'confId': this.rowDetails.confId, 
      'clientSidePaging': true,
    };

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._instituteMasterService.listExamTerms(postParam).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          if (data.dataJson) {

            this.tempData = [...data.dataJson];
            this.tableData = data.dataJson;

            setTimeout(() => { this.termTable.rowDetail.expandAllRows(); }, 2);
          }
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  changeRows(limit) {
    this.page.offset = 0;    
    this.page.limit = limit;
  }

  toggleExpandRow(row) {
    this.termTable.rowDetail.toggleExpandRow(row);
  }

  onInputSearch(event, expandAllRows: boolean = true) {
    let updateFilterValues = globalFunctions.updateFilter(event, this.tableData, this.tempData, this.columns, this.termTable, expandAllRows);
    this.tableData = updateFilterValues.tableData;
    this.tempData = updateFilterValues.tempData;
    this.columns = updateFilterValues.columnsData;
    this.termTable = updateFilterValues.table;
  }

  filterColumn(event, column, searchType = '') {
    let filteredData = globalFunctions.updateColumnFilter(event, this.tableData, this.tempData, this.termTable, column.prop, searchType);
    this.tableData = filteredData.tableData;
    this.tempData = filteredData.tempData;
    this.termTable = filteredData.table;
  }

  onAddEditTerm(mode, row:any = {}) {

    let dialogRef = this.dialog.open(CreateTermDialogComponent, {
      width: '600px',
      height: 'auto',
      autoFocus: false
    });

    let modalTitle = '';
    if (mode == 'add') {
      row.termExamId = 0;
      modalTitle = 'Add Term';
    } else if (mode == 'edit') {
      modalTitle = 'Edit Term';
    }

    row.confId = this.rowDetails.confId;

    dialogRef.componentInstance.instituteId = this.instituteId;
    dialogRef.componentInstance.modalTitle  = modalTitle;
    dialogRef.componentInstance.mode        = mode;
    dialogRef.componentInstance.rowDetails  = row;
    dialogRef.componentInstance.dialogRef   = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'loadPage') {
        this.listExamTerms();
      }
    });
  }

  onDeleteTerm(row: any) {

    row.instituteId = this.instituteId;
    row.confId = this.rowDetails.confId;

    if (globalFunctions.isEmpty(row.confId)) {
      alert('confId not found');
    } else if (globalFunctions.isEmpty(row.instituteId)) {
      alert('instituteId not found');
    } else if (globalFunctions.isEmpty(row.termExamId)) {
      alert('termExamId not found');
    } else {

      let dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px',
        height: 'auto',
        autoFocus: false
      });

      dialogRef.componentInstance.modalTitle = "Are you sure you want to delete Term Exam: Id "+row.termExamId + " ?";
      dialogRef.componentInstance.yesText = 'OK';
      dialogRef.componentInstance.noText = 'CLOSE';
      dialogRef.componentInstance.dialogRef = dialogRef;

      dialogRef.afterClosed().subscribe(result => {
        if (result == 'ok') {
          this.deleteExamTerm(row);
        }
      });
    }
  }

  deleteExamTerm(row) {

    this.allEventEmitters.showLoader.emit(true);
    this._instituteMasterService.deleteExamTerm(row).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.listExamTerms();
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
