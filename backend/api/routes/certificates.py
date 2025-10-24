"""
Certificate management endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId
import os
import uuid

from services.certificate_service import CertificateService
from database.mongodb import get_database
from api.middleware.auth import get_current_user
from utils.validators import validate_file_extension, sanitize_filename
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR = "../data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_certificate(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload and process a certificate with AI
    
    This endpoint handles the certificate upload and processing workflow:
    1. Validates the uploaded file
    2. Saves the file temporarily
    3. Processes with EasyOCR and Gemini AI
    4. Stores the extracted data in MongoDB
    5. Returns the processed certificate data
    
    Returns:
        dict: Processed certificate data with extracted fields
    """
    # Validate file type
    if not validate_file_extension(file.filename, ['.jpg', '.jpeg', '.png', '.pdf']):
        raise HTTPException(status_code=400, detail="Invalid file type. Use JPG, PNG, or PDF")
    
    try:
        # Save file temporarily
        file_id = str(uuid.uuid4())
        safe_filename = sanitize_filename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{safe_filename}")
        
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        # Process with certificate service
        certificate_service = CertificateService()
        result = await certificate_service.process_certificate(
            file_path=file_path,
            user_id=current_user['user_id'],
            original_filename=file.filename
        )
        
        # Clean up temporary file
        try:
            os.remove(file_path)
        except Exception as e:
            logger.warning(f"Failed to delete temporary file {file_path}: {str(e)}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing certificate: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing certificate: {str(e)}")

@router.get("/")
async def list_certificates(
    status: Optional[str] = None,
    certificate_type: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "-expiry_date",
    page: int = 1,
    per_page: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """
    List certificates with filtering and pagination
    
    Args:
        status: Filter by status (valid, expiring_soon, expired)
        certificate_type: Filter by certificate type (GOTS, ISO 9001, etc.)
        search: Search in certificate number, issuer, or scope
        sort: Sort field with optional - prefix for descending
        page: Page number (1-based)
        per_page: Items per page
        
    Returns:
        dict: Paginated list of certificates and statistics
    """
    try:
        certificate_service = CertificateService()
        return await certificate_service.list_certificates(
            user_id=current_user['user_id'],
            status=status,
            certificate_type=certificate_type,
            search=search,
            sort=sort,
            page=page,
            per_page=per_page
        )
    except Exception as e:
        logger.error(f"Error listing certificates: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving certificates")

@router.get("/{certificate_id}")
async def get_certificate(
    certificate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get certificate details by ID
    """
    try:
        certificate_service = CertificateService()
        certificate = await certificate_service.get_certificate(
            certificate_id=certificate_id,
            user_id=current_user['user_id']
        )
        if not certificate:
            raise HTTPException(status_code=404, detail="Certificate not found")
        return certificate
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting certificate {certificate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving certificate")

@router.put("/{certificate_id}")
async def update_certificate(
    certificate_id: str,
    update_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Update certificate details
    """
    try:
        certificate_service = CertificateService()
        updated = await certificate_service.update_certificate(
            certificate_id=certificate_id,
            user_id=current_user['user_id'],
            update_data=update_data
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Certificate not found or update failed")
        return {"success": True, "message": "Certificate updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating certificate {certificate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating certificate")

@router.delete("/{certificate_id}")
async def delete_certificate(
    certificate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a certificate
    """
    try:
        certificate_service = CertificateService()
        deleted = await certificate_service.delete_certificate(
            certificate_id=certificate_id,
            user_id=current_user['user_id']
        )
        if not deleted:
            raise HTTPException(status_code=404, detail="Certificate not found or delete failed")
        return {"success": True, "message": "Certificate deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting certificate {certificate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting certificate")
