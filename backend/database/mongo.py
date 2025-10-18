"""
MongoDB connection and database utilities
"""
from motor.motor_asyncio import AsyncIOMotorClient
from ..utils.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_db(cls):
        """Initialize database connection"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URI)
            cls.db = cls.client[settings.MONGODB_DB_NAME]
            await cls.db.command('ping')
            print("Connected to MongoDB successfully!")
            return cls.db
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise

    @classmethod
    def get_db(cls):
        """Get database instance"""
        if cls.db is None:
            raise RuntimeError("Database is not connected. Call connect_db first.")
        return cls.db

    @classmethod
    async def close_db(cls):
        """Close database connection"""
        if cls.client:
            cls.client.close()
            cls.db = None
            print("MongoDB connection closed.")

# Database models will be registered here
from .models import *

# Initialize database connection on import
import asyncio
asyncio.create_task(MongoDB.connect_db())
