import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import { AdmissionService } from 'app-shared-services/admission.service';
import { AtktService } from 'app-shared-services/atkt.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { environment } from 'environments/environment';

@Component({
  selector: 'download-forms',
  templateUrl: './download-forms.component.html',
  styleUrls: ['./download-forms.component.css'],
  providers: [SnackBarMsgComponent, AdmissionService, AtktService],  
  encapsulation: ViewEncapsulation.None
})
export class DownloadFormsComponent implements OnInit {

  @ViewChild('pageTable') pageTable: any;
  allData:any = [];
  tableData:any = [];
  pageColumns = [];
  pagination = {
    pageStart: 0,
    pageEnd: 0,
    limit: 5,
    totalRecords: 0,
    offset: 0,
    sortProp: '',
    sortOrder: ''
  };
  rowsPerPageArray = [5, 10, 15, 20];
  inputFilter: string;

  showEmptyBox: boolean = false;
  showEmptyBoxTxt: string = '';

  formType: string = '';

  constructor(
    private allEventEmitters: AllEventEmitters,
    public _snackBarMsgComponent: SnackBarMsgComponent, 
    private _admissionService: AdmissionService,
    private _atktService: AtktService,
  ) {

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME + 
      ' | Download Forms'
    );
  }

  ngOnInit() {

    this.formType = globalFunctions.getUserProf('formType');

    if (this.formType == 'atkt' || this.formType == 'exam') {
      this.getAtktForms();
    } else {
      this.downloadForms();
    }
  }

  getAtktForms() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._atktService.getAtktForms().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.allData = data.dataJson;
          this.tableData = data.dataJson;

          setTimeout(() => { this.pageTable.rowDetail.expandAllRows(); }, 2);

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

  downloadForms() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._admissionService.downloadForms().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.allData = data.dataJson;
          this.tableData = data.dataJson;

          setTimeout(() => { this.pageTable.rowDetail.expandAllRows(); }, 2);

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

  onInputSearch(event) {
    let filteredData = globalFunctions.updateFilter(event, this.tableData, this.allData, this.pageColumns, this.pageTable);
    this.tableData = filteredData.tableData;
    this.allData = filteredData.tempData;
    this.pageColumns = filteredData.columnsData;
    this.pageTable = filteredData.table;
  }  

  viewForm(formUrl) {
    if (!globalFunctions.isEmpty(formUrl)) {
      var win = window.open(formUrl, '_blank');
      if (win) {
        win.focus();
      } else {
        alert('Please allow popups for this website');
      }
    } else {
      alert('Form Url not found!');
    }
  }
}