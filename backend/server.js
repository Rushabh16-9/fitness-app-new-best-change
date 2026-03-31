const express = require('express');
const multer = require('multer');
const axios = require('axios');
const sharp = require('sharp');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { createCanvas } = require('canvas');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: 'AIzaSyBgYUk7T_8ys-13KbS0bzAk_orI6TEEbs8' });
const GEMINI_VISION_MODEL = 'gemini-2.5-flash-lite';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG images and PDF files are allowed.'));
        }
    }
});

// Wrapper middleware to handle multer errors
const uploadMiddleware = (req, res, next) => {
    const uploadSingle = upload.single('document');
    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: `File upload error: ${err.message}` });
        } else if (err) {
            console.error('Unknown upload error:', err);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// Disable worker for Node.js environment
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

// Helper function to convert PDF to image
async function pdfToImage(pdfBuffer) {
    try {
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(pdfBuffer),
            disableFontFace: true,
            disableRange: true,
            verbosity: 0
        });
        const pdfDocument = await loadingTask.promise;
        const page = await pdfDocument.getPage(1);
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        const renderContext = { canvasContext: context, viewport: viewport };
        await page.render(renderContext).promise;
        return canvas.toBuffer('image/jpeg', { quality: 0.95 });
    } catch (error) {
        console.error('PDF to image conversion error:', error);
        throw new Error(`Failed to convert PDF to image: ${error.message}`);
    }
}

// Utility for delays (handling 429 rate limits)
const sleepMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Single call: verifies document type AND extracts data simultaneously
async function extractWithGemini(imageBuffer, mimeType, expectedDocType) {
    const base64Image = imageBuffer.toString('base64');

    const promptText = `You are a highly capable AI specialized in Indian academic document data extraction.

STEP 1 - STRICT VERIFICATION: Verify if this image is EXACTLY a "${expectedDocType || 'SSC, HSC, Diploma, Degree, or Semester Marksheet'}".
- If the expected type is "SSC Marksheet", the image MUST be a 10th grade marksheet. If the image is a 12th grade/HSC marksheet, you MUST reject it by setting "notAMarksheet": true.
- If the expected type is "HSC Marksheet", the image MUST be a 12th grade marksheet. If the image is a 10th grade/SSC marksheet, you MUST reject it by setting "notAMarksheet": true.
- If the expected type contains "Semester", "Degree", or "Diploma", ensure the image is a college or university marksheet for that level and reject school-level marksheets.
- CRITICAL: If the image is a picture of a person, an apple, a random object, scenery, a blank page, or ANY non-academic document, you MUST immediately reject it by setting "notAMarksheet": true and providing a descriptive "invalidReason" (e.g. "This is a photo of a random object, not a marksheet").

STEP 2 - EXTRACT: If the document strictly matches the expected type, extract the fields below.

Return ONLY a valid JSON object with this exact structure. No markdown, no explanation:
{
  "notAMarksheet": false,
  "invalidReason": "",
  "identifiedDocumentType": "",
  "personalInfo": {
    "firstName": "",
    "middleName": "",
    "lastName": "",
    "mothersName": "",
    "gender": "",
    "dob": "",
    "seatNo": "",
    "candidateName": "",
    "abcId": ""
  },
  "academicInfo": {
    "board": "",
    "schoolName": "",
    "examination": "",
    "passingYear": "",
    "passingMonth": "",
    "marksObtained": "",
    "marksOutof": "",
    "percentage": "",
    "cgpa": "",
    "sgpa": "",
        "creditPoints": "",
        "creditGrade": "",
    "semester": "",
    "grade": "",
    "result": "",
    "atktCount": "",
    "stream": "",
    "subjects": [
      {
        "name": "",
        "marks": ""
      }
    ]
  }
}

Rules:
- identifiedDocumentType: You MUST classify the document type in this field. Output EXACTLY one of: "SSC/10th", "HSC/12th", "Semester X" (replace X with the number), "Degree", "Diploma", or "Unknown". Look carefully at the keywords like Secondary, Higher Secondary, SSC, HSC, or Semester.
- notAMarksheet: set true ONLY if the document is completely unrelated or explicitly a mismatch for "${expectedDocType || 'Marksheet'}" (e.g., uploading HSC when SSC is requested). Treat semester marksheets valid if "Semester" or "Degree" is expected.
- invalidReason: short explanation if notAMarksheet is true.
- examination: 'HSC', 'SSC', 'Diploma', 'Degree', or the specific exam name.
- result: 'PASS', 'FAIL', 'PROMOTED', or empty if not clearly stated.
- passingYear: Identify the year the exam was held or passed. Look for "Month/Year of Exam", "Exam Held In", or similar fields. Extract ONLY the 4-digit year (YYYY format, e.g., "2024").
- passingMonth: Identify the month the exam was held or passed. E.g., if it says "October 2024", extract "October". Extract the full English month name.
- percentage: number only (e.g., 85.50). If only SGPA/CGPA is present, leave empty.
- sgpa/cgpa: number only (e.g., 8.5)
- creditPoints: extract the total grade points / total credits points if printed (e.g., "∑CG", "Credit Points", "Total Grade Points").
- creditGrade: extract the aggregate credit grade / final credit grade if printed.
- semester: extract the semester number if visible (e.g., "1", "2", "6").
- seatNo: alphanumeric seat/roll number or PRN.
- atktCount: Look at the marks/grades table. Count how many subjects have "F" (Fail), "FF", or "ABS" (Absent), or require a re-attempt. If the student passed all subjects, return "0". If there are 2 failed subjects, return "2".
- STRICT SEMESTER MATCH: If expectedDocType indicates "Sem 1" and document is Sem 2 (or vice versa), set notAMarksheet=true with an invalidReason like "Uploaded document is Semester 2 marksheet, but Semester 1 marksheet is required."

CANDIDATE NAME EXTRACTION (CRITICAL RULES):
  Primary Anchor: Find the specific text label "Name of Candidate" or "Candidate Name" in the top section of the document (top 30%).
  Target Value: Extract the name printed IMMEDIATELY TO THE RIGHT of that anchor label. This is the ONLY valid name for candidateName.
  The "Bottom 25%" Rule (STRICT EXCLUSION): Ignore ALL text in the bottom quarter of the image.
    - If a name is located near a signature, a stamp, or the words "Principal", "Controller", "Checked by", or "Examination", it is an official's name. It is INVALID. Discard it.
    - Ignore the names "Ketan Lalji Jain" or "Kinjal Bharat Jain" entirely.
  Verification: The correct student's name WILL be physically close to the "Seat No", "Student ID", and "ABC ID" fields. If the name you found is not near these fields, discard it and look at the top header again.

- gender: Look for a "Gender" field in the top table. Extract "Male" or "Female" exactly.
- board: For degree/semester marksheets, look for "University of Mumbai" or the affiliating university name. Set this as the board.
- schoolName: Set to the college name exactly as printed (e.g., "Royal College of Arts, Science and Commerce").
- mothersName: mother's name exactly as printed.
- abcId: ABC ID or APAAR ID if visible. Common format: "ABC ID: XXXXXXXXXXXX". Extract only the numeric ID.
- IMPORTANT - Indian name format is SURNAME FIRSTNAME MIDDLENAME:
  - lastName = first word, firstName = second word, middleName = remaining words
  - If 2 words: lastName = first, firstName = second, middleName = ''
- Do not leave firstName/middleName/lastName empty if candidateName is filled.
- DEGREE MARKS/TABLES: Look for "Total Marks", "∑CG", "∑C", "Marks Obtained" at the bottom of the marks table. Copy the printed totals (e.g., 397 for obtained, 550 for out of).
- subjects: For each subject row in the grade card, extract the subject name and the total marks obtained for that subject.`;

    const MAX_RETRIES = 3;
    let lastErr;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: GEMINI_VISION_MODEL,
                contents: [
                    promptText,
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType
                        }
                    }
                ],
                config: {
                    responseMimeType: "application/json",
                }
            });

            let content = response.text || '{}';

            const parsed = JSON.parse(content);

            const expectedText = (expectedDocType || '').toString().toLowerCase();
            const expectedSem = /\b(sem|semester|semister)\s*[-_]?\s*(1|i)\b/.test(expectedText) ? '1' : /\b(sem|semester|semister)\s*[-_]?\s*(2|ii)\b/.test(expectedText) ? '2' : '';
            const examText = (parsed?.academicInfo?.examination || '').toString().toLowerCase();
            const identifiedType = (parsed?.identifiedDocumentType || '').toString().toUpperCase();
            
            // Extract semester from wherever possible
            const extractedSem = (parsed?.academicInfo?.semester || '').toString().trim()
                || (/\b(sem|semester|semister)\s*[-_]?\s*(1|i)\b/.test(examText) ? '1' : /\b(sem|semester|semister)\s*[-_]?\s*(2|ii)\b/.test(examText) ? '2' : '')
                || (identifiedType.includes('SEMESTER 1') ? '1' : identifiedType.includes('SEMESTER 2') ? '2' : '');

            const isExpectedSsc = /\b(ssc|10th|tenth|10\s*th|secondary)\b/.test(expectedText) && !/\bhigher\b/.test(expectedText);
            const isExpectedHsc = /\b(hsc|12th|twelfth|12\s*th|higher\s*secondary)\b/.test(expectedText);
            
            const isExtractedSsc = identifiedType.includes('SSC') || identifiedType.includes('10TH') || (/\b(ssc|10th|tenth|10\s*th|secondary)\b/.test(examText) && !/\bhigher\b/.test(examText));
            const isExtractedHsc = identifiedType.includes('HSC') || identifiedType.includes('12TH') || /\b(hsc|12th|twelfth|12\s*th|higher\s*secondary)\b/.test(examText);

            // 1. Cross-matching SSC vs HSC
            if (isExpectedSsc && isExtractedHsc && !isExtractedSsc) {
                parsed.notAMarksheet = true;
                parsed.invalidReason = `Uploaded document appears to be an HSC (12th) marksheet, but an SSC (10th) marksheet is required.`;
            } else if (isExpectedHsc && isExtractedSsc && !isExtractedHsc) {
                parsed.notAMarksheet = true;
                parsed.invalidReason = `Uploaded document appears to be an SSC (10th) marksheet, but an HSC (12th) marksheet is required.`;
            } 
            // 2. Cross-matching Semesters vs Schools
            else if (expectedSem && (isExtractedSsc || isExtractedHsc)) {
                parsed.notAMarksheet = true;
                const foundType = isExtractedSsc ? 'SSC' : 'HSC';
                parsed.invalidReason = `Uploaded document appears to be an ${foundType} marksheet, but a Semester ${expectedSem} marksheet is required.`;
            } 
            else if ((isExpectedSsc || isExpectedHsc) && extractedSem) {
                parsed.notAMarksheet = true;
                const expectedType = isExpectedSsc ? 'SSC (10th)' : 'HSC (12th)';
                parsed.invalidReason = `Uploaded document appears to be a Semester marksheet, but an ${expectedType} marksheet is required.`;
            }
            // 3. Existing Sem vs Sem mismatch
            else if (expectedSem && extractedSem && expectedSem !== extractedSem) {
                parsed.notAMarksheet = true;
                parsed.invalidReason = `Uploaded document is Semester ${extractedSem} marksheet, but Semester ${expectedSem} marksheet is required.`;
            }

            // DEBUG: Log name fields specifically
            const fullName = (parsed.personalInfo?.candidateName || '').trim();
            if (fullName && !parsed.personalInfo.firstName) {
                const parts = fullName.split(/\s+/);
                if (parts.length >= 3) {
                    parsed.personalInfo.lastName = parts[0];
                    parsed.personalInfo.firstName = parts[1];
                    parsed.personalInfo.middleName = parts.slice(2).join(' ');
                } else if (parts.length === 2) {
                    parsed.personalInfo.lastName = parts[0];
                    parsed.personalInfo.firstName = parts[1];
                    parsed.personalInfo.middleName = '';
                } else {
                    parsed.personalInfo.firstName = fullName;
                }
            }
            return parsed;
        } catch (err) {
            lastErr = err;
            if (attempt < MAX_RETRIES) {
                await sleepMs(2000);
            } else {
                break;
            }
        }
    }

    console.error('Gemini extraction error:', lastErr.message || lastErr);
    throw new Error(`Failed to extract via Gemini API. Reason: ${lastErr.message || 'Unknown error'}`);
}

// Endpoint: Extract + Verify data from SSC/HSC marksheet using Gemini
app.post('/api/extract-marksheet', uploadMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const expectedDocType = req.body.expectedDocType || req.body.document_name || 'SSC or HSC Marksheet';

        let imageBuffer = req.file.buffer;
        let mimeType = req.file.mimetype;

        if (mimeType === 'application/pdf') {
            imageBuffer = await pdfToImage(req.file.buffer);
            mimeType = 'image/jpeg';
        }

        const optimizedImageBuffer = await sharp(imageBuffer)
            .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();

        const extractedData = await extractWithGemini(optimizedImageBuffer, 'image/jpeg', expectedDocType);

        if (extractedData.notAMarksheet) {
            return res.status(400).json({
                error: `Invalid document: ${extractedData.invalidReason || 'This does not appear to be a valid marksheet. Please upload the correct document.'}`
            });
        }

        delete extractedData.notAMarksheet;
        delete extractedData.invalidReason;

        res.json({
            success: true,
            data: extractedData
        });

    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({
            error: error.message || 'Failed to extract data from marksheet'
        });
    }
});

// Endpoint: Verify generic document type
app.post('/api/verify-document', uploadMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const expectedType = req.body.expectedType || 'Document';

        let imageBuffer = req.file.buffer;
        let mimeType = req.file.mimetype || 'image/jpeg';

        // If the uploaded file is a PDF, convert first page to image for AI vision
        if (mimeType === 'application/pdf') {
            imageBuffer = await pdfToImage(imageBuffer);
            mimeType = 'image/jpeg';
        }

        const base64Image = imageBuffer.toString('base64');

        const prompt = `You are a strict Indian college admission auditor with a zero-tolerance policy for incorrect document uploads. 
Your task is to analyze this image and determine if it is a genuine, legible "${expectedType}".

CRITICAL RULE: The uploaded document MUST EXACTLY MATCH the requested type: "${expectedType}".
If the document is a different type of document (e.g., if you are expecting an "Aadhaar Card" but the user uploaded a "Marksheet", "Ration Card", "Bank Statement", or "Blank Form"), you MUST reject it.

A VALID document must:
- Clearly and unambiguously be a "${expectedType}". For example, if it's an Aadhaar Card, it must have the word "Aadhaar", the logo, and a 12-digit number.
- Visually match the standard layout of a "${expectedType}".
- Be readable and not excessively blurry.

INVALID examples (must fail validation):
- A document of the WRONG type (e.g. uploading a Marksheet when an Aadhaar Card is expected).
- Photos of random objects, fruits, people, scenery, or completely unrelated documents.
- A blank form without filled details.
- A handwritten note or unrelated screenshot.

Return ONLY a JSON object. Ensure you provide a clear reason if it is rejected:
{
  "isValid": true or false,
  "confidence": number between 0 and 100,
  "reason": "If invalid, explain exactly why (e.g. 'This is a HSC Marksheet, not an Aadhaar Card'). If valid, say 'Valid'."
}`;

        const response = await ai.models.generateContent({
            model: GEMINI_VISION_MODEL,
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });
        let responseText1 = response.text || '{}';
        const parsed1 = JSON.parse(responseText1);


        // Enforce a confidence threshold: even if AI says isValid=true, reject if confidence is low
        const CONFIDENCE_THRESHOLD = 70;
        const confidence = typeof parsed1.confidence === 'number' ? parsed1.confidence : 0;
        const isValid = parsed1.isValid === true && confidence >= CONFIDENCE_THRESHOLD;
        const reason = isValid ? (parsed1.reason || 'Valid') : (parsed1.reason || `Confidence too low (${confidence}%). Please upload a clearer image of ${expectedType}.`);

        if (!isValid) {
        }

        res.json({
            success: true,
            verification: {
                isValid,
                confidence,
                documentType: expectedType,
                reason
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            error: error.message || 'Failed to verify document'
        });
    }
});


// Endpoint: Validate signature using Groq AI
app.post('/api/validate-signature', uploadMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype || 'image/jpeg';
        const base64Image = imageBuffer.toString('base64');

        const prompt = `You are a strict AI auditor validating a signature image for an Indian college admission form.

Analyze this image and determine if it is a genuine, handwritten or digitally drawn human signature.

A VALID signature MUST:
- Clearly show cursive writing, initials, or handwriting representing a person's name.
- Be on a relatively plain background (like white paper or a digital canvas).

INVALID examples (MUST REJECT IMMEDIATELY):
- Photos of human faces, animals, objects (like apples), scenery, printed text passages, entire documents/certificates.
- Blank or completely blurred images.

Return ONLY a JSON object:
{
  "isValid": true or false,
  "errors": ["reason if invalid, empty array if valid"]
}`;

        const response = await ai.models.generateContent({
            model: GEMINI_VISION_MODEL,
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });
        let responseText2 = response.text || '{}';
        const parsed2 = JSON.parse(responseText2);

        res.json({
            success: true,
            validation: {
                isValid: parsed2.isValid === true,
                errors: parsed2.errors || []
            }
        });
    } catch (error) {
        console.error('Signature validation error:', error);
        res.status(500).json({
            error: error.message || 'Failed to validate signature'
        });
    }
});

// Endpoint: Validate passport photo using Gemini AI
app.post('/api/validate-photo', uploadMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype || 'image/jpeg';
        const base64Image = imageBuffer.toString('base64');

        const prompt = `You are strict AI auditor validating a passport-size photo for an Indian college admission form.

Analyze this image and determine if it is a valid, high-quality passport-size photograph of a human person.

A VALID photo MUST:
- Clearly show a single HUMAN FACE in focus (the person's face must be clearly visible and well-lit)
- Be a portrait-style photo of a person (head and shoulders)
- Be reasonably sharp and not excessively blurry

INVALID examples (MUST REJECT IMMEDIATELY):
- Photos of animals, fruits (like apples), food, objects, scenery, documents, text, drawings
- Blurred, severely out of focus, or dark/unrecognizable images
- Group photos with multiple people
- Pictures of a screen or severely distorted images

Return ONLY a JSON object (no markdown, no explanation):
{
  "isValid": true or false,
  "errors": ["reason if invalid, empty array if valid"]
}`;

        const response = await ai.models.generateContent({
            model: GEMINI_VISION_MODEL,
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });
        let responseText3 = response.text || '{}';
        const parsed3 = JSON.parse(responseText3);

        res.json({
            success: true,
            validation: {
                isValid: parsed3.isValid === true,
                errors: parsed3.errors || []
            }
        });
    } catch (error) {
        console.error('Photo validation error:', error);
        res.status(500).json({
            error: error.message || 'Failed to validate photo'
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    res.json({ status: 'healthy', api: 'Gemini 2.5 Flash Lite Active' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled specific error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        details: err.message
    });
});

// Helper to save file to disk
async function saveFileToDisk(buffer, originalName) {
    const uploadDir = path.join(__dirname, 'uploads');
    try {
        await fs.mkdir(uploadDir, { recursive: true });
        const timestamp = Date.now();
        const safeName = originalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${timestamp}_${safeName}`;
        const filepath = path.join(uploadDir, filename);

        await fs.writeFile(filepath, buffer);
        return filename;
    } catch (error) {
        console.error('Error saving file:', error);
        throw new Error('Failed to save file to disk');
    }
}

// Endpoint: Upload PDF (matches Admission/uploadPdf)
app.post('/api/Admission/uploadPdf', uploadMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filename = await saveFileToDisk(req.file.buffer, req.file.originalname);

        res.json({
            status: 1,
            message: 'File uploaded successfully',
            dataJson: { fileName: filename }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint: Upload Doc Image (matches Admission/uploadDocImage)
app.post('/api/Admission/uploadDocImage', uploadMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const filename = await saveFileToDisk(req.file.buffer, req.file.originalname);

        res.json({
            status: 1,
            message: 'Image uploaded successfully',
            dataJson: { fileName: filename }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
});
