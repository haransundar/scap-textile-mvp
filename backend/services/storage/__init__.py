"""
Storage service interface and factory
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, BinaryIO, Union
from fastapi import UploadFile, HTTPException
import os
from ...utils.config import settings

class StorageService(ABC):
    """Abstract base class for storage services"""
    
    @abstractmethod
    async def upload_file(
        self,
        file_obj: Union[UploadFile, BinaryIO],
        file_path: str,
        content_type: str = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Upload a file to storage"""
        pass
    
    @abstractmethod
    def generate_presigned_url(self, key: str, expires_in: int = None) -> str:
        """Generate a pre-signed URL for private files"""
        pass
    
    @abstractmethod
    async def delete_file(self, key: str) -> bool:
        """Delete a file from storage"""
        pass
    
    @abstractmethod
    def get_file_metadata(self, key: str) -> Dict[str, Any]:
        """Get metadata for a file"""
        pass


def get_storage_service() -> StorageService:
    """Factory function to get the appropriate storage service"""
    storage_type = settings.STORAGE_TYPE.lower()
    
    if storage_type == 's3':
        from .s3_service import s3_service
        return s3_service
    elif storage_type == 'local':
        from .local_storage import local_storage
        return local_storage
    else:
        raise ValueError(f"Unsupported storage type: {storage_type}")

# Create a singleton instance of the storage service
storage_service = get_storage_service()
