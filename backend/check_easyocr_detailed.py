import os
import sys
import logging
import torch
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def print_section(title):
    print("\n" + "="*80)
    print(f" {title.upper()} ")
    print("="*80)

def check_system():
    """Check system and environment"""
    print_section("System Information")
    print(f"Python: {sys.version}")
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA version: {torch.version.cuda}")
        print(f"GPU: {torch.cuda.get_device_name(0)}")

def check_easyocr():
    """Check EasyOCR installation and model loading"""
    try:
        import easyocr
        print_section("EasyOCR Information")
        print(f"EasyOCR version: {easyocr.__version__}")
        
        # Try to get model directory
        try:
            model_dir = os.path.join(os.path.expanduser('~'), '.EasyOCR', 'model')
            print(f"Model directory: {model_dir}")
            if os.path.exists(model_dir):
                print("Model files found:")
                for f in os.listdir(model_dir):
                    print(f"  - {f}")
            else:
                print("Model directory does not exist")
        except Exception as e:
            print(f"Error checking model directory: {e}")
        
        # Try to initialize with English
        print("\nInitializing EasyOCR with English...")
        try:
            reader = easyocr.Reader(['en'], download_enabled=False)
            print("✅ Successfully initialized EasyOCR with English")
            
            # Try to get model path (if available in the reader object)
            if hasattr(reader, 'detector') and hasattr(reader.detector, 'model_path'):
                print(f"Model path: {reader.detector.model_path}")
            
            # List available languages
            print("\nAvailable languages:")
            print(", ".join(reader.get_available_languages()))
            
        except Exception as e:
            print(f"❌ Error initializing EasyOCR: {e}")
            print("\n💡 Try running with download_enabled=True to download the models")
            
    except ImportError as e:
        print(f"❌ EasyOCR is not installed: {e}")
        print("Install it with: pip install easyocr")

def main():
    check_system()
    check_easyocr()
    
    print_section("Next Steps")
    print("1. If models are missing, run with download_enabled=True")
    print("2. If you have models in a custom location, set the EASYOCR_MODULE_PATH environment variable")
    print("3. Common model locations:")
    print("   - Windows: %USERPROFILE%\\.EasyOCR\\model")
    print("   - Linux/Mac: ~/.EasyOCR/model")

if __name__ == "__main__":
    main()
