"""
Notifications API Routes
Handles user notifications, alerts, and reminders
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId

from database.mongodb import get_database
from api.middleware.auth import get_current_user

router = APIRouter()


class NotificationCreate(BaseModel):
    user_id: str
    type: str  # alert, update, success, reminder
    title: str
    message: str
    action_required: bool = False
    action_text: Optional[str] = None
    action_url: Optional[str] = None


class BulkActionRequest(BaseModel):
    ids: List[str]
    action: str  # read, delete


class NotificationSettings(BaseModel):
    email: bool = True
    sms: bool = False
    certificate_expiry: bool = True
    regulatory_updates: bool = True
    risk_alerts: bool = True


@router.get("/")
async def get_notifications(
    type: Optional[str] = Query(None, description="Filter by type: all, unread, alerts, updates"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get user notifications with filtering and pagination"""
    db = await get_database()
    
    # Build query
    query = {"user_id": current_user["_id"]}
    
    if type == "unread":
        query["read"] = False
    elif type == "alerts":
        query["type"] = "alert"
    elif type == "updates":
        query["type"] = "update"
    
    # Get total count
    total = await db.notifications.count_documents(query)
    unread = await db.notifications.count_documents({"user_id": current_user["_id"], "read": False})
    
    # Get paginated results
    skip = (page - 1) * limit
    notifications = await db.notifications.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Format time ago
    for notif in notifications:
        notif["_id"] = str(notif["_id"])
        notif["timeAgo"] = format_time_ago(notif["created_at"])
    
    return {
        "notifications": notifications,
        "total": total,
        "unread": unread,
        "page": page,
        "limit": limit
    }


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark notification as read"""
    db = await get_database()
    
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user["_id"]},
        {"$set": {"read": True, "read_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True, "message": "Notification marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete notification"""
    db = await get_database()
    
    result = await db.notifications.delete_one(
        {"_id": ObjectId(notification_id), "user_id": current_user["_id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True, "message": "Notification deleted"}


@router.post("/bulk-action")
async def bulk_action(
    request: BulkActionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Perform bulk action on notifications"""
    db = await get_database()
    
    ids = [ObjectId(id) for id in request.ids]
    query = {"_id": {"$in": ids}, "user_id": current_user["_id"]}
    
    if request.action == "read":
        result = await db.notifications.update_many(
            query,
            {"$set": {"read": True, "read_at": datetime.utcnow()}}
        )
        return {"success": True, "modified": result.modified_count}
    
    elif request.action == "delete":
        result = await db.notifications.delete_many(query)
        return {"success": True, "deleted": result.deleted_count}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid action")


@router.get("/settings")
async def get_notification_settings(
    current_user: dict = Depends(get_current_user)
):
    """Get notification preferences"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.get("notification_settings", {
        "email": True,
        "sms": False,
        "certificate_expiry": True,
        "regulatory_updates": True,
        "risk_alerts": True
    })


@router.put("/settings")
async def update_notification_settings(
    settings: NotificationSettings,
    current_user: dict = Depends(get_current_user)
):
    """Update notification preferences"""
    db = await get_database()
    
    result = await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"notification_settings": settings.dict()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "settings": settings.dict()}


def format_time_ago(dt: datetime) -> str:
    """Format datetime to 'X minutes/hours/days ago'"""
    now = datetime.utcnow()
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    else:
        days = int(seconds / 86400)
        return f"{days} day{'s' if days > 1 else ''} ago"
