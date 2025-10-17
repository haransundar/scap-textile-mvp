"""
Environment Variable Validation Script
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from dotenv import load_dotenv

# Load .env from project root
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

required_vars = {
    'GOOGLE_AI_API_KEY': 30,  # Expected minimum length
    'GROQ_API_KEY': 40,
    'OPENROUTER_API_KEY': 40,
    'MONGODB_URI': 20,
}

print("="*60)
print("ENVIRONMENT VARIABLE VERIFICATION")
print("="*60)

all_valid = True
for var, min_length in required_vars.items():
    value = os.getenv(var)
    if not value:
        print(f"❌ {var}: MISSING")
        all_valid = False
    elif len(value) < min_length:
        print(f"⚠️  {var}: Too short (expected >{min_length} chars, got {len(value)})")
        all_valid = False
    else:
        print(f"✅ {var}: Present ({len(value)} chars)")

print()
if all_valid:
    print("✅ All environment variables configured correctly")
    sys.exit(0)
else:
    print("❌ Fix missing/invalid environment variables in .env")
    sys.exit(1)
