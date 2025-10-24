"""
Quick API key test without extra dependencies
"""
import os
import sys

# Add backend to path
sys.path.insert(0, 'backend')

def test_api_keys():
    print("=" * 60)
    print("🔑 API Key Verification")
    print("=" * 60)
    
    # Read .env file manually
    env_vars = {}
    try:
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value
    except FileNotFoundError:
        print("❌ .env file not found!")
        return
    
    # Check each API key
    keys_to_check = {
        'GOOGLE_AI_API_KEY': 'Google AI (Gemini)',
        'GROQ_API_KEY': 'Groq',
        'OPENROUTER_API_KEY': 'OpenRouter'
    }
    
    print("\n📋 API Keys Found:")
    print("-" * 60)
    
    all_present = True
    for key, service in keys_to_check.items():
        if key in env_vars and env_vars[key]:
            value = env_vars[key]
            masked = f"{value[:10]}...{value[-4:]}" if len(value) > 14 else "***"
            print(f"✅ {service:20} : {masked}")
        else:
            print(f"❌ {service:20} : NOT FOUND")
            all_present = False
    
    print("-" * 60)
    
    if all_present:
        print("\n✅ All API keys are present in .env file")
        print("\n🔄 Now testing if they work...")
        print("\nTo test the keys, run:")
        print("   cd backend")
        print("   python -m pytest tests/ -v")
        print("\nOr start the backend server:")
        print("   cd backend")
        print("   uvicorn main:app --reload")
    else:
        print("\n⚠️  Some API keys are missing!")
        print("\n📝 Get your API keys from:")
        print("   • Google AI: https://makersuite.google.com/app/apikey")
        print("   • Groq: https://console.groq.com/keys")
        print("   • OpenRouter: https://openrouter.ai/keys")
    
    # Check if backend can import the config
    print("\n" + "=" * 60)
    print("🔧 Testing Backend Configuration")
    print("=" * 60)
    
    try:
        from utils.config import settings
        print("✅ Backend config loaded successfully")
        print(f"   • Google AI Key: {settings.GOOGLE_AI_API_KEY[:10]}...{settings.GOOGLE_AI_API_KEY[-4:]}")
        print(f"   • Groq Key: {settings.GROQ_API_KEY[:10]}...{settings.GROQ_API_KEY[-4:]}")
        print(f"   • OpenRouter Key: {settings.OPENROUTER_API_KEY[:10]}...{settings.OPENROUTER_API_KEY[-4:]}")
        print(f"   • MongoDB URI: {settings.MONGODB_URI}")
        print(f"   • Environment: {settings.ENVIRONMENT}")
        
        print("\n✅ Configuration is valid!")
        
    except Exception as e:
        print(f"❌ Failed to load backend config: {e}")
        print("\nMake sure you're in the project root directory")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_api_keys()
