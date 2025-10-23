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
    
    # Get supplier data - try both suppliers and users collections
    try:
        supplier = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
        
        # If not in suppliers, try users collection
        if not supplier:
            user = await db.users.find_one({"_id": ObjectId(supplier_id)})
            if user:
                # Create supplier record from user data
                supplier = {
                    "_id": user["_id"],
                    "name": user.get("full_name", user.get("email")),
                    "email": user.get("email"),
                    "created_at": user.get("created_at"),
                    "risk_score": 0
                }
                await db.suppliers.insert_one(supplier)
                logger.info(f"✅ Created supplier record for user {supplier_id}")
    except Exception as e:
        logger.error(f"Error fetching supplier {supplier_id}: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid supplier ID: {str(e)}")
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found. Please contact support.")
    
    # Get certificates to calculate days to expiry
    certificates = await db.certificates.find({"supplier_id": supplier_id}).to_list(length=100)
    
    days_to_expiry = 365  # Default
    if certificates:
        # Find nearest expiry
        expiry_dates = [cert.get("expiry_date") for cert in certificates if cert.get("expiry_date")]
        if expiry_dates:
            nearest_expiry = min(expiry_dates)
            if isinstance(nearest_expiry, str):
                # Parse string date to datetime
                try:
                    nearest_expiry = datetime.fromisoformat(nearest_expiry.replace('Z', '+00:00'))
                except ValueError:
                    # Try parsing as date string without time
                    from dateutil.parser import parse
                    nearest_expiry = parse(nearest_expiry)
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
        item["date"] = item["calculated_at"].isoformat()
        item["risk_level"] = _get_risk_level(item["score"])
    
    return {
        "supplier_id": supplier_id,
        "period_days": days,
        "history": history
    }


@router.get("/drivers/{supplier_id}")
async def get_risk_drivers(supplier_id: str):
    """Get risk drivers for supplier"""
    db = get_database()
    
    # Get latest risk score
    risk_score = await db.risk_scores.find_one(
        {"supplier_id": supplier_id},
        sort=[("calculated_at", -1)]
    )
    
    if not risk_score:
        # Calculate if not exists
        risk_doc = await calculate_risk_score(supplier_id)
        risk_score = risk_doc
    
    drivers = risk_score.get("risk_drivers", [])
    
    # Enhance drivers with actionable info
    enhanced_drivers = []
    for driver in drivers:
        enhanced = {
            **driver,
            "action": _get_action_for_driver(driver["factor"]),
            "impact_level": _get_impact_level(driver["weight"])
        }
        enhanced_drivers.append(enhanced)
    
    return {
        "supplier_id": supplier_id,
        "drivers": enhanced_drivers,
        "calculated_at": risk_score.get("calculated_at")
    }


@router.get("/insights/{supplier_id}")
async def get_risk_insights(supplier_id: str):
    """Get AI-powered risk insights and predictions"""
    db = get_database()
    
    # Get current and historical risk
    current = await db.risk_scores.find_one(
        {"supplier_id": supplier_id},
        sort=[("calculated_at", -1)]
    )
    
    if not current:
        return {"insights": [], "predictions": []}
    
    # Get history for trend analysis
    history = await db.risk_scores.find(
        {"supplier_id": supplier_id},
        sort=[("calculated_at", -1)]
    ).to_list(length=10)
    
    insights = []
    predictions = []
    
    # Trend analysis
    if len(history) >= 2:
        score_change = current["score"] - history[1]["score"]
        if score_change > 10:
            insights.append({
                "type": "warning",
                "title": "Risk Increasing",
                "message": f"Your risk score increased by {score_change:.1f} points since last calculation",
                "severity": "high"
            })
        elif score_change < -10:
            insights.append({
                "type": "success",
                "title": "Risk Decreasing",
                "message": f"Great! Your risk score decreased by {abs(score_change):.1f} points",
                "severity": "low"
            })
    
    # Certificate expiry warnings
    certs = await db.certificates.find({"supplier_id": supplier_id}).to_list(length=100)
    expiring_soon = [c for c in certs if c.get("status") == "expiring_soon"]
    if expiring_soon:
        insights.append({
            "type": "alert",
            "title": "Certificates Expiring",
            "message": f"{len(expiring_soon)} certificate(s) expiring within 30 days",
            "severity": "medium",
            "action": "Renew certificates"
        })
    
    # Prediction
    if len(history) >= 3:
        # Simple linear prediction
        scores = [h["score"] for h in history[:3]]
        avg_change = (scores[0] - scores[-1]) / 2
        predicted_30d = current["score"] + avg_change
        
        predictions.append({
            "timeframe": "30 days",
            "predicted_score": round(predicted_30d, 1),
            "confidence": 75,
            "message": f"Based on current trend, risk may reach {predicted_30d:.0f} in 30 days"
        })
    
    return {
        "supplier_id": supplier_id,
        "insights": insights,
        "predictions": predictions,
        "calculated_at": current.get("calculated_at")
    }


@router.get("/benchmark/{supplier_id}")
async def get_risk_benchmark(supplier_id: str):
    """Get risk benchmarking data"""
    db = get_database()
    
    # Get current supplier risk
    supplier = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    current_score = supplier.get("risk_score", 0)
    
    # Calculate industry average (simplified)
    industry_scores = await db.suppliers.find({}, {"risk_score": 1}).to_list(length=1000)
    industry_avg = sum(s.get("risk_score", 0) for s in industry_scores) / len(industry_scores) if industry_scores else 50
    
    # Calculate percentile
    scores_list = [s.get("risk_score", 0) for s in industry_scores]
    scores_list.sort()
    percentile = (scores_list.index(current_score) / len(scores_list) * 100) if current_score in scores_list else 50
    
    return {
        "supplier_id": supplier_id,
        "your_score": current_score,
        "industry_average": round(industry_avg, 1),
        "percentile": round(percentile, 1),
        "comparison": "better" if current_score < industry_avg else "worse",
        "difference": abs(current_score - industry_avg)
    }


def _get_risk_level(score: float) -> str:
    """Determine risk level from score"""
    if score < 30:
        return "low"
    elif score < 60:
        return "medium"
    else:
        return "high"


def _get_action_for_driver(factor: str) -> str:
    """Get recommended action for a risk driver"""
    actions = {
        "Certificate Expiry": "Renew expiring certificates",
        "Audit Performance": "Schedule compliance audit",
        "Financial Health": "Improve financial metrics",
        "Geographic Risk": "Review supply chain locations",
        "Industry Risk": "Monitor industry trends"
    }
    return actions.get(factor, "Review and update information")


def _get_impact_level(weight: float) -> str:
    """Determine impact level from weight"""
    if weight > 0.3:
        return "high"
    elif weight > 0.15:
        return "medium"
    else:
        return "low"
