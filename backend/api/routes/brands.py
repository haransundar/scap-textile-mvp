"""
Brand Connections API Routes
Manages brand partnerships and data sharing
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId

from database.mongodb import get_database
from api.middleware.auth import get_current_user

router = APIRouter()


class ConnectBrandRequest(BaseModel):
    brand_id: str
    request_message: Optional[str] = None


class SharingPermissions(BaseModel):
    certificates: bool = False
    risk_score: bool = False
    network: bool = False
    audits: bool = False


@router.get("/connections")
async def get_brand_connections(
    current_user: dict = Depends(get_current_user)
):
    """Get all brand connections and stats"""
    db = await get_database()
    
    # Get connections
    connections = await db.brand_connections.find(
        {"supplier_id": current_user["user_id"]}
    ).to_list(length=100)
    
    # Separate by status
    connected = []
    pending = []
    
    for conn in connections:
        conn["_id"] = str(conn["_id"])
        
        # Get brand details
        brand = await db.brands.find_one({"_id": ObjectId(conn["brand_id"])})
        if brand:
            conn["brand_name"] = brand.get("name", "Unknown Brand")
            conn["brand_logo"] = brand.get("logo")
            conn["brand_location"] = brand.get("location")
        
        # Count shared items
        conn["sharedItemsCount"] = sum(conn.get("sharing_permissions", {}).values())
        
        if conn["status"] == "connected":
            connected.append(conn)
        elif conn["status"] == "pending":
            pending.append(conn)
    
    # Calculate stats
    stats = {
        "connected": len(connected),
        "pending": len(pending),
        "total_shared": sum(c["sharedItemsCount"] for c in connected)
    }
    
    return {
        "connected": connected,
        "pending": pending,
        "stats": stats
    }


@router.post("/connect")
async def connect_brand(
    request: ConnectBrandRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send connection request to brand"""
    db = await get_database()
    
    # Check if connection already exists
    existing = await db.brand_connections.find_one({
        "supplier_id": current_user["user_id"],
        "brand_id": request.brand_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Connection already exists")
    
    # Create connection request
    connection = {
        "supplier_id": current_user["user_id"],
        "brand_id": request.brand_id,
        "status": "pending",
        "request_message": request.request_message,
        "sharing_permissions": {
            "certificates": False,
            "risk_score": False,
            "network": False,
            "audits": False
        },
        "requested_at": datetime.utcnow()
    }
    
    result = await db.brand_connections.insert_one(connection)
    connection["_id"] = str(result.inserted_id)
    
    # Create notification for brand
    await db.notifications.insert_one({
        "user_id": request.brand_id,
        "type": "update",
        "title": "New Connection Request",
        "message": f"{current_user.get('company_name', 'A supplier')} wants to connect with you",
        "read": False,
        "action_required": True,
        "action_text": "Review Request",
        "action_url": f"/dashboard/suppliers/{current_user['user_id']}",
        "created_at": datetime.utcnow()
    })
    
    return {"success": True, "connection": connection}


@router.put("/{brand_id}/sharing")
async def update_sharing_permissions(
    brand_id: str,
    permissions: SharingPermissions,
    current_user: dict = Depends(get_current_user)
):
    """Update data sharing permissions for a brand"""
    db = await get_database()
    
    result = await db.brand_connections.update_one(
        {
            "supplier_id": current_user["user_id"],
            "brand_id": brand_id,
            "status": "connected"
        },
        {
            "$set": {
                "sharing_permissions": permissions.dict(),
                "last_updated": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Log sharing history
    await db.sharing_history.insert_one({
        "supplier_id": current_user["user_id"],
        "brand_id": brand_id,
        "data_type": "permissions_updated",
        "action": "updated",
        "permissions": permissions.dict(),
        "timestamp": datetime.utcnow()
    })
    
    return {"success": True, "permissions": permissions.dict()}


@router.delete("/{brand_id}/disconnect")
async def disconnect_brand(
    brand_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove brand connection"""
    db = await get_database()
    
    result = await db.brand_connections.delete_one({
        "supplier_id": current_user["user_id"],
        "brand_id": brand_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Log disconnection
    await db.sharing_history.insert_one({
        "supplier_id": current_user["user_id"],
        "brand_id": brand_id,
        "data_type": "connection",
        "action": "disconnected",
        "timestamp": datetime.utcnow()
    })
    
    return {"success": True, "message": "Brand disconnected"}


@router.get("/sharing-history")
async def get_sharing_history(
    current_user: dict = Depends(get_current_user)
):
    """Get sharing activity history"""
    db = await get_database()
    
    history = await db.sharing_history.find(
        {"supplier_id": current_user["user_id"]}
    ).sort("timestamp", -1).limit(50).to_list(length=50)
    
    # Enrich with brand names
    for item in history:
        item["_id"] = str(item["_id"])
        brand = await db.brands.find_one({"_id": ObjectId(item["brand_id"])})
        if brand:
            item["brand_name"] = brand.get("name", "Unknown Brand")
        item["date"] = item["timestamp"].strftime("%Y-%m-%d %H:%M")
    
    return {"history": history}


@router.post("/{brand_id}/share-profile")
async def share_profile(
    brand_id: str,
    current_user: dict = Depends(get_current_user)
):
    """One-click share all allowed data with brand"""
    db = await get_database()
    
    # Get connection
    connection = await db.brand_connections.find_one({
        "supplier_id": current_user["user_id"],
        "brand_id": brand_id,
        "status": "connected"
    })
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    permissions = connection.get("sharing_permissions", {})
    shared_items = []
    
    # Share certificates
    if permissions.get("certificates"):
        certs = await db.certificates.find({"supplier_id": current_user["user_id"]}).to_list(length=100)
        shared_items.extend([{"type": "certificate", "id": str(c["_id"])} for c in certs])
    
    # Share risk score
    if permissions.get("risk_score"):
        risk = await db.risk_scores.find_one({"supplier_id": current_user["user_id"]})
        if risk:
            shared_items.append({"type": "risk_score", "id": str(risk["_id"])})
    
    # Update last shared timestamp
    await db.brand_connections.update_one(
        {"_id": connection["_id"]},
        {"$set": {"last_shared_at": datetime.utcnow()}}
    )
    
    # Log sharing
    await db.sharing_history.insert_one({
        "supplier_id": current_user["user_id"],
        "brand_id": brand_id,
        "data_type": "full_profile",
        "action": "shared",
        "items_count": len(shared_items),
        "timestamp": datetime.utcnow()
    })
    
    return {
        "success": True,
        "shared_items": len(shared_items),
        "items": shared_items
    }
