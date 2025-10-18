"""
Risk assessment models for SCAP (Supply Chain AI Compliance Platform)
"""
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RiskTrend(str, Enum):
    INCREASING = "increasing"
    DECREASING = "decreasing"
    STABLE = "stable"


class RiskDriver(BaseModel):
    """Model representing a single risk driver"""
    rank: int = Field(..., ge=1, le=3, description="Rank of the risk driver (1-3)")
    factor: str = Field(..., description="Name of the risk factor")
    weight: float = Field(..., ge=0.0, le=1.0, description="Weight of this factor in the overall risk score")
    description: str = Field(..., description="Human-readable description of the risk factor")
    impact: Literal["low", "medium", "high"] = Field(..., description="Impact level of this risk factor")
    action: str = Field(..., description="Recommended action to mitigate this risk")
    action_url: str = Field(..., description="URL to take action on this risk")
    value: Optional[Any] = Field(None, description="Current value of the risk factor")


class RiskSubScores(BaseModel):
    """Model representing sub-scores for different risk categories"""
    certificate_health: int = Field(..., ge=0, le=100, description="Health score based on certificate status")
    audit_performance: int = Field(..., ge=0, le=100, description="Performance score based on audit results")
    financial_stability: int = Field(..., ge=0, le=100, description="Financial health score")
    regulatory_compliance: int = Field(..., ge=0, le=100, description="Compliance with regulations")


class RiskFeatures(BaseModel):
    """Model representing the features used in risk calculation"""
    days_to_nearest_expiry: float
    total_certificates: float
    expired_count: float
    expiring_soon_count: float
    valid_count: float
    audit_pass_rate: float
    avg_certificate_validity_days: float
    financial_health_score: float
    geographic_risk_score: float
    years_in_business: float


class RiskScoreResponse(BaseModel):
    """Response model for risk score calculation"""
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Overall risk score (0-100)")
    risk_level: RiskLevel = Field(..., description="Risk level category")
    last_updated: str = Field(..., description="ISO timestamp of when the score was last updated")
    drivers: List[RiskDriver] = Field(..., description="Top 3 risk drivers")
    sub_scores: RiskSubScores = Field(..., description="Detailed sub-scores for different risk categories")
    trend: RiskTrend = Field(..., description="Trend of the risk score")
    change_from_last_month: float = Field(..., description="Change in risk score from last month")
    industry_benchmark: float = Field(..., description="Industry average risk score for comparison")
    features: Optional[RiskFeatures] = Field(None, description="Raw feature values used in calculation")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class RiskHistoryItem(BaseModel):
    """Model for historical risk score data points"""
    date: str = Field(..., description="ISO timestamp of the score")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Risk score at this date")


class RiskHistoryResponse(BaseModel):
    """Response model for risk history endpoint"""
    supplier_id: str = Field(..., description="ID of the supplier")
    history: List[RiskHistoryItem] = Field(..., description="Historical risk scores")


class RiskBenchmarkResponse(BaseModel):
    """Response model for risk benchmark data"""
    supplier_score: float = Field(..., ge=0.0, le=100.0, description="Supplier's current risk score")
    industry_average: float = Field(..., ge=0.0, le=100.0, description="Industry average risk score")
    top_percentile: float = Field(..., ge=0.0, le=100.0, description="Top percentile risk score")
    bottom_percentile: float = Field(..., ge=0.0, le=100.0, description="Bottom percentile risk score")
    comparison_metrics: List[Dict[str, Any]] = Field(..., description="Detailed comparison metrics")
