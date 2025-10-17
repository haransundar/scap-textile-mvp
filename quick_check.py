"""
Quick Backend Status Check
"""
from pathlib import Path
import sys

print("""
╔══════════════════════════════════════════════════════════════╗
║         SCAP BACKEND - QUICK STATUS CHECK                    ║
╚══════════════════════════════════════════════════════════════╝
""")

checks = {}

# 1. Python version
import subprocess
result = subprocess.run(['python', '--version'], capture_output=True, text=True)
version = result.stdout.strip()
checks['Python Version'] = ('3.11' in version or '3.12' in version, version)

# 2. Virtual environment
venv_exists = Path('backend/venv').exists()
checks['Virtual Environment'] = (venv_exists, 'backend/venv' if venv_exists else 'NOT FOUND')

# 3. .env file
env_exists = Path('.env').exists()
if env_exists:
    with open('.env') as f:
        content = f.read()
        has_keys = all(key in content for key in ['GOOGLE_AI_API_KEY', 'GROQ_API_KEY', 'MONGODB_URI'])
        checks['.env File'] = (has_keys, 'All keys present' if has_keys else 'Missing keys')
else:
    checks['.env File'] = (False, 'NOT FOUND')

# 4. Backend structure
required_files = [
    'backend/main.py',
    'backend/requirements.txt',
    'backend/api/routes/suppliers.py',
    'backend/services/ocr_service.py'
]
all_files = all(Path(f).exists() for f in required_files)
checks['Backend Files'] = (all_files, f'{sum(Path(f).exists() for f in required_files)}/{len(required_files)} files')

# 5. EasyOCR models
easyocr_path = Path.home() / '.EasyOCR' / 'model'
if easyocr_path.exists():
    models = list(easyocr_path.glob('*.pth'))
    checks['EasyOCR Models'] = (len(models) >= 4, f'{len(models)} models found')
else:
    checks['EasyOCR Models'] = (False, 'NOT DOWNLOADED')

# 6. Documentation
docs = ['README.md', 'GETTING_STARTED.md', 'ARCHITECTURE.md']
docs_exist = all(Path(d).exists() for d in docs)
checks['Documentation'] = (docs_exist, f'{sum(Path(d).exists() for d in docs)}/{len(docs)} files')

# 7. Scripts
scripts = ['setup.bat', 'start_backend.bat', 'test_api.py']
scripts_exist = all(Path(s).exists() for s in scripts)
checks['Setup Scripts'] = (scripts_exist, f'{sum(Path(s).exists() for s in scripts)}/{len(scripts)} files')

# Print results
print("\n📊 STATUS REPORT\n" + "="*60)
for check, (status, detail) in checks.items():
    icon = "✅" if status else "❌"
    print(f"{icon} {check:.<30} {detail}")

# Summary
passed = sum(1 for status, _ in checks.values() if status)
total = len(checks)

print("\n" + "="*60)
print(f"Score: {passed}/{total} checks passed ({passed/total*100:.0f}%)")

if passed == total:
    print("\n🎉 All checks passed!")
    print("\n📋 NEXT STEPS:")
    print("   1. Run: setup.bat (if venv not created)")
    print("   2. Run: start_backend.bat")
    print("   3. Visit: http://localhost:8000/docs")
    print("   4. Run: python test_api.py")
elif not venv_exists:
    print("\n⚠️  Virtual environment not created")
    print("\n📋 SETUP REQUIRED:")
    print("   1. Run: setup.bat")
    print("   2. This will:")
    print("      - Create virtual environment")
    print("      - Install all packages")
    print("      - Download AI models")
    print("      - Setup database")
    print("      - Seed sample data")
else:
    print("\n⚠️  Some components need attention")
    print("\n📋 RECOMMENDED ACTIONS:")
    if not checks['EasyOCR Models'][0]:
        print("   - Download models: python scripts/download_models.py")
    if not checks['.env File'][0]:
        print("   - Configure .env file with API keys")
    print("   - Review VERIFICATION_CHECKLIST.md for details")

print("\n" + "="*60)
print("📚 Documentation:")
print("   - VERIFICATION_CHECKLIST.md - Comprehensive testing guide")
print("   - GETTING_STARTED.md - Setup instructions")
print("   - README.md - Project overview")
print("="*60 + "\n")
