"""
Certificate data models for SCAP platform
"""
from pydantic import BaseModel, Field, validator, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
from bson import ObjectId
from typing_extensions import Literal

class CertificateType(str, Enum):
    GOTS = "GOTS"
    ISO_9001 = "ISO 9001"
    ISO_14001 = "ISO 14001"
    OEKO_TEX = "OEKO-TEX"
    SA8000 = "SA8000"
    BSCI = "BSCI"
    FAIR_TRADE = "Fair Trade"
    OTHER = "Other"

class CertificateStatus(str, Enum):
    VALID = "valid"
    EXPIRING_SOON = "expiring_soon"
    EXPIRED = "expired"
    UNKNOWN = "unknown"

class CertificateBase(BaseModel):
    """Base model for certificate data"""
    certificate_type: CertificateType = Field(..., description="Type of certification")
    certificate_number: str = Field(..., description="Unique identifier for the certificate")
    issued_by: str = Field(..., description="Name of the issuing organization")
    issued_to: str = Field(..., description="Name of the company/entity the certificate was issued to")
    issued_date: date = Field(..., description="Date when the certificate was issued")
    expiry_date: date = Field(..., description="Date when the certificate expires")
    scope: Optional[str] = Field(None, description="Description of the certification scope")
    certificate_holder_address: Optional[str] = Field(None, description="Address of the certificate holder")
    status: CertificateStatus = Field(default=CertificateStatus.UNKNOWN, description="Current status of the certificate")
    
    @validator('expiry_date', pre=True)
    def validate_expiry_date(cls, v, values):
        if 'issued_date' in values and v and values['issued_date'] and v < values['issued_date']:
            raise ValueError('Expiry date must be after issued date')
        return v

class CertificateCreate(CertificateBase):
    """Model for creating a new certificate"""
    user_id: str = Field(..., description="ID of the user who uploaded the certificate")
    original_filename: str = Field(..., description="Original filename of the uploaded file")
    file_path: str = Field(..., description="Path to the stored certificate file")
    ocr_text: str = Field(..., description="Raw text extracted by OCR")
    ocr_confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score of OCR extraction (0-1)")
    structured_data: Dict[str, Any] = Field(default_factory=dict, description="Structured data extracted by AI")
    verified: bool = Field(default=False, description="Whether the data has been manually verified")
    
    class Config:
        json_encoders = {
            ObjectId: str,
            date: lambda v: v.isoformat() if v else None
        }

class CertificateUpdate(BaseModel):
    """Model for updating an existing certificate"""
    certificate_type: Optional[CertificateType] = None
    certificate_number: Optional[str] = None
    issued_by: Optional[str] = None
    issued_to: Optional[str] = None
    issued_date: Optional[date] = None
    expiry_date: Optional[date] = None
    scope: Optional[str] = None
    certificate_holder_address: Optional[str] = None
    verified: Optional[bool] = None
    
    class Config:
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }

class CertificateResponse(CertificateBase):
    """Response model for certificate data"""
    id: str = Field(..., alias="_id", description="Unique identifier for the certificate")
    user_id: str = Field(..., description="ID of the user who uploaded the certificate")
    original_filename: str = Field(..., description="Original filename of the uploaded file")
    file_url: Optional[HttpUrl] = Field(None, description="URL to access the certificate file")
    ocr_confidence: float = Field(..., description="Confidence score of OCR extraction (0-1)")
    uploaded_at: datetime = Field(..., description="When the certificate was uploaded")
    updated_at: Optional[datetime] = Field(None, description="When the certificate was last updated")
    verified: bool = Field(..., description="Whether the data has been manually verified")
    needs_review: bool = Field(..., description="Whether the certificate needs manual review")
    
    class Config:
        json_encoders = {
            ObjectId: str,
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None
        }
        populate_by_name = True
        use_enum_values = True

class CertificateListResponse(BaseModel):
    """Response model for paginated list of certificates"""
    certificates: List[CertificateResponse] = Field(..., description="List of certificates")
    total: int = Field(..., description="Total number of certificates")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of items per page")
    stats: Dict[str, int] = Field(..., description="Statistics about certificate statuses")
