"""
Pre-download EasyOCR models
"""
import easyocr
import os
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("Downloading EasyOCR models...")
print("This may take a few minutes on first run...")

# Create readers - this will download models
# Note: Tamil and Hindi cannot be used together, so we download them separately
print("\nDownloading English + Tamil models...")
reader_ta = easyocr.Reader(['en', 'ta'], gpu=False, verbose=True)

print("\nDownloading English + Hindi models...")
reader_hi = easyocr.Reader(['en', 'hi'], gpu=False, verbose=True)

print("\nEasyOCR models downloaded successfully!")
print(f"Models stored in: {os.path.expanduser('~/.EasyOCR/model/')}")
print("\nDownloaded models:")
print("  - craft_mlt_25k.pth (text detection)")
print("  - latin_g2.pth (English recognition)")
print("  - tamil_g2.pth (Tamil recognition)")
print("  - devanagari_g2.pth (Hindi recognition)")
