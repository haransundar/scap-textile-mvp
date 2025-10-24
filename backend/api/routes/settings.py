"""
Settings API Routes
User profile, account settings, team management
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from passlib.context import CryptContext

from database.mongodb import get_database
from api.middleware.auth import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class ProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    location: Optional[str] = None
    tier_level: Optional[str] = None
    industry: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class NotificationPreferences(BaseModel):
    email: bool = True
    sms: bool = False
    certificate_expiry: bool = True
    regulatory_updates: bool = True
    risk_alerts: bool = True


class TeamInvite(BaseModel):
    email: EmailStr
    role: str  # admin, member, viewer


@router.get("/profile")
async def get_profile(
    current_user: dict = Depends(get_current_user)
):
    """Get user profile"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove sensitive data
    user.pop("password", None)
    user["_id"] = str(user["_id"])
    
    return {"profile": user}


@router.put("/profile")
async def update_profile(
    profile: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    db = await get_database()
    
    # Build update dict (only include provided fields)
    update_data = {k: v for k, v in profile.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "Profile updated successfully"}


@router.put("/password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """Change user password"""
    db = await get_database()
    
    # Get user
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not pwd_context.verify(password_data.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Hash new password
    new_password_hash = pwd_context.hash(password_data.new_password)
    
    # Update password
    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"password": new_password_hash, "password_updated_at": datetime.utcnow()}}
    )
    
    return {"success": True, "message": "Password changed successfully"}


@router.get("/notifications")
async def get_notification_preferences(
    current_user: dict = Depends(get_current_user)
):
    """Get notification preferences"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.get("notification_settings", {
        "email": True,
        "sms": False,
        "certificate_expiry": True,
        "regulatory_updates": True,
        "risk_alerts": True
    })


@router.put("/notifications")
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user: dict = Depends(get_current_user)
):
    """Update notification preferences"""
    db = await get_database()
    
    result = await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"notification_settings": preferences.dict()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "preferences": preferences.dict()}


@router.get("/team")
async def get_team_members(
    current_user: dict = Depends(get_current_user)
):
    """Get team members"""
    db = await get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    team_members = user.get("team_members", [])
    
    # Enrich with user details
    for member in team_members:
        member_user = await db.users.find_one({"_id": ObjectId(member["user_id"])})
        if member_user:
            member["name"] = member_user.get("full_name", member_user.get("email"))
            member["email"] = member_user.get("email")
    
    return {"team_members": team_members}


@router.post("/team/invite")
async def invite_team_member(
    invite: TeamInvite,
    current_user: dict = Depends(get_current_user)
):
    """Invite team member"""
    db = await get_database()
    
    # Check if user exists
    invited_user = await db.users.find_one({"email": invite.email})
    
    if not invited_user:
        raise HTTPException(status_code=404, detail="User not found with this email")
    
    # Check if already a team member
    current_user_doc = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    team_members = current_user_doc.get("team_members", [])
    
    if any(m["user_id"] == str(invited_user["_id"]) for m in team_members):
        raise HTTPException(status_code=400, detail="User is already a team member")
    
    # Add to team
    new_member = {
        "user_id": str(invited_user["_id"]),
        "role": invite.role,
        "invited_at": datetime.utcnow()
    }
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$push": {"team_members": new_member}}
    )
    
    # Create notification for invited user
    await db.notifications.insert_one({
        "user_id": str(invited_user["_id"]),
        "type": "update",
        "title": "Team Invitation",
        "message": f"You've been invited to join {current_user.get('company_name', 'a team')} as {invite.role}",
        "read": False,
        "action_required": True,
        "action_text": "View Team",
        "created_at": datetime.utcnow()
    })
    
    return {"success": True, "member": new_member}


@router.delete("/team/{member_id}")
async def remove_team_member(
    member_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove team member"""
    db = await get_database()
    
    result = await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$pull": {"team_members": {"user_id": member_id}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    return {"success": True, "message": "Team member removed"}
