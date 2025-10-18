import requests
import json

def test_auth():
    # Get token from frontend local storage (you'll need to manually copy this)
    token = input("Paste your JWT token: ").strip()
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    # Test the auth/me endpoint
    print("\nTesting /api/auth/me endpoint...")
    try:
        response = requests.get(
            'http://localhost:8000/api/auth/me',
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")
    
    # Test the risk score endpoint directly
    supplier_id = '68f24cac37d8dc09931dc957'  # From the error message
    print(f"\nTesting /api/risk/score/{supplier_id}...")
    try:
        response = requests.get(
            f'http://localhost:8000/api/risk/score/{supplier_id}',
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_auth()
