import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { ExtractionResponse, VerificationResponse } from '../models/document-extraction.model';
import * as globalFunctions from 'app/global/globalFunctions';

import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DocumentExtractionService {

    private readonly API_URL = this.getAiApiUrl();

    constructor(private http: HttpClient) { }

    private getAiApiUrl(): string {
        const normalize = (value: string) => (value || '').replace(/\/+$/, '');

        const apiEndpoint = normalize(environment.API_ENDPOINT || '');
        return apiEndpoint ? `${apiEndpoint}/AI` : '/AI';
    }

    private getCommonPostValues(): any {
        try {
            return globalFunctions.getCommonPostValues() || {};
        } catch (e) {
            return {};
        }
    }

    private appendCommonFields(formData: FormData): any {
        const commonPostValues = this.getCommonPostValues();
        for (const key in commonPostValues) {
            if (Object.prototype.hasOwnProperty.call(commonPostValues, key) && commonPostValues[key] !== undefined && commonPostValues[key] !== null) {
                formData.append(key, String(commonPostValues[key]));
            }
        }
        return commonPostValues;
    }

    private getSessionExpiredMessage(error: any, fallback: string): string {
        const commonPostValues = this.getCommonPostValues();
        const userId = commonPostValues && commonPostValues.userId ? commonPostValues.userId : 'unknown';
        const status = error?.status || error?.error?.status;

        if (status === 419 || error?.error?.status === 419) {
            return `Session Expired (userId: ${userId})`;
        }

        return fallback;
    }

    /**
     * Extract data from HSC marksheet image
     */
    extractMarksheetData(file: File, documentType?: string): Observable<ExtractionResponse> {
        const formData = new FormData();
        this.appendCommonFields(formData);
        formData.append('document', file);
        if (documentType) {
            formData.append('document_name', documentType);
            formData.append('expectedDocType', documentType);
        }

        return this.http.post<ExtractionResponse>(`${this.API_URL}/extractMarksheet`, formData)
            .pipe(
                timeout(30000),
                catchError(error => {
                    console.error('Extraction error:', error);
                    if (error?.status === 419 || error?.error?.status === 419) {
                        return throwError(() => new Error(this.getSessionExpiredMessage(error, 'Session Expired')));
                    }
                    const message = error.error?.error
                        || error.message
                        || 'Extraction service unavailable. Please ensure the backend is running.';
                    return throwError(() => new Error(message));
                })
            );
    }

    /**
     * Verify if uploaded document is of expected type
     */
    verifyDocument(file: File, expectedType: string = 'HSC Marksheet'): Observable<VerificationResponse> {
        const formData = new FormData();
        this.appendCommonFields(formData);
        formData.append('document', file);
        formData.append('expectedType', expectedType);

        return this.http.post<VerificationResponse>(`${this.API_URL}/verifyDocument`, formData)
            .pipe(
                timeout(30000),
                catchError(error => {
                    console.error('Verification error:', error);
                    if (error?.status === 419 || error?.error?.status === 419) {
                        return throwError(() => new Error(this.getSessionExpiredMessage(error, 'Session Expired')));
                    }
                    return throwError(() => new Error(error.error?.error || 'Failed to verify document'));
                })
            );
    }

    /**
     * Upload a document image/PDF to the backend upload endpoint
     */
    uploadDocImage(file: File, docId: any): Observable<any> {
        const url = environment.API_ENDPOINT + 'Admission/uploadDocImage';
        let commonPostValues = globalFunctions.getCommonPostValues();
        const fd = new FormData();
        for (var key in commonPostValues) {
            if (commonPostValues.hasOwnProperty(key)) {
                fd.append(key, commonPostValues[key]);
            }
        }
        fd.append('document', file, file.name || 'upload');
        fd.append('docId', String(docId || ''));
        return this.http.post<any>(url, fd).pipe(
            timeout(30000),
            catchError(error => throwError(() => error))
        );
    }

    /**
     * Check backend health and Ollama connection
     */
    checkHealth(): Observable<any> {
        return this.http.get(`${this.API_URL}/health`)
            .pipe(
                catchError(error => {
                    console.error('Health check error:', error);
                    return throwError(() => new Error('Backend service is not available'));
                })
            );
    }
}
