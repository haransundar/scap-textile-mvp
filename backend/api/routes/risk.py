"""
Risk prediction endpoints
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from bson import ObjectId

from services.risk_predictor import risk_predictor
from database.mongodb import get_database
from models.risk import RiskScoreResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/score/{supplier_id}")
async def get_risk_score(supplier_id: str):
    """Get current risk score for supplier"""
    db = get_database()
    
    # Get latest risk score
    risk_score = await db.risk_scores.find_one(
        {"supplier_id": supplier_id},
        sort=[("calculated_at", -1)]
    )
    
    if not risk_score:
        # Calculate if not exists
        return await calculate_risk_score(supplier_id)
    
    risk_score["_id"] = str(risk_score["_id"])
    return risk_score


@router.post("/calculate/{supplier_id}")
async def calculate_risk_score(supplier_id: str):
    """Calculate and store risk score for supplier"""
    db = get_database()
    
    # Get supplier data
    try:
        supplier = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid supplier ID")
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Get certificates to calculate days to expiry
    certificates = await db.certificates.find({"supplier_id": supplier_id}).to_list(length=100)
    
    days_to_expiry = 365  # Default
    if certificates:
        # Find nearest expiry
        expiry_dates = [cert.get("expiry_date") for cert in certificates if cert.get("expiry_date")]
        if expiry_dates:
            nearest_expiry = min(expiry_dates)
            if isinstance(nearest_expiry, str):
                from datetime import datetime
                nearest_expiry = datetime.fromisoformat(nearest_expiry.replace('Z', '+00:00'))
            days_to_expiry = (nearest_expiry - datetime.utcnow()).days
    
    # Build features
    features = {
        "days_to_cert_expiry": days_to_expiry,
        "past_audit_failures": 0,  # TODO: Get from audit history
        "financial_health_score": 70.0,  # TODO: Calculate from financial data
        "news_sentiment_score": 0.0,  # TODO: Analyze news
        "geographic_risk_score": 0.2  # TODO: Calculate based on location
    }
    
    # Calculate risk
    risk_result = risk_predictor.calculate_risk_score(features)
    
    # Store in database
    risk_doc = {
        "supplier_id": supplier_id,
        "score": risk_result["score"],
        "risk_drivers": risk_result["risk_drivers"],
        "features": features,
        "calculated_at": datetime.utcnow()
    }
    
    result = await db.risk_scores.insert_one(risk_doc)
    
    # Update supplier's risk score
    await db.suppliers.update_one(
        {"_id": ObjectId(supplier_id)},
        {
            "$set": {
                "risk_score": risk_result["score"],
                "risk_drivers": [d["factor"] for d in risk_result["risk_drivers"]]
            }
        }
    )
    
    risk_doc["_id"] = str(result.inserted_id)
    logger.info(f"✅ Calculated risk score for {supplier_id}: {risk_result['score']}")
    
    return risk_doc


@router.get("/history/{supplier_id}")
async def get_risk_history(supplier_id: str, days: int = 180):
    """Get risk score history for supplier"""
    db = get_database()
    
    since_date = datetime.utcnow() - timedelta(days=days)
    
    cursor = db.risk_scores.find(
        {
            "supplier_id": supplier_id,
            "calculated_at": {"$gte": since_date}
        },
        sort=[("calculated_at", 1)]
    )
    
    history = await cursor.to_list(length=1000)
    
    for item in history:
        item["_id"] = str(item["_id"])
    
    return {
        "supplier_id": supplier_id,
        "period_days": days,
        "history": history
    }
