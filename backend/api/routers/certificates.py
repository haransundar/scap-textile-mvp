"""
Certificate API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import logging
from bson import ObjectId

from database.models import (
    CertificateInDB,
    CertificateCreate,
    CertificateUpdate,
    CertificateStatus,
    CertificateType,
    PyObjectId
)
from database.repositories.certificate_repository import certificate_repository
from services.storage import storage_service
from utils.auth import get_current_user
from utils.config import settings

router = APIRouter(prefix="/api/certificates", tags=["certificates"])
logger = logging.getLogger(__name__)

# File upload size limit (10MB)
MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024

@router.post("/upload", response_model=CertificateInDB, status_code=status.HTTP_201_CREATED)
async def upload_certificate(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload and process a certificate file
    """
    try:
        # Validate file size
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size is {settings.MAX_FILE_SIZE_MB}MB"
            )
        
        # Validate file type
        if file.content_type not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
            )
        
        # Save file to storage
        upload_result = await storage_service.upload_file(
            file_obj=file,
            file_path=f"certificates/{current_user['id']}",
            content_type=file.content_type,
            metadata={
                "uploaded_by": current_user['id'],
                "original_filename": file.filename
            }
        )
        
        # Create certificate in database (initially as pending)
        certificate_data = CertificateCreate(
            name=file.filename,
            certificate_number="",  # Will be set after AI processing
            certificate_type=CertificateType.OTHER,
            issuer="",
            issued_to=current_user.get('organization_name', ''),
            issued_date=datetime.utcnow(),
            expiry_date=datetime.utcnow() + timedelta(days=365),  # Default 1 year
            scope="",
            description="",
            document_url=upload_result["url"],
            thumbnail_url="",
            status=CertificateStatus.PENDING,
            verification_status=False,
            confidence={"overall": 0.0, "fields": {}},
            ocr_data={
                "raw_text": "",
                "processed_text": "",
                "language": "en",
                "confidence": 0.0
            },
            created_by=PyObjectId(current_user['id']),
            organization_id=PyObjectId(current_user['organization_id'])
        )
        
        certificate = await certificate_repository.create(certificate_data)
        
        # TODO: Start background task for AI processing
        
        return certificate
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading certificate: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process certificate upload"
        )

@router.get("", response_model=List[CertificateInDB])
async def list_certificates(
    skip: int = 0,
    limit: int = 10,
    status: Optional[CertificateStatus] = None,
    certificate_type: Optional[CertificateType] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    List certificates with optional filtering and pagination
    """
    try:
        filters = {}
        if status:
            filters["status"] = status
        if certificate_type:
            filters["certificate_type"] = certificate_type
        if search:
            filters["search"] = search
        
        return await certificate_repository.list_certificates(
            organization_id=current_user['organization_id'],
            skip=skip,
            limit=limit,
            filters=filters
        )
    except Exception as e:
        logger.error(f"Error listing certificates: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve certificates"
        )

@router.get("/{certificate_id}", response_model=CertificateInDB)
async def get_certificate(
    certificate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a single certificate by ID
    """
    try:
        certificate = await certificate_repository.get_by_id(certificate_id)
        if not certificate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Certificate not found"
            )
        
        # Verify user has access to this certificate
        if str(certificate.organization_id) != current_user['organization_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this certificate"
            )
            
        return certificate
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting certificate: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve certificate"
        )

@router.put("/{certificate_id}", response_model=CertificateInDB)
async def update_certificate(
    certificate_id: str,
    update_data: CertificateUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a certificate
    """
    try:
        # Verify certificate exists and user has access
        certificate = await certificate_repository.get_by_id(certificate_id)
        if not certificate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Certificate not found"
            )
            
        if str(certificate.organization_id) != current_user['organization_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this certificate"
            )
        
        # Update certificate
        updated = await certificate_repository.update(certificate_id, update_data)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to update certificate"
            )
            
        return updated
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating certificate: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update certificate"
        )

@router.delete("/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate(
    certificate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a certificate
    """
    try:
        # Verify certificate exists and user has access
        certificate = await certificate_repository.get_by_id(certificate_id)
        if not certificate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Certificate not found"
            )
            
        if str(certificate.organization_id) != current_user['organization_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this certificate"
            )
        
        # Delete file from storage if it exists
        if certificate.document_url:
            try:
                # Extract key from URL or use a different approach based on your storage implementation
                key = certificate.document_url.split('/')[-1]
                await storage_service.delete_file(key)
            except Exception as e:
                logger.warning(f"Failed to delete file from storage: {str(e)}")
        
        # Delete from database
        success = await certificate_repository.delete(certificate_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to delete certificate"
            )
            
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting certificate: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete certificate"
        )

@router.get("/stats/summary")
async def get_certificate_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Get certificate statistics for the dashboard
    """
    try:
        return await certificate_repository.get_certificate_stats(
            organization_id=current_user['organization_id']
        )
    except Exception as e:
        logger.error(f"Error getting certificate stats: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve certificate statistics"
        )

@router.post("/{certificate_id}/duplicates")
async def check_duplicates(
    certificate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check for potential duplicate certificates
    """
    try:
        # Get the certificate
        certificate = await certificate_repository.get_by_id(certificate_id)
        if not certificate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Certificate not found"
            )
            
        if str(certificate.organization_id) != current_user['organization_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this certificate"
            )
        
        # Find potential duplicates
        duplicates = await certificate_repository.find_duplicates(
            certificate_number=certificate.certificate_number,
            certificate_type=certificate.certificate_type,
            organization_id=current_user['organization_id']
        )
        
        # Remove the current certificate from results
        duplicates = [d for d in duplicates if str(d.id) != certificate_id]
        
        return {"count": len(duplicates), "duplicates": duplicates}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking for duplicates: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check for duplicate certificates"
        )
