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
    private readonly queuedExtractionDelayMs: number = 1200;

    constructor(
        public dialogRef: MatDialogRef<DocumentUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private extractionService: DocumentExtractionService
    ) {
        this.dialogRef.disableClose = true;
    }

    ngOnInit(): void {
        this.initializeDocumentUpload();
    }

    private initializeDocumentUpload(): void {
        let docs: any[] = [];
        if (this.data && Array.isArray(this.data.documents)) {
            docs = this.data.documents;
        } else if (this.data) {
            docs = [this.data];
        }

        this.documentsState = docs.map(doc => {
            const docNameLower = (doc.document_name || '').toLowerCase();
            // A document is verification-only if it is NOT a marksheet/academic-record type
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

    private isDocumentMismatchMessage(rawReason: any): boolean {
        const text = (rawReason || '').toString().trim();
        return /^invalid document\b/i.test(text) || /document type does not match/i.test(text);
    }

    private getUploadGuidance(expectedDoc: string, isMarksheetFlow: boolean): string {
        if (isMarksheetFlow) return `Please upload a clear, single-page ${expectedDoc} image or PDF.`;
        return `Please upload a clear image/PDF of ${expectedDoc}.`;
    }

    private buildInvalidDocumentMessage(reason: any, expectedDoc: string, isMarksheetFlow: boolean): string {
        return `Reason: ${this.getBriefInvalidReason(reason)}. ${this.getUploadGuidance(expectedDoc, isMarksheetFlow)}`;
    }

    private buildBackendFailureMessage(reason: any, expectedDoc: string): string {
        const text = (reason || '').toString().replace(/\s+/g, ' ').trim();
        return text || `Failed to process ${expectedDoc}. Please try again.`;
    }

    private extractExpectedExamType(docName: string): string | null {
        const nameLower = (docName || '').toLowerCase();
        if (/\bssc\b/.test(nameLower) || /\b10th\b/.test(nameLower)) return 'SSC';
        if (/\bhsc\b/.test(nameLower) || /\b12th\b/.test(nameLower)) return 'HSC';
        if (/\bsemester|sem\b/.test(nameLower)) return 'SEMESTER';
        if (/\bdiploma\b/.test(nameLower)) return 'DIPLOMA';
        if (/\bdegree\b/.test(nameLower)) return 'DEGREE';
        return null;
    }

    private extractExpectedSemesterNumber(docName: string): number | null {
        const nameLower = (docName || '').toLowerCase();
        const semesterMatch = nameLower.match(/semester\s*(\d+)|sem\s*(\d+)|sem-(\d+)/i);
        if (semesterMatch) {
            const semNumber = semesterMatch[1] || semesterMatch[2] || semesterMatch[3];
            return parseInt(semNumber, 10) || null;
        }
        return null;
    }

    private extractDetectedSemesterNumber(extractedData: ExtractedMarksheetData): number | null {
        if (!extractedData?.academicInfo) return null;
        const semester = extractedData.academicInfo.semester;
        if (!semester) return null;
        const semMatch = (semester + '').match(/(\d+)/);
        return semMatch ? parseInt(semMatch[1], 10) : null;
    }

    private validateExamTypeMatch(extractedData: ExtractedMarksheetData, expectedExamType: string | null, expectedDocName: string): { isValid: boolean; mismatchReason?: string } {
        if (!expectedExamType || !extractedData?.academicInfo) {
            return { isValid: true }; // Skip validation if we can't determine expected type
        }

        const detectedExamination = (extractedData.academicInfo.examination || '').toUpperCase().trim();
        const detectedBoard = (extractedData.academicInfo.board || '').toUpperCase().trim();
        
        // Map various exam types to standardized form
        const normalizeExamType = (exam: string): string => {
            if (/^(SSC|10TH|10|SECONDARY)/.test(exam)) return 'SSC';
            if (/^(HSC|12TH|12|HIGHER\s*SECONDARY|INTERMEDIATE)/.test(exam)) return 'HSC';
            if (/^SEMESTER|SEM|UG|BACHELOR/.test(exam)) return 'SEMESTER';
            if (/^DIPLOMA/.test(exam)) return 'DIPLOMA';
            if (/^DEGREE|MASTER|PG/.test(exam)) return 'DEGREE';
            return exam;
        };

        const normalizedDetected = normalizeExamType(detectedExamination);
        const normalizedExpected = normalizeExamType(expectedExamType);

        // Check main exam type match
        if (normalizedDetected !== normalizedExpected) {
            return {
                isValid: false,
                mismatchReason: `Document is identified as ${normalizedDetected} (from extracted data: "${detectedExamination}"), but you selected "${expectedExamType}" section. Please upload the correct marksheet type.`
            };
        }

        // For semester marksheets, also validate semester number
        if (normalizedExpected === 'SEMESTER') {
            const expectedSemNumber = this.extractExpectedSemesterNumber(expectedDocName);
            const detectedSemNumber = this.extractDetectedSemesterNumber(extractedData);
            
            if (expectedSemNumber !== null && detectedSemNumber !== null && expectedSemNumber !== detectedSemNumber) {
                return {
                    isValid: false,
                    mismatchReason: `Document is identified as Semester ${detectedSemNumber}, but you selected Semester ${expectedSemNumber} section. Please upload the correct semester marksheet.`
                };
            }
        }

        return { isValid: true };
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

        const isAnotherRequestRunning = this.documentsState.some(
            (doc, docIndex) => docIndex !== index && (doc.isVerifying || doc.isExtracting)
        );

        if (isAnotherRequestRunning) {
            state.verificationMessage = 'Waiting for previous document verification...';
            state.isVerifying = false;
            state.isExtracting = false;
            setTimeout(() => this.extractData(index), this.queuedExtractionDelayMs);
            return;
        }

        // Reset any previous extraction result before validating a new upload.
        state.extractedData = null;
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
                        state.verificationMessage = this.isDocumentMismatchMessage(reason)
                            ? `✗ Invalid ${state.document_name}`
                            : `✗ Failed ${state.document_name}`;
                        state.extractionError = this.isDocumentMismatchMessage(reason)
                            ? this.buildInvalidDocumentMessage(reason, state.document_name, false)
                            : this.buildBackendFailureMessage(reason, state.document_name);
                    }
                },
                error: (error) => {
                    state.isExtracting = false;
                    state.isVerifying = false;
                    const httpStatus = error?.status || error?.error?.status;
                    const backendError = error?.error?.error || error?.message || 'Failed to verify document.';
                    // If it's a server/network error (503, 502, 500, 0) and NOT a document mismatch, skip and allow upload
                    if (!this.isDocumentMismatchMessage(backendError) && (httpStatus === 503 || httpStatus === 502 || httpStatus === 500 || httpStatus === 0 || !httpStatus)) {
                        state.verificationFailed = false;
                        state.verificationMessage = '';
                        state.extractionError = '';
                        return;
                    }
                    state.verificationFailed = true;
                    state.verificationMessage = this.isDocumentMismatchMessage(backendError)
                        ? `✗ Invalid ${state.document_name}`
                        : `✗ Failed ${state.document_name}`;
                    state.extractionError = this.isDocumentMismatchMessage(backendError)
                        ? this.buildInvalidDocumentMessage(backendError, state.document_name, false)
                        : this.buildBackendFailureMessage(backendError, state.document_name);
                }
            });
            return;
        }

        this.extractionService.verifyDocument(state.file, state.document_name).subscribe({
            next: (verifyResponse) => {
                const verification = verifyResponse?.verification;
                const isValidDocType = !!(verifyResponse?.success && verification?.isValid);
                const verifyReason = verification?.reason || verifyResponse?.error || verifyResponse?.message || 'Document type verification failed.';

                if (!isValidDocType) {
                    state.isExtracting = false;
                    state.isVerifying = false;
                    state.verificationFailed = true;
                    state.verificationMessage = this.isDocumentMismatchMessage(verifyReason)
                        ? `✗ Invalid ${state.document_name}`
                        : `✗ Failed ${state.document_name}`;
                    state.extractionError = this.isDocumentMismatchMessage(verifyReason)
                        ? this.buildInvalidDocumentMessage(verifyReason, state.document_name, true)
                        : this.buildBackendFailureMessage(verifyReason, state.document_name);
                    return;
                }

                state.isVerifying = false;
                state.isExtracting = true;
                state.verificationMessage = 'Document verified. Extracting data...';

                this.extractionService.extractMarksheetData(state.file, state.document_name).subscribe({
                    next: (response) => {
                        state.isExtracting = false;
                        const hasMinimumSignals = this.hasMinimumMarksheetSignals(response?.data);
                        
                        // Strict validation: Verify exam type matches document section (including semester number for semester marksheets)
                        const expectedExamType = this.extractExpectedExamType(state.document_name);
                        const examTypeValidation = this.validateExamTypeMatch(response?.data, expectedExamType, state.document_name);
                        
                        if (response.success && response.data && hasMinimumSignals && examTypeValidation.isValid) {
                            state.verificationFailed = false;
                            state.verificationMessage = `✓ Verified as ${state.document_name}`;
                            state.extractedData = response.data;
                        } else if (!examTypeValidation.isValid) {
                            // Exam type mismatch - strict rejection
                            state.verificationFailed = true;
                            state.verificationMessage = `✗ Invalid ${state.document_name}`;
                            state.extractionError = examTypeValidation.mismatchReason || `Document type does not match "${state.document_name}" section.`;
                        } else {
                            state.verificationFailed = true;
                            state.verificationMessage = `✗ Invalid ${state.document_name}`;
                            state.extractionError = this.buildInvalidDocumentMessage(response?.error || 'Could not confirm required marksheet details from this file.', state.document_name, true);
                        }
                    },
                    error: (error) => {
                        state.isExtracting = false;
                        const backendError = error?.error?.error || error?.error?.message || error?.message || 'Failed to extract data.';
                        state.verificationFailed = true;
                        state.verificationMessage = this.isDocumentMismatchMessage(backendError)
                            ? `✗ Invalid ${state.document_name}`
                            : `✗ Failed ${state.document_name}`;
                        state.extractionError = this.isDocumentMismatchMessage(backendError)
                            ? this.buildInvalidDocumentMessage(backendError, state.document_name, true)
                            : this.buildBackendFailureMessage(backendError, state.document_name);
                    }
                });
            },
            error: (error) => {
                state.isExtracting = false;
                state.isVerifying = false;
                const httpStatus = error?.status || error?.error?.status;
                const backendError = error?.error?.error || error?.error?.message || error?.message || 'Failed to verify document type.';
                // If it's a server/network error (503, 502, 500, 0) and NOT a document mismatch,
                // skip verification and proceed directly to extraction.
                if (!this.isDocumentMismatchMessage(backendError) && (httpStatus === 503 || httpStatus === 502 || httpStatus === 500 || httpStatus === 0 || !httpStatus)) {
                    state.verificationMessage = 'Verification unavailable. Extracting data...';
                    state.isExtracting = true;
                    this.extractionService.extractMarksheetData(state.file!, state.document_name).subscribe({
                        next: (response) => {
                            state.isExtracting = false;
                            const hasMinimumSignals = this.hasMinimumMarksheetSignals(response?.data);
                            const expectedExamType = this.extractExpectedExamType(state.document_name);
                            const examTypeValidation = this.validateExamTypeMatch(response?.data, expectedExamType, state.document_name);

                            if (response.success && response.data && hasMinimumSignals && examTypeValidation.isValid) {
                                state.verificationFailed = false;
                                state.verificationMessage = `✓ Verified as ${state.document_name}`;
                                state.extractedData = response.data;
                            } else if (!examTypeValidation.isValid) {
                                state.verificationFailed = true;
                                state.verificationMessage = `✗ Invalid ${state.document_name}`;
                                state.extractionError = examTypeValidation.mismatchReason || `Document type does not match "${state.document_name}" section.`;
                            } else {
                                state.verificationFailed = true;
                                state.verificationMessage = `✗ Invalid ${state.document_name}`;
                                state.extractionError = this.buildInvalidDocumentMessage(response?.error || 'Could not confirm required marksheet details from this file.', state.document_name, true);
                            }
                        },
                        error: (extractErr) => {
                            state.isExtracting = false;
                            const extractBackendError = extractErr?.error?.error || extractErr?.error?.message || extractErr?.message || 'Failed to extract data.';
                            state.verificationFailed = true;
                            state.verificationMessage = `✗ Failed ${state.document_name}`;
                            state.extractionError = this.buildBackendFailureMessage(extractBackendError, state.document_name);
                        }
                    });
                    return;
                }
                state.verificationFailed = true;
                state.verificationMessage = this.isDocumentMismatchMessage(backendError)
                    ? `✗ Invalid ${state.document_name}`
                    : `✗ Failed ${state.document_name}`;
                state.extractionError = this.isDocumentMismatchMessage(backendError)
                    ? this.buildInvalidDocumentMessage(backendError, state.document_name, true)
                    : this.buildBackendFailureMessage(backendError, state.document_name);
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

    private isDocumentApproved(state: UploadDocumentState): boolean {
        if (!state || !state.file || state.isVerifying || state.isExtracting) {
            return false;
        }

        if (state.verificationFailed || !!state.extractionError) {
            return false;
        }

        if (state.isVerificationOnlyDoc) {
            return !!state.verificationMessage && state.verificationMessage.indexOf('✓') === 0;
        }

        return !!state.extractedData;
    }

    private hasMinimumMarksheetSignals(extracted: any): boolean {
        if (!extracted || typeof extracted !== 'object') {
            return false;
        }

        const personal = extracted.personalInfo || {};
        const academic = extracted.academicInfo || {};
        const hasNameOrSeat = !!(personal.candidateName || personal.firstName || personal.lastName || personal.seatNo);
        const hasAcademicAnchor = !!(
            academic.examination ||
            academic.semester ||
            academic.board ||
            academic.passingYear ||
            (Array.isArray(academic.subjects) && academic.subjects.length > 0)
        );

        return hasNameOrSeat && hasAcademicAnchor;
    }

    get isSubmitDisabled(): boolean {
        if (this.isSubmitting || this.documentsState.length === 0) return true;
        return this.documentsState.some(s => !this.isDocumentApproved(s));
    }

    submit(): void {
        if (this.isSubmitDisabled) {
            this.submitError = 'Please upload valid documents. One or more files failed verification.';
            return;
        }

        this.isSubmitting = true;
        this.submitError = '';

        // If it's a dual semester upload (Sem1/Sem2)
        const isSemDual = this.documentsState.length === 2 &&
                          /(sem|semester)\s*[-_]?\s*(1|i)\b|\bsem\s*1\b/i.test(this.documentsState[0].document_name || '') &&
                          /(sem|semester)\s*[-_]?\s*(2|ii)\b|\bsem\s*2\b/i.test(this.documentsState[1].document_name || '');

        if (isSemDual) {
            const sem1DocId = this.documentsState[0].document_id;
            const sem2DocId = this.documentsState[1].document_id;
            const sem1Upload$ = this.extractionService.uploadDocImage(this.documentsState[0].file!, sem1DocId);
            const sem2Upload$ = this.extractionService.uploadDocImage(this.documentsState[1].file!, sem2DocId);
            forkJoin({ sem1: sem1Upload$, sem2: sem2Upload$ }).subscribe({
                next: (results: any) => {
                    this.isSubmitting = false;
                    this.dialogRef.close({
                        success: true,
                        document_id: sem1DocId,
                        sem2_document_id: sem2DocId,
                        fileName: results.sem2?.dataJson?.fileName || '',
                        extractedData: this.documentsState[1].extractedData,
                        sem1Data: {
                            document_id: sem1DocId,
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

        // Generic bulk submit - return only approved documents to the parent.
        this.dialogRef.close({
            success: true,
            documents: this.documentsState.filter(state => this.isDocumentApproved(state)).map(state => ({
                document_id: state.document_id,
                document_name: state.document_name,
                file: state.file,
                extractedData: state.extractedData
            }))
        });
    }
}
