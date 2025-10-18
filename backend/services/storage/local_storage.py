"""
Local file system storage for development and testing
"""
import os
import shutil
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import BinaryIO, Dict, Optional, Union
from fastapi import UploadFile, HTTPException
from urllib.parse import urljoin
from ...utils.config import settings

class LocalStorage:
    """Local file system storage implementation"""
    
    def __init__(self):
        self.base_dir = Path(settings.LOCAL_STORAGE_PATH or "local_storage")
        self.base_url = settings.BASE_URL or "http://localhost:8000"
        self.ensure_storage_dir()
    
    def ensure_storage_dir(self):
        """Ensure the storage directory exists"""
        self.base_dir.mkdir(parents=True, exist_ok=True)
    
    def get_file_path(self, key: str) -> Path:
        """Get the full local file path for a given key"""
        # Prevent directory traversal
        key = key.lstrip("/\\")
        return (self.base_dir / key).resolve()
    
    async def upload_file(
        self,
        file_obj: Union[UploadFile, BinaryIO],
        file_path: str,
        content_type: str = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Save a file to the local filesystem
        """
        try:
            # Generate a unique filename
            file_extension = os.path.splitext(getattr(file_obj, 'filename', 'file'))[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Create the directory if it doesn't exist
            save_dir = self.base_dir / file_path
            save_dir.mkdir(parents=True, exist_ok=True)
            
            # Save the file
            file_path = save_dir / unique_filename
            
            # Handle both UploadFile and file-like objects
            if hasattr(file_obj, 'file'):  # UploadFile
                content = await file_obj.read()
                content_type = content_type or file_obj.content_type
            else:  # File-like object
                content = file_obj.read()
            
            with open(file_path, 'wb') as f:
                f.write(content)
            
            # Generate URL
            relative_path = str(file_path.relative_to(self.base_dir)).replace('\\', '/')
            url = f"{self.base_url.rstrip('/')}/storage/{relative_path}"
            
            return {
                "url": url,
                "key": str(relative_path),
                "bucket": str(self.base_dir),
                "content_type": content_type,
                "metadata": metadata or {}
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save file: {str(e)}"
            )
    
    def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Generate a URL for accessing a file
        In local storage, this just returns the direct URL
        """
        return f"{self.base_url.rstrip('/')}/storage/{key.lstrip('/')}"
    
    async def delete_file(self, key: str) -> bool:
        """
        Delete a file from local storage
        """
        try:
            file_path = self.get_file_path(key)
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete file: {str(e)}"
            )
    
    def get_file_metadata(self, key: str) -> Dict[str, Any]:
        """
        Get metadata for a file
        """
        try:
            file_path = self.get_file_path(key)
            if not file_path.exists():
                raise HTTPException(status_code=404, detail="File not found")
            
            stats = file_path.stat()
            return {
                "content_type": "application/octet-stream",
                "content_length": stats.st_size,
                "last_modified": datetime.fromtimestamp(stats.st_mtime),
                "metadata": {},
                "etag": str(stats.st_mtime)
            }
        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get file metadata: {str(e)}"
            )

# Create a singleton instance
local_storage = LocalStorage()
