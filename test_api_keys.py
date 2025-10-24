"""
Test script to verify all API keys are working
"""
import os
from dotenv import load_dotenv
import requests
from groq import Groq
import google.generativeai as genai

# Load environment variables
load_dotenv()

def test_google_ai():
    """Test Google AI (Gemini) API key"""
    print("\n🔍 Testing Google AI API Key...")
    try:
        api_key = os.getenv('GOOGLE_AI_API_KEY')
        if not api_key:
            print("   ❌ GOOGLE_AI_API_KEY not found in .env")
            return False
        
        print(f"   Key: {api_key[:10]}...{api_key[-4:]}")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say 'API key is valid'")
        
        print(f"   ✅ Google AI API key is VALID")
        print(f"   Response: {response.text[:50]}...")
        return True
        
    except Exception as e:
        print(f"   ❌ Google AI API key is INVALID: {e}")
        return False


def test_groq():
    """Test Groq API key"""
    print("\n🔍 Testing Groq API Key...")
    try:
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            print("   ❌ GROQ_API_KEY not found in .env")
            return False
        
        print(f"   Key: {api_key[:10]}...{api_key[-4:]}")
        
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="qwen2-72b-instruct",
            messages=[{"role": "user", "content": "Say 'API key is valid'"}],
            max_tokens=50
        )
        
        print(f"   ✅ Groq API key is VALID")
        print(f"   Response: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"   ❌ Groq API key is INVALID: {e}")
        return False


def test_openrouter():
    """Test OpenRouter API key"""
    print("\n🔍 Testing OpenRouter API Key...")
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            print("   ❌ OPENROUTER_API_KEY not found in .env")
            return False
        
        print(f"   Key: {api_key[:10]}...{api_key[-4:]}")
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemma-2-9b-it:free",
                "messages": [{"role": "user", "content": "Say 'API key is valid'"}],
                "max_tokens": 50
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ OpenRouter API key is VALID")
            print(f"   Response: {result['choices'][0]['message']['content']}")
            return True
        else:
            print(f"   ❌ OpenRouter API key is INVALID")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
    except Exception as e:
        print(f"   ❌ OpenRouter API key test failed: {e}")
        return False


def main():
    print("=" * 60)
    print("🔑 API Key Verification Test")
    print("=" * 60)
    
    results = {
        "Google AI": test_google_ai(),
        "Groq": test_groq(),
        "OpenRouter": test_openrouter()
    }
    
    print("\n" + "=" * 60)
    print("📊 Summary")
    print("=" * 60)
    
    for service, status in results.items():
        status_icon = "✅" if status else "❌"
        status_text = "VALID" if status else "INVALID"
        print(f"{status_icon} {service}: {status_text}")
    
    all_valid = all(results.values())
    
    if all_valid:
        print("\n🎉 All API keys are valid! Your backend should work correctly.")
    else:
        print("\n⚠️  Some API keys are invalid. Please update them in your .env file.")
        print("\n📝 How to get API keys:")
        if not results["Google AI"]:
            print("   • Google AI: https://makersuite.google.com/app/apikey")
        if not results["Groq"]:
            print("   • Groq: https://console.groq.com/keys")
        if not results["OpenRouter"]:
            print("   • OpenRouter: https://openrouter.ai/keys")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
