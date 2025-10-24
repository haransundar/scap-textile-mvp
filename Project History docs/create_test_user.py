"""
Create a test user in the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/scap_local")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "scap_local")

def truncate_password_bytes(password: str) -> bytes:
    """Truncate password to 72 bytes for bcrypt compatibility"""
    if not password:
        return b""
    
    password_bytes = password.encode('utf-8')
    if len(password_bytes) <= 72:
        return password_bytes
    
    truncated = password_bytes[:72]
    while len(truncated) > 0:
        try:
            truncated.decode('utf-8')
            return truncated
        except UnicodeDecodeError:
            truncated = truncated[:-1]
    return b""

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    password_bytes = truncate_password_bytes(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

async def create_test_user():
    """Create a test user in the database"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB_NAME]
    users_collection = db.users
    
    # Test user data
    test_users = [
        {
            "email": "admin@example.com",
            "password": "admin123",
            "full_name": "Admin User",
            "company_name": "SCAP Admin",
            "role": "admin"
        },
        {
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
            "company_name": "Test Company",
            "role": "supplier"
        }
    ]
    
    for user_data in test_users:
        # Check if user already exists
        existing = await users_collection.find_one({"email": user_data["email"]})
        if existing:
            print(f"✓ User {user_data['email']} already exists")
            continue
        
        # Hash password
        hashed_password = hash_password(user_data["password"])
        
        # Create user document
        user_doc = {
            "email": user_data["email"],
            "password": hashed_password,
            "full_name": user_data["full_name"],
            "company_name": user_data["company_name"],
            "role": user_data["role"],
            "created_at": datetime.utcnow()
        }
        
        # Insert user
        result = await users_collection.insert_one(user_doc)
        print(f"✓ Created user: {user_data['email']} (ID: {result.inserted_id})")
        print(f"  Password: {user_data['password']}")
    
    client.close()
    print("\n✅ Test users created successfully!")
    print("\nYou can now login with:")
    print("  Email: admin@example.com")
    print("  Password: admin123")
    print("\n  OR")
    print("\n  Email: test@example.com")
    print("  Password: password123")

if __name__ == "__main__":
    asyncio.run(create_test_user())
