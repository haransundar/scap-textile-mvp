# Certificate Management Module

This module provides AI-powered certificate management for the SCAP platform, enabling users to upload, process, and manage compliance certificates with automated text extraction and data structuring.

## Features

- **AI-Powered Certificate Processing**
  - Multi-language OCR with EasyOCR (supports English, Hindi, Tamil, and more)
  - Smart text extraction with confidence scoring
  - Automatic data structuring with Gemini AI
  - Image preprocessing for improved OCR accuracy

- **Certificate Management**
  - Upload and store certificates in various formats (PDF, JPG, PNG)
  - Automatic certificate type detection
  - Expiry tracking with notifications
  - Digital certificate repository with secure access

- **Data Extraction**
  - Automatic extraction of key fields:
    - Certificate type and number
    - Issuing organization
    - Issue and expiry dates
    - Scope and validity
    - Certificate holder details

## API Endpoints

### Upload Certificate
- **POST** `/api/certificates/upload`
  - Upload a certificate file for processing
  - Supports: PDF, JPG, PNG
  - Returns: Processed certificate data with extracted fields

### List Certificates
- **GET** `/api/certificates/`
  - List all certificates with filtering and pagination
  - Query parameters:
    - `status`: Filter by status (valid, expiring_soon, expired)
    - `type`: Filter by certificate type
    - `search`: Search in certificate details
    - `page`: Page number (default: 1)
    - `per_page`: Items per page (default: 10)

### Get Certificate
- **GET** `/api/certificates/{certificate_id}`
  - Get detailed information about a specific certificate

### Update Certificate
- **PUT** `/api/certificates/{certificate_id}`
  - Update certificate information
  - Supports partial updates

### Delete Certificate
- **DELETE** `/api/certificates/{certificate_id}`
  - Remove a certificate from the system

## Data Models

### Certificate
```typescript
{
  _id: string;                  // Unique identifier
  user_id: string;              // Owner of the certificate
  certificate_type: string;     // Type of certificate (e.g., 'ISO 9001', 'GOTS')
  certificate_number: string;   // Certificate identifier
  issued_by: string;            // Issuing organization
  issued_to: string;            // Company/entity the certificate was issued to
  issued_date: string;          // Date when issued (ISO format)
  expiry_date: string;          // Expiration date (ISO format)
  scope: string;                // Description of certification scope
  status: 'valid' | 'expiring_soon' | 'expired' | 'unknown';
  original_filename: string;    // Original uploaded filename
  file_path: string;            // Path to stored file
  ocr_text: string;             // Raw extracted text
  ocr_confidence: number;       // Confidence score (0-1)
  verified: boolean;            // Whether data has been manually verified
  needs_review: boolean;        // Whether manual review is needed
  created_at: string;           // When record was created (ISO format)
  updated_at: string;           // Last update timestamp (ISO format)
}
```

## Processing Flow

1. **Upload & Preprocessing**
   - File validation (type, size)
   - Image preprocessing (contrast enhancement, noise reduction)
   - Conversion to appropriate format if needed

2. **Text Extraction**
   - OCR processing with language detection
   - Text cleaning and normalization
   - Confidence scoring

3. **Data Structuring**
   - AI-powered field extraction
   - Data validation and standardization
   - Confidence-based review flagging

4. **Storage & Indexing**
   - Secure file storage
   - Database record creation
   - Search indexing

## Error Handling

- **400 Bad Request**: Invalid input data or file
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Certificate not found
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Processing failed

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment variables (`.env`):
   ```
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=scap
   GOOGLE_API_KEY=your-google-ai-key
   ```

3. Start the service:
   ```bash
   uvicorn main:app --reload
   ```

## Testing

Run the test suite:
```bash
pytest tests/
```

## License

This module is part of the SCAP platform and is licensed under the MIT License.
