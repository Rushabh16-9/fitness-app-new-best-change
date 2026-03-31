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

  checkRequiredDocuments(formData?: any) {
    // Use formData passed from event (already assigned) to avoid timing issues
    const fd = formData || this.sharedAdmissionForm?.formData;
    let aiDocList: any[] = [];

    const rawAiFlag = fd?.personalInfo?.aiDocumentVerification
      ?? fd?.aiDocumentVerification
      ?? fd?.personal_info_config?.aiDocumentVerification;

    if (Array.isArray(rawAiFlag)) {
      aiDocList = rawAiFlag.filter((d: any) => d.show === true);
    } else if (rawAiFlag === true) {
      // broad boolean enable — fallback to read from JSON file
      this._admissionService.getRequiredDocuments().subscribe(
        (requiredDocuments: any[]) => {
          const aiList = requiredDocuments.filter(doc => doc.show);
          if (aiList.length > 0) {
            this.openUploadDialog(aiList);
          }
        },
        (error) => { console.error('AdmissionForm: Failed to fetch required documents:', error); }
      );
      return;
    }

    if (aiDocList.length > 0) {
      this.openUploadDialog(aiDocList);
    }
  }

  openUploadDialog(documents: any[]) {
    console.log('AdmissionForm: openUploadDialog called with:', documents);
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '800px',
      data: { documents: documents },
      disableClose: true
    });

    dialogRef.afterOpened().subscribe(() => {
      console.log('AdmissionForm: Dialog opened successfully');
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('AdmissionForm: Dialog closed with result:', result);

      if (!(result && result.success)) {
        return;
      }

      // Dual upload flow returns already-uploaded filenames and both extracted payloads.
      if (result.sem1Data || result.fileName) {
        const sem1DocId = result?.sem1Data?.document_id || 390;
        const sem2DocId = result?.sem2_document_id || result?.document_id || 389;

        if (this.sharedAdmissionForm) {
          const sem1FileName = result?.sem1Data?.fileName;
          if (sem1FileName) {
            this.sharedAdmissionForm.updateDocumentStatus(sem1DocId, sem1FileName);
            this.sharedAdmissionForm.updateEduListRowUploadStatus(sem1DocId, sem1FileName);
            this.sharedAdmissionForm.uploadedFileNames.push(sem1FileName);
          }
          if (result?.sem1Data?.extractedData) {
            this.autoFillFormWithExtractedData(result.sem1Data.extractedData, sem1DocId, sem1FileName);
          }

          if (result.fileName) {
            this.sharedAdmissionForm.updateDocumentStatus(sem2DocId, result.fileName);
            this.sharedAdmissionForm.updateEduListRowUploadStatus(sem2DocId, result.fileName);
            this.sharedAdmissionForm.uploadedFileNames.push(result.fileName);
          }
          if (result.extractedData) {
            this.autoFillFormWithExtractedData(result.extractedData, sem2DocId, result.fileName);
          }
        }

        this.sharedAdmissionForm?._snackBarMsgComponent?.openSnackBar('Sem 1 & Sem 2 data auto-filled successfully.', 'x', 'success-snackbar', 5000);
        return;
      }

      // Handle the new generic bulk array case
      if (result.documents && Array.isArray(result.documents)) {
        const docsToUpload = result.documents.filter((d: any) => d.file != null);
        
        if (docsToUpload.length === 0) return;

        console.log(`[DIALOG UPLOAD] Beginning bulk upload for ${docsToUpload.length} documents`);
        this.allEventEmitters.showLoader.emit(true);
        let completedCount = 0;
        
        docsToUpload.forEach((doc: any) => {
           const docId = this.resolveDocumentId(doc, doc);
           const file = doc.file;
           const ext = file.name.toLowerCase().split('.').pop();
           
           console.log('[DIALOG UPLOAD] Uploading file to server, docId:', docId, 'fileType:', ext);

           const uploadObservable = ext === 'pdf'
             ? this._admissionService.uploadPdf(file, docId)
             : this._admissionService.uploadDocImage({ docId: docId, docValue: file });

           uploadObservable.subscribe(
             response => {
               completedCount++;
               if (response.status == 1 || response.status == '1') {
                 const fileName = response.dataJson?.fileName;
                 console.log('[DIALOG UPLOAD] Upload successful, fileName:', fileName);

                 if (this.sharedAdmissionForm) {
                   this.sharedAdmissionForm.updateDocumentStatus(docId, fileName);
                   this.sharedAdmissionForm.updateEduListRowUploadStatus(docId, fileName);
                   if (fileName) {
                     this.sharedAdmissionForm.uploadedFileNames.push(fileName);
                   }
                 }
                 if (doc.extractedData) {
                   this.autoFillFormWithExtractedData(doc.extractedData, docId, fileName);
                 }
                 this.sharedAdmissionForm?._snackBarMsgComponent?.openSnackBar(response.message || 'Document uploaded successfully', 'x', 'success-snackbar', 5000);
               } else {
                 const failMsg = response.message || 'Upload failed';
                 this.sharedAdmissionForm?._snackBarMsgComponent?.openSnackBar(failMsg, 'x', 'error-snackbar', 5000);
               }
               
               if (completedCount === docsToUpload.length) {
                 this.allEventEmitters.showLoader.emit(false);
                 setTimeout(() => {
                   this.sharedAdmissionForm?.loadDocumentsList();
                 }, 500);
               }
             },
             error => {
               completedCount++;
               console.error('[DIALOG UPLOAD] Upload error:', error);
               this.sharedAdmissionForm?._snackBarMsgComponent?.openSnackBar('Upload failed. Please try again.', 'x', 'error-snackbar', 5000);
               
               if (completedCount === docsToUpload.length) {
                 this.allEventEmitters.showLoader.emit(false);
                 setTimeout(() => {
                   this.sharedAdmissionForm?.loadDocumentsList();
                 }, 500);
               }
             }
           );
        });
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
