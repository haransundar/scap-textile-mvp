"""
Pre-download EasyOCR models for English, Tamil, and Hindi
"""
import easyocr
import os
import sys
import urllib.request
from pathlib import Path

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("="*70)
print("EASYOCR MODEL DOWNLOAD")
print("="*70)

model_dir = Path.home() / '.EasyOCR' / 'model'
model_dir.mkdir(parents=True, exist_ok=True)

print(f"\nModel directory: {model_dir}")

# Model URLs from EasyOCR repository
models_to_download = {
    'craft_mlt_25k.pth': {
        'url': 'https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/craft_mlt_25k.zip',
        'description': 'Text detection model',
        'size': '25 MB'
    },
    'latin_g2.pth': {
        'url': 'https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/latin_g2.zip',
        'description': 'English recognition',
        'size': '94 MB'
    },
    'devanagari_g2.pth': {
        'url': 'https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/devanagari_g2.zip',
        'description': 'Hindi recognition',
        'size': '88 MB'
    }
}

print("\nDownloading models using EasyOCR library...")
print("This will take 5-10 minutes depending on your internet speed.\n")

# Download English + Hindi (these work together)
print("Step 1: Downloading English + Hindi models...")
try:
    reader_en_hi = easyocr.Reader(['en', 'hi'], gpu=False, verbose=True)
    print("\n✓ English + Hindi models downloaded successfully!")
except Exception as e:
    print(f"\n✗ Error downloading English + Hindi: {e}")

# For Tamil, we need to download separately (Tamil only works with English)
print("\nStep 2: Downloading Tamil model...")
print("Note: Tamil can only be used with English, not with Hindi")
try:
    # This will download Tamil model
    reader_en_ta = easyocr.Reader(['en', 'ta'], gpu=False, verbose=True, download_enabled=True)
    print("\n✓ Tamil model downloaded successfully!")
except Exception as e:
    print(f"\n✗ Error downloading Tamil: {e}")
    print("Tamil model may have compatibility issues with current EasyOCR version.")
    print("The system will work with English and Hindi for now.")

# Verify downloaded models
print("\n" + "="*70)
print("VERIFICATION")
print("="*70)

if model_dir.exists():
    models = list(model_dir.glob('*.pth'))
    print(f"\nFound {len(models)} model(s) in {model_dir}:")
    for model in models:
        size_mb = model.stat().st_size / (1024 * 1024)
        print(f"  ✓ {model.name} ({size_mb:.1f} MB)")
else:
    print("\n✗ Model directory not found")

print("\n" + "="*70)
print("DOWNLOAD COMPLETE")
print("="*70)
print("\nYou can now use EasyOCR for:")
print("  - English text extraction")
print("  - Hindi text extraction")
print("  - Tamil text extraction (if download succeeded)")
print("\nNote: Tamil and Hindi cannot be used in the same Reader instance.")
print("="*70)
