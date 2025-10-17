"""
Gemini 2.5 Flash for document understanding and structuring
"""
import google.generativeai as genai
from utils.config import settings
import json
import logging
from typing import Dict

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GOOGLE_AI_API_KEY)


class DocumentAIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        logger.info("✅ Gemini 2.5 Flash initialized")
    
    def structure_certificate_data(self, ocr_text: str) -> Dict:
        """
        Convert OCR text to structured certificate JSON
        
        Args:
            ocr_text: Raw text extracted from certificate
            
        Returns:
            Structured certificate data
        """
        prompt = f"""Extract certificate details from this text and return ONLY valid JSON with these exact fields:
{{
    "certificate_type": "GOTS" or "ISO14001" or "OEKO-TEX" or "SA8000" or "BSCI" or "Other",
    "certificate_number": "string",
    "issued_by": "string",
    "issued_to": "string",
    "issued_date": "YYYY-MM-DD",
    "expiry_date": "YYYY-MM-DD",
    "scope": "string"
}}

Text: {ocr_text}

Return ONLY the JSON object, no other text."""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if result_text.startswith('```'):
                result_text = result_text.split('```')[1]
                if result_text.startswith('json'):
                    result_text = result_text[4:]
            
            structured_data = json.loads(result_text)
            logger.info(f"✅ Structured certificate: {structured_data.get('certificate_type')}")
            return structured_data
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ Failed to parse Gemini response as JSON: {e}")
            logger.error(f"Response was: {response.text}")
            raise ValueError("Failed to structure certificate data")
        except Exception as e:
            logger.error(f"❌ Document AI failed: {e}")
            raise
    
    def translate_text(self, text: str, target_language: str) -> str:
        """
        Translate text to target language
        
        Args:
            text: Text to translate
            target_language: 'ta' (Tamil), 'hi' (Hindi), or 'en' (English)
        """
        lang_map = {'ta': 'Tamil', 'hi': 'Hindi', 'en': 'English'}
        target = lang_map.get(target_language, 'English')
        
        prompt = f"Translate this text to {target}. Return ONLY the translation:\n\n{text}"
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"❌ Translation failed: {e}")
            return text  # Return original if translation fails


# Global instance
document_ai_service = DocumentAIService()
