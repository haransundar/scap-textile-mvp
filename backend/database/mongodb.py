"""
MongoDB connection using Motor (async driver)
"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from utils.config import settings


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db = None


mongodb = MongoDB()


async def connect_db():
    """Connect to MongoDB"""
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URI)
    mongodb.db = mongodb.client[settings.MONGODB_DB_NAME]
    
    # Test connection
    await mongodb.client.admin.command('ping')


async def close_db():
    """Close MongoDB connection"""
    if mongodb.client:
        mongodb.client.close()


def get_database():
    """Get database instance"""
    return mongodb.db
