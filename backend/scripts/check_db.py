"""
Database verification script for SCAP Backend
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def check_database():
    """Check database connection and collections"""
    try:
        # Get MongoDB connection string from environment or use default
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGODB_DB_NAME", "scap_local")
        
        print(f"🔌 Connecting to MongoDB at {mongo_uri}...")
        client = AsyncIOMotorClient(mongo_uri)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB")
        
        # Get database
        db = client[db_name]
        print(f"📊 Using database: {db_name}")
        
        # List all collections
        collections = await db.list_collection_names()
        print("\n📚 Collections in database:")
        for collection in collections:
            count = await db[collection].count_documents({})
            print(f"- {collection}: {count} documents")
        
        # Check for required collections
        required_collections = ['suppliers', 'risk_scores']
        missing = [col for col in required_collections if col not in collections]
        
        if missing:
            print(f"\n❌ Missing required collections: {', '.join(missing)}")
            print("Please run the database initialization script.")
        else:
            print("\n✅ All required collections exist")
            
            # Check for sample data
            supplier_count = await db.suppliers.count_documents({})
            if supplier_count == 0:
                print("\n⚠️  No suppliers found in the database")
                print("Please add supplier data or run the data seeding script.")
            
            risk_score_count = await db.risk_scores.count_documents({})
            if risk_score_count == 0:
                print("\n⚠️  No risk scores found in the database")
                print("Risk scores will be calculated on first access.")
        
    except Exception as e:
        print(f"\n❌ Error connecting to MongoDB: {str(e)}")
        print("Please check your MongoDB connection settings and ensure the service is running.")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    asyncio.run(check_database())
