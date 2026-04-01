import { Component, ViewEncapsulation, ViewChild, ElementRef, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { HttpResponse, HttpEventType } from '@angular/common/http';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { Router } from '@angular/router';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { ImageCropperDialogComponent } from 'app-shared-components/image-cropper-dialog/image-cropper-dialog.component';
import { SubjectsInfoDialogComponent } from 'app-shared-components/subjects-info-dialog/subjects-info-dialog.component';

import { CommonService } from 'app-shared-services/common.service';
import { AdmissionService } from 'app-shared-services/admission.service';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { environment } from 'environments/environment';
import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';
import * as regexValidators from 'app/global/validator';

@Component({
  selector: 'shared-course-selection',
  styleUrls: ['shared-course-selection.component.css'],
  templateUrl: './shared-course-selection.component.html',
  providers: [
    SnackBarMsgComponent,
    CommonService, 
    AdmissionService, 
  ],
  encapsulation: ViewEncapsulation.None
})
export class SharedCourseSelectionComponent implements OnInit {

  @ViewChild('docToUploadFileInput') docToUploadFileInput: ElementRef;
  attachmentFileExt: string = "ppt, pptx, doc, docx, xls, xlsx, txt, pdf, jpg, jpeg, png";
  imageFileExt: string = "png, jpg, jpeg";
  attachmentMaxFileSize:number = 10;

  @Input('panelMode') panelMode;

  autoCompleteChipList: UntypedFormControl = new UntypedFormControl();

  allMsgs: any = allMsgs;

  finalArray = {};
  institutes = [];
  allInstitutes = [];
  institutesReverseArray = {};
  instructions = '';

  filteredInstitutes = [];
  selectedInstitutesArray = [];
  instituteDisplayData = [];

  fromInstitute: boolean = false;

  fromInstituteAdmissionClosed: boolean = false;
  admissionClosedMessage: string = 'Admissions are closed';
  
  optPayment: boolean = true;
  universityApplicationFormNoText: string = '';
  
  constructor(
    private router: Router,
    public dialog: MatDialog, 
    private allEventEmitters: AllEventEmitters,
    public _snackBarMsgComponent: SnackBarMsgComponent, 
    private _commonService: CommonService,     
    private _admissionService: AdmissionService,
    ) {

    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('instituteId'))) {
      this.fromInstitute = true;
    }
  }

  ngOnInit() {

    let userProf = globalFunctions.getUserProf();
    this.optPayment = userProf.optPayment;

    this.getListOfInstitutes();
  }

  getListOfInstitutes() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._admissionService.getListOfInstitutes().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {

        if (data.status == 1) {

          this.instructions = data.instructions;
          this.institutes = data.dataJson;
          this.allInstitutes = data.dataJson;
          this.universityApplicationFormNoText = data.universityApplicationFormNoText;

          this.institutesReverseArray = {};
          this.instituteDisplayData = [];            
          this.allInstitutes.forEach((institute, instituteIndex) => {

            if (this.fromInstitute) {
              this.fromInstituteAdmissionClosed = institute.admissionClosed;
            }

            if (institute.isSelected) {
              this.selectedInstitutesArray.push(institute);
            }

            institute.applicationNoError = false;
            institute.coursesError = false;
            institute.bunch = [];
            let loopIdx = 0;
            let courses = {};
            let instituteLevels = {};
            institute.instituteLevels.forEach((inst, index) => {

              inst.courseApplicationNo = inst.universityApplicationFormNo;
              inst.courseApplicationNoIsRequired = inst.isSelected;
              inst.courseApplicationNoError = false;
              inst.courseApplicationNoDuplError = false;
              inst.lngError = false;
              inst.grpError = false;

              inst.showDocumentUpload = false;
              inst.docReq = false;
              inst.documentUploadObj = null;
              inst.documentUrl = null;
              inst.hasUploadedDoc = false;
              inst.showDocResetBtn = false;
              inst.docError = false;
              inst.docBrowsed = false;
              inst.docUploadPercent = null;
              inst.docUploading = false;
              inst.docToUpload = null;

              if (!globalFunctions.isEmpty(inst.document)) {
                inst.showDocumentUpload = inst.document.display;                
                inst.documentUploadObj = inst.document;
                inst.docReq = inst.document.required;
                if (!globalFunctions.isEmpty(inst.document.value)) {
                  inst.hasUploadedDoc = true;
                  inst.documentUrl = inst.document.value;
                }                
              }
             
              inst.allSubjectGroups = inst.subjectGroups;
             
              inst.showSubjectGroups = false;
              if ( !globalFunctions.isEmpty(inst.allSubjectGroups) ) {
                inst.showSubjectGroups = true;
              }

              inst.showLanguageGroups = false;
              if ( !globalFunctions.isEmpty(inst.languageGroups) ) {
                inst.showSubjectGroups = false;                
                inst.showLanguageGroups = true;
                inst.languageGroups.forEach((lanGrp, lanGrpIndex) => {
                  if (lanGrp.isSelected) {
                    inst.selectedLangGroupId = lanGrp.langGroupId;
                    inst.showSubjectGroups = true;
                    inst.subjectGroups = [];
                    inst.allSubjectGroups.forEach((subGrp, subGrpIndex) => {
                      subGrp.showSubjectInfo = false;
                      if (!globalFunctions.isEmpty(subGrp.subjectList)) {
                         subGrp.showSubjectInfo = true;
                      }
                      if (subGrp.langGroupId == lanGrp.langGroupId) {
                        inst.subjectGroups.push(subGrp);
                      }
                    });
                  }
                });
              }
              courses[inst.admissionConfId] = inst.isSelected;

              if (index != 0 && index % 1 == 0) {
                loopIdx = loopIdx + 1;
              }
              if (typeof institute.bunch[loopIdx] === 'undefined') {
                institute.bunch[loopIdx] = [];
              }

              instituteLevels[inst.admissionConfId] = inst;

              institute.bunch[loopIdx].push(inst);
            });

            this.institutesReverseArray[institute.instituteId] = institute;
            this.institutesReverseArray[institute.instituteId]['courses'] = courses;
            this.institutesReverseArray[institute.instituteId]['instituteLevels'] = instituteLevels;

            this.instituteDisplayData.push(institute);              
          });

          this.filteredInstitutes = this.institutes;
         
          this.autoCompleteChipList.valueChanges.subscribe(val => {
            this.filterOptions(val);
          });

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

  filterOptions(text: string) {
    this.filteredInstitutes = this.institutes.filter(obj => obj.instituteName.toLowerCase().indexOf(text.toString().toLowerCase()) === 0);
  }

  addChip(event: MatAutocompleteSelectedEvent, input: any): void {

    this._snackBarMsgComponent.closeSnackBar();

    const selection = event.option.value;

    this.selectedInstitutesArray.push(selection);

    this.institutesReverseArray[selection.instituteId]['isSelected'] = true;

    this.institutes = this.institutes.filter(obj => obj.instituteName !== selection.instituteName);
    this.filteredInstitutes = this.institutes;

    if (input) {
      input.value = '';
    }

    setTimeout(() => {
      let element = '#instituteId-'+selection.instituteId;
    }, 3);
  }

  removeChip(chip: any): void {

    this.institutesReverseArray[chip.instituteId]['isSelected'] = false;
    this.institutesReverseArray[chip.instituteId]['applicationNoError'] = false;
    this.institutesReverseArray[chip.instituteId]['coursesError'] = false;
    this.institutesReverseArray[chip.instituteId]['universityApplicationFormNo'] = null;

    Object.keys(this.institutesReverseArray[chip.instituteId].courses).forEach(key => {
      this.institutesReverseArray[chip.instituteId].courses[key] = false;
    });

    this.institutesReverseArray[chip.instituteId].bunch.forEach((part, index, theArray) => {
      theArray[index].forEach((newpart, newindex, newtheArray) => {
        newtheArray[newindex].isSelected = false;
      });
    });

    let index = this.selectedInstitutesArray.indexOf(chip);

    if (index >= 0) {

      this.selectedInstitutesArray.splice(index, 1);

      this.institutes.push(chip);
    }
  }

  selectCollege(instituteId: number, institute: number, isChecked: boolean) {

    this._snackBarMsgComponent.closeSnackBar();

    if (isChecked) {

      this.institutesReverseArray[instituteId].isSelected = true;

      this.selectedInstitutesArray.push(institute);      

    } else {

      this.institutesReverseArray[instituteId].isSelected = false;
      this.institutesReverseArray[instituteId].applicationNoError = false;
      this.institutesReverseArray[instituteId].coursesError = false;

      let index = this.selectedInstitutesArray.indexOf(institute);
      if (index >= 0) {
        this.selectedInstitutesArray.splice(index, 1);
      }
    }
  }

  onSelectCourse(institute: any, admissionConfId: number, checked: boolean) {

    let instituteId = institute.instituteId;

    this._snackBarMsgComponent.closeSnackBar();
    this.institutesReverseArray[instituteId]['coursesError'] = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].courseApplicationNoDuplError = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].courseApplicationNoError = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].docError = false;

    this.institutesReverseArray[instituteId]['courses'][admissionConfId] = checked;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].isSelected = checked;

    if (this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].showSubjectGroups && !checked) {

      this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].subjectGroups.forEach((grp, index) => {
        grp.isSelected = false;
      });
    }
  }

  onSelectRadioCourse(institute: any, admissionConfId: number) {

    let instituteId = institute.instituteId;

    this._snackBarMsgComponent.closeSnackBar();
    this.institutesReverseArray[instituteId]['coursesError'] = false;

    Object.keys(this.institutesReverseArray[instituteId].instituteLevels).forEach(keyAdmissionConfId => {
      this.institutesReverseArray[instituteId].instituteLevels[keyAdmissionConfId].docError = false;
      this.institutesReverseArray[instituteId].instituteLevels[keyAdmissionConfId].courseApplicationNoDuplError = false;
      this.institutesReverseArray[instituteId].instituteLevels[keyAdmissionConfId].courseApplicationNoError = false;
      this.institutesReverseArray[instituteId].instituteLevels[keyAdmissionConfId].isSelected = false;
      this.institutesReverseArray[instituteId]['courses'][keyAdmissionConfId] = false;
      if (admissionConfId == parseInt(keyAdmissionConfId)) {
        this.institutesReverseArray[instituteId]['courses'][keyAdmissionConfId] = true;
        this.institutesReverseArray[instituteId].instituteLevels[keyAdmissionConfId].isSelected = true;
      }
    });
  }

  onSelectLanguage(langGroupId: number, institute:any, admissionConfId: number) {

    let instituteId = institute.instituteId;

    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].languageGroups.forEach((langGrp, index) => {
      langGrp.isSelected = false;
      if (langGrp.langGroupId == langGroupId ) {
        langGrp.isSelected = true;
      }
    });

    this._snackBarMsgComponent.closeSnackBar();
    this.institutesReverseArray[instituteId]['coursesError'] = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].lngError = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].grpError = false;

    let selectCourse = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].showSubjectGroups = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].subjectGroups = [];
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].allSubjectGroups.forEach((subGrp, index) => {
      subGrp.isSelected = false;
      if (subGrp.langGroupId == langGroupId) {
        this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].showSubjectGroups = true;
        this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].subjectGroups.push(subGrp);
      }
    });
  }

  selectGrp(instituteId: number, admissionConfId: number, sg, checked: boolean) {

    this._snackBarMsgComponent.closeSnackBar();
    this.institutesReverseArray[instituteId]['coursesError'] = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].grpError = false;

    let selectCourse = true;

    if ( !globalFunctions.isEmpty(this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].subjectGroups) ) {

      this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].subjectGroups[sg].isSelected = checked;
      if (this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].subjectGroups.length > 1) {

        let sectd = 0;
        this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].subjectGroups.forEach((grp, index) => {
          if (grp.isSelected) {
            sectd++;
          }
        });

        if (sectd == 0) {
          selectCourse = false;
        }
      } else {
        selectCourse = checked;
      }

      this.setCourseSelected(instituteId, admissionConfId, selectCourse);
    }
  }

  selectRadioGrp(instituteId: number, admissionConfId: number, subjectGroupId:number, sgIndex:number) {

    this._snackBarMsgComponent.closeSnackBar();
    this.institutesReverseArray[instituteId]['coursesError'] = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].grpError = false;

    let selectCourse = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].subjectGroups.forEach((subGrp, index) => {
      subGrp.isSelected = false;
      if (sgIndex == index) {
        subGrp.isSelected = true;
        selectCourse = true;
      }
    });

    this.setCourseSelected(instituteId, admissionConfId, selectCourse);
  }

  setCourseSelected(instituteId, admissionConfId, selectCourse) {

    if (this.institutesReverseArray[instituteId].showCoursesInRadio) {

      Object.keys(this.institutesReverseArray[instituteId].instituteLevels).forEach(keyAdmissionConfId => {

        this.institutesReverseArray[instituteId].instituteLevels[keyAdmissionConfId].isSelected = false;
        this.institutesReverseArray[instituteId]['courses'][keyAdmissionConfId] = false;
        if (admissionConfId == parseInt(keyAdmissionConfId)) {
          this.institutesReverseArray[instituteId]['courses'][keyAdmissionConfId] = true;
          this.institutesReverseArray[instituteId].instituteLevels[keyAdmissionConfId].isSelected = true;
        }
      });

    } else {

      this.institutesReverseArray[instituteId]['courses'][admissionConfId] = selectCourse;
      this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].isSelected = selectCourse;
    }
  }

  onEduDocReadFile(event:any, instituteId, admissionConfId:number) {

    this._snackBarMsgComponent.closeSnackBar();

    if (event.target.files && event.target.files[0]) {

      let file = event.target.files[0];
      let ext = file.name.toLowerCase().split('.').pop() || file.name;

      if (!globalFunctions.isValidFileExtension(file, this.attachmentFileExt)) {

        this._snackBarMsgComponent.openSnackBar(ext + " file extension is not valid, Valid extensions are: ( " + this.attachmentFileExt + " )", 'x', 'error-snackbar');

        this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].docBrowsed = false;

      } else if (!globalFunctions.isValidFileSize(file, this.attachmentMaxFileSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.attachmentMaxFileSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');

        this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].docBrowsed = false;

      } else {

        let postParam = {
          'instituteId': instituteId,
          'admissionConfId': admissionConfId,
        }

        if (ext == 'png' || ext == 'jpeg' || ext == 'jpg') {

          this.openImageCropperDialog(event, postParam);

        } else {

          this.browsedEduDocData(file, postParam);
        }
      }
    }
  }

  removeEduDocFile(instituteId, admissionConfId) {

    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].docError = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].docBrowsed = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].docToUpload = null;

    if (!globalFunctions.isEmpty(this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].documentUrl)) {
      this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].showDocResetBtn = true
    }
  }

  removeUploadedEduDocFile(instituteId, admissionConfId) {

    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].hasUploadedDoc = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].docBrowsed = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].showDocResetBtn = true;
  }

  onResetEduDocFile(instituteId:number, admissionConfId:number) {
    
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].showDocResetBtn = false;
    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].hasUploadedDoc = true;
  }

  browsedEduDocData(data, postParam:any) {

    this.institutesReverseArray[postParam.instituteId].instituteLevels[postParam.admissionConfId].docError = false;
    this.institutesReverseArray[postParam.instituteId].instituteLevels[postParam.admissionConfId].docBrowsed = true;
    this.institutesReverseArray[postParam.instituteId].instituteLevels[postParam.admissionConfId].showDocResetBtn = false;

    this.uploadFile(data, postParam);
  }  

  openImageCropperDialog(imageEvent, postParam:any) {

    let dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      height: '550px',
      minHeight: '400px',
      width: '500px',
    });

    dialogRef.componentInstance.modalTitle = 'Crop Document';
    dialogRef.componentInstance.imageEvent = imageEvent;

    const sub = dialogRef.componentInstance.onOk.subscribe((data:any) => {

      let file = imageEvent.target.files[0];

      let _this = this;
      this.urltoFile(data.base64, file.name, 'image/png').then(function(file) {
        _this.browsedEduDocData(file, postParam);
      });
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  urltoFile(url, filename, mimeType){
  
    return (fetch(url)
      .then(function(res){return res.arrayBuffer();})
      .then(function(buf){return new File([buf], filename, {type:mimeType});})
    );
  }    

  uploadFile(file, postVal:any) {
    
    this.institutesReverseArray[postVal.instituteId].instituteLevels[postVal.admissionConfId].docUploading = true;
  
    let postParam: any = {
      'fileFormat': 'documents',
    }

    this.allEventEmitters.showLoader.emit(true);
    this._commonService.uploadFile(file, postParam).subscribe(event => {

      if (event.type === HttpEventType.UploadProgress) {

        let perc = Math.round(100 * event.loaded / event.total);
        
        this.institutesReverseArray[postVal.instituteId].instituteLevels[postVal.admissionConfId].docUploadPercent = perc;

      } else if (event instanceof HttpResponse) {

        this.institutesReverseArray[postVal.instituteId].instituteLevels[postVal.admissionConfId].docUploading = false;
        
        let data = event.body;

        this.allEventEmitters.showLoader.emit(false);

        if (data.status != undefined) {
          
          if ((data.status == 1) && (!globalFunctions.isEmpty(data.dataJson.fileNames))) {

            data.dataJson.fileNames.forEach((fileName) => {
              this.institutesReverseArray[postVal.instituteId].instituteLevels[postVal.admissionConfId].docToUpload = fileName;
            });

            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);
         
          } else if (data.status == 0) {

            this.institutesReverseArray[postVal.instituteId].instituteLevels[postVal.admissionConfId].docBrowsed = false;

            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
          }
        } else {
          this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
        }
      }
    }, err => {
      this.allEventEmitters.showLoader.emit(false);
      this._snackBarMsgComponent.openSnackBar(allMsgs.SOMETHING_WRONG, 'x', 'error-snackbar', 5000);
    });
  }  

  viewDoc(docUrl) {
    if (!globalFunctions.isEmpty(docUrl)) {
      var win = window.open(docUrl, '_blank');
      if (win) {
        win.focus();
      } else {
        alert('Please allow popups for this website');
      }
    } else {
      alert('Doc Url not found!');
    }
  }  
  
  onSubmit() {
    let returnVal = this.validateForm();

    if (!returnVal.submitErr) {
      if (this.optPayment) {
        this.addToCart();
      } else {
        this.directFormGenerate();
      }
    }
  }

  validateForm() {

    this._snackBarMsgComponent.closeSnackBar();

    this.finalArray = {};
    let submitErr = false;
    let uploadErr = false;
    if (globalFunctions.isEmpty(this.selectedInstitutesArray)) {

      this._snackBarMsgComponent.openSnackBar(allMsgs.INSTITUTES_NOT_SELECTED, 'x', 'error-snackbar', 5000);

    } else {

      let inputErrorCnt: number = 0;
      let grpErrorCnt: number = 0;
      let checkedErrorCnt: number = 0;
      let courseApplicationNoArray = [];
      let checkedSubject: number = 0;
      let subjectCount: number = 0;
      let checkedSubjectErr = '';

      Object.keys(this.institutesReverseArray).forEach(key => {
        const institute = this.institutesReverseArray[key];

        if (institute.isSelected == true) {

          institute.coursesError = true;
          let finalAdmissionConfIds = [];
          let admissionConfIds = {};
          checkedErrorCnt = 0;
          Object.keys(institute.courses).forEach(function(admissionConfId) {

            const checked = institute.courses[admissionConfId];
            if (checked) {
              checkedErrorCnt++;
              institute.coursesError = false;

              let course = institute.instituteLevels[admissionConfId];

              if (course.showDocumentUpload && course.docReq && globalFunctions.isEmpty(course.docToUpload) && course.hasUploadedDoc == false) {
                course.docError = true;
                uploadErr = true;
              }

              course.courseApplicationNoError = false;
              course.courseApplicationNoDuplError = false;
              if ( (institute.showMkclNo) && (institute.mkclCompulsion) && (course.isSelected) ) {
                if ( globalFunctions.isEmpty(course.courseApplicationNo) ) {
                  inputErrorCnt++;
                  course.courseApplicationNoError = true;
                } else {
                  if (courseApplicationNoArray.includes(course.courseApplicationNo)) {
                    inputErrorCnt++;
                    course.courseApplicationNoDuplError = true;
                  } else {
                    courseApplicationNoArray.push(course.courseApplicationNo);
                  }
                }
              }

              course.grpError = false;
              let subjectGroupIds = [];              
              if ( !globalFunctions.isEmpty(course.subjectGroups) ) {

                let grpSelected = 0;
                course.subjectGroups.forEach((grp, index) => {
                  if (grp.isSelected) {
                    subjectGroupIds.push(grp.subjectGroupId);
                    grpSelected++;
                    checkedSubject++;
                  }
                });

                if (grpSelected == 0) {
                  course.grpError = true;
                  grpErrorCnt++;
                }
              }

              course.lngError = false;
              let langGroupId = 0;              
              if ( !globalFunctions.isEmpty(course.languageGroups) ) {

                let grpSelected = 0;
                course.languageGroups.forEach((grp, index) => {
                  if (grp.isSelected) {
                    langGroupId = grp.langGroupId;
                    grpSelected++;
                  }
                });

                if (grpSelected == 0) {
                  course.lngError = true;
                  grpErrorCnt++;
                }
              }

              let admissionConfIdValues = {};
              admissionConfIdValues['docToUpload'] = course.docToUpload;
              admissionConfIdValues['universityApplicationFormNo'] = course.courseApplicationNo;
              admissionConfIdValues['langGroupId'] = langGroupId;
              admissionConfIdValues['subjectGroupIds'] = subjectGroupIds;

              admissionConfIds[admissionConfId] = admissionConfIdValues;
             
              if(course.validateSubjectGroupMaxSelectionCount == true){
                if(course.subjectGroupMinSelectionCount > checkedSubject){
                  checkedSubjectErr = 'min';
                  subjectCount      = course.subjectGroupMinSelectionCount;
                }else if(course.subjectGroupMaxSelectionCount < checkedSubject){
                  checkedSubjectErr = 'max';
                  subjectCount      = course.subjectGroupMaxSelectionCount;
                }
              }
            }
        
          });
          
          this.finalArray[institute.instituteId] = {};
          this.finalArray[institute.instituteId]['universityApplicationFormNo'] = institute.universityApplicationFormNo;
          this.finalArray[institute.instituteId]['admissionConfIds'] = admissionConfIds;
        }
      });

      if (checkedErrorCnt == 0 || inputErrorCnt > 0 || grpErrorCnt > 0 || uploadErr) {
        this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
        submitErr = true;
      }

      if(checkedSubjectErr != ''){
        if(checkedSubjectErr == 'min'){
          this._snackBarMsgComponent.openSnackBar('Please select minimum '+subjectCount+' subject', 'x', 'error-snackbar', 5000);
        }else if(checkedSubjectErr == 'max'){
          this._snackBarMsgComponent.openSnackBar('Please select maximum '+subjectCount+' subject', 'x', 'error-snackbar', 5000);
        }
       
        submitErr = true;
      }
      
      let postParam: any = {
        'submitErr': submitErr,
        'finalArray': this.finalArray,
      };

      return postParam;
    }
  }

  addToCart() {

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.addToCart(this.finalArray).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {

        if (data.status == 1) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);

          this.router.navigate(['/cart']);

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

  directFormGenerate() {

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.directFormGenerate(this.finalArray).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {

        if (data.status == 1) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);

          this.router.navigate(['/downloadForms']);

        } else if (data.status == 101) {

            globalFunctions.setUserProf('applicantId', data.dataJson.newApplicantId);

            this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

            this.router.navigate(['/admissionForm']);

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

  updateApplicationNo(applicationNo: any, instituteId: number) {

    this.institutesReverseArray[instituteId]['universityApplicationFormNo'] = applicationNo;
    if (!globalFunctions.isEmpty(applicationNo)) {    
      this.institutesReverseArray[instituteId]['applicationNoError'] = false;
    } else {
      this.institutesReverseArray[instituteId]['applicationNoError'] = true;
    }
  }

  updateCourseApplicationNo(val: any, admissionConfId: number, instituteId: number) {

    this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].courseApplicationNo = val;

    let isSelected = this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].isSelected;

    if ( (isSelected) && (globalFunctions.isEmpty(val)) ) {

      this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].courseApplicationNoError = true;

    } else {

      this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].courseApplicationNoError = false;
      this.institutesReverseArray[instituteId].instituteLevels[admissionConfId].courseApplicationNoDuplError = false;
    }
  }

  isEmptyObject(obj: any) {
    if (globalFunctions.isEmpty(obj)) {
      return true;
    } else {
      return false;
    }
  }

  onOpenSubjectInfo(subGrp:any = {}) {

    let dialogRef = this.dialog.open(SubjectsInfoDialogComponent, {
      width: '600px',
      height: 'auto',
      autoFocus: false
    });

    dialogRef.componentInstance.modalTitle = subGrp.subjectGroupName;
    dialogRef.componentInstance.subGrp     = subGrp;
    dialogRef.componentInstance.dialogRef  = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'loadPage') {

      }
    });
  }


}