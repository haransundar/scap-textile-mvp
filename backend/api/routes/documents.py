"""
Document upload and OCR processing endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from datetime import datetime
from bson import ObjectId
import os
import uuid

from services.ocr_service import ocr_service
from services.document_ai_service import document_ai_service
from database.mongodb import get_database
from database.chroma_db import chroma_client
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
    Upload certificate photo and extract data
    
    Process:
    1. Save uploaded image
    2. Extract text with EasyOCR
    3. Structure data with Gemini
    4. Store in MongoDB
    5. Add to ChromaDB for RAG
    """
    # Validate file type
    if not validate_file_extension(file.filename, ['.jpg', '.jpeg', '.png', '.heic']):
        raise HTTPException(status_code=400, detail="Invalid file type. Use JPG, PNG, or HEIC")
    
    try:
        # Save file
        file_id = str(uuid.uuid4())
        safe_filename = sanitize_filename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{safe_filename}")
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"📁 Saved file: {file_path}")
        
        # Step 1: OCR extraction
        ocr_result = ocr_service.extract_text(file_path)
        logger.info(f"📝 OCR extracted text ({ocr_result['confidence']:.2%} confidence)")
        
        # Step 2: Structure with Gemini
        structured_data = document_ai_service.structure_certificate_data(ocr_result['text'])
        
        # Step 3: Store in MongoDB
        db = get_database()
        certificate_doc = {
            "supplier_id": current_user["user_id"],
            "type": structured_data.get("certificate_type", "Other"),
            "number": structured_data.get("certificate_number", ""),
            "issued_by": structured_data.get("issued_by", ""),
            "issued_to": structured_data.get("issued_to", ""),
            "issued_date": structured_data.get("issued_date"),
            "expiry_date": structured_data.get("expiry_date"),
            "scope": structured_data.get("scope", ""),
            "file_path": file_path,
            "verification_status": "pending",
            "ocr_confidence": ocr_result['confidence'],
            "created_at": datetime.utcnow()
        }
        
        result = await db.certificates.insert_one(certificate_doc)
        cert_id = str(result.inserted_id)
        
        # Step 4: Add to ChromaDB for RAG
        chroma_client.add_document(
            doc_id=cert_id,
            text=f"Certificate {structured_data.get('certificate_type')}: {ocr_result['text']}",
            metadata={
                "supplier_id": current_user["user_id"],
                "cert_type": structured_data.get("certificate_type"),
                "cert_number": structured_data.get("certificate_number")
            }
        )
        
        logger.info(f"✅ Certificate processed: {cert_id}")
        
        return {
            "certificate_id": cert_id,
            "structured_data": structured_data,
            "ocr_confidence": ocr_result['confidence'],
            "message": "Certificate uploaded and processed successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{certificate_id}")
async def get_certificate(certificate_id: str):
    """Get certificate details"""
    db = get_database()
    
    try:
        cert = await db.certificates.find_one({"_id": ObjectId(certificate_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid certificate ID")
    
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    cert["_id"] = str(cert["_id"])
    return cert


@router.get("/supplier/{supplier_id}")
async def get_supplier_certificates(supplier_id: str):
    """Get all certificates for a supplier"""
    db = get_database()
    
    cursor = db.certificates.find({"supplier_id": supplier_id})
    certificates = await cursor.to_list(length=100)
    
    for cert in certificates:
        cert["_id"] = str(cert["_id"])
    
    return certificates


@router.put("/{certificate_id}/verify")
async def verify_certificate(certificate_id: str, verified: bool):
    """Brand verifies certificate (brand users only)"""
    db = get_database()
    
    status_value = "verified" if verified else "pending"
    
    result = await db.certificates.update_one(
        {"_id": ObjectId(certificate_id)},
        {"$set": {"verification_status": status_value}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return {"message": f"Certificate {status_value}"}


@router.delete("/{certificate_id}")
async def delete_certificate(
    certificate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete certificate"""
    db = get_database()
    
    # Verify ownership
    cert = await db.certificates.find_one({"_id": ObjectId(certificate_id)})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    if cert["supplier_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Delete from MongoDB
    await db.certificates.delete_one({"_id": ObjectId(certificate_id)})
    
    # Delete from ChromaDB
    chroma_client.delete_document(certificate_id)
    
    # Delete file
    if os.path.exists(cert["file_path"]):
        os.remove(cert["file_path"])
    
    logger.info(f"🗑️ Deleted certificate: {certificate_id}")
    return {"message": "Certificate deleted"}
