"""
Local AI Models Download Verification
"""
import os
from pathlib import Path

print("="*60)
print("LOCAL MODEL DOWNLOAD VERIFICATION")
print("="*60)

# Check EasyOCR models
easyocr_path = Path.home() / '.EasyOCR' / 'model'
if easyocr_path.exists():
    models = list(easyocr_path.glob('*.pth'))
    print(f"\n✅ EasyOCR directory: {easyocr_path}")
    print(f"   Found {len(models)} model(s):")
    for model in models:
        size_mb = model.stat().st_size / (1024 * 1024)
        print(f"   - {model.name} ({size_mb:.1f} MB)")
    
    # Expected models
    required = ['craft_mlt_25k.pth', 'latin_g2.pth', 'tamil_g2.pth', 'devanagari_g2.pth']
    missing = [m for m in required if not (easyocr_path / m).exists()]
    if missing:
        print(f"\n❌ Missing models: {missing}")
        print("   Run: python scripts/download_models.py")
    else:
        print("\n✅ All required EasyOCR models present")
else:
    print("\n❌ EasyOCR models NOT downloaded")
    print("   Run: python scripts/download_models.py")

# Check ChromaDB embeddings
chroma_path = Path(__file__).parent.parent / 'data' / 'embeddings'
if chroma_path.exists():
    print(f"\n✅ ChromaDB directory exists: {chroma_path}")
else:
    print(f"\n⚠️  ChromaDB directory will be created on first use")

# Check sentence-transformers cache
transformers_path = Path.home() / '.cache' / 'torch' / 'sentence_transformers'
if transformers_path.exists():
    print(f"✅ Sentence-transformers cache: {transformers_path}")
else:
    print(f"⚠️  Sentence-transformers will download on first embedding call")

print("\n" + "="*60)
