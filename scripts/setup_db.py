"""
Initialize MongoDB collections and indexes
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.utils.config import settings


async def setup_database():
    """Create collections and indexes"""
    print("🔧 Setting up MongoDB database...")
    
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    
    # Create collections
    collections = [
        "suppliers",
        "certificates",
        "regulatory_updates",
        "supply_chain_links",
        "risk_scores",
        "chat_history"
    ]
    
    existing_collections = await db.list_collection_names()
    
    for collection in collections:
        if collection not in existing_collections:
            await db.create_collection(collection)
            print(f"✅ Created collection: {collection}")
        else:
            print(f"ℹ️  Collection already exists: {collection}")
    
    # Create indexes
    print("\n🔧 Creating indexes...")
    
    # Suppliers indexes
    await db.suppliers.create_index("email", unique=True)
    await db.suppliers.create_index("tier")
    print("✅ Created suppliers indexes")
    
    # Certificates indexes
    await db.certificates.create_index("supplier_id")
    await db.certificates.create_index("expiry_date")
    await db.certificates.create_index("verification_status")
    print("✅ Created certificates indexes")
    
    # Regulatory updates indexes
    await db.regulatory_updates.create_index("jurisdiction")
    await db.regulatory_updates.create_index("effective_date")
    await db.regulatory_updates.create_index("source_url", unique=True)
    print("✅ Created regulatory_updates indexes")
    
    # Risk scores indexes
    await db.risk_scores.create_index("supplier_id")
    await db.risk_scores.create_index("calculated_at")
    await db.risk_scores.create_index([("supplier_id", 1), ("calculated_at", -1)])
    print("✅ Created risk_scores indexes")
    
    # Chat history indexes
    await db.chat_history.create_index("supplier_id", unique=True)
    print("✅ Created chat_history indexes")
    
    # Supply chain links indexes
    await db.supply_chain_links.create_index("brand_id")
    await db.supply_chain_links.create_index("tier_1_supplier_id")
    print("✅ Created supply_chain_links indexes")
    
    client.close()
    print("\n✅ Database setup complete!")


if __name__ == "__main__":
    asyncio.run(setup_database())
