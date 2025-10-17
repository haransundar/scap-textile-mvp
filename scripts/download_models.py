"""
Pre-download EasyOCR models
"""
import easyocr
import os

print("📥 Downloading EasyOCR models...")
print("This may take a few minutes on first run...")

# Create reader - this will download models
reader = easyocr.Reader(['en', 'ta', 'hi'], gpu=False, verbose=True)

print("\n✅ EasyOCR models downloaded successfully!")
print(f"📁 Models stored in: {os.path.expanduser('~/.EasyOCR/model/')}")
print("\nDownloaded models:")
print("  - craft_mlt_25k.pth (text detection)")
print("  - latin_g2.pth (English recognition)")
print("  - tamil_g2.pth (Tamil recognition)")
print("  - devanagari_g2.pth (Hindi recognition)")
