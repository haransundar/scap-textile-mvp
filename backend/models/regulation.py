"""
Regulatory update models
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime


class BannedChemical(BaseModel):
    name: str
    cas_number: str


class RegulationBase(BaseModel):
    regulation_title: str
    jurisdiction: str = Field(pattern="^(EU|India|International)$")
    source_url: HttpUrl
    article_reference: Optional[str] = None
    summary: str = Field(max_length=500)
    effective_date: datetime
    penalty: Optional[str] = None
    affected_sectors: List[str] = []
    banned_chemicals: List[BannedChemical] = []
    labor_requirements: List[str] = []


class RegulationCreate(RegulationBase):
    version: str = "1.0"
    previous_version_id: Optional[str] = None


class RegulationResponse(RegulationBase):
    id: str = Field(alias="_id")
    version: str
    affected_suppliers: List[str] = []
    alert_sent: bool = False
    created_at: datetime

    class Config:
        populate_by_name = True
