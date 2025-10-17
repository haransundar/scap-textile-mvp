"""
Risk assessment models
"""
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


class RiskDriver(BaseModel):
    factor: str
    weight: float = Field(ge=0.0, le=1.0)
    description: str


class RiskFeatures(BaseModel):
    days_to_cert_expiry: int
    past_audit_failures: int
    financial_health_score: float = Field(ge=0.0, le=100.0)
    news_sentiment_score: float = Field(ge=-1.0, le=1.0)
    geographic_risk_score: float = Field(ge=0.0, le=1.0)


class RiskScoreResponse(BaseModel):
    id: str = Field(alias="_id")
    supplier_id: str
    score: float = Field(ge=0.0, le=100.0)
    risk_drivers: List[RiskDriver]
    features: RiskFeatures
    calculated_at: datetime

    class Config:
        populate_by_name = True
