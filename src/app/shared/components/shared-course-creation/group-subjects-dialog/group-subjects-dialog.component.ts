import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

import { CreateGroupSubjectsDialogComponent } from './create-group-subjects-dialog/create-group-subjects-dialog.component';
import { CreateLanguageGroupsDialogComponent } from './create-language-groups-dialog/create-language-groups-dialog.component';
import { ConfirmDialogComponent } from 'app-shared-components/confirm-dialog/confirm-dialog.component';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import { InstituteMasterService } from 'app-shared-services/instituteMaster.service';

import { AllEventEmitters } from 'app/global/all-event-emitters';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'group-subjects-dialog',
  templateUrl: './group-subjects-dialog.component.html',
  styleUrls: ['./group-subjects-dialog.component.css'],
  providers: [
    SnackBarMsgComponent, 
    InstituteMasterService,
  ],
  encapsulation: ViewEncapsulation.None
})
export class GroupSubjectsDialogComponent implements OnInit {

  @ViewChild('subGrpTable', { static: true }) subGrpTable: any;
  @ViewChild('langGroupsTable', { static: true }) langGroupsTable: any;

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  modalTitle: string;
  mode: string;

  rowsPerPageArray = [5, 10, 15, 20];

  subGrpData:any;
  tempSubGrpData:any;
  subGrpColumns = [];
  subGrpPage = {
    pageStart: 0,
    pageEnd: 0,    
    limit: 5,
    totalRecords: 0,
    offset: 0,
    orderBy: '',
    orderDir: ''
  };

  langGroupsData:any;
  tempLangGroupsData:any;
  langGroupscolumns = [];
  langGroupsPage = {
    pageStart: 0,
    pageEnd: 0,    
    limit: 5,
    totalRecords: 0,
    offset: 0,
    orderBy: '',
    orderDir: ''
  };

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

    this.getListOfSubjectGroups();
    this.getListOfSubjectLangGroups();
  }

  getListOfSubjectGroups() {

    this.subGrpData = [];
    this.tempSubGrpData = [];

    let postParam: any = {
      'instituteId': this.instituteId, 
      'confId': this.rowDetails.confId, 
      'clientSidePaging': true,
    };

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._instituteMasterService.getListOfSubjectGroups(postParam).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          if (data.dataJson) {

            this.tempSubGrpData = [...data.dataJson];
            this.subGrpData = data.dataJson;

            setTimeout(() => { this.subGrpTable.rowDetail.expandAllRows(); }, 2);
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

  getListOfSubjectLangGroups() {

    this.langGroupsData = [];
    this.tempLangGroupsData = [];

    let postParam: any = {
      'instituteId': this.instituteId, 
      'confId': this.rowDetails.confId, 
      'clientSidePaging': true,
    };

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._instituteMasterService.getListOfSubjectLangGroups(postParam).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          if (data.dataJson) {

            this.tempLangGroupsData = [...data.dataJson];
            this.langGroupsData = data.dataJson;

            setTimeout(() => { this.subGrpTable.rowDetail.expandAllRows(); }, 2);
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
    this.subGrpPage.offset = 0;    
    this.subGrpPage.limit = limit;
  }

  langGroupsChangeRows(limit) {
    this.langGroupsPage.offset = 0;    
    this.langGroupsPage.limit = limit;
  }

  toggleExpandRow(row) {
    this.subGrpTable.rowDetail.toggleExpandRow(row);
  }

  langGroupsToggleExpandRow(row) {
    this.langGroupsTable.rowDetail.toggleExpandRow(row);
  }

  onInputSearch(event, expandAllRows: boolean = true) {
    let updateFilterValues = globalFunctions.updateFilter(event, this.subGrpData, this.tempSubGrpData, this.subGrpColumns, this.subGrpTable, expandAllRows);
    this.subGrpData = updateFilterValues.tableData;
    this.tempSubGrpData = updateFilterValues.tempData;
    this.subGrpColumns = updateFilterValues.columnsData;
    this.subGrpTable = updateFilterValues.table;
  }

  langGroupsInputSearch(event, expandAllRows: boolean = true) {
    let updateFilterValues = globalFunctions.updateFilter(event, this.langGroupsData, this.tempLangGroupsData, this.langGroupscolumns, this.langGroupsTable, expandAllRows);
    this.langGroupsData = updateFilterValues.tableData;
    this.tempLangGroupsData = updateFilterValues.tempData;
    this.langGroupscolumns = updateFilterValues.columnsData;
    this.langGroupsTable = updateFilterValues.table;
  }

  onAddEditSubjectGroup(mode, row:any = {}) {

    let dialogRef = this.dialog.open(CreateGroupSubjectsDialogComponent, {
      panelClass: 'fullscreen-dialog',
      autoFocus: false
    });

    let modalTitle = '';
    if (mode == 'add') {
      row.subjectGroupId = 0;
      modalTitle = 'Add Subject Group';
    } else if (mode == 'edit') {
      modalTitle = 'Edit Subject Group';
    } else if (mode == 'clone') {
      modalTitle = 'Clone Subject Group';
    }

    row.confId = this.rowDetails.confId;

    dialogRef.componentInstance.instituteId = this.instituteId;
    dialogRef.componentInstance.modalTitle  = modalTitle;
    dialogRef.componentInstance.mode        = mode;
    dialogRef.componentInstance.rowDetails  = row;
    dialogRef.componentInstance.dialogRef   = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'loadPage') {
        this.getListOfSubjectGroups();
      }
    });
  }

  onDeleteSubjectGroup(row: any) {

    row.instituteId = this.instituteId;
    row.confId = this.rowDetails.confId;

    if (globalFunctions.isEmpty(row.confId)) {
      alert('confId not found');
    } else if (globalFunctions.isEmpty(row.instituteId)) {
      alert('instituteId not found');
    } else if (globalFunctions.isEmpty(row.subjectGroupId)) {
      alert('subjectGroupId not found');
    } else {

      let dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px',
        height: 'auto',
        autoFocus: false
      });

      dialogRef.componentInstance.modalTitle = "Are you sure you want to delete Subject Group: Id "+row.subjectGroupId + " ?";
      dialogRef.componentInstance.yesText = 'OK';
      dialogRef.componentInstance.noText = 'CLOSE';
      dialogRef.componentInstance.dialogRef = dialogRef;

      dialogRef.afterClosed().subscribe(result => {
        if (result == 'ok') {
          this.deleteSubjectGroup(row);
        }
      });
    }
  }

  deleteSubjectGroup(row) {

    this.allEventEmitters.showLoader.emit(true);
    this._instituteMasterService.deleteSubjectGroup(row).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.getListOfSubjectGroups();
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

  onAddEditLanguage(mode, row:any = {}) {

    let dialogRef = this.dialog.open(CreateLanguageGroupsDialogComponent, {
      panelClass: 'fullscreen-dialog',
      autoFocus: false
    });

    let modalTitle = '';
    if (mode == 'add') {
      row.subjectGroupId = 0;
      modalTitle = 'Add Language Group';
    } else if (mode == 'edit') {
      modalTitle = 'Edit Language Group';
    } else if (mode == 'clone') {
      modalTitle = 'Clone Language Group';
    }

    row.confId = this.rowDetails.confId;

    dialogRef.componentInstance.instituteId = this.instituteId;
    dialogRef.componentInstance.modalTitle  = modalTitle;
    dialogRef.componentInstance.mode        = mode;
    dialogRef.componentInstance.rowDetails  = row;
    dialogRef.componentInstance.dialogRef   = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'loadPage') {
        this.getListOfSubjectLangGroups();
      }
    });
  }

  onDeleteLangGroup(row: any) {

    row.instituteId = this.instituteId;
    row.confId = this.rowDetails.confId;

    if (globalFunctions.isEmpty(row.confId)) {
      alert('confId not found');
    } else if (globalFunctions.isEmpty(row.instituteId)) {
      alert('instituteId not found');
    } else if (globalFunctions.isEmpty(row.langGroupId)) {
      alert('langGroupId not found');
    } else {

      let dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '500px',
        height: 'auto',
        autoFocus: false
      });

      dialogRef.componentInstance.modalTitle = "Are you sure you want to delete Language Group: Id "+row.langGroupId + " ?";
      dialogRef.componentInstance.yesText = 'OK';
      dialogRef.componentInstance.noText = 'CLOSE';
      dialogRef.componentInstance.dialogRef = dialogRef;

      dialogRef.afterClosed().subscribe(result => {
        if (result == 'ok') {
          this.deleteSubjectLangGroup(row);
        }
      });
    }
  }

  deleteSubjectLangGroup(row) {

    this.allEventEmitters.showLoader.emit(true);
    this._instituteMasterService.deleteSubjectLangGroup(row).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.getListOfSubjectLangGroups();
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
