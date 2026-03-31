import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DocumentExtractionService } from 'app/shared/services/document-extraction.service';
import { ExtractedMarksheetData } from 'app/shared/models/document-extraction.model';
import { forkJoin } from 'rxjs';

export interface UploadDocumentState {
    document_id: number;
    document_name: string;
    file: File | null;
    imagePreviewUrl: string | null;
    isExtracting: boolean;
    isVerifying: boolean;
    extractedData: ExtractedMarksheetData | null;
    verificationFailed: boolean;
    verificationMessage: string;
    extractionError: string;
    isVerificationOnlyDoc: boolean;
}

@Component({
    selector: 'app-document-upload-dialog',
    templateUrl: './document-upload-dialog.component.html',
    styleUrls: ['./document-upload-dialog.component.css']
})
export class DocumentUploadDialogComponent implements OnInit {

    documentsState: UploadDocumentState[] = [];
    isSubmitting: boolean = false;
    submitError: string = '';
    
    private readonly maxFileSizeMbMarksheet: number = 20;
    private readonly maxFileSizeMbVerificationOnly: number = 2;

    constructor(
        public dialogRef: MatDialogRef<DocumentUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private extractionService: DocumentExtractionService
    ) {
        this.dialogRef.disableClose = true;
    }

    ngOnInit(): void {
        let docs: any[] = [];
        if (this.data && Array.isArray(this.data.documents)) {
            docs = this.data.documents;
        } else if (this.data) {
            docs = [this.data];
        }

        // Expand "Sem 1" into dual upload for backward compatibility if it's the only one and matches Sem 1
        if (docs.length === 1) {
            const docNameLower = (docs[0].document_name || '').toLowerCase();
            const isSem1Title = /(sem|semester|semister)\s*[-_]?\s*(1|i)\b/.test(docNameLower) && /mark\s*sheet|marksheet/.test(docNameLower);
            if (docs[0].document_id === 390 || isSem1Title) {
                docs = [
                    { document_id: 390, document_name: 'Sem 1 Marksheet' },
                    { document_id: 389, document_name: 'Sem 2 Marksheet' }
                ];
            }
        }

        this.documentsState = docs.map(doc => {
            const docNameLower = (doc.document_name || '').toLowerCase();
            const isMarksheet = /\b(marksheet|mark\s*sheet|ssc|hsc|semester|sem|diploma|degree|10th|12th)\b/.test(docNameLower);
            const isVerifOnly = !isMarksheet;
            
            return {
                document_id: doc.document_id || doc.id,
                document_name: doc.document_name || 'Document',
                file: doc.file || null,
                imagePreviewUrl: null,
                isExtracting: false,
                isVerifying: false,
                extractedData: null,
                verificationFailed: false,
                verificationMessage: '',
                extractionError: '',
                isVerificationOnlyDoc: isVerifOnly
            };
        });

        // Handle pre-filled file for the first document if passed via legacy single doc data
        if (this.data && this.data.file && this.documentsState.length > 0) {
            this.handleFileForIndex(this.data.file, 0);
        }
    }

    private getBriefInvalidReason(rawReason: any): string {
        const text = (rawReason || '').toString().replace(/\s+/g, ' ').trim();
        if (!text) return 'Uploaded file does not match the selected document type.';
        return text.replace(/^invalid document\s*:?\s*/i, '').replace(/^error\s*:?\s*/i, '').trim();
    }

    private getUploadGuidance(expectedDoc: string, isMarksheetFlow: boolean): string {
        if (isMarksheetFlow) return `Please upload a clear, single-page ${expectedDoc} image or PDF.`;
        return `Please upload a clear image/PDF of ${expectedDoc}.`;
    }

    private buildInvalidDocumentMessage(reason: any, expectedDoc: string, isMarksheetFlow: boolean): string {
        return `Reason: ${this.getBriefInvalidReason(reason)}. ${this.getUploadGuidance(expectedDoc, isMarksheetFlow)}`;
    }

    onFileSelected(event: any, index: number): void {
        if (event.target.files && event.target.files.length > 0) {
            this.handleFileForIndex(event.target.files[0], index);
            event.target.value = ''; // Reset input
        }
    }

    private handleFileForIndex(file: File, index: number): void {
        const state = this.documentsState[index];
        if (!state) return;

        const maxFileSizeMb = state.isVerificationOnlyDoc ? this.maxFileSizeMbVerificationOnly : this.maxFileSizeMbMarksheet;
        const fileSizeInMb = file.size / (1024 * 1024);
        
        if (fileSizeInMb > maxFileSizeMb) {
            const roundedSize = Math.round(fileSizeInMb * 100) / 100;
            state.file = null;
            state.imagePreviewUrl = null;
            state.extractedData = null;
            state.isExtracting = false;
            state.isVerifying = false;
            state.verificationFailed = true;
            state.verificationMessage = '✗ File too large';
            state.extractionError = `File size ${roundedSize} MB exceeds limit of ${maxFileSizeMb} MB. Please upload a smaller file.`;
            return;
        }

        state.file = file;
        state.extractionError = '';
        state.verificationFailed = false;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = e => state.imagePreviewUrl = reader.result as string;
            reader.readAsDataURL(file);
        } else {
            state.imagePreviewUrl = null;
        }

        this.extractData(index);
    }

    extractData(index: number): void {
        const state = this.documentsState[index];
        if (!state || !state.file) return;

        state.isExtracting = true;
        state.isVerifying = true;
        state.verificationMessage = 'Verifying document...';
        state.extractionError = '';

        if (state.isVerificationOnlyDoc) {
            this.extractionService.verifyDocument(state.file, state.document_name).subscribe({
                next: (response) => {
                    state.isExtracting = false;
                    state.isVerifying = false;
                    const verification = response?.verification;
                    const isValid = !!(response?.success && verification?.isValid);
                    const reason = verification?.reason || response?.error || '';
                    
                    if (isValid) {
                        state.verificationFailed = false;
                        state.verificationMessage = `✓ Verified as ${state.document_name}`;
                        state.extractedData = null;
                    } else {
                        state.verificationFailed = true;
                        state.verificationMessage = `✗ Invalid ${state.document_name}`;
                        state.extractionError = this.buildInvalidDocumentMessage(reason, state.document_name, false);
                    }
                },
                error: (error) => {
                    state.isExtracting = false;
                    state.isVerifying = false;
                    state.verificationFailed = true;
                    state.verificationMessage = `✗ Invalid ${state.document_name}`;
                    const backendError = error?.error?.error || error?.message || 'Failed to verify document.';
                    state.extractionError = this.buildInvalidDocumentMessage(backendError, state.document_name, false);
                }
            });
            return;
        }

        this.extractionService.extractMarksheetData(state.file, state.document_name).subscribe({
            next: (response) => {
                state.isExtracting = false;
                state.isVerifying = false;
                if (response.success && response.data) {
                    state.verificationMessage = `✓ Verified as ${state.document_name}`;
                    state.extractedData = response.data;
                } else {
                    state.verificationFailed = true;
                    state.verificationMessage = `✗ Invalid ${state.document_name}`;
                    state.extractionError = this.buildInvalidDocumentMessage(response.error || 'Failed to extract data.', state.document_name, true);
                }
            },
            error: (error) => {
                state.isExtracting = false;
                state.isVerifying = false;
                state.verificationFailed = true;
                state.verificationMessage = `✗ Invalid ${state.document_name}`;
                
                const backendError = error?.error?.error || error?.message || 'Failed to extract data.';
                state.extractionError = this.buildInvalidDocumentMessage(backendError, state.document_name, true);
            }
        });
    }

    retryExtraction(index: number): void {
        const state = this.documentsState[index];
        if (!state) return;
        state.extractionError = '';
        state.verificationFailed = false;
        state.extractedData = null;
        if (state.file) this.extractData(index);
    }

    get isSubmitDisabled(): boolean {
        if (this.isSubmitting || this.documentsState.length === 0) return true;
        // Block only if any document is missing a file or still processing
        return this.documentsState.some(s => !s.file || s.isVerifying || s.isExtracting);
    }

    submit(): void {
        if (this.isSubmitDisabled) return;

        this.isSubmitting = true;
        this.submitError = '';

        // If it's the exact magic dual upload scenario Sem1/Sem2
        const isMagicDual = this.documentsState.length === 2 && 
                            this.documentsState[0].document_id === 390 && 
                            this.documentsState[1].document_id === 389;

        if (isMagicDual) {
            const sem1Upload$ = this.extractionService.uploadDocImage(this.documentsState[0].file!, 390);
            const sem2Upload$ = this.extractionService.uploadDocImage(this.documentsState[1].file!, 389);
            forkJoin({ sem1: sem1Upload$, sem2: sem2Upload$ }).subscribe({
                next: (results: any) => {
                    this.isSubmitting = false;
                    this.dialogRef.close({
                        success: true,
                        document_id: 390,
                        sem2_document_id: 389,
                        fileName: results.sem2?.dataJson?.fileName || '',
                        extractedData: this.documentsState[1].extractedData,
                        sem1Data: {
                            document_id: 390,
                            fileName: results.sem1?.dataJson?.fileName || '',
                            extractedData: this.documentsState[0].extractedData
                        }
                    });
                },
                error: (err: any) => {
                    this.isSubmitting = false;
                    this.submitError = 'Upload failed. Please check the server connection and try again.';
                }
            });
            return;
        }

        // Generic bulk submit - return all documents to the parent to handle uploading
        this.dialogRef.close({
            success: true,
            documents: this.documentsState.map(state => ({
                document_id: state.document_id,
                document_name: state.document_name,
                file: state.file,
                extractedData: state.extractedData
            }))
        });
    }
}
