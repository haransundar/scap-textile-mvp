"""
Test the auth endpoint to see the exact error
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    """Test login endpoint"""
    print("=" * 60)
    print("Testing Login Endpoint")
    print("=" * 60)
    
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    print(f"\n1. Logging in with: {login_data['email']}")
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print(f"\n   ✓ Login successful!")
        print(f"   Token (first 50 chars): {token[:50]}...")
        return token
    else:
        print(f"\n   ✗ Login failed!")
        return None

def test_me_endpoint(token):
    """Test /me endpoint"""
    print("\n" + "=" * 60)
    print("Testing /me Endpoint")
    print("=" * 60)
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print(f"\n2. Getting user info with token...")
    print(f"   Headers: {headers}")
    
    try:
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        print(f"\n   Status: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print(f"   Response Body: {json.dumps