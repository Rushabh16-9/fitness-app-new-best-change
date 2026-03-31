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

    private readonly API_URL = environment.API_ENDPOINT + 'api';

    constructor(private http: HttpClient) { }

    /**
     * Extract data from HSC marksheet image
     */
    extractMarksheetData(file: File, documentType?: string): Observable<ExtractionResponse> {
        const formData = new FormData();
        formData.append('document', file);
        if (documentType) {
            formData.append('document_name', documentType);
        }

        return this.http.post<ExtractionResponse>(`${this.API_URL}/extract-marksheet`, formData)
            .pipe(
                timeout(30000),
                catchError(error => {
                    console.error('Extraction error:', error);
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
        formData.append('document', file);
        formData.append('expectedType', expectedType);

        return this.http.post<VerificationResponse>(`${this.API_URL}/verify-document`, formData)
            .pipe(
                timeout(30000),
                catchError(error => {
                    console.error('Verification error:', error);
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
