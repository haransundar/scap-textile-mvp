"""
Supplier data models
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class Address(BaseModel):
    street: str
    city: str
    state: str
    country: str = "India"
    pincode: str


class SupplierBase(BaseModel):
    name: str
    tier: int = Field(ge=2, le=4, description="Supplier tier (2-4)")
    contact_person: str
    email: EmailStr
    phone: str
    address: Address
    language_preference: str = Field(default="en", pattern="^(en|ta|hi)$")
    industry_type: str = Field(description="dyeing/spinning/weaving/knitting")
    employee_count: Optional[int] = None
    annual_turnover: Optional[float] = None


class SupplierCreate(SupplierBase):
    password: str = Field(min_length=8)


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Address] = None
    language_preference: Optional[str] = None
    industry_type: Optional[str] = None
    employee_count: Optional[int] = None
    annual_turnover: Optional[float] = None


class SupplierResponse(SupplierBase):
    id: str = Field(alias="_id")
    risk_score: float = 50.0
    risk_drivers: List[str] = []
    connected_brands: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
