import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';

import * as globalFunctions from 'app/global/globalFunctions';
import { AllEventEmitters } from 'app/global/all-event-emitters';
import { Settings } from 'app/app.settings.model';
import { AppSettings } from 'app/app.settings';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DocumentUploadDialogComponent } from 'app/shared/components/document-upload-dialog/document-upload-dialog.component';
import { SharedAdmissionFormComponent } from 'app/shared/components/shared-admission-form/shared-admission-form.component';
import { AdmissionService } from 'app/shared/services/admission.service';

@Component({
  selector: 'open-admission-form',
  templateUrl: 'open-admission-form.component.html',
  styleUrls: ['open-admission-form.component.css'],
  providers: [AdmissionService],
  encapsulation: ViewEncapsulation.None
})
export class OpenAdmissionFormComponent implements OnInit {

  @ViewChild(SharedAdmissionFormComponent) sharedAdmissionForm!: SharedAdmissionFormComponent;

  panelMode = 'admission';
  formDetails:any = {};
  dialogRef:any;

  public settings: Settings;

  headerImage: any = '';
  formPolicyId: any = 0;
  fromInstitute: boolean = false;
  showEnrollmentNumber: boolean = false;
  showTopNote: boolean = false;

  constructor(
    public appSettings:AppSettings,     
    private allEventEmitters: AllEventEmitters,
    private dialog: MatDialog,
    private _admissionService: AdmissionService
  ) { 

    this.settings = this.appSettings.settings;

    if (!globalFunctions.isEmpty(globalFunctions.getUserProf('instituteId'))) {

      let userProf = globalFunctions.getUserProf();
      this.headerImage = userProf.headerImage;
      this.formPolicyId = userProf.formPolicyId;

      if (this.formPolicyId == 1) {
        this.showEnrollmentNumber = true;
      }

      this.fromInstitute = true;
    }
  }

  ngOnInit(): void {

  }

  ngAfterViewInit():void {

    setTimeout(() => { this.settings.loadingSpinner = false }, 300);
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
        (error) => { console.error('OpenAdmissionForm: Failed to fetch required documents:', error); }
      );
      return;
    }

    if (aiDocList.length > 0) {
      this.openUploadDialog(aiDocList);
    }
  }

  openUploadDialog(documents: any[]) {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '800px',
      data: { documents: documents },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
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
        return;
      }

      // Handle the new generic bulk array case
      if (result.documents && Array.isArray(result.documents)) {
        const docsToUpload = result.documents.filter((d: any) => d.file != null);
        
        if (docsToUpload.length === 0) return;

        this.allEventEmitters.showLoader.emit(true);
        let completedCount = 0;
        
        docsToUpload.forEach((doc: any) => {
           const docId = this.resolveDocumentId(doc, doc);
           const file = doc.file;
           const ext = file.name.toLowerCase().split('.').pop();
           
           const uploadObservable = ext === 'pdf'
             ? this._admissionService.uploadPdf(file, docId)
             : this._admissionService.uploadDocImage({ docId: docId, docValue: file });

           uploadObservable.subscribe(
             response => {
               completedCount++;
               if (response.status == 1 || response.status == '1') {
                 const fileName = response.dataJson?.fileName;
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
               }
               if (completedCount === docsToUpload.length) {
                 this.allEventEmitters.showLoader.emit(false);
               }
             },
             () => {
               completedCount++;
               if (completedCount === docsToUpload.length) {
                 this.allEventEmitters.showLoader.emit(false);
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
    if (this.sharedAdmissionForm) {
      this.sharedAdmissionForm.patchExtractedData(extractedData, documentId, fileName);
    }
  }
}
