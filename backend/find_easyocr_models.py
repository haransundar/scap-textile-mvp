import os
import sys
from pathlib import Path

def find_easyocr_models():
    """Search for EasyOCR model files in common locations"""
    print("🔍 Searching for EasyOCR model files...")
    
    # Common locations where EasyOCR models might be stored
    search_paths = [
        # Windows
        Path(os.path.expanduser('~')) / '.EasyOCR',
        Path(os.path.expanduser('~')) / '.cache',
        Path('D:') / 'AI Models' / 'EasyOCR',
        Path('C:') / 'AI Models' / 'EasyOCR',
        
        # Unix-like
        Path.home() / '.EasyOCR',
        Path.home() / '.cache',
        
        # Current directory
        Path.cwd() / 'models',
        Path.cwd().parent / 'models',
    ]
    
    model_extensions = {'.pth', '.pt', '.bin'}
    found_models = []
    
    for path in search_paths:
        if not path.exists():
            continue
            
        print(f"\n🔍 Searching in: {path}")
        
        try:
            for root, dirs, files in os.walk(path):
                # Skip large directories that are unlikely to contain models
                if 'node_modules' in root or '__pycache__' in root:
                    continue
                    
                for file in files:
                    if any(file.endswith(ext) for ext in model_extensions):
                        model_path = Path(root) / file
                        size_mb = model_path.stat().st_size / (1024 * 1024)
                        found_models.append((model_path, size_mb))
                        print(f"✅ Found model: {model_path} ({size_mb:.2f} MB)")
                        
        except Exception as e:
            print(f"⚠️ Error searching {path}: {e}")
    
    if not found_models:
        print("\n❌ No EasyOCR models found in common locations.")
        print("Please download the models and place them in one of these directories:")
        for path in search_paths[:3]:  # Only show first few suggested locations
            print(f"- {path}")
    else:
        print("\n🎉 Found the following model files:")
        for i, (model_path, size_mb) in enumerate(found_models, 1):
            print(f"{i}. {model_path} ({size_mb:.2f} MB)")
        
        # Suggest a model directory
        if found_models:
            model_dir = found_models[0][0].parent
            print(f"\n💡 Suggested model directory to use: {model_dir}")
            print("You can set this in the OCR service using:")
            print(f'os.environ["EASYOCR_MODULE_PATH"] = r"{model_dir}"')

if __name__ == "__main__":
    find_easyocr_models()
