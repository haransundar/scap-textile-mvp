"""
Certificate repository for database operations
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from ..mongo import MongoDB
from ..models import (
    CertificateInDB,
    CertificateCreate,
    CertificateUpdate,
    CertificateStatus,
    PyObjectId,
    create_indexes
)

class CertificateRepository:
    COLLECTION = "certificates"
    
    def __init__(self, db=None):
        self.db = db or MongoDB.get_db()
        self.collection = self.db[self.COLLECTION]
        
    async def initialize(self):
        """Initialize collection indexes"""
        await create_indexes(self.db)
    
    async def create(self, certificate: CertificateCreate) -> CertificateInDB:
        """Create a new certificate"""
        certificate_dict = certificate.dict(exclude_none=True)
        certificate_dict["created_at"] = datetime.utcnow()
        certificate_dict["updated_at"] = certificate_dict["created_at"]
        
        result = await self.collection.insert_one(certificate_dict)
        created = await self.collection.find_one({"_id": result.inserted_id})
        return CertificateInDB(**created)
    
    async def get_by_id(self, certificate_id: str) -> Optional[CertificateInDB]:
        """Get a certificate by ID"""
        if not ObjectId.is_valid(certificate_id):
            return None
            
        certificate = await self.collection.find_one({"_id": ObjectId(certificate_id)})
        return CertificateInDB(**certificate) if certificate else None
    
    async def get_by_number(self, certificate_number: str) -> Optional[CertificateInDB]:
        """Get a certificate by certificate number"""
        certificate = await self.collection.find_one({"certificate_number": certificate_number})
        return CertificateInDB(**certificate) if certificate else None
    
    async def update(
        self, 
        certificate_id: str, 
        update_data: CertificateUpdate
    ) -> Optional[CertificateInDB]:
        """Update a certificate"""
        if not ObjectId.is_valid(certificate_id):
            return None
            
        update_dict = update_data.dict(exclude_unset=True)
        update_dict["updated_at"] = datetime.utcnow()
        
        result = await self.collection.update_one(
            {"_id": ObjectId(certificate_id)},
            {"$set": update_dict}
        )
        
        if result.modified_count == 0:
            return None
            
        return await self.get_by_id(certificate_id)
    
    async def delete(self, certificate_id: str) -> bool:
        """Delete a certificate"""
        if not ObjectId.is_valid(certificate_id):
            return False
            
        result = await self.collection.delete_one({"_id": ObjectId(certificate_id)})
        return result.deleted_count > 0
    
    async def list_certificates(
        self,
        organization_id: str,
        skip: int = 0,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[CertificateInDB]:
        """List certificates with optional filters"""
        query = {"organization_id": ObjectId(organization_id)}
        
        if filters:
            if "status" in filters:
                query["status"] = filters["status"]
            if "certificate_type" in filters:
                query["certificate_type"] = filters["certificate_type"]
            if "search" in filters:
                search = {"$regex": filters["search"], "$options": "i"}
                query["$or"] = [
                    {"name": search},
                    {"certificate_number": search},
                    {"issuer": search},
                    {"issued_to": search}
                ]
        
        cursor = self.collection.find(query).skip(skip).limit(limit)
        return [CertificateInDB(**cert) async for cert in cursor]
    
    async def count_certificates(
        self,
        organization_id: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> int:
        """Count certificates with optional filters"""
        query = {"organization_id": ObjectId(organization_id)}
        
        if filters:
            if "status" in filters:
                query["status"] = filters["status"]
            if "certificate_type" in filters:
                query["certificate_type"] = filters["certificate_type"]
        
        return await self.collection.count_documents(query)
    
    async def get_certificate_stats(self, organization_id: str) -> Dict[str, int]:
        """Get certificate statistics for dashboard"""
        pipeline = [
            {"$match": {"organization_id": ObjectId(organization_id)}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]
        
        stats = {
            "total": 0,
            "valid": 0,
            "expiring_soon": 0,
            "expired": 0,
            "pending": 0
        }
        
        cursor = self.collection.aggregate(pipeline)
        async for doc in cursor:
            status = doc["_id"]
            count = doc["count"]
            stats[status] = count
            stats["total"] += count
        
        return stats
    
    async def find_duplicates(
        self,
        certificate_number: str,
        certificate_type: str,
        organization_id: str
    ) -> List[CertificateInDB]:
        """Find potential duplicate certificates"""
        query = {
            "organization_id": ObjectId(organization_id),
            "$or": [
                {"certificate_number": certificate_number},
                {"certificate_type": certificate_type}
            ]
        }
        
        cursor = self.collection.find(query)
        return [CertificateInDB(**cert) async for cert in cursor]
    
    async def update_status_based_on_expiry(self):
        """Update certificate statuses based on expiry date"""
        now = datetime.utcnow()
        threshold = now + timedelta(days=30)
        
        # Update expired certificates
        await self.collection.update_many(
            {"expiry_date": {"$lt": now}, "status": {"$ne": CertificateStatus.EXPIRED}},
            {"$set": {"status": CertificateStatus.EXPIRED, "updated_at": now}}
        )
        
        # Update expiring soon certificates
        await self.collection.update_many(
            {
                "expiry_date": {"$gte": now, "$lte": threshold},
                "status": {"$nin": [CertificateStatus.EXPIRING_SOON, CertificateStatus.EXPIRED]}
            },
            {"$set": {"status": CertificateStatus.EXPIRING_SOON, "updated_at": now}}
        )
        
        # Update status of certificates that are no longer expiring soon
        await self.collection.update_many(
            {
                "expiry_date": {"$gt": threshold},
                "status": CertificateStatus.EXPIRING_SOON
            },
            {"$set": {"status": CertificateStatus.VALID, "updated_at": now}}
        )

# Create a singleton instance
certificate_repository = CertificateRepository()
