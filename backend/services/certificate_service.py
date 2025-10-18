"""
Certificate Service

This module handles the business logic for certificate processing,
including AI-powered text extraction and data structuring.
"""
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from bson import ObjectId

from .ocr_service import OCRService
from .llm_service import LLMService
from database.mongodb import get_database
from utils.validators import validate_date_format

logger = logging.getLogger(__name__)

class CertificateService:
    """Service for certificate processing and management"""
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.llm_service = LLMService()
        self.db = get_database()
        self.certificates_collection = self.db.certificates
    
    async def process_certificate(
        self,
        file_path: str,
        user_id: str,
        original_filename: str
    ) -> Dict[str, Any]:
        """
        Process a certificate file through the AI pipeline
        
        Args:
            file_path: Path to the uploaded certificate file
            user_id: ID of the user uploading the certificate
            original_filename: Original filename of the uploaded file
            
        Returns:
            dict: Processed certificate data
        """
        try:
            # Step 1: Extract text using OCR
            logger.info(f"Extracting text from certificate: {file_path}")
            ocr_result = await self.ocr_service.extract_text(file_path)
            
            # Step 2: Structure data using LLM
            logger.info("Structuring certificate data with LLM")
            structured_data = await self._extract_structured_data(
                ocr_result['text'], 
                original_filename
            )
            
            # Step 3: Calculate status based on expiry date
            status = self._calculate_status(structured_data.get('expiry_date'))
            
            # Step 4: Create certificate document
            certificate_data = {
                'user_id': ObjectId(user_id),
                'original_filename': original_filename,
                'file_path': file_path,
                'uploaded_at': datetime.utcnow(),
                'status': status,
                'ocr_text': ocr_result['text'],
                'ocr_confidence': ocr_result.get('confidence', 0),
                **structured_data
            }
            
            # Step 5: Save to database
            result = await self.certificates_collection.insert_one(certificate_data)
            certificate_data['_id'] = str(result.inserted_id)
            
            return {
                'success': True,
                'certificate_id': str(result.inserted_id),
                'message': 'Certificate processed successfully',
                'processing_time': ocr_result.get('processing_time', 0),
                'extracted_data': structured_data,
                'confidence_score': ocr_result.get('confidence', 0),
                'needs_review': self._needs_manual_review(ocr_result.get('confidence', 0), structured_data)
            }
            
        except Exception as e:
            logger.error(f"Error processing certificate: {str(e)}", exc_info=True)
            raise
    
    async def _extract_structured_data(self, text: str, filename: str) -> Dict[str, Any]:
        """Extract structured data from OCR text using LLM"""
        prompt = f"""
        You are a compliance certificate data extractor. Given OCR text from a certificate,
        extract the following fields in JSON format:
        
        {{
          "certificate_type": "GOTS|ISO 9001|ISO 14001|OEKO-TEX|SA8000|BSCI|Fair Trade|Other",
          "certificate_number": "string",
          "issued_by": "organization name",
          "issued_to": "company name",
          "issued_date": "YYYY-MM-DD",
          "expiry_date": "YYYY-MM-DD",
          "scope": "description of certification scope",
          "certificate_holder_address": "string (if available)"
        }}
        
        Filename: {filename}
        
        OCR Text:
        {text}
        
        Return only valid JSON. If a field cannot be determined, use null.
        """
        
        try:
            response = await self.llm_service.generate(prompt)
            # Clean response to extract JSON
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            json_str = response[json_start:json_end].strip()
            
            import json
            return json.loads(json_str)
            
        except Exception as e:
            logger.error(f"Error extracting structured data: {str(e)}")
            return {
                'certificate_type': 'Other',
                'certificate_number': None,
                'issued_by': None,
                'issued_to': None,
                'issued_date': None,
                'expiry_date': None,
                'scope': None,
                'certificate_holder_address': None
            }
    
    def _calculate_status(self, expiry_date: Optional[str]) -> str:
        """Calculate certificate status based on expiry date"""
        if not expiry_date or not validate_date_format(expiry_date):
            return 'unknown'
            
        expiry = datetime.strptime(expiry_date, '%Y-%m-%d').date()
        today = datetime.utcnow().date()
        days_until_expiry = (expiry - today).days
        
        if days_until_expiry < 0:
            return 'expired'
        elif days_until_expiry <= 30:
            return 'expiring_soon'
        else:
            return 'valid'
    
    def _needs_manual_review(self, confidence: float, data: Dict[str, Any]) -> bool:
        """Determine if certificate needs manual review"""
        # Check confidence score
        if confidence < 0.7:  # 70% confidence threshold
            return True
            
        # Check for missing critical fields
        required_fields = ['certificate_type', 'certificate_number', 'expiry_date']
        for field in required_fields:
            if not data.get(field):
                return True
                
        return False
    
    async def list_certificates(
        self,
        user_id: str,
        status: Optional[str] = None,
        certificate_type: Optional[str] = None,
        search: Optional[str] = None,
        sort: str = "-expiry_date",
        page: int = 1,
        per_page: int = 10
    ) -> Dict[str, Any]:
        """List certificates with filtering and pagination"""
        try:
            # Build query
            query = {'user_id': ObjectId(user_id)}
            
            if status:
                query['status'] = status
                
            if certificate_type:
                query['certificate_type'] = certificate_type
                
            if search:
                query['$or'] = [
                    {'certificate_number': {'$regex': search, '$options': 'i'}},
                    {'issued_by': {'$regex': search, '$options': 'i'}},
                    {'scope': {'$regex': search, '$options': 'i'}}
                ]
            
            # Count total matching documents
            total = await self.certificates_collection.count_documents(query)
            
            # Calculate pagination
            skip = (page - 1) * per_page
            
            # Determine sort order
            sort_direction = -1 if sort.startswith('-') else 1
            sort_field = sort.lstrip('-')
            
            # Execute query
            cursor = self.certificates_collection.find(query)\
                .sort(sort_field, sort_direction)\
                .skip(skip)\
                .limit(per_page)
                
            certificates = []
            async for doc in cursor:
                doc['_id'] = str(doc['_id'])
                doc['user_id'] = str(doc['user_id'])
                certificates.append(doc)
            
            # Calculate statistics
            stats = {
                'total': total,
                'valid': await self.certificates_collection.count_documents({
                    'user_id': ObjectId(user_id),
                    'status': 'valid'
                }),
                'expiring_soon': await self.certificates_collection.count_documents({
                    'user_id': ObjectId(user_id),
                    'status': 'expiring_soon'
                }),
                'expired': await self.certificates_collection.count_documents({
                    'user_id': ObjectId(user_id),
                    'status': 'expired'
                })
            }
            
            return {
                'certificates': certificates,
                'total': total,
                'page': page,
                'per_page': per_page,
                'stats': stats
            }
            
        except Exception as e:
            logger.error(f"Error listing certificates: {str(e)}", exc_info=True)
            raise
    
    async def get_certificate(self, certificate_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a single certificate by ID"""
        try:
            doc = await self.certificates_collection.find_one({
                '_id': ObjectId(certificate_id),
                'user_id': ObjectId(user_id)
            })
            
            if doc:
                doc['_id'] = str(doc['_id'])
                doc['user_id'] = str(doc['user_id'])
                return doc
            return None
            
        except Exception as e:
            logger.error(f"Error getting certificate {certificate_id}: {str(e)}")
            raise
    
    async def update_certificate(
        self,
        certificate_id: str,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> bool:
        """Update certificate data"""
        try:
            # Remove any protected fields
            update_data.pop('_id', None)
            update_data.pop('user_id', None)
            update_data.pop('uploaded_at', None)
            
            # If expiry date is updated, recalculate status
            if 'expiry_date' in update_data:
                update_data['status'] = self._calculate_status(update_data['expiry_date'])
            
            result = await self.certificates_collection.update_one(
                {'_id': ObjectId(certificate_id), 'user_id': ObjectId(user_id)},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error updating certificate {certificate_id}: {str(e)}")
            raise
    
    async def delete_certificate(self, certificate_id: str, user_id: str) -> bool:
        """Delete a certificate"""
        try:
            # First get the certificate to delete the associated file
            cert = await self.get_certificate(certificate_id, user_id)
            if cert and 'file_path' in cert and os.path.exists(cert['file_path']):
                try:
                    os.remove(cert['file_path'])
                except Exception as e:
                    logger.warning(f"Failed to delete file {cert['file_path']}: {str(e)}")
            
            # Delete from database
            result = await self.certificates_collection.delete_one({
                '_id': ObjectId(certificate_id),
                'user_id': ObjectId(user_id)
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting certificate {certificate_id}: {str(e)}")
            raise
