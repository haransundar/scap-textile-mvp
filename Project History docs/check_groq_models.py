"""
Check available Groq models
"""

def check_models():
    print("=" * 60)
    print("🔍 Checking Available Groq Models")
    print("=" * 60)
    
    # Read API key
    groq_key = None
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('GROQ_API_KEY='):
                    groq_key = line.split('=', 1)[1].strip()
                    break
    except FileNotFoundError:
        print("❌ .env file not found!")
        return
    
    if not groq_key:
        print("❌ GROQ_API_KEY not found in .env")
        return
    
    try:
        from groq import Groq
        
        client = Groq(api_key=groq_key)
        
        # List available models
        models = client.models.list()
        
        print("\n📋 Available Models:")
        print("-" * 60)
        
        for model in models.data:
            print(f"   • {model.id}")
            if hasattr(model, 'owned_by'):
                print(f"     Owner: {model.owned_by}")
        
        print("-" * 60)
        
        # Test with a common model
        print("\n🔄 Testing with llama-3.3-70b-versatile...")
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": "Say 'Hello, Groq API works!'"}
            ],
            max_tokens=50
        )
        
        result = response.choices[0].message.content
        print(f"✅ SUCCESS: {result}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_models()
