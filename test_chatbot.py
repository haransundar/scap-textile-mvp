"""
Simple test script for the chatbot endpoint only
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_chatbot():
    print("Testing chatbot endpoint...")
    
    # First login to get a token
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        # Try supplier login first
        login_response = requests.post(f"{BASE_URL}/api/suppliers/login", json=login_data)
        
        if login_response.status_code != 200:
            # Try auth login if supplier login fails
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        
        if login_response.status_code != 200:
            print(f"Login failed with status {login_response.status_code}")
            print(login_response.text)
            return False
        
        token = login_response.json()["access_token"]
        print("Login successful, got token")
        
        # Now test the chatbot
        headers = {"Authorization": f"Bearer {token}"}
        chat_data = {
            "message": "What is GOTS certification?",
            "language": "en"
        }
        
        chat_response = requests.post(f"{BASE_URL}/api/chat/message", headers=headers, json=chat_data)
        
        if chat_response.status_code == 200:
            result = chat_response.json()
            print(f"Chatbot response successful!")
            print(f"Response: {result['response'][:100]}...")
            return True
        else:
            print(f"Chatbot request failed with status {chat_response.status_code}")
            print(chat_response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print("Cannot connect to backend. Make sure the server is running.")
        return False

if __name__ == "__main__":
    test_chatbot()