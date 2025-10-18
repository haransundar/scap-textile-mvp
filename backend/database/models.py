"""
MongoDB models using Pydantic for data validation
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from bson import ObjectId
from enum import Enum

# Custom ObjectId type for Pydantic
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# Enums
class CertificateStatus(str, Enum):
    VALID = "valid"
    EXPIRING_SOON = "expiring_soon"
    EXPIRED = "expired"
    PENDING = "pending"
    REJECTED = "rejected"


class CertificateType(str, Enum):
    ISO_9001 = "ISO 9001"
    ISO_14001 = "ISO 14001"
    ISO_45001 = "ISO 45001"
    GOTS = "GOTS"
    OCS = "OCS"
    FAIR_TRADE = "Fair Trade"
    BSCI = "BSCI"
    SMETA = "SMETA"
    OTHER = "Other"


class ExtractionConfidence(BaseModel):
    overall: float = Field(..., ge=0, le=1, description="Overall confidence score (0-1)")
    fields: Dict[str, float] = Field(default_factory=dict, description="Confidence scores per field")


class OCRExtraction(BaseModel):
    raw_text: str
    processed_text: str
    language: str
    confidence: float


class CertificateBase(BaseModel):
    name: str
    certificate_number: str
    certificate_type: CertificateType
    issuer: str
    issued_to: str
    issued_date: datetime
    expiry_date: datetime
    scope: str
    description: Optional[str] = None
    document_url: str
    thumbnail_url: Optional[str] = None
    status: CertificateStatus = CertificateStatus.PENDING
    verification_status: bool = False
    confidence: ExtractionConfidence
    ocr_data: OCRExtraction
    metadata: Dict[str, Any] = {}
    tags: List[str] = []
    created_by: PyObjectId
    organization_id: PyObjectId

    class Config:
        json_encoders = {ObjectId: str}
        use_enum_values = True
        arbitrary_types_allowed = True


class CertificateCreate(CertificateBase):
    pass


class CertificateUpdate(BaseModel):
    name: Optional[str] = None
    certificate_number: Optional[str] = None
    certificate_type: Optional[CertificateType] = None
    issuer: Optional[str] = None
    issued_to: Optional[str] = None
    issued_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    scope: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CertificateStatus] = None
    verification_status: Optional[bool] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        json_encoders = {ObjectId: str}
        use_enum_values = True


class CertificateInDB(CertificateBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        use_enum_values = True
        allow_population_by_field_name = True


# Create indexes for better query performance
async def create_indexes(db):
    await db.certificates.create_index("certificate_number", unique=True)
    await db.certificates.create_index("certificate_type")
    await db.certificates.create_index("issuer")
    await db.certificates.create_index("issued_to")
    await db.certificates.create_index("expiry_date")
    await db.certificates.create_index("status")
    await db.certificates.create_index("created_by")
    await db.certificates.create_index("organization_id")
