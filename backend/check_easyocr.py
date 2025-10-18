import os
import sys
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_easyocr_models():
    """Check EasyOCR model loading with debug information"""
    print("🔍 Checking EasyOCR model loading...")
    
    try:
        import easyocr
        print("✅ EasyOCR is installed")
        
        # Print EasyOCR version
        print(f"📦 EasyOCR version: {easyocr.__version__}")
        
        # Print model paths
        print("\n📂 Model paths:")
        
        # Try to get model directory
        try:
            from easyocr.utils import get_home_cache_directory
            model_dir = get_home_cache_directory()
            print(f"- Default model directory: {model_dir}")
            
            if os.path.exists(model_dir):
                print("  Contents:")
                for f in os.listdir(model_dir):
                    print(f"  - {f}")
            else:
                print(f"  Directory does not exist")
        except Exception as e:
            print(f"  Could not determine model directory: {e}")
        
        # Try to list available languages
        print("\n🌐 Available languages:")
        try:
            # This will try to load the model, which will show where it's looking
            reader = easyocr.Reader(['en'], download_enabled=False)
            print("✅ Successfully initialized English model")
            print(f"Model location: {reader.detector.model_path}")
            
            # List all available languages
            print("\n📋 All supported languages:")
            print(", ".join(reader.get_available_languages()))
            
        except Exception as e:
            print(f"❌ Error initializing EasyOCR: {e}")
            print("\n💡 Try running with download_enabled=True to download the models")
            
    except ImportError as e:
        print(f"❌ EasyOCR is not installed: {e}")
        print("Install it with: pip install easyocr")

if __name__ == "__main__":
    check_easyocr_models()
