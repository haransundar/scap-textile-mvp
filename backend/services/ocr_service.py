"""
EasyOCR service for multilingual text extraction
"""
import easyocr
from PIL import Image
import numpy as np
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class OCRService:
    def __init__(self):
        """Initialize EasyOCR with English, Tamil, Hindi support"""
        try:
            self.reader = easyocr.Reader(
                ['en', 'ta', 'hi'],
                gpu=False,  # CPU-only for compatibility
                verbose=False
            )
            logger.info("✅ EasyOCR initialized with English, Tamil, Hindi")
        except Exception as e:
            logger.error(f"❌ Failed to initialize EasyOCR: {e}")
            raise
    
    def extract_text(self, image_path: str) -> Dict[str, any]:
        """
        Extract text from image
        
        Returns:
            {
                'text': str (full extracted text),
                'confidence': float (average confidence),
                'details': list (per-line results)
            }
        """
        try:
            # Read image
            image = Image.open(image_path)
            image_np = np.array(image)
            
            # Perform OCR
            results = self.reader.readtext(image_np)
            
            # Process results
            extracted_lines = []
            confidences = []
            
            for (bbox, text, conf) in results:
                extracted_lines.append(text)
                confidences.append(conf)
            
            full_text = ' '.join(extracted_lines)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            logger.info(f"✅ OCR extracted {len(extracted_lines)} lines with {avg_confidence:.2%} confidence")
            
            return {
                'text': full_text,
                'confidence': avg_confidence,
                'details': [
                    {'text': text, 'confidence': conf}
                    for (_, text, conf) in results
                ]
            }
        
        except Exception as e:
            logger.error(f"❌ OCR extraction failed: {e}")
            raise


# Global instance
ocr_service = OCRService()
