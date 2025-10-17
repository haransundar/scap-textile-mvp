"""
Certificate data models
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CertificateBase(BaseModel):
    type: str = Field(description="GOTS/ISO14001/OEKO-TEX/SA8000/BSCI")
    number: str
    issued_by: str
    issued_date: datetime
    expiry_date: datetime
    scope: Optional[str] = None


class CertificateCreate(CertificateBase):
    supplier_id: str
    file_path: str
    ocr_confidence: float = Field(ge=0.0, le=1.0)


class CertificateUpdate(BaseModel):
    verification_status: str = Field(pattern="^(pending|verified|expired)$")


class CertificateResponse(CertificateBase):
    id: str = Field(alias="_id")
    supplier_id: str
    file_path: str
    verification_status: str = "pending"
    ocr_confidence: float
    created_at: datetime

    class Config:
        populate_by_name = True
