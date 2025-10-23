"""
Seed script for new features: Notifications, Brands, Settings
"""
import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/scap_local")
DB_NAME = os.getenv("MONGODB_DB_NAME", "scap_local")


async def seed_notifications():
    """Seed sample notifications"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    
    # Get first user
    user = await db.users.find_one()
    if not user:
        print("No users found. Please run main seed script first.")
        return
    
    user_id = str(user["_id"])
    
    notifications = [
        {
            "user_id": user_id,
            "type": "alert",
            "title": "Certificate Expiring Soon",
            "message": "Your GOTS certificate will expire in 30 days. Please renew to maintain compliance.",
            "read": False,
            "action_required": True,
            "action_text": "Renew Certificate",
            "action_url": "/dashboard/certificates",
            "created_at": datetime.utcnow() - timedelta(hours=2)
        },
        {
            "user_id": user_id,
            "type": "update",
            "title": "New Regulation Posted",
            "message": "EU CSDDD has been updated with new requirements for textile suppliers.",
            "read": False,
            "action_required": True,
            "action_text": "View Details",
            "action_url": "/dashboard/compliance",
            "created_at": datetime.utcnow() - timedelta(hours=5)
        },
        {
            "user_id": user_id,
            "type": "success",
            "title": "Certificate Uploaded Successfully",
            "message": "Your ISO 14001 certificate has been processed and verified.",
            "read": True,
            "action_required": False,
            "created_at": datetime.utcnow() - timedelta(days=1)
        },
        {
            "user_id": user_id,
            "type": "reminder",
            "title": "Audit Due Next Month",
            "message": "Your annual compliance audit is scheduled for next month. Prepare required documents.",
            "read": False,
            "action_required": True,
            "action_text": "View Checklist",
            "action_url": "/dashboard/compliance",
            "created_at": datetime.utcnow() - timedelta(days=2)
        },
        {
            "user_id": user_id,
            "type": "update",
            "title": "Risk Score Improved",
            "message": "Your compliance risk score has improved from 65 to 58. Great work!",
            "read": True,
            "action_required": False,
            "created_at": datetime.utcnow() - timedelta(days=3)
        }
    ]
    
    await db.notifications.delete_many({"user_id": user_id})
    result = await db.notifications.insert_many(notifications)
    print(f"✅ Created {len(result.inserted_ids)} notifications")


async def seed_brands():
    """Seed sample brand connections"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    
    # Get first user
    user = await db.users.find_one()
    if not user:
        print("No users found. Please run main seed script first.")
        return
    
    user_id = str(user["_id"])
    
    # Create sample brands
    brands = [
        {
            "name": "H&M",
            "logo": None,
            "location": "Stockholm, Sweden",
            "industry": "Fashion Retail",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Zara",
            "logo": None,
            "location": "Arteixo, Spain",
            "industry": "Fashion Retail",
            "created_at": datetime.utcnow()
        },
        {
            "name": "Uniqlo",
            "logo": None,
            "location": "Tokyo, Japan",
            "industry": "Fashion Retail",
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.brands.delete_many({})
    brand_results = await db.brands.insert_many(brands)
    brand_ids = [str(id) for id in brand_results.inserted_ids]
    print(f"✅ Created {len(brand_ids)} brands")
    
    # Create brand connections
    connections = [
        {
            "supplier_id": user_id,
            "brand_id": brand_ids[0],
            "status": "connected",
            "sharing_permissions": {
                "certificates": True,
                "risk_score": True,
                "network": False,
                "audits": True
            },
            "connected_at": datetime.utcnow() - timedelta(days=30),
            "last_shared_at": datetime.utcnow() - timedelta(days=1)
        },
        {
            "supplier_id": user_id,
            "brand_id": brand_ids[1],
            "status": "connected",
            "sharing_permissions": {
                "certificates": True,
                "risk_score": False,
                "network": True,
                "audits": False
            },
            "connected_at": datetime.utcnow() - timedelta(days=60),
            "last_shared_at": datetime.utcnow() - timedelta(days=5)
        },
        {
            "supplier_id": user_id,
            "brand_id": brand_ids[2],
            "status": "pending",
            "sharing_permissions": {
                "certificates": False,
                "risk_score": False,
                "network": False,
                "audits": False
            },
            "requested_at": datetime.utcnow() - timedelta(days=3)
        }
    ]
    
    await db.brand_connections.delete_many({"supplier_id": user_id})
    conn_results = await db.brand_connections.insert_many(connections)
    print(f"✅ Created {len(conn_results.inserted_ids)} brand connections")
    
    # Create sharing history
    history = [
        {
            "supplier_id": user_id,
            "brand_id": brand_ids[0],
            "data_type": "certificates",
            "action": "shared",
            "timestamp": datetime.utcnow() - timedelta(days=1)
        },
        {
            "supplier_id": user_id,
            "brand_id": brand_ids[0],
            "data_type": "risk_score",
            "action": "shared",
            "timestamp": datetime.utcnow() - timedelta(days=2)
        },
        {
            "supplier_id": user_id,
            "brand_id": brand_ids[1],
            "data_type": "certificates",
            "action": "shared",
            "timestamp": datetime.utcnow() - timedelta(days=5)
        },
        {
            "supplier_id": user_id,
            "brand_id": brand_ids[1],
            "data_type": "network",
            "action": "shared",
            "timestamp": datetime.utcnow() - timedelta(days=10)
        }
    ]
    
    await db.sharing_history.delete_many({"supplier_id": user_id})
    hist_results = await db.sharing_history.insert_many(history)
    print(f"✅ Created {len(hist_results.inserted_ids)} sharing history records")


async def seed_settings():
    """Update user with settings data"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    
    # Get first user
    user = await db.users.find_one()
    if not user:
        print("No users found. Please run main seed script first.")
        return
    
    # Update user with settings
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "notification_settings": {
                    "email": True,
                    "sms": False,
                    "certificate_expiry": True,
                    "regulatory_updates": True,
                    "risk_alerts": True
                },
                "team_members": []
            }
        }
    )
    print("✅ Updated user with notification settings")


async def main():
    """Run all seed functions"""
    print("🌱 Seeding new features data...")
    
    await seed_notifications()
    await seed_brands()
    await seed_settings()
    
    print("\n✅ All new features data seeded successfully!")
    print("\nYou can now test:")
    print("  - /dashboard/notifications")
    print("  - /dashboard/brands")
    print("  - /dashboard/settings")


if __name__ == "__main__":
    asyncio.run(main())
