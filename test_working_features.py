"""
Test script for all working SCAP backend features
Run this after starting the backend server
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_health():
    """Test health endpoint"""
    print_section("1. Testing Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server Status: {data.get('status')}")
            print(f"✅ MongoDB: {data.get('database')}")
            print(f"✅ Timestamp: {data.get('timestamp')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        print("⚠️  Make sure the backend server is running!")
        return False

def test_register_user():
    """Test user registration"""
    print_section("2. Testing User Registration")
    try:
        user_data = {
            "email": f"test_{int(datetime.now().timestamp())}@example.com",
            "password": os.getenv('TEST_PASSWORD', 'TestPassword123!'),
            "full_name": "Test User",
            "company_name": "Test Company"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User registered: {data.get('email')}")
            print(f"✅ User ID: {data.get('id')}")
            return data
        else:
            print(f"⚠️  Registration response: {response.status_code}")
            print(f"   {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_login(email, password):
    """Test user login"""
    print_section("3. Testing User Login")
    try:
        login_data = {
            "username": email,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful")
            print(f"✅ Token type: {data.get('token_type')}")
            print(f"✅ Access token: {data.get('access_token')[:50]}...")
            return data.get('access_token')
        else:
            print(f"❌ Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_suppliers(token):
    """Test supplier endpoints"""
    print_section("4. Testing Supplier Management")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get all suppliers
        response = requests.get(f"{BASE_URL}/api/suppliers", headers=headers)
        if response.status_code == 200:
            suppliers = response.json()
            print(f"✅ Found {len(suppliers)} suppliers")
            for supplier in suppliers[:3]:
                print(f"   - {supplier.get('name')} ({supplier.get('location')})")
            return True
        else:
            print(f"⚠️  Suppliers response: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_documents(token):
    """Test document endpoints"""
    print_section("5. Testing Document Management")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get all documents
        response = requests.get(f"{BASE_URL}/api/documents", headers=headers)
        if response.status_code == 200:
            documents = response.json()
            print(f"✅ Found {len(documents)} documents")
            for doc in documents[:3]:
                print(f"   - {doc.get('filename')} ({doc.get('document_type')})")
            return True
        else:
            print(f"⚠️  Documents response: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_compliance(token):
    """Test compliance endpoints"""
    print_section("6. Testing Compliance Checking")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get compliance checks
        response = requests.get(f"{BASE_URL}/api/compliance/checks", headers=headers)
        if response.status_code == 200:
            checks = response.json()
            print(f"✅ Found {len(checks)} compliance checks")
            for check in checks[:3]:
                print(f"   - {check.get('check_type')}: {check.get('status')}")
            return True
        else:
            print(f"⚠️  Compliance response: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_ocr_languages():
    """Test available OCR languages"""
    print_section("7. Testing OCR Language Support")
    try:
        response = requests.get(f"{BASE_URL}/api/documents/ocr/languages")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Available languages: {', '.join(data.get('languages', []))}")
            print(f"✅ Default language: {data.get('default')}")
            return True
        else:
            print(f"⚠️  OCR languages response: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("  SCAP BACKEND FEATURE TESTING")
    print("="*60)
    print("\n⚠️  Make sure the backend server is running on http://localhost:8000")
    print("   Start it with: cd backend && .\\venv\\Scripts\\activate && python main.py\n")
    
    input("Press Enter to start testing...")
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": 7
    }
    
    # Test 1: Health check
    if test_health():
        results["passed"] += 1
    else:
        results["failed"] += 1
        print("\n❌ Server is not running. Please start it first.")
        return
    
    # Test 2: Register user
    user = test_register_user()
    if user:
        results["passed"] += 1
        email = user.get('email')
        password = "TestPassword123!"
    else:
        results["failed"] += 1
        print("\n⚠️  Using default credentials for remaining tests")
        email = "admin@scap.com"
        password = "admin123"
    
    # Test 3: Login
    token = test_login(email, password)
    if token:
        results["passed"] += 1
    else:
        results["failed"] += 1
        print("\n❌ Cannot continue without authentication token")
        return
    
    # Test 4: Suppliers
    if test_suppliers(token):
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 5: Documents
    if test_documents(token):
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 6: Compliance
    if test_compliance(token):
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 7: OCR Languages
    if test_ocr_languages():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Print summary
    print_section("TEST SUMMARY")
    print(f"Total Tests: {results['total']}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"\nSuccess Rate: {(results['passed']/results['total']*100):.1f}%")
    
    if results['passed'] == results['total']:
        print("\n🎉 All tests passed! Your backend is fully operational!")
    elif results['passed'] >= results['total'] * 0.7:
        print("\n✅ Most tests passed! Backend is operational with minor issues.")
    else:
        print("\n⚠️  Several tests failed. Please check the backend logs.")
    
    print("\n" + "="*60)
    print("  Next Steps:")
    print("="*60)
    print("1. Visit http://localhost:8000/docs for interactive API testing")
    print("2. Upload sample certificates and test OCR")
    print("3. Test compliance checking with real data")
    print("4. Start building the frontend application")
    print("\n")

if __name__ == "__main__":
    run_all_tests()
