"""
Simple test to verify Groq API key works
Run this BEFORE starting the backend
"""
import sys

def test_groq():
    print("=" * 60)
    print("🔍 Testing Groq API Key")
    print("=" * 60)
    
    # Read API key from .env
    groq_key = None
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('GROQ_API_KEY='):
                    groq_key = line.split('=', 1)[1].strip()
                    break
    except FileNotFoundError:
        print("❌ .env file not found!")
        return False
    
    if not groq_key:
        print("❌ GROQ_API_KEY not found in .env")
        return False
    
    print(f"\n📋 API Key: {groq_key[:15]}...{groq_key[-4:]}")
    print(f"   Length: {len(groq_key)} characters")
    print(f"   Format: {'✅ Correct' if groq_key.startswith('gsk_') else '❌ Wrong (should start with gsk_)'}")
    
    # Try to use the key
    print("\n🔄 Testing API call...")
    try:
        from groq import Groq
        
        client = Groq(api_key=groq_key)
        
        response = client.chat.completions.create(
            model="qwen2-72b-instruct",
            messages=[
                {"role": "user", "content": "Say 'Hello, API key works!'"}
            ],
            max_tokens=50,
            temperature=0.5
        )
        
        result = response.choices[0].message.content
        
        print(f"✅ SUCCESS! Groq API is working!")
        print(f"\n📝 Response: {result}")
        print("\n" + "=" * 60)
        print("✅ Your Groq API key is VALID")
        print("=" * 60)
        return True
        
    except Exception as e:
        error_str = str(e)
        print(f"\n❌ FAILED: {error_str}")
        
        if "401" in error_str or "Invalid API Key" in error_str:
            print("\n⚠️  Your API key is INVALID or EXPIRED")
            print("\n📝 To fix:")
            print("   1. Go to: https://console.groq.com/keys")
            print("   2. Delete the old key")
            print("   3. Create a new API key")
            print("   4. Copy the new key")
            print("   5. Update GROQ_API_KEY in .env file")
            print("   6. Run this test again")
        elif "groq" in error_str.lower() and "module" in error_str.lower():
            print("\n⚠️  Groq library not installed")
            print("\n📝 To fix:")
            print("   pip install groq")
        else:
            print(f"\n⚠️  Unexpected error: {error_str}")
        
        print("\n" + "=" * 60)
        return False

if __name__ == "__main__":
    success = test_groq()
    sys.exit(0 if success else 1)
