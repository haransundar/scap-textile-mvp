"""
Unit tests for the CertificateService class
"""
import pytest
import os
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId

from services.certificate_service import CertificateService
from models.certificate import CertificateStatus

# Test data
TEST_USER_ID = "507f1f77bcf86cd799439011"
SAMPLE_CERTIFICATE = {
    "_id": ObjectId("507f1f77bcf86cd799439012"),
    "user_id": ObjectId(TEST_USER_ID),
    "certificate_type": "ISO 9001",
    "certificate_number": "ISO-9001-2023-12345",
    "issued_by": "International Organization for Standardization",
    "issued_to": "Test Company Inc.",
    "issued_date": "2023-01-15",
    "expiry_date": "2026-01-14",
    "scope": "Quality Management System",
    "status": "valid",
    "original_filename": "test_certificate.pdf",
    "file_path": "/path/to/test_certificate.pdf",
    "ocr_text": "ISO 9001:2015 Certificate\nIssued to: Test Company\n...",
    "ocr_confidence": 0.95,
    "verified": False,
    "needs_review": False,
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow()
}

@pytest.fixture
def mock_db():
    """Fixture for a mock MongoDB database"""
    mock_db = MagicMock()
    mock_db.certificates = MagicMock()
    return mock_db

@pytest.fixture
def cert_service(mock_db):
    """Fixture for CertificateService with mocked database"""
    service = CertificateService()
    service.certificates_collection = mock_db.certificates
    return service

@pytest.mark.asyncio
async def test_calculate_status_valid():
    """Test status calculation for valid certificate"""
    service = CertificateService()
    expiry_date = (datetime.utcnow() + timedelta(days=60)).strftime("%Y-%m-%d")
    status = service._calculate_status(expiry_date)
    assert status == CertificateStatus.VALID

@pytest.mark.asyncio
async def test_calculate_status_expiring_soon():
    """Test status calculation for expiring soon certificate"""
    service = CertificateService()
    expiry_date = (datetime.utcnow() + timedelta(days=15)).strftime("%Y-%m-%d")
    status = service._calculate_status(expiry_date)
    assert status == CertificateStatus.EXPIRING_SOON

@pytest.mark.asyncio
async def test_calculate_status_expired():
    """Test status calculation for expired certificate"""
    service = CertificateService()
    expiry_date = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    status = service._calculate_status(expiry_date)
    assert status == CertificateStatus.EXPIRED

@pytest.mark.asyncio
async def test_extract_structured_data(cert_service):
    """Test extraction of structured data from OCR text"""
    ocr_text = """
    CERTIFICATE OF REGISTRATION
    ISO 9001:2015
    
    This is to certify that
    TEST COMPANY INC.
    
    Has been assessed and registered to
    ISO 9001:2015 - Quality Management Systems
    
    Certificate Number: ISO-9001-2023-12345
    Issue Date: 2023-01-15
    Expiry Date: 2026-01-14
    
    Scope: Design, development and supply of software solutions
    """
    
    with patch.object(cert_service.llm_service, 'generate') as mock_generate:
        # Mock the LLM response
        mock_generate.return_value = '''
        {
            "certificate_type": "ISO 9001",
            "certificate_number": "ISO-9001-2023-12345",
            "issued_by": "International Organization for Standardization",
            "issued_to": "TEST COMPANY INC.",
            "issued_date": "2023-01-15",
            "expiry_date": "2026-01-14",
            "scope": "Design, development and supply of software solutions"
        }
        '''
        
        result = await cert_service._extract_structured_data(ocr_text, "test_certificate.pdf")
        
        assert result["certificate_type"] == "ISO 9001"
        assert result["certificate_number"] == "ISO-9001-2023-12345"
        assert result["issued_to"] == "TEST COMPANY INC."
        assert result["expiry_date"] == "2026-01-14"

@pytest.mark.asyncio
async def test_process_certificate(cert_service, tmp_path):
    """Test the complete certificate processing flow"""
    # Create a test image file
    test_file = tmp_path / "test_cert.png"
    test_file.write_bytes(b"fake image data")
    
    # Mock OCR and LLM services
    with patch.object(cert_service.ocr_service, 'extract_text') as mock_ocr, \
         patch.object(cert_service, '_extract_structured_data') as mock_extract, \
         patch('os.remove') as mock_remove:
        
        # Setup mocks
        mock_ocr.return_value = {
            'text': 'Sample OCR text',
            'confidence': 0.95,
            'processing_time': 1.5
        }
        
        mock_extract.return_value = {
            'certificate_type': 'ISO 9001',
            'certificate_number': 'TEST-123',
            'issued_by': 'Test Org',
            'issued_to': 'Test Company',
            'issued_date': '2023-01-01',
            'expiry_date': '2026-01-01',
            'scope': 'Test Scope'
        }
        
        # Mock database insert
        cert_service.certificates_collection.insert_one.return_value.inserted_id = ObjectId("507f1f77bcf86cd799439013")
        
        # Call the method
        result = await cert_service.process_certificate(
            file_path=str(test_file),
            user_id=TEST_USER_ID,
            original_filename="test_cert.png"
        )
        
        # Verify results
        assert result['success'] is True
        assert 'certificate_id' in result
        assert result['extracted_data']['certificate_type'] == 'ISO 9001'
        
        # Verify file was processed and cleaned up
        mock_ocr.assert_called_once()
        mock_extract.assert_called_once()
        mock_remove.assert_called_once_with(str(test_file))

@pytest.mark.asyncio
async def test_list_certificates(cert_service):
    """Test listing certificates with filters"""
    # Setup mock data
    mock_cursor = [
        {**SAMPLE_CERTIFICATE, "_id": ObjectId("507f1f77bcf86cd799439012")},
        {**SAMPLE_CERTIFICATE, "_id": ObjectId("607f1f77bcf86cd799439013")},
    ]
    
    # Setup mock database methods
    cert_service.certificates_collection.count_documents.return_value = 2
    cert_service.certificates_collection.find.return_value.sort.return_value.skip.return_value.limit.return_value = mock_cursor
    
    # Call the method
    result = await cert_service.list_certificates(
        user_id=TEST_USER_ID,
        status="valid",
        page=1,
        per_page=10
    )
    
    # Verify results
    assert result["total"] == 2
    assert len(result["certificates"]) == 2
    assert "stats" in result
    assert result["page"] == 1
    assert result["per_page"] == 10

@pytest.mark.asyncio
async def test_get_certificate(cert_service):
    """Test retrieving a single certificate"""
    # Setup mock data
    cert_id = "507f1f77bcf86cd799439012"
    mock_cert = {**SAMPLE_CERTIFICATE, "_id": ObjectId(cert_id)}
    
    # Setup mock database method
    cert_service.certificates_collection.find_one.return_value = mock_cert
    
    # Call the method
    result = await cert_service.get_certificate(
        certificate_id=cert_id,
        user_id=TEST_USER_ID
    )
    
    # Verify results
    assert result is not None
    assert str(result["_id"]) == cert_id
    assert result["certificate_number"] == "ISO-9001-2023-12345"

@pytest.mark.asyncio
async def test_update_certificate(cert_service):
    """Test updating a certificate"""
    # Setup test data
    cert_id = "507f1f77bcf86cd799439012"
    update_data = {
        "verified": True,
        "notes": "Verified by admin"
    }
    
    # Setup mock database method
    cert_service.certificates_collection.update_one.return_value.modified_count = 1
    
    # Call the method
    result = await cert_service.update_certificate(
        certificate_id=cert_id,
        user_id=TEST_USER_ID,
        update_data=update_data
    )
    
    # Verify results
    assert result is True
    cert_service.certificates_collection.update_one.assert_called_once()

@pytest.mark.asyncio
async def test_delete_certificate(cert_service):
    """Test deleting a certificate"""
    # Setup test data
    cert_id = "507f1f77bcf86cd799439012"
    
    # Setup mock database methods
    cert_service.certificates_collection.delete_one.return_value.deleted_count = 1
    
    # Call the method
    result = await cert_service.delete_certificate(
        certificate_id=cert_id,
        user_id=TEST_USER_ID
    )
    
    # Verify results
    assert result is True
    cert_service.certificates_collection.delete_one.assert_called_once()
