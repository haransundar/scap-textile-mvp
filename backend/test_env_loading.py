"""
Test if .env is being loaded correctly by the backend
"""
import os
import sys

print("=" * 60)
print("🔍 Environment Variable Loading Test")
print("=" * 60)

# Check current directory
print(f"\n📂 Current Directory: {os.getcwd()}")

# Check if .env exists in current directory
env_in_current = os.path.exists('.env')
env_in_parent = os.path.exists('../.env')

print(f"\n📄 .env in current dir: {'✅ Yes' if env_in_current else '❌ No'}")
print(f"📄 .env in parent dir: {'✅ Yes' if env_in_parent else '❌ No'}")

# Try to load config
print("\n🔧 Loading backend config...")
try:
    from utils.config import settings
    
    print("✅ Config loaded successfully!")
    print(f"\n🔑 API Keys Status:")
    print(f"   • GROQ_API_KEY: {settings.GROQ_API_KEY[:15]}...{settings.GROQ_API_KEY[-4:]} ({len(settings.GROQ_API_KEY)} chars)")
    print(f"   • OPENROUTER_API_KEY: {settings.OPENROUTER_API_KEY[:15]}...{settings.OPENROUTER_API_KEY[-4:]} ({len(settings.OPENROUTER_API_KEY)} chars)")
    print(f"   • GOOGLE_AI_API_KEY: {settings.GOOGLE_AI_API_KEY[:15]}...{settings.GOOGLE_AI_API_KEY[-4:]} ({len(settings.GOOGLE_AI_API_KEY)} chars)")
    
    # Test Groq directly
    print("\n🧪 Testing Groq API...")
    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Say 'Working!'"}],
        max_tokens=10
    )
    
    print(f"✅ Groq API works! Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Solution:")
    print("   The backend needs to be started from the PROJECT ROOT, not from backend folder!")
    print("\n   Correct way:")
    print("   1. cd to project root: D:\\AI Projects\\SCAP(Supply Chain AI Compliance Platform)")
    print("   2. Then run: cd backend && python main.py")
    print("   OR: uvicorn main:app --reload --app-dir backend")

print("\n" + "=" * 60)
