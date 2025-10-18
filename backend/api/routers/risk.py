"""
Risk Analysis API Endpoints

This module provides API endpoints for risk analysis functionality.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from ....database import get_database
from ....services.risk_service import RiskService
from ....models.user import User
from ....api.dependencies.auth import get_current_active_user

router = APIRouter(
    prefix="/api/risk",
    tags=["risk"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

@router.get("/calculate/{supplier_id}", response_model=Dict[str, Any])
async def calculate_risk(
    supplier_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    """
    Calculate and return the current risk assessment for a supplier
    
    This endpoint calculates a comprehensive risk score based on various factors
    including certificate status, audit history, and financial health.
    """
    try:
        risk_service = RiskService(db)
        risk_data = await risk_service.calculate_risk(supplier_id)
        return risk_data
        
    except ValueError as e:
        logger.error(f"Risk calculation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in risk calculation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate risk: {str(e)}"
        )

@router.get("/history/{supplier_id}", response_model=Dict[str, Any])
async def get_risk_history(
    supplier_id: str,
    days: int = 180,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    """
    Get historical risk scores for a supplier
    
    Returns a time series of risk scores for the specified time period.
    """
    try:
        risk_service = RiskService(db)
        history = await risk_service.get_risk_history(supplier_id, days=days)
        return {"history": history}
        
    except Exception as e:
        logger.error(f"Error fetching risk history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch risk history: {str(e)}"
        )

@router.post("/recalculate/{supplier_id}", response_model=Dict[str, Any])
async def recalculate_risk(
    supplier_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    """
    Force recalculation of risk score
    
    This endpoint triggers a fresh calculation of the risk score, bypassing any cached results.
    """
    try:
        risk_service = RiskService(db)
        risk_data = await risk_service.calculate_risk(supplier_id, force_recalculate=True)
        return risk_data
        
    except Exception as e:
        logger.error(f"Error in risk recalculation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to recalculate risk: {str(e)}"
        )

@router.get("/drivers/{supplier_id}", response_model=Dict[str, Any])
async def get_risk_drivers(
    supplier_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    """
    Get the top risk drivers for a supplier
    
    Returns the top 3 factors contributing to the supplier's risk score.
    """
    try:
        risk_service = RiskService(db)
        risk_data = await risk_service.calculate_risk(supplier_id)
        return {
            "supplier_id": supplier_id,
            "drivers": risk_data.get("drivers", []),
            "last_updated": risk_data.get("last_updated")
        }
        
    except Exception as e:
        logger.error(f"Error getting risk drivers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get risk drivers: {str(e)}"
        )

@router.get("/benchmark/{supplier_id}", response_model=Dict[str, Any])
async def get_risk_benchmark(
    supplier_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    """
    Get risk benchmark data for a supplier
    
    Compares the supplier's risk score to industry benchmarks.
    """
    try:
        risk_service = RiskService(db)
        risk_data = await risk_service.calculate_risk(supplier_id)
        
        # Placeholder benchmark data - replace with actual benchmark calculation
        benchmark_data = {
            "supplier_score": risk_data["risk_score"],
            "industry_average": 52.0,
            "top_percentile": 25.0,
            "bottom_percentile": 75.0,
            "comparison_metrics": [
                {"metric": "Certificate Health", "supplier": risk_data["sub_scores"]["certificate_health"], "industry": 68},
                {"metric": "Audit Performance", "supplier": risk_data["sub_scores"]["audit_performance"], "industry": 72},
                {"metric": "Financial Stability", "supplier": risk_data["sub_scores"]["financial_stability"], "industry": 65},
                {"metric": "Regulatory Compliance", "supplier": risk_data["sub_scores"]["regulatory_compliance"], "industry": 78}
            ]
        }
        
        return benchmark_data
        
    except Exception as e:
        logger.error(f"Error getting risk benchmark: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get risk benchmark: {str(e)}"
        )

@router.get("/mitigations/{supplier_id}", response_model=List[Dict[str, Any]])
async def get_risk_mitigations(
    supplier_id: str,
    current_user: User = Depends(get_current_active_user),
    db=Depends(get_db)
):
    """
    Get recommended risk mitigation strategies for a supplier
    
    Returns a list of actionable recommendations to reduce the supplier's risk.
    """
    try:
        risk_service = RiskService(db)
        risk_data = await risk_service.calculate_risk(supplier_id)
        
        # Generate mitigation recommendations based on risk drivers
        mitigations = []
        
        for driver in risk_data.get("drivers", []):
            mitigation = {
                "risk_factor": driver["factor"],
                "current_value": driver.get("value", "N/A"),
                "recommendation": driver.get("action", "Review and improve"),
                "priority": driver.get("impact", "medium"),
                "action_url": driver.get("action_url", "/dashboard")
            }
            mitigations.append(mitigation)
        
        return mitigations
        
    except Exception as e:
        logger.error(f"Error getting risk mitigations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get risk mitigations: {str(e)}"
        )
