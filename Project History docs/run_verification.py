"""
SCAP Backend Automated Verification Runner
Run this script to verify all backend components
"""
import subprocess
import sys
from pathlib import Path

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"❌ Timeout after 30 seconds")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     SCAP BACKEND COMPREHENSIVE VERIFICATION                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")
    
    results = {}
    
    # Check if we're in the right directory
    if not Path('backend').exists():
        print("❌ Error: Run this script from the project root directory")
        sys.exit(1)
    
    # Test 1: Check Python version
    print("\n1️⃣  Checking Python version...")
    result = subprocess.run(['python', '--version'], capture_output=True, text=True)
    print(result.stdout)
    if '3.11' in result.stdout or '3.12' in result.stdout:
        print("✅ Python version OK")
        results['python_version'] = True
    else:
        print("⚠️  Python 3.11+ recommended")
        results['python_version'] = False
    
    # Test 2: Check if venv exists
    print("\n2️⃣  Checking virtual environment...")
    venv_path = Path('backend/venv')
    if venv_path.exists():
        print(f"✅ Virtual environment found: {venv_path}")
        results['venv_exists'] = True
    else:
        print(f"❌ Virtual environment NOT found")
        print("   Run: cd backend && python -m venv venv")
        results['venv_exists'] = False
    
    # Test 3: Check .env file
    print("\n3️⃣  Checking .env file...")
    env_path = Path('.env')
    if env_path.exists():
        print(f"✅ .env file found")
        # Check for required keys
        with open(env_path) as f:
            content = f.read()
            required_keys = ['GOOGLE_AI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'MONGODB_URI']
            missing = [key for key in required_keys if key not in content]
            if missing:
                print(f"⚠️  Missing keys: {missing}")
                results['env_file'] = False
            else:
                print(f"✅ All required API keys present")
                results['env_file'] = True
    else:
        print(f"❌ .env file NOT found")
        results['env_file'] = False
    
    # Test 4: Check MongoDB
    print("\n4️⃣  Checking MongoDB connection...")
    try:
        from pymongo import MongoClient
        from pymongo.errors import ServerSelectionTimeoutError
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'), serverSelectionTimeoutMS=3000)
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        
        db = client[os.getenv('MONGODB_DB_NAME', 'scap_local')]
        collections = db.list_collection_names()
        print(f"   Collections: {len(collections)}")
        results['mongodb'] = True
        client.close()
    except ServerSelectionTimeoutError:
        print("❌ MongoDB connection timeout")
        print("   Make sure MongoDB is running")
        results['mongodb'] = False
    except ImportError:
        print("⚠️  pymongo not installed (venv not activated)")
        results['mongodb'] = False
    except Exception as e:
        print(f"❌ MongoDB error: {e}")
        results['mongodb'] = False
    
    # Test 5: Check EasyOCR models
    print("\n5️⃣  Checking EasyOCR models...")
    easyocr_path = Path.home() / '.EasyOCR' / 'model'
    if easyocr_path.exists():
        models = list(easyocr_path.glob('*.pth'))
        print(f"✅ EasyOCR models found: {len(models)}")
        required = ['craft_mlt_25k.pth', 'latin_g2.pth', 'tamil_g2.pth', 'devanagari_g2.pth']
        missing = [m for m in required if not (easyocr_path / m).exists()]
        if missing:
            print(f"⚠️  Missing models: {missing}")
            results['easyocr'] = False
        else:
            print("✅ All required models present")
            results['easyocr'] = True
    else:
        print("❌ EasyOCR models NOT downloaded")
        print("   Run: python scripts/download_models.py")
        results['easyocr'] = False
    
    # Test 6: Check backend files
    print("\n6️⃣  Checking backend structure...")
    required_files = [
        'backend/main.py',
        'backend/requirements.txt',
        'backend/api/routes/suppliers.py',
        'backend/services/ocr_service.py',
        'backend/models/supplier.py'
    ]
    all_exist = all(Path(f).exists() for f in required_files)
    if all_exist:
        print("✅ All required backend files present")
        results['backend_structure'] = True
    else:
        missing = [f for f in required_files if not Path(f).exists()]
        print(f"❌ Missing files: {missing}")
        results['backend_structure'] = False
    
    # Summary
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test, status in results.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {test.replace('_', ' ').title()}")
    
    print(f"\nScore: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All checks passed! Backend is ready.")
        print("\nNext steps:")
        print("1. Activate venv: cd backend && venv\\Scripts\\activate")
        print("2. Start server: python main.py")
        print("3. Test API: python test_api.py")
        print("4. View docs: http://localhost:8000/docs")
    else:
        print("\n⚠️  Some checks failed. Review the output above.")
        print("\nCommon fixes:")
        print("1. Create venv: cd backend && python -m venv venv")
        print("2. Install packages: pip install -r requirements.txt")
        print("3. Start MongoDB: Check Services")
        print("4. Download models: python scripts/download_models.py")
        print("5. Setup database: python scripts/setup_db.py")
    
    print("\n" + "="*60)
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
