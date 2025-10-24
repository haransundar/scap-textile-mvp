"""
SCAP Comprehensive Backend Verification
Checks all models, core functions, and API implementations
"""
import sys
import os
from pathlib import Path

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("="*70)
print("SCAP COMPREHENSIVE BACKEND VERIFICATION")
print("="*70)

results = {
    'models': {},
    'environment': {},
    'database': {},
    'ai_services': {},
    'api_endpoints': {},
    'core_functions': {}
}

# ============================================================================
# PHASE 1: LOCAL MODELS VERIFICATION
# ============================================================================
print("\n" + "="*70)
print("PHASE 1: LOCAL MODELS VERIFICATION")
print("="*70)

# 1.1 EasyOCR Models
print("\n1.1 Checking EasyOCR Models...")
easyocr_path = Path.home() / '.EasyOCR' / 'model'
if easyocr_path.exists():
    models = list(easyocr_path.glob('*.pth'))
    print(f"   Found {len(models)} model(s) in {easyocr_path}")
    
    required_models = {
        'craft_mlt_25k.pth': 'Text detection',
        'latin_g2.pth': 'English recognition',
        'tamil_g2.pth': 'Tamil recognition',
        'devanagari_g2.pth': 'Hindi recognition'
    }
    
    for model_name, description in required_models.items():
        if (easyocr_path / model_name).exists():
            size_mb = (easyocr_path / model_name).stat().st_size / (1024 * 1024)
            print(f"   ✓ {model_name} ({size_mb:.1f} MB) - {description}")
            results['models'][model_name] = True
        else:
            print(f"   ✗ {model_name} - MISSING")
            results['models'][model_name] = False
else:
    print("   ✗ EasyOCR models directory NOT FOUND")
    for model in ['craft_mlt_25k.pth', 'latin_g2.pth', 'tamil_g2.pth', 'devanagari_g2.pth']:
        results['models'][model] = False

# 1.2 Sentence-Transformers Cache
print("\n1.2 Checking Sentence-Transformers Cache...")
transformers_path = Path.home() / '.cache' / 'torch' / 'sentence_transformers'
if transformers_path.exists():
    print(f"   ✓ Cache directory exists: {transformers_path}")
    results['models']['sentence_transformers'] = True
else:
    print(f"   ⚠ Cache will be created on first use")
    results['models']['sentence_transformers'] = 'pending'

# ============================================================================
# PHASE 2: ENVIRONMENT VALIDATION
# ============================================================================
print("\n" + "="*70)
print("PHASE 2: ENVIRONMENT VALIDATION")
print("="*70)

# 2.1 Python Version
print("\n2.1 Checking Python Version...")
import platform
py_version = platform.python_version()
print(f"   Python {py_version}")
results['environment']['python_version'] = py_version

# 2.2 Virtual Environment
print("\n2.2 Checking Virtual Environment...")
venv_path = Path('backend/venv')
if venv_path.exists():
    print(f"   ✓ Virtual environment exists: {venv_path}")
    results['environment']['venv'] = True
else:
    print(f"   ✗ Virtual environment NOT FOUND")
    results['environment']['venv'] = False

# 2.3 Environment Variables
print("\n2.3 Checking Environment Variables...")
try:
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = ['GOOGLE_AI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'MONGODB_URI']
    for var in required_vars:
        value = os.getenv(var)
        if value and len(value) > 10:
            print(f"   ✓ {var}: Present ({len(value)} chars)")
            results['environment'][var] = True
        else:
            print(f"   ✗ {var}: MISSING or INVALID")
            results['environment'][var] = False
except ImportError:
    print("   ✗ python-dotenv not installed")
    for var in ['GOOGLE_AI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'MONGODB_URI']:
        results['environment'][var] = False

# ============================================================================
# PHASE 3: DATABASE VERIFICATION
# ============================================================================
print("\n" + "="*70)
print("PHASE 3: DATABASE VERIFICATION")
print("="*70)

print("\n3.1 Checking MongoDB Connection...")
try:
    from pymongo import MongoClient
    from pymongo.errors import ServerSelectionTimeoutError
    
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'), 
                        serverSelectionTimeoutMS=3000)
    client.admin.command('ping')
    print("   ✓ MongoDB connection successful")
    results['database']['connection'] = True
    
    # Check collections
    db = client[os.getenv('MONGODB_DB_NAME', 'scap_local')]
    collections = db.list_collection_names()
    print(f"   ✓ Database: {db.name}")
    print(f"   ✓ Collections: {len(collections)}")
    
    required_collections = ['suppliers', 'certificates', 'regulatory_updates', 
                          'supply_chain_links', 'risk_scores', 'chat_history']
    for coll in required_collections:
        if coll in collections:
            count = db[coll].count_documents({})
            print(f"      ✓ {coll} ({count} documents)")
            results['database'][coll] = True
        else:
            print(f"      ✗ {coll} - MISSING")
            results['database'][coll] = False
    
    client.close()
except Exception as e:
    if 'ServerSelectionTimeoutError' in str(type(e)):
        print("   ✗ MongoDB connection timeout")
    elif 'ModuleNotFoundError' in str(type(e)) or 'ImportError' in str(type(e)):
        print("   ✗ pymongo not installed")
    else:
        print(f"   ✗ Error: {e}")
    results['database']['connection'] = False

# ============================================================================
# PHASE 4: AI SERVICES VERIFICATION
# ============================================================================
print("\n" + "="*70)
print("PHASE 4: AI SERVICES VERIFICATION")
print("="*70)

# 4.1 EasyOCR Functionality
print("\n4.1 Testing EasyOCR Functionality...")
try:
    import easyocr
    print("   ✓ EasyOCR package imported")
    
    # Test initialization (English only for speed)
    print("   Testing reader initialization...")
    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    print("   ✓ EasyOCR reader initialized successfully")
    results['ai_services']['easyocr'] = True
except ImportError:
    print("   ✗ EasyOCR not installed")
    results['ai_services']['easyocr'] = False
except Exception as e:
    print(f"   ✗ EasyOCR initialization failed: {e}")
    results['ai_services']['easyocr'] = False

# 4.2 Gemini API
print("\n4.2 Testing Gemini API...")
try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv('GOOGLE_AI_API_KEY'))
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    # Test API call
    response = model.generate_content("Return exactly: 'API_WORKING'")
    if 'API_WORKING' in response.text:
        print("   ✓ Gemini API responding correctly")
        results['ai_services']['gemini'] = True
    else:
        print(f"   ⚠ Unexpected response: {response.text}")
        results['ai_services']['gemini'] = 'warning'
except ImportError:
    print("   ✗ google-generativeai not installed")
    results['ai_services']['gemini'] = False
except Exception as e:
    print(f"   ✗ Gemini API failed: {e}")
    results['ai_services']['gemini'] = False

# 4.3 Groq API
print("\n4.3 Testing Groq API...")
try:
    from groq import Groq
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))
    
    # Test API call
    response = client.chat.completions.create(
        model="qwen2-72b-instruct",
        messages=[{"role": "user", "content": "Say 'OK'"}],
        max_tokens=10
    )
    if response.choices[0].message.content:
        print("   ✓ Groq API responding correctly")
        results['ai_services']['groq'] = True
    else:
        print("   ⚠ Empty response from Groq")
        results['ai_services']['groq'] = 'warning'
except ImportError:
    print("   ✗ groq not installed")
    results['ai_services']['groq'] = False
except Exception as e:
    print(f"   ✗ Groq API failed: {e}")
    results['ai_services']['groq'] = False

# 4.4 ChromaDB
print("\n4.4 Testing ChromaDB...")
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    
    # Test initialization
    persist_dir = Path('data/embeddings')
    persist_dir.mkdir(parents=True, exist_ok=True)
    
    client = chromadb.PersistentClient(
        path=str(persist_dir),
        settings=ChromaSettings(anonymized_telemetry=False)
    )
    print("   ✓ ChromaDB client initialized")
    results['ai_services']['chromadb'] = True
except ImportError:
    print("   ✗ chromadb not installed")
    results['ai_services']['chromadb'] = False
except Exception as e:
    print(f"   ✗ ChromaDB failed: {e}")
    results['ai_services']['chromadb'] = False

# ============================================================================
# PHASE 5: CORE FUNCTIONS VERIFICATION
# ============================================================================
print("\n" + "="*70)
print("PHASE 5: CORE FUNCTIONS VERIFICATION")
print("="*70)

# 5.1 Check if core service files exist
print("\n5.1 Checking Core Service Files...")
core_files = {
    'backend/services/ocr_service.py': 'OCR Service',
    'backend/services/document_ai_service.py': 'Document AI Service',
    'backend/services/llm_service.py': 'LLM Service',
    'backend/services/risk_predictor.py': 'Risk Predictor',
    'backend/api/routes/suppliers.py': 'Supplier Routes',
    'backend/api/routes/documents.py': 'Document Routes',
    'backend/api/routes/compliance.py': 'Compliance Routes',
    'backend/api/routes/risk.py': 'Risk Routes',
    'backend/api/routes/chat.py': 'Chat Routes',
    'backend/api/middleware/auth.py': 'Authentication',
    'backend/database/mongodb.py': 'MongoDB Connection',
    'backend/database/chroma_db.py': 'ChromaDB Connection'
}

for file_path, description in core_files.items():
    if Path(file_path).exists():
        print(f"   ✓ {description}: {file_path}")
        results['core_functions'][description] = True
    else:
        print(f"   ✗ {description}: MISSING")
        results['core_functions'][description] = False

# 5.2 Check API endpoint implementations
print("\n5.2 Checking API Endpoint Implementations...")
try:
    sys.path.insert(0, 'backend')
    
    # Check if routes can be imported
    endpoint_modules = {
        'Supplier Routes': 'api.routes.suppliers',
        'Document Routes': 'api.routes.documents',
        'Compliance Routes': 'api.routes.compliance',
        'Risk Routes': 'api.routes.risk',
        'Chat Routes': 'api.routes.chat'
    }
    
    for name, module_path in endpoint_modules.items():
        try:
            __import__(module_path)
            print(f"   ✓ {name}: Importable")
            results['api_endpoints'][name] = True
        except ImportError as e:
            print(f"   ✗ {name}: Import failed - {e}")
            results['api_endpoints'][name] = False
        except Exception as e:
            print(f"   ⚠ {name}: Warning - {e}")
            results['api_endpoints'][name] = 'warning'
            
except Exception as e:
    print(f"   ✗ Error checking endpoints: {e}")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "="*70)
print("VERIFICATION SUMMARY")
print("="*70)

def count_status(results_dict):
    total = 0
    passed = 0
    for value in results_dict.values():
        if isinstance(value, dict):
            sub_total, sub_passed = count_status(value)
            total += sub_total
            passed += sub_passed
        else:
            total += 1
            if value is True:
                passed += 1
    return total, passed

total, passed = count_status(results)

print(f"\nOverall Score: {passed}/{total} ({passed/total*100:.1f}%)")

print("\nBy Category:")
for category, items in results.items():
    if isinstance(items, dict):
        cat_total = len(items)
        cat_passed = sum(1 for v in items.values() if v is True)
        status = "✓" if cat_passed == cat_total else "⚠" if cat_passed > 0 else "✗"
        print(f"  {status} {category.replace('_', ' ').title()}: {cat_passed}/{cat_total}")

print("\n" + "="*70)
print("RECOMMENDATIONS")
print("="*70)

recommendations = []

# Check models
if not all(results['models'].get(m, False) for m in ['craft_mlt_25k.pth', 'latin_g2.pth']):
    recommendations.append("Download EasyOCR models: python scripts/download_models.py")

# Check database
if not results['database'].get('connection', False):
    recommendations.append("Start MongoDB service")

# Check AI services
if not results['ai_services'].get('gemini', False):
    recommendations.append("Verify GOOGLE_AI_API_KEY in .env")
if not results['ai_services'].get('groq', False):
    recommendations.append("Verify GROQ_API_KEY in .env")

if recommendations:
    print("\nAction Items:")
    for i, rec in enumerate(recommendations, 1):
        print(f"  {i}. {rec}")
else:
    print("\n✓ All systems operational! Ready to start backend server.")
    print("\nNext steps:")
    print("  1. cd backend")
    print("  2. .\\venv\\Scripts\\activate")
    print("  3. python main.py")
    print("  4. Visit http://localhost:8000/docs")

print("\n" + "="*70)
