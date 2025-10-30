import { Component, ViewEncapsulation, ViewChild, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl, FormGroupDirective } from '@angular/forms';

import { MatDatepicker } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';

import * as allMsgs from 'app/global/allMsgs';
import * as globalFunctions from 'app/global/globalFunctions';

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
  selector: 'app-search-block',
  templateUrl: './search-block.component.html',
  styleUrls: ['./search-block.component.css'],
  providers: [
    SnackBarMsgComponent,
    DatePipe,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},    
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}    
  ],  
  encapsulation: ViewEncapsulation.None
})
export class SearchBlockComponent implements OnInit {

  @Output() onDateRangeSearch:EventEmitter<any> = new EventEmitter();

  @ViewChild('fromDateElementFocus', { static: true }) _fromInput: ElementRef;
  @ViewChild('toDateElementFocus', { static: true }) _toInput: ElementRef;

  allMsgs: any = allMsgs;

  maxDate = new Date(2018, 1, 1);
  toDateMinDate = new Date(2018, 1, 1);

  dateRangeSearchForm: UntypedFormGroup;
  fromDate:AbstractControl;
  toDate:AbstractControl;
  dateRange = {
    fromDate: '',
    toDate: ''
  };

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,    
    public _snackBarMsgComponent: SnackBarMsgComponent
  ) { 

    this.maxDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));
    this.toDateMinDate = new Date(this.datePipe.transform(new Date(), 'yyyy, MM, dd'));    
  }

  ngOnInit() {

    this.dateRangeSearchForm = this._formBuilder.group({
      'fromDate' : [new Date(''), Validators.required], 
      'toDate' : [new Date(''), Validators.required]
    });
    this.fromDate = this.dateRangeSearchForm.controls['fromDate'];
    this.toDate = this.dateRangeSearchForm.controls['toDate'];    
  }

  _openFromDatepicker(picker: MatDatepicker<Date>) {
    picker.open();
    setTimeout(() => this._fromInput.nativeElement.focus());
  }

  _closeFromDatepicker(e) {
    setTimeout(() => this._fromInput.nativeElement.blur());
    if (!globalFunctions.isEmpty(this.dateRangeSearchForm.get("fromDate").value)) {
      let fromDate = globalFunctions.format(new Date(this.dateRangeSearchForm.get("fromDate").value), 'input');
      this.toDateMinDate = new Date(this.datePipe.transform(new Date(fromDate), 'yyyy, MM, dd'));
    }
  }

  _openToDatepicker(picker: MatDatepicker<Date>) {
    picker.open();
    setTimeout(() => this._toInput.nativeElement.focus());
  }

  _closeToDatepicker(e) {
    setTimeout(() => this._toInput.nativeElement.blur());
  }

  onSearch(values: any) {
    if (this.dateRangeSearchForm.valid) {
      let startDate = globalFunctions.format(new Date(this.dateRangeSearchForm.get("fromDate").value), 'input');
      let endDate = globalFunctions.format(new Date(this.dateRangeSearchForm.get("toDate").value), 'input');
      if (new Date(endDate) < new Date(startDate)) {
        this._snackBarMsgComponent.openSnackBar(allMsgs.WRONG_DATE_RANGE, 'x', 'error-snackbar', 5000);
      } else {
        this.dateRange.fromDate = startDate;
        this.dateRange.toDate = endDate;
        this.onDateRangeSearch.emit(this.dateRange);
      }
    }
  }

  onClear(formDirective: FormGroupDirective) {
    formDirective.resetForm();
    if (!globalFunctions.isEmpty(this.dateRange.fromDate) && !globalFunctions.isEmpty(this.dateRange.toDate)) {
      this.dateRangeSearchForm.reset();
      this.dateRange.fromDate = '';
      this.dateRange.toDate = '';
      this.onDateRangeSearch.emit(this.dateRange);
    }
  }

}
