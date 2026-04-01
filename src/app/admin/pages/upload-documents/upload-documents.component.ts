import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SnackBarMsgComponent } from 'app-shared-components/snack-bar-msg/snack-bar-msg.component';
import { ConfirmDialogComponent } from 'app-shared-components/confirm-dialog/confirm-dialog.component';

import { ImageCropperDialogComponent } from 'app-shared-components/image-cropper-dialog/image-cropper-dialog.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DocumentUploadDialogComponent } from 'app/shared/components/document-upload-dialog/document-upload-dialog.component';

import { AdmissionService } from 'app-shared-services/admission.service';
import { AtktService } from 'app-shared-services/atkt.service';

import * as globalFunctions from 'app/global/globalFunctions';
import * as allMsgs from 'app/global/allMsgs';

import { AllEventEmitters } from 'app/global/all-event-emitters';
import { environment } from 'environments/environment';

@Component({
  selector: 'upload-documents',
  styleUrls: ['upload-documents.component.css'],
  templateUrl: './upload-documents.component.html',
  providers: [
    SnackBarMsgComponent,
    AdmissionService,
    AtktService,
  ]
})
export class UploadDocumentsComponent implements OnInit {

  allMsgs: any = allMsgs;
  globalFunctions: any = globalFunctions;

  fromInstitute: boolean = false;
  headerImage: string = '';
  panelMode: string = '';
  isMobile: any = false;
  documentsForm: UntypedFormGroup;
  documentsFormValues = [];
  defaultPdfImage = '../assets/images/users/default-pdf.png';
  defaultDocImage = '../assets/images/users/default-doc.jpg';

  allDocuments = [];
  documentsBunch = [];
  maxSize: number = 2;
  fileExt: string = "JPG, JPEG, PNG";
  docFileExt: string = "JPG, JPEG, PNG, PDF";

  formType: any = '';
  documentsUpload: any = true;
  courseSelection: any = true;
  optPayment: boolean = true;

  constructor(
    public dialog: MatDialog,
    private _formBuilder: UntypedFormBuilder,
    private allEventEmitters: AllEventEmitters,
    public _snackBarMsgComponent: SnackBarMsgComponent,
    private router: Router,
    private _admissionService: AdmissionService,
    private _atktService: AtktService,
  ) {

    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('instituteId'))) {
      this.headerImage = globalFunctions.getUserProf('headerImage');
      this.fromInstitute = true;
    }

    let userProf = globalFunctions.getUserProf();
    this.formType = userProf.formType;
    this.documentsUpload = userProf.documentsUpload;
    this.courseSelection = userProf.courseSelection;
    this.optPayment = userProf.optPayment;

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME +
      ' | Upload Documents'
    );
  }

  ngOnInit() {

    this.panelMode = globalFunctions.getLocalStorage('panelMode');
    this.isMobile = globalFunctions.getLocalStorage('isMobile', 'JsonParse');
    this.documentsFormControls();
    if (this.formType == 'atkt' || this.formType == 'exam') {
      this.getAtktUploadedDocuments();
    } else {
      this.getUploadedDocuments();
    }
  }

  getUploadedDocuments() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._admissionService.getUploadedDocuments().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.setDocumentsValues(data.dataJson);
        } else if (data.status == 102) {
          this.router.navigate(['/cart']);
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
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

  getAtktUploadedDocuments() {

    setTimeout(() => { this.allEventEmitters.showLoader.emit(true); }, 1);
    this._atktService.getUploadedDocuments().subscribe(data => {

      setTimeout(() => { this.allEventEmitters.showLoader.emit(false); }, 2);

      if (data.status != undefined) {
        if (data.status == 1) {
          this.setDocumentsValues(data.dataJson);
        } else if (data.status == 102) {
          this.router.navigate(['/cart']);
          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);
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

  documentsFormControls() {
    this.documentsForm = this._formBuilder.group({
      bunch: this._formBuilder.array([]),
      documents: this._formBuilder.array([
        this.documentsRows()
      ])
    });
  }

  documentsRows(): UntypedFormGroup {
    return this._formBuilder.group({
      breakRow: [false],
      docId: [null],
      docTitle: [null],
      note: [null],
      docError: [false],
      isBrowsed: [false],
      isUploaded: [false],
      hasPhoto: [null],
      docToUpload: [null],
      required: [false],
      uploadedFile: [null]
    });
  }

  setDocumentsValues(documentsData: any) {

    if (!globalFunctions.isEmpty(documentsData)) {

      this.documentsForm = this._formBuilder.group({
        bunch: this._formBuilder.array([]),
        documents: this._formBuilder.array([
          this.documentsRows()
        ])
      });

      const documents = <UntypedFormArray>this.documentsForm.controls.documents;
      documents.controls.splice(0, 1);

      let loopIdx = 0;
      this.allDocuments = [];
      this.documentsBunch = [];
      documentsData.forEach((itemRow, index) => {

        const documents = <UntypedFormArray>this.documentsForm.controls.documents;

        let isRequired: any;
        if (itemRow.required) {
          isRequired = Validators.required;
        }

        let isUploaded = false;
        let hasPhoto = null;
        if (itemRow.uploadedFile) {
          isUploaded = true;
          let extension = itemRow.uploadedFile.split('.').pop();
          hasPhoto = itemRow.uploadedFile;
          if (extension == 'pdf') {
            hasPhoto = this.defaultPdfImage;
          }
        }

        let breakRow = false;
        if (index != 0 && index % 2 == 0) {
          loopIdx = loopIdx + 1;
          breakRow = true;
        }

        if (typeof this.documentsBunch[loopIdx] === 'undefined') {
          breakRow = true;
          this.documentsBunch[loopIdx] = [];
        }

        let row = this._formBuilder.group({
          breakRow: [breakRow],
          docId: [itemRow.docId],
          docTitle: [itemRow.docTitle],
          note: [itemRow.note],
          required: [itemRow.required],
          uploadedFile: [itemRow.uploadedFile],
          docError: [false],
          isBrowsed: [false],
          isUploaded: [isUploaded],
          hasPhoto: [hasPhoto, isRequired],
          docToUpload: [null]
        });

        documents.push(row);
        this.documentsBunch[loopIdx].push(row);
        this.allDocuments.push(row);
      });
    }
  }

  docBunchUrl(event: any, docIndex = 0, bunchIndex = 0) {

    this._snackBarMsgComponent.closeSnackBar();

    if (event.target.files && event.target.files[0]) {

      let file = event.target.files[0];
      let ext = file.name.toUpperCase().split('.').pop() || file.name;

      const documents = this.allDocuments[docIndex];

      if (!globalFunctions.isValidFileExtension(file, this.docFileExt)) {

        this._snackBarMsgComponent.openSnackBar(ext + " file extension is not valid, Valid extensions are: ( " + this.fileExt + " )", 'x', 'error-snackbar');
        documents['controls'].isBrowsed.setValue(false);

      } else if (!globalFunctions.isValidFileSize(file, this.maxSize)) {

        let fileSizeinMB = file.size / (1024 * 1000);
        let size = Math.round(fileSizeinMB * 100) / 100;

        this._snackBarMsgComponent.openSnackBar(file.name + ":exceed file size limit of " + this.maxSize + "MB ( " + size + "MB )", 'x', 'error-snackbar');
        documents['controls'].isBrowsed.setValue(false);

      } else {

        // Open Gemini AI Verification Dialog for ALL file types (PDF and images)
        const docTitle = this.allDocuments[docIndex]?.controls?.docTitle?.value || '';
        const docId = this.allDocuments[docIndex]?.controls?.docId?.value;

        const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
          width: '600px',
          disableClose: true,
          data: {
            document_name: docTitle,
            document_id: docId,
            file: file
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result && result.success) {
            const verifiedFile = result.file || file;
            const resolvedExt = (verifiedFile?.name || '').toUpperCase().split('.').pop() || ext;
            const normalizedDocTitle = (docTitle || '').toLowerCase().replace(/\s+/g, ' ').trim();
            const isMarksheetDoc = /\b(marksheet|mark\s*sheet|ssc|hsc|semester|sem|diploma|degree|10th|12th)\b/.test(normalizedDocTitle);
            // Any document that is not a marksheet type is verification-only
            const isVerificationOnlyDoc = !isMarksheetDoc;

            if (resolvedExt.toUpperCase() === 'PDF' || isVerificationOnlyDoc) {
              this.browsedDocData(verifiedFile, docIndex, bunchIndex, resolvedExt);
            } else {
              this.openImageCropperDialog(event, 'documents', docIndex, bunchIndex);
            }
          } else {
            // Rejected or cancelled — reset the file input
            documents['controls'].isBrowsed.setValue(false);
            event.target.value = '';
          }
        });
      }
    }
  }

  browsedDocData(data, docIndex, bunchIndex, ext = '') {

    const documents = this.allDocuments[docIndex];
    const fileObj: any = (data && data[0]) ? data[0] : data;
    documents['controls'].docError.setValue(false);
    documents['controls'].isBrowsed.setValue(true);
    documents['controls'].docToUpload.setValue(fileObj);

    let postData = {
      docId: documents['controls'].docId.value,
      docValue: fileObj
    }

    if (ext == 'PDF') {

      documents['controls'].hasPhoto.setValue(this.defaultPdfImage);

      if (this.formType == 'atkt' || this.formType == 'exam') {
        this.uploadAtktPdf(postData, docIndex);
      } else {
        this.uploadPdf(postData, docIndex);
      }

    } else {

      documents['controls'].hasPhoto.setValue(data);

      if (this.formType == 'atkt' || this.formType == 'exam') {
        this.uploadAtktDocImage(postData, docIndex);
      } else {
        this.uploadDocImage(postData, docIndex);
      }
    }
  }

  uploadPdf(values: any, docIndex = 0) {

    let file: File = values.docValue;
    if (!file && values.docValue && values.docValue[0]) {
      file = values.docValue[0];
    }
    if (!file) {
      this.allEventEmitters.showLoader.emit(false);
      this._snackBarMsgComponent.openSnackBar('Invalid file data. Please re-upload document.', 'x', 'error-snackbar', 5000);
      return;
    }

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.uploadPdf(file, values.docId, this.panelMode).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          const uploadedDocRef = data?.dataJson?.uploadedFile || data?.dataJson?.fileUrl || data?.dataJson?.fileName || '';
          this.allDocuments[docIndex].controls.uploadedFile.setValue(uploadedDocRef);
          this.allDocuments[docIndex].controls.docToUpload.setValue(uploadedDocRef);
          this.allDocuments[docIndex].controls.isUploaded.setValue(true);
          this.allDocuments[docIndex].controls.docError.setValue(false);
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

  uploadAtktPdf(values: any, docIndex = 0) {

    let file: File = values.docValue;
    if (!file && values.docValue && values.docValue[0]) {
      file = values.docValue[0];
    }
    if (!file) {
      this.allEventEmitters.showLoader.emit(false);
      this._snackBarMsgComponent.openSnackBar('Invalid file data. Please re-upload document.', 'x', 'error-snackbar', 5000);
      return;
    }

    this.allEventEmitters.showLoader.emit(true);
    this._atktService.uploadPdf(file, values.docId, this.panelMode).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          const uploadedDocRef = data?.dataJson?.uploadedFile || data?.dataJson?.fileUrl || data?.dataJson?.fileName || '';
          this.allDocuments[docIndex].controls.uploadedFile.setValue(uploadedDocRef);
          this.allDocuments[docIndex].controls.docToUpload.setValue(uploadedDocRef);
          this.allDocuments[docIndex].controls.isUploaded.setValue(true);
          this.allDocuments[docIndex].controls.docError.setValue(false);
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

  uploadDocImage(values: any, docIndex = 0) {

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.uploadDocImage(values, this.panelMode).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          const uploadedDocRef = data?.dataJson?.uploadedFile || data?.dataJson?.fileUrl || data?.dataJson?.fileName || '';
          this.allDocuments[docIndex].controls.uploadedFile.setValue(uploadedDocRef);
          this.allDocuments[docIndex].controls.docToUpload.setValue(uploadedDocRef);
          this.allDocuments[docIndex].controls.isUploaded.setValue(true);
          this.allDocuments[docIndex].controls.docError.setValue(false);
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

  uploadAtktDocImage(values: any, docIndex = 0) {

    this.allEventEmitters.showLoader.emit(true);
    this._atktService.uploadDocImage(values, this.panelMode).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          const uploadedDocRef = data?.dataJson?.uploadedFile || data?.dataJson?.fileUrl || data?.dataJson?.fileName || '';
          this.allDocuments[docIndex].controls.uploadedFile.setValue(uploadedDocRef);
          this.allDocuments[docIndex].controls.docToUpload.setValue(uploadedDocRef);
          this.allDocuments[docIndex].controls.isUploaded.setValue(true);
          this.allDocuments[docIndex].controls.docError.setValue(false);
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

  openImageCropperDialog(imageEvent, mode = '', docIndex: number = 0, bunchIndex: number = 0) {
    let modalHeight = "calc(100% - 30px)";
    let modalWidth = "500px";
    if (this.isMobile == true) {
      modalHeight = "500px";
      modalWidth = "500px";
    }
    let dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      height: modalHeight,
      // minHeight: '400px',
      width: modalWidth,
    });

    let modalTitle = '';
    if (mode == 'passportSizePhoto') {
      modalTitle = 'Crop applicant passport size photo to fit on the form';
    } else if (mode == 'signatureImage') {
      modalTitle = 'Crop applicant signature image to fit on the form';
    } else if (mode == 'documents') {
      modalTitle = 'Crop Document';
    }

    dialogRef.componentInstance.mode = mode;
    dialogRef.componentInstance.modalTitle = modalTitle;
    dialogRef.componentInstance.imageEvent = imageEvent;

    const sub = dialogRef.componentInstance.onOk.subscribe((data) => {
      this.browsedDocData(data.base64, docIndex, bunchIndex);
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  onDocumentsFormSubmit(values: any): void {

    let err = false;
    this.documentsForm.controls.documents.value.forEach((itemRow, index) => {
      if (itemRow.required && globalFunctions.isEmpty(itemRow.docToUpload) && globalFunctions.isEmpty(itemRow.uploadedFile)) {
        const documents = (<UntypedFormArray>this.documentsForm.controls['documents']).at(index);
        documents['controls'].docError.setValue(true);
        err = true;
      }
    });

    if (!err) {
      this.afterDocumentsFormSubmit();
    } else {
      this._snackBarMsgComponent.openSnackBar(allMsgs.REQUIRED_ALL_FIELDS, 'x', 'error-snackbar', 5000);
    }
  }

  afterDocumentsFormSubmit() {

    this.allEventEmitters.showLoader.emit(false);

    let authUrl = globalFunctions.getLocalStorage('authUrl', 'JsonParse');
    if (!globalFunctions.isEmpty(authUrl)) {
      window.location.href = authUrl;
    } else if (this.formType == 'preReg') {
      this.generateForm();
    } else if (this.courseSelection) {
      this.router.navigate(['/courseSelection']);
    } else if (this.optPayment) {
      this.router.navigate(['/cart']);
    } else if (this.formType == 'atkt') {
      this.directFormGenerate();
    } else {
      this.generateForm();
    }
  }

  generateForm() {

    let postParam: any = {
      'page': this.panelMode,
    };

    this.allEventEmitters.showLoader.emit(true);
    this._admissionService.generateForm(postParam).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {
        if (data.status == 1) {
          if (data.dataJson.showMsg) {
            this.openAlert(data.dataJson.messageText);
          } else {
            this.router.navigate(['/downloadForms']);
          }
        } else if (data.status == 0) {
          this.router.navigate(['/admissionForm']);
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

  viewDoc(docUrl) {
    var win = window.open(docUrl, '_blank');
    if (win) {
      win.focus();
    } else {
      alert('Please allow popups for this website');
    }
  }

  openAlert(innerHtmlMsg = '') {

    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: 'auto',
      width: '500px',
      autoFocus: false
    });

    dialogRef.componentInstance.innerHtmlMsg = innerHtmlMsg;
    dialogRef.componentInstance.yesText = 'OK';
    dialogRef.componentInstance.dialogRef = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['/downloadForms']);
    });
  }

  directFormGenerate() {

    this.allEventEmitters.showLoader.emit(true);
    this._atktService.directFormGenerate({}, this.panelMode).subscribe(data => {

      this.allEventEmitters.showLoader.emit(false);

      if (data.status != undefined) {

        if (data.status == 1) {

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'success-snackbar', 5000);

          if (!globalFunctions.isEmpty(data.dataJson.newApplicantId)) {
            globalFunctions.setUserProf('applicantId', data.dataJson.newApplicantId);
          }

          this.router.navigate(['/downloadForms']);

        } else if (data.status == 101) {

          globalFunctions.setUserProf('applicantId', data.dataJson.newApplicantId);

          this._snackBarMsgComponent.openSnackBar(data.message, 'x', 'error-snackbar', 5000);

          if (this.formType == 'exam') {
            this.router.navigate(['/examForm']);
          } else {
            this.router.navigate(['/atktForm']);
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

}