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
  selector: 'create-group-subjects-dialog',
  templateUrl: './create-group-subjects-dialog.component.html',
  styleUrls: ['./create-group-subjects-dialog.component.css'],
  providers: [
    SnackBarMsgComponent,
    InstituteMasterService,
    InstitutesService,
  ],
  encapsulation: ViewEncapsulation.None
})
export class CreateGroupSubjectsDialogComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;
  modalTitle: string;
  mode: string;

  showLanguageSelection:boolean = false;

  filteredSubjectList = [];
  subjectListArray = [];
  examTerms = [];
  examTypes = [];
  langGroupsData = [];

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

    this._snackBarMsgComponent.closeSnackBar();

    this.createTermForm = this._formBuilder.group({
      subjectGroupName: [this.rowDetails.subjectGroupName, Validators.required],
      langGroupIds: [this.rowDetails.langGroupIds],
      subjectList : this._formBuilder.array([
        this.initItemRows()
      ])
    });

    if (this.mode == 'edit' || this.mode == 'clone') {
      this.setSubjectList();
    }

    this.getAllSubjects();
    this.listExamTerms();
    this.getExamTypes();
    this.getListOfSubjectLangGroups();
  }

  getListOfSubjectLangGroups() {

    this.langGroupsData = [];
    this.showLanguageSelection = false;
    const langGroupIds = this.createTermForm.controls.langGroupIds;

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
          if ( !globalFunctions.isEmpty(data.dataJson) ) {
            this.showLanguageSelection = true;
            this.langGroupsData = data.dataJson;
            langGroupIds.setValidators([Validators.required]);
          } else {
            langGroupIds.clearValidators();            
          }
          langGroupIds.updateValueAndValidity();          
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

  initItemRows() : FormGroup {
    return this._formBuilder.group({
      subjectCode: [null, Validators.required],
      subjectName: [null, Validators.required],
      termExamIds: [null, Validators.required],
      examTypeIds: [null]
    });
  }

  setSubjectList() {

    const itemRows = <FormArray>this.createTermForm.controls.subjectList;
    itemRows.controls.splice(0, 1);

    this.rowDetails.subjectList.forEach((val) => {

      const itemRows = <FormArray>this.createTermForm.controls.subjectList;

      let row = this._formBuilder.group({
        subjectCode : [val.subjectCode, Validators.required],
        subjectName : [val.subjectName, Validators.required],
        termExamIds : [val.termExamIds, Validators.required],
        examTypeIds : [val.examTypeIds]
      });

      itemRows.push(row);
    });
  }

  public getAllSubjects():void {

    this._instituteMasterService.getAllSubjects().subscribe(data => {

      if (data.status != undefined) {
        if (data.status == 1) {
          this.subjectListArray = data.dataJson;
          this.filteredSubjectList = data.dataJson;
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

  listExamTerms() {

    let postParam: any = {
      'instituteId': this.instituteId, 
      'confId': this.rowDetails.confId, 
      'clientSidePaging': true,
    };

    this._instituteMasterService.listExamTerms(postParam).subscribe(data => {

      if (data.status != undefined) {
        if (data.status == 1) {
          if (data.dataJson) {
            this.examTerms = data.dataJson;
          }
        } else if (data.status == 0) {
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  public getExamTypes():void {

    this._instituteMasterService.getExamTypes().subscribe(data => {

      if (data.status != undefined) {
        if (data.status == 1) {
          this.examTypes = data.dataJson;
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

  onSubjectKeyup(eve: any) :void {
    let text = eve.target.value;
    this.filteredSubjectList = this.subjectListArray.filter(obj => obj.subjectName.toString().toLowerCase().indexOf(text.toString().toLowerCase()) === 0);
  }

  selectSubject(event: MatAutocompleteSelectedEvent, rowIndex): void {
    const selection = event.option.value;
    this.createTermForm.controls.subjectList['controls'][rowIndex].controls['subjectName'].setValue(selection.subjectName, {emitEvent: false})
  }

  addNewRow() : void {
    const control = <FormArray>this.createTermForm.controls.subjectList;
    control.push(this.initItemRows());
    this.filteredSubjectList = this.subjectListArray;
  }

  deleteRow(i : number) : void {
    const control = <FormArray>this.createTermForm.controls.subjectList;
    control.removeAt(i);
  }

  onSave(values:any):void {

    if (this.createTermForm.valid) {

      if (this.mode == 'edit') {
        values.subjectGroupId = this.rowDetails.subjectGroupId;
      }

      values.instituteId = this.instituteId;
      values.confId = this.rowDetails.confId;
      values.subjectGroupName = values.subjectGroupName;
      values.langGroupIds = values.langGroupIds;
      values.subjectList = values.subjectList;

      this.allEventEmitters.showLoader.emit(true);
      this._instituteMasterService.createUpdateSubjectGroup(values).subscribe(data => {
   
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
