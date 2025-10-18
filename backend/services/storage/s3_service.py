"""
AWS S3 Storage Service for file uploads and management
"""
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, BinaryIO, Union, Dict, Any
from fastapi import UploadFile, HTTPException
import boto3
from botocore.exceptions import ClientError
from ...utils.config import settings

class S3Service:
    """AWS S3 Storage Service"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
        self.presigned_url_expiry = 3600  # 1 hour
    
    async def upload_file(
        self,
        file_obj: Union[UploadFile, BinaryIO],
        file_path: str,
        content_type: str = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Upload a file to S3
        
        Args:
            file_obj: File-like object or FastAPI UploadFile
            file_path: Path where the file will be stored in the bucket
            content_type: MIME type of the file
            metadata: Additional metadata to store with the file
            
        Returns:
            Dict containing file information including URL and key
        """
        try:
            # Generate a unique filename to prevent collisions
            file_extension = os.path.splitext(getattr(file_obj, 'filename', 'file'))[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            s3_key = f"{file_path}/{unique_filename}"
            
            # Get file content
            if hasattr(file_obj, 'file'):  # Handle FastAPI UploadFile
                file_content = await file_obj.read()
                content_type = content_type or file_obj.content_type
            else:  # Handle file-like object
                file_content = file_obj.read()
            
            # Upload to S3
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            if metadata:
                extra_args['Metadata'] = metadata
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                **extra_args
            )
            
            # Generate public URL
            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
            
            return {
                "url": url,
                "key": s3_key,
                "bucket": self.bucket_name,
                "content_type": content_type,
                "metadata": metadata or {}
            }
            
        except ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload file to S3: {str(e)}"
            )
    
    def generate_presigned_url(self, key: str, expires_in: int = None) -> str:
        """
        Generate a pre-signed URL for accessing a private file
        
        Args:
            key: S3 object key
            expires_in: Expiration time in seconds (default: 1 hour)
            
        Returns:
            Pre-signed URL
        """
        try:
            expires_in = expires_in or self.presigned_url_expiry
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate pre-signed URL: {str(e)}"
            )
    
    async def delete_file(self, key: str) -> bool:
        """
        Delete a file from S3
        
        Args:
            key: S3 object key
            
        Returns:
            bool: True if deletion was successful, False otherwise
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
        except ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete file from S3: {str(e)}"
            )
    
    def get_file_metadata(self, key: str) -> Dict[str, Any]:
        """
        Get metadata for a file
        
        Args:
            key: S3 object key
            
        Returns:
            Dict containing file metadata
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=key
            )
            
            return {
                "content_type": response.get('ContentType'),
                "content_length": response.get('ContentLength'),
                "last_modified": response.get('LastModified'),
                "metadata": response.get('Metadata', {}),
                "etag": response.get('ETag')
            }
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                raise HTTPException(status_code=404, detail="File not found")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get file metadata: {str(e)}"
            )

# Create a singleton instance
s3_service = S3Service()
