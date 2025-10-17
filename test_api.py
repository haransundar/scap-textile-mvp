"""
Quick API test script
Run this after starting the backend to verify everything works
"""
import requests
import json
from time import sleep

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def test_health():
    print_section("1. Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_login():
    print_section("2. Login Test")
    data = {
        "email": "priya@priyatextiles.com",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/api/suppliers/login", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Login successful!")
        print(f"Token: {result['access_token'][:50]}...")
        return result['access_token'], result['supplier_id']
    else:
        print(f"❌ Login failed: {response.text}")
        return None, None

def test_get_profile(token):
    print_section("3. Get Supplier Profile")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/suppliers/me", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        profile = response.json()
        print(f"✅ Supplier: {profile['name']}")
        print(f"   Tier: {profile['tier']}")
        print(f"   Location: {profile['address']['city']}, {profile['address']['state']}")
        print(f"   Risk Score: {profile['risk_score']}")
        return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def test_get_certificates(supplier_id, token):
    print_section("4. Get Certificates")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/documents/supplier/{supplier_id}", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        certs = response.json()
        print(f"✅ Found {len(certs)} certificate(s)")
        for cert in certs:
            print(f"   - {cert['type']}: {cert['number']}")
            print(f"     Expires: {cert['expiry_date']}")
            print(f"     Confidence: {cert['ocr_confidence']:.1%}")
        return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def test_risk_score(supplier_id, token):
    print_section("5. Calculate Risk Score")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/risk/calculate/{supplier_id}", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        risk = response.json()
        print(f"✅ Risk Score: {risk['score']}/100")
        print(f"   Risk Drivers:")
        for driver in risk['risk_drivers']:
            print(f"   - {driver['factor']}: {driver['description']}")
        return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def test_chatbot(token):
    print_section("6. Test Chatbot")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "message": "What is GOTS certification?",
        "language": "en"
    }
    response = requests.post(f"{BASE_URL}/api/chat/message", headers=headers, json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Chatbot Response:")
        print(f"   {result['response'][:200]}...")
        return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def test_regulations():
    print_section("7. Get Regulations")
    response = requests.get(f"{BASE_URL}/api/compliance/regulations?days=365")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        regs = response.json()
        print(f"✅ Found {len(regs)} regulation(s)")
        for reg in regs:
            print(f"   - {reg['regulation_title']}")
            print(f"     Jurisdiction: {reg['jurisdiction']}")
            print(f"     Effective: {reg['effective_date']}")
        return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def main():
    print("\n" + "="*60)
    print("  SCAP API Test Suite")
    print("="*60)
    print("\nMake sure the backend is running on http://localhost:8000")
    print("Press Enter to start tests...")
    input()
    
    results = []
    
    # Test 1: Health check
    results.append(("Health Check", test_health()))
    sleep(0.5)
    
    # Test 2: Login
    token, supplier_id = test_login()
    results.append(("Login", token is not None))
    
    if not token:
        print("\n❌ Cannot continue without authentication")
        return
    
    sleep(0.5)
    
    # Test 3: Get profile
    results.append(("Get Profile", test_get_profile(token)))
    sleep(0.5)
    
    # Test 4: Get certificates
    results.append(("Get Certificates", test_get_certificates(supplier_id, token)))
    sleep(0.5)
    
    # Test 5: Risk score
    results.append(("Risk Score", test_risk_score(supplier_id, token)))
    sleep(0.5)
    
    # Test 6: Chatbot
    results.append(("Chatbot", test_chatbot(token)))
    sleep(0.5)
    
    # Test 7: Regulations
    results.append(("Regulations", test_regulations()))
    
    # Summary
    print_section("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Backend is working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the logs above.")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend")
        print("Make sure the backend is running:")
        print("  cd backend")
        print("  venv\\Scripts\\activate")
        print("  python main.py")
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
