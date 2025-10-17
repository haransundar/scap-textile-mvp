"""
Compliance and regulatory monitoring endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timedelta
from bson import ObjectId

from database.mongodb import get_database
from models.regulation import RegulationResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/regulations", response_model=List[RegulationResponse])
async def list_regulations(
    jurisdiction: str = None,
    days: int = 90,
    skip: int = 0,
    limit: int = 50
):
    """List recent regulatory updates"""
    db = get_database()
    
    query = {}
    if jurisdiction:
        query["jurisdiction"] = jurisdiction
    
    # Get regulations from last N days
    since_date = datetime.utcnow() - timedelta(days=days)
    query["created_at"] = {"$gte": since_date}
    
    cursor = db.regulatory_updates.find(query).sort("created_at", -1).skip(skip).limit(limit)
    regulations = await cursor.to_list(length=limit)
    
    for reg in regulations:
        reg["_id"] = str(reg["_id"])
    
    return regulations


@router.get("/regulations/{regulation_id}")
async def get_regulation(regulation_id: str):
    """Get specific regulation details"""
    db = get_database()
    
    try:
        regulation = await db.regulatory_updates.find_one({"_id": ObjectId(regulation_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid regulation ID")
    
    if not regulation:
        raise HTTPException(status_code=404, detail="Regulation not found")
    
    regulation["_id"] = str(regulation["_id"])
    return regulation


@router.get("/alerts/{supplier_id}")
async def get_supplier_alerts(supplier_id: str):
    """Get compliance alerts for specific supplier"""
    db = get_database()
    
    # Get supplier
    try:
        supplier = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid supplier ID")
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Find regulations affecting this supplier
    cursor = db.regulatory_updates.find({
        "affected_suppliers": supplier_id,
        "effective_date": {"$gte": datetime.utcnow()}
    }).sort("effective_date", 1)
    
    alerts = await cursor.to_list(length=100)
    
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
        # Calculate days until effective
        days_until = (alert["effective_date"] - datetime.utcnow()).days
        alert["days_until_effective"] = days_until
        alert["urgency"] = "high" if days_until < 30 else "medium" if days_until < 90 else "low"
    
    return {
        "supplier_id": supplier_id,
        "alert_count": len(alerts),
        "alerts": alerts
    }


@router.post("/regulations/check")
async def check_regulation_impact(supplier_id: str, regulation_id: str):
    """Check if regulation affects specific supplier"""
    db = get_database()
    
    # Get supplier and regulation
    supplier = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    regulation = await db.regulatory_updates.find_one({"_id": ObjectId(regulation_id)})
    
    if not supplier or not regulation:
        raise HTTPException(status_code=404, detail="Supplier or regulation not found")
    
    # Check if supplier's industry is in affected sectors
    affected = supplier.get("industry_type") in regulation.get("affected_sectors", [])
    
    if affected:
        # Add supplier to affected list
        await db.regulatory_updates.update_one(
            {"_id": ObjectId(regulation_id)},
            {"$addToSet": {"affected_suppliers": supplier_id}}
        )
    
    return {
        "supplier_id": supplier_id,
        "regulation_id": regulation_id,
        "is_affected": affected,
        "reason": f"Supplier industry '{supplier.get('industry_type')}' is in affected sectors" if affected else "Not affected"
    }
