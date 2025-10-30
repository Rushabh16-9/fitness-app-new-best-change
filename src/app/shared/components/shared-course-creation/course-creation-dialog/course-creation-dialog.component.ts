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
  selector: 'course-creation-dialog',
  templateUrl: './course-creation-dialog.component.html',
  styleUrls: ['./course-creation-dialog.component.css'],
  providers: [
    SnackBarMsgComponent,
    InstituteMasterService,
    InstitutesService,
  ],
  encapsulation: ViewEncapsulation.None
})
export class CourseCreationDialogComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;
  modalTitle: string;
  mode: string;

  courseCreationForm: FormGroup;
  institutesList = [];
  coursesList = [];
  bankAccountsArray = [];
  levelConfigurationArray = [];

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

    let adminReq:any;
    if (this.page == 'admin') {
      adminReq = Validators.required;
    }

    this.courseCreationForm = this._formBuilder.group({
      parentConfIds: [this.rowDetails.parentConfIds],
      admissionFormFees: [this.rowDetails.admissionFormFees, Validators.required],
      bankAccountId: [this.rowDetails.bankAccountId, Validators.required],
      convinienceAmount: [this.rowDetails.convinienceAmount, adminReq],
      courseTitle: [this.rowDetails.courseTitle, Validators.required],
      printName: [this.rowDetails.printName, Validators.required],
      shortName: [this.rowDetails.shortName],
      levels : this._formBuilder.array([
        this.initItemRows()
      ])
    });

    this._snackBarMsgComponent.closeSnackBar();

    this.getAllCourses();
    this.getListOfBankAccounts();
    this.getLevelConfiguration();
  }

  initItemRows() : FormGroup {
    return this._formBuilder.group({
      levelId: [null, Validators.compose([Validators.required])],      
      levelName: [null, Validators.compose([Validators.required])],      
      selectedLevel: [null, Validators.compose([Validators.required])], 
      levelValues: [null],
    });
  }

  getAllCourses() {

    this._institutesService.getAllCourses().subscribe(data => {
      if (data.status != undefined) {
        if (data.status == 1) {
          this.coursesList = data.dataJson;
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  getListOfBankAccounts() {

    this._instituteMasterService.getListOfBankAccounts(this.instituteId, 1).subscribe(data => {

      this.bankAccountsArray = [];
      if (data.status != undefined) {
        if (data.status == 1) {
          if (data.dataJson) {
            this.bankAccountsArray = data.dataJson;
          }
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    }, err => {
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  public getLevelConfiguration():void {

    this._instituteMasterService.getLevelConfiguration(this.instituteId, this.rowDetails.confId).subscribe(data => {

      if (data.status != undefined) {
        if (data.status == 1) {
          this.levelConfigurationArray = data.dataJson;
          this.setLevelValues(data.dataJson);
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

  setLevelValues(levelsArray:any) {

    const levels = <FormArray>this.courseCreationForm.controls.levels;
    levels.controls.splice(0, 1);

    levelsArray.forEach((val) => {

      const levels = <FormArray>this.courseCreationForm.controls.levels;

      let row = this._formBuilder.group({
        levelId : [val.levelId, Validators.required],
        levelName : [val.levelName, Validators.required],
        selectedLevel : [val.selectedLevel, Validators.required],
        levelValues : [val.levelValues],
      });

      levels.push(row);
    });
  }

  selectLevel(event: MatAutocompleteSelectedEvent, rowIndex): void {
    const selection = event.option.value;
    this.courseCreationForm.controls.levels['controls'][rowIndex].controls['selectedLevel'].setValue(selection, {emitEvent: false})
  }

  onLevelKeyup(eve: any, rowIndex) :void {
    let text = eve.target.value;
    let filteredValues = this.levelConfigurationArray[rowIndex]['levelValues'].filter(obj => obj.toString().toLowerCase().indexOf(text.toString().toLowerCase()) === 0);
    this.courseCreationForm.controls.levels['controls'][rowIndex].controls['levelValues'].setValue(filteredValues, {emitEvent: false})
  }  

  onSave(values:any):void {

    if (this.courseCreationForm.valid) {

      values.instituteId = this.instituteId;
      values.confId = this.rowDetails.confId;
      values.userSelectedLevels = values.levels;
      
      this.allEventEmitters.showLoader.emit(true);
      this._instituteMasterService.insertUpdateCourseDetails(values).subscribe(data => {

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
