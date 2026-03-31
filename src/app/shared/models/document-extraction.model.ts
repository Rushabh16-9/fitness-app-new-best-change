export interface ExtractedMarksheetData {
    personalInfo: {
        firstName: string;
        middleName: string;
        lastName: string;
        mothersName: string;
        gender: 'Male' | 'Female' | '';
        abcId?: string;
        candidateName?: string;
        dob?: string;
        seatNo?: string;
    };
    academicInfo: {
        board: string;
        passingYear: number;
        passingMonth?: string;
        atktCount?: number;
        subjects: Array<{
            name: string;
            marks: number;
        }>;
        totalMarks: number;
        percentage: number;
        marksObtained?: number;
        marksOutof?: number;
        cgpa?: string;
        sgpa?: string;
        grade?: string;
        examination?: string;
        semester?: string;
    };
}

export interface DocumentVerification {
    isValid: boolean;
    confidence: number;
    documentType: string;
    reason: string;
}

export interface ExtractionResponse {
    success: boolean;
    data?: ExtractedMarksheetData;
    error?: string;
    rawResponse?: string;
}

export interface VerificationResponse {
    success: boolean;
    verification?: DocumentVerification;
    error?: string;
}
