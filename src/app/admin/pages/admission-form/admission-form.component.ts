import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';

import * as globalFunctions from 'app/global/globalFunctions';
import { environment } from 'environments/environment';
import { AllEventEmitters } from 'app/global/all-event-emitters';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DocumentUploadDialogComponent } from 'app/shared/components/document-upload-dialog/document-upload-dialog.component';
import { SharedAdmissionFormComponent } from 'app/shared/components/shared-admission-form/shared-admission-form.component';
import { AdmissionService } from 'app/shared/services/admission.service';

@Component({
  selector: 'admission-form',
  templateUrl: 'admission-form.component.html',
  styleUrls: ['admission-form.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None
})
export class AdmissionFormComponent implements OnInit {

  @ViewChild(SharedAdmissionFormComponent) sharedAdmissionForm!: SharedAdmissionFormComponent;

  panelMode = 'admission';
  formDetails: any = {};
  dialogRef: any;

  headerImage: any = '';
  formPolicyId: any = 0;
  fromInstitute: boolean = false;
  showEnrollmentNumber: boolean = false;
  showTopNote: boolean = false;
  showHeaderImage: boolean = false;

  constructor(
    private allEventEmitters: AllEventEmitters,
    private dialog: MatDialog,
    private _admissionService: AdmissionService
  ) {

    this.allEventEmitters.setTitle.emit(
      environment.WEBSITE_NAME + ' - ' +
      environment.PANEL_NAME +
      ' | Admission Form'
    );

    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('instituteId'))) {

      let userProf = globalFunctions.getUserProf();
      this.headerImage = userProf.headerImage;
      this.formPolicyId = userProf.formPolicyId;

      if (this.formPolicyId == 1) {
        this.showEnrollmentNumber = true;
      }

      this.fromInstitute = true;
    }

    allEventEmitters.setHeaderImage.subscribe(
      (flag: boolean) => {
        if (flag) {
          let userProf = globalFunctions.getUserProf();
          this.headerImage = userProf.headerImage;
        }
      }
    );

    if (!globalFunctions.isEmpty(this.headerImage)) {
      this.showHeaderImage = true;
    }

  }

  ngOnInit(): void {
    // Upload popup is now triggered from SharedAdmissionFormComponent.setFormValues()
    // only when instructions popup is configured to display
    // this.checkRequiredDocuments();
  }

  checkRequiredDocuments() {
    console.log('AdmissionForm: checkRequiredDocuments called');

    // Check if we already showed the dialog in this session
    // if (sessionStorage.getItem('documentUploadDialogShown')) {
    //   return;
    // }

    // Fetch required documents from existing admission form details payload
    this._admissionService.getAdmissionFormDetails().subscribe(
      (response: any) => {
        const requiredDocuments = Array.isArray(response?.dataJson?.documents) ? response.dataJson.documents : [];
        console.log('Fetched required documents:', requiredDocuments);
        const docToUpload = requiredDocuments.find((doc: any) => doc.show);

        if (docToUpload) {
          this.openUploadDialog(docToUpload);
          sessionStorage.setItem('documentUploadDialogShown', 'true');
        }
      },
      (error: any) => {
        console.error('Failed to fetch required documents:', error);
        // Fallback or handle error - for now, maybe just do nothing or show error
      }
    );
  }

  openUploadDialog(document: any) {
    console.log('AdmissionForm: openUploadDialog called with:', document);
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '600px',
      data: document,
      disableClose: true
    });

    dialogRef.afterOpened().subscribe(() => {
      console.log('AdmissionForm: Dialog opened successfully');
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('AdmissionForm: Dialog closed with result:', result);
      if (result && result.success && result.file) {
        console.log('Document upload verified, proceeding to upload file:', result.file?.name);

        const docId = this.resolveDocumentId(result, document);
        const file = result.file;
        const ext = file.name.toLowerCase().split('.').pop();

        this.allEventEmitters.showLoader.emit(true);
        console.log('[DIALOG UPLOAD] Uploading file to server, docId:', docId, 'fileType:', ext);

        const uploadObservable = ext === 'pdf'
          ? this._admissionService.uploadPdf(file, docId)
          : this._admissionService.uploadDocImage({ docId: docId, docValue: file });

        uploadObservable.subscribe(
          response => {
            this.allEventEmitters.showLoader.emit(false);
            console.log('[DIALOG UPLOAD] Server upload response:', response);

            if (response.status == 1 || response.status == '1') {
              const fileName = response.dataJson?.fileName;
              console.log('[DIALOG UPLOAD] Upload successful, fileName:', fileName);

              if (this.sharedAdmissionForm) {
                this.sharedAdmissionForm.updateDocumentStatus(docId, fileName);
                if (fileName) {
                  this.sharedAdmissionForm.uploadedFileNames.push(fileName as string);
                }
              }

              if (result.extractedData) {
                this.autoFillFormWithExtractedData(result.extractedData, docId, fileName);
              }

              const successMsg = response.message || 'Document uploaded successfully';
              this.sharedAdmissionForm?._snackBarMsgComponent?.openSnackBar(successMsg, 'x', 'success-snackbar', 5000);
            } else {
              const failMsg = response.message || 'Upload failed';
              this.sharedAdmissionForm?._snackBarMsgComponent?.openSnackBar(failMsg, 'x', 'error-snackbar', 5000);
            }
          },
          error => {
            this.allEventEmitters.showLoader.emit(false);
            console.error('[DIALOG UPLOAD] Upload error:', error);
            this.sharedAdmissionForm?._snackBarMsgComponent?.openSnackBar('Upload failed. Please try again.', 'x', 'error-snackbar', 5000);
          }
        );
      }
    });
  }

  private resolveDocumentId(result: any, document: any): any {
    const fallbackId = result.document_id || document.document_id || document.id;

    if (!this.sharedAdmissionForm) {
      return fallbackId;
    }

    const docName = (document?.document_name || '').toString().toLowerCase();
    const examName = (result?.extractedData?.academicInfo?.examination || '').toString().toLowerCase();

    const keywords: string[] = [];
    if (docName.includes('hsc') || docName.includes('12')) {
      keywords.push('hsc', '12th', 'twelfth');
    }
    if (docName.includes('ssc') || docName.includes('10')) {
      keywords.push('ssc', '10th', 'tenth');
    }
    if (keywords.length === 0) {
      if (examName.includes('hsc') || examName.includes('12')) {
        keywords.push('hsc', '12th', 'twelfth');
      } else if (examName.includes('ssc') || examName.includes('10')) {
        keywords.push('ssc', '10th', 'tenth');
      }
    }

    const resolvedId = keywords.length > 0
      ? this.sharedAdmissionForm.findDocumentIdByTitle(keywords)
      : null;

    return resolvedId || fallbackId;
  }

  autoFillFormWithExtractedData(extractedData: any, documentId: any, fileName?: string): void {
    console.log('Auto-filling form with extracted data:', extractedData);

    if (this.sharedAdmissionForm) {
      this.sharedAdmissionForm.patchExtractedData(extractedData, documentId, fileName);
    } else {
      console.error('SharedAdmissionFormComponent not found via ViewChild');
      alert('Could not auto-fill form. Please try again.');
    }
  }


}
