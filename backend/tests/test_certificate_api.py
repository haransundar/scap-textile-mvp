"""
Integration tests for the Certificate API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from bson import ObjectId
import os
import tempfile
from PIL import Image
import io

from main import app
from models.certificate import CertificateStatus

# Test client
client = TestClient(app)

# Test data
TEST_USER_ID = "507f1f77bcf86cd799439011"
TEST_CERT_ID = "507f1f77bcf86cd799439012"
SAMPLE_CERTIFICATE = {
    "_id": ObjectId(TEST_CERT_ID),
    "user_id": ObjectId(TEST_USER_ID),
    "certificate_type": "ISO 9001",
    "certificate_number": "ISO-9001-2023-12345",
    "issued_by": "International Organization for Standardization",
    "issued_to": "Test Company Inc.",
    "issued_date": "2023-01-15",
    "expiry_date": (datetime.utcnow() + timedelta(days=365)).strftime("%Y-%m-%d"),
    "status": "valid",
    "original_filename": "test_certificate.pdf",
    "file_path": "/path/to/test_certificate.pdf",
    "ocr_text": "Sample OCR text",
    "ocr_confidence": 0.95,
    "verified": False,
    "needs_review": False,
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow()
}

# Mock authentication
def get_current_user_mock():
    return {"id": TEST_USER_ID, "email": "test@example.com", "role": "user"}

# Fixture for test files
@pytest.fixture
def test_image():
    """Create a test image file"""
    # Create a simple image
    image = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
    temp_file.write(img_byte_arr.getvalue())
    temp_file.close()
    
    yield temp_file.name
    
    # Cleanup
    if os.path.exists(temp_file.name):
        os.unlink(temp_file.name)

# Mock database operations
@pytest.fixture
def mock_db(monkeypatch):
    """Mock database operations"""
    from database import mongodb
    
    class MockCollection:
        def __init__(self):
            self.data = {}
            
        async def find_one(self, query):
            if "_id" in query and str(query["_id"]) == TEST_CERT_ID:
                return SAMPLE_CERTIFICATE
            return None
            
        async def find(self, query):
            return [SAMPLE_CERTIFICATE]
            
        async def count_documents(self, query):
            return 1
            
        async def insert_one(self, document):
            return type('obj', (object,), {'inserted_id': ObjectId(TEST_CERT_ID)})
            
        async def update_one(self, filter, update, **kwargs):
            return type('obj', (object,), {'modified_count': 1})
            
        async def delete_one(self, filter):
            return type('obj', (object,), {'deleted_count': 1})
    
    mock_db = type('obj', (object,), {'certificates': MockCollection()})
    
    async def mock_get_db():
        return mock_db
    
    monkeypatch.setattr(mongodb, "get_database", mock_get_db)
    return mock_db

# Mock authentication dependency
@pytest.fixture
def mock_auth(monkeypatch):
    """Mock authentication"""
    from api.middleware import auth
    
    async def mock_get_current_user():
        return {
            "id": TEST_USER_ID,
            "email": "test@example.com",
            "role": "user"
        }
    
    monkeypatch.setattr(auth, "get_current_user", mock_get_current_user)

# Mock OCR service
@pytest.fixture
def mock_ocr(monkeypatch):
    """Mock OCR service"""
    from services import ocr_service
    
    async def mock_extract_text(*args, **kwargs):
        return {
            'text': 'Sample OCR text',
            'confidence': 0.95,
            'processing_time': 1.5
        }
    
    monkeypatch.setattr(ocr_service.OCRService, "extract_text", mock_extract_text)

# Mock certificate service
@pytest.fixture
def mock_cert_service(monkeypatch):
    """Mock certificate service"""
    from services import certificate_service
    
    async def mock_extract_structured_data(*args, **kwargs):
        return {
            'certificate_type': 'ISO 9001',
            'certificate_number': 'ISO-9001-2023-12345',
            'issued_by': 'Test Org',
            'issued_to': 'Test Company',
            'issued_date': '2023-01-15',
            'expiry_date': '2026-01-14',
            'scope': 'Test Scope'
        }
    
    monkeypatch.setattr(certificate_service.CertificateService, "_extract_structured_data", mock_extract_structured_data)

# Tests
class TestCertificateAPI:
    def test_upload_certificate(self, test_image, mock_auth, mock_db, mock_ocr, mock_cert_service):
        """Test uploading a certificate"""
        with open(test_image, 'rb') as f:
            response = client.post(
                "/api/certificates/upload",
                files={"file": ("test_cert.png", f, "image/png")},
                headers={"Authorization": "Bearer test_token"}
            )
            
        assert response.status_code == 200
        data = response.json()
        assert "certificate_id" in data
        assert data["success"] is True
        assert data["extracted_data"]["certificate_type"] == "ISO 9001"
    
    def test_upload_invalid_file(self, mock_auth):
        """Test uploading an invalid file"""
        response = client.post(
            "/api/certificates/upload",
            files={"file": ("test.txt", b"not an image", "text/plain")},
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]
    
    def test_list_certificates(self, mock_auth, mock_db):
        """Test listing certificates"""
        response = client.get(
            "/api/certificates/",
            params={"status": "valid", "page": 1, "per_page": 10},
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["certificates"], list)
        assert data["page"] == 1
        assert data["per_page"] == 10
        assert "stats" in data
    
    def test_get_certificate(self, mock_auth, mock_db):
        """Test getting a single certificate"""
        response = client.get(
            f"/api/certificates/{TEST_CERT_ID}",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["certificate_number"] == "ISO-9001-2023-12345"
        assert data["status"] == "valid"
    
    def test_get_nonexistent_certificate(self, mock_auth, mock_db):
        """Test getting a non-existent certificate"""
        response = client.get(
            "/api/certificates/000000000000000000000000",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 404
    
    def test_update_certificate(self, mock_auth, mock_db):
        """Test updating a certificate"""
        update_data = {
            "verified": True,
            "notes": "Verified by admin"
        }
        
        response = client.put(
            f"/api/certificates/{TEST_CERT_ID}",
            json=update_data,
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        assert response.json()["success"] is True
    
    def test_delete_certificate(self, mock_auth, mock_db):
        """Test deleting a certificate"""
        response = client.delete(
            f"/api/certificates/{TEST_CERT_ID}",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        assert response.json()["success"] is True

# Run tests
if __name__ == "__main__":
    pytest.main(["-v", "test_certificate_api.py"])
