"""
MongoDB Connection and Configuration Test
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
import os
from dotenv import load_dotenv

# Load environment
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

print("="*60)
print("MONGODB CONNECTION TEST")
print("="*60)

try:
    # Test connection
    client = MongoClient(
        os.getenv('MONGODB_URI'),
        serverSelectionTimeoutMS=5000
    )
    
    # Force connection
    client.admin.command('ping')
    print("\n✅ MongoDB connection successful")
    
    # Check database
    db = client[os.getenv('MONGODB_DB_NAME', 'scap_local')]
    collections = db.list_collection_names()
    print(f"✅ Database: {db.name}")
    print(f"   Collections ({len(collections)}): {', '.join(collections) if collections else 'None'}")
    
    # Expected collections
    required = ['suppliers', 'certificates', 'regulatory_updates',
                'supply_chain_links', 'risk_scores', 'chat_history']
    missing = [c for c in required if c not in collections]
    
    if missing:
        print(f"\n⚠️  Missing collections: {missing}")
        print("   Run: python scripts/setup_db.py")
    else:
        print("\n✅ All required collections exist")
    
    # Check indexes
    if collections:
        print("\nIndex Verification:")
        for coll_name in ['suppliers', 'certificates', 'regulatory_updates']:
            if coll_name in collections:
                coll = db[coll_name]
                indexes = list(coll.list_indexes())
                print(f"  {coll_name}: {len(indexes)} index(es)")
                for idx in indexes:
                    keys = list(idx['key'].keys())
                    print(f"    - {idx['name']}: {keys}")
    
except ServerSelectionTimeoutError:
    print("\n❌ MongoDB connection timeout")
    print("   Check if MongoDB is running:")
    print("   Windows: Check Services for 'MongoDB'")
    print("   Linux: sudo systemctl status mongod")
except ConnectionFailure as e:
    print(f"\n❌ MongoDB connection failed: {e}")
except Exception as e:
    print(f"\n❌ Unexpected error: {e}")
finally:
    if 'client' in locals():
        client.close()

print("\n" + "="*60)
