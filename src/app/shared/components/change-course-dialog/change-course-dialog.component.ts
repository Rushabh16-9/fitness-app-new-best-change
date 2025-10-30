import { Component, OnInit, ViewEncapsulation, EventEmitter, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { AllEventEmitters } from 'app/global/all-event-emitters';

import { AtktService } from 'app-shared-services/atkt.service';
import { InstitutesService } from 'app-shared-services/institutes.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

@Component({
  selector: 'change-course-dialog',
  templateUrl: './change-course-dialog.component.html',
  styleUrls: ['./change-course-dialog.component.css'],
  providers: [SnackBarMsgComponent, AtktService, InstitutesService],
  encapsulation: ViewEncapsulation.None  
})
export class ChangeCourseDialogComponent implements OnInit {

  mode: string;
  modalTitle: string;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  onOk = new EventEmitter();
  coordinates = {x:0};

  showStudentSelection:boolean = false;
  academicInfoForm: UntypedFormGroup;
  studentsArray = [];
  coursesArray = [];
  examsArray = [];
  subjectGroupsArray = [];
  showSubjectGroup:boolean = false;
  
  instituteId: number = 0;
  userId: number = 0;
  mobileNo: number = 0;
  formPolicyId: number = 0;
  formType: string = '';

  constructor(
    private _formBuilder: UntypedFormBuilder,    
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private allEventEmitters: AllEventEmitters, 
    private _atktService: AtktService, 
    private _institutesService: InstitutesService,    
    @Inject(MAT_DIALOG_DATA) public dialogRef: any
  ) { }

  ngOnInit() {

    let userProf = globalFunctions.getUserProf();
    this.instituteId = userProf.instituteId;
    this.userId = userProf.userId;
    this.mobileNo = userProf.mobileNo;
    this.formPolicyId = userProf.formPolicyId;
    this.formType = userProf.formType;

    this._snackBarMsgComponent.closeSnackBar();

    this.createAcademicInfoFormControls();
    this.getUserStudentsList();
  }

  createAcademicInfoFormControls() {
    this.academicInfoForm = this._formBuilder.group({
      studentId : [null, Validators.required],      
      confId : [null, Validators.required],      
      termExamId : [null, Validators.required],
      subjectGroupId : [null],
    });
  }

  getUserStudentsList():void {

    let postParam = {
      userId: this.userId,
      instituteId: this.instituteId,
      mobileNo: this.mobileNo,
      formPolicyId: this.formPolicyId,
    }

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._atktService.getUserStudentsList(postParam).subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1 && data.dataJson) {
          if (data.dataJson.length == 1) {
            this.getStudentsCourses(data.dataJson[0].studentId);
            this.academicInfoForm.controls['studentId'].setValue(data.dataJson[0].studentId, {emitEvent: false});
          } else {
            this.showStudentSelection = true;
            this.studentsArray = data.dataJson;
          }
        } else {
          this.getStudentsCourses(0);
          this.academicInfoForm.controls['studentId'].setValue(0, {emitEvent: false});
        }
      } else {
        this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
      }
    },err => {
      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }

  getStudentsCourses(studentId):void {

    let postParam = {
      studentId: studentId,
      instituteId: this.instituteId,
      formType: this.formType,
    }

    this.allEventEmitters.showLoader.emit(true);
    this._atktService.getStudentsCourses(postParam).subscribe(data => {
    
      this.allEventEmitters.showLoader.emit(false);
    
      if (data.status != undefined) {
        if (data.status == 1) {
          this.coursesArray = data.dataJson.courses;
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

  getCourseExams(confId):void {

    this.allEventEmitters.showLoader.emit(true);
    this._atktService.getCourseExams(confId, this.instituteId).subscribe(data => {
    
      this.allEventEmitters.showLoader.emit(false);
    
      if (data.status != undefined) {
        if (data.status == 1) {
          this.examsArray = data.dataJson.examTerms;
          this.subjectGroupsArray = data.dataJson.subjectGroups;
          if (!globalFunctions.isEmpty(data.dataJson.subjectGroups)) {
            this.subjectGroupsArray = data.dataJson.subjectGroups;
            this.showSubjectGroup = true;
          }
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

  public onAcademicInfoSubmit(values:any):void {
    if (this.academicInfoForm.valid) {
      globalFunctions.setUserProf('studentId', this.academicInfoForm.get("studentId").value);
      globalFunctions.setUserProf('confId', this.academicInfoForm.get("confId").value);
      globalFunctions.setUserProf('termExamId', this.academicInfoForm.get("termExamId").value);
      globalFunctions.setUserProf('subjectGroupId', this.academicInfoForm.get("subjectGroupId").value);
      this.dialogRef.close('loadPage');
    }
  }  

  onCloseClick(): void {
    this.dialogRef.close();
  }

}
