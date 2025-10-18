"""
AI Service for certificate data extraction using Google's Gemini model
"""
import os
import json
import logging
from typing import Dict, List, Optional, Any
import google.generativeai as genai
from ..utils.config import settings

logger = logging.getLogger(__name__)

class AIService:
    """Service for AI-powered data extraction and processing"""
    
    def __init__(self):
        """Initialize the AI service with Gemini model"""
        try:
            # Configure the Gemini API
            genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
            
            # Initialize the model
            self.model = genai.GenerativeModel('gemini-pro')
            
            # Define the certificate schema for structured output
            self.certificate_schema = {
                "type": "object",
                "properties": {
                    "certificate_number": {
                        "type": "string",
                        "description": "The unique identification number of the certificate"
                    },
                    "certificate_type": {
                        "type": "string",
                        "enum": ["ISO 9001", "ISO 14001", "ISO 45001", "GOTS", "OCS", "Fair Trade", "BSCI", "SMETA", "Other"],
                        "description": "Type of the certificate"
                    },
                    "issuer": {
                        "type": "string",
                        "description": "Name of the organization that issued the certificate"
                    },
                    "issued_to": {
                        "type": "string",
                        "description": "Name of the organization or person the certificate was issued to"
                    },
                    "issued_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Date when the certificate was issued (YYYY-MM-DD)"
                    },
                    "expiry_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Date when the certificate expires (YYYY-MM-DD)"
                    },
                    "scope": {
                        "type": "string",
                        "description": "Scope or coverage of the certification"
                    },
                    "description": {
                        "type": "string",
                        "description": "Additional details about the certificate"
                    },
                    "confidence": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 1,
                        "description": "Confidence score of the extracted data (0-1)"
                    },
                    "extracted_fields": {
                        "type": "object",
                        "description": "Additional fields extracted from the certificate",
                        "additionalProperties": True
                    }
                },
                "required": ["certificate_number", "certificate_type", "issuer", "issued_to", "issued_date", "expiry_date"],
                "additionalProperties": False
            }
            
            logger.info("✅ AI Service initialized with Gemini model")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize AI Service: {e}")
            raise
    
    async def extract_certificate_data(self, text: str, language: str = 'en') -> Dict[str, Any]:
        """
        Extract structured certificate data from OCR text using AI
        
        Args:
            text: Extracted text from OCR
            language: Language of the text
            
        Returns:
            Dictionary containing structured certificate data
        """
        try:
            if not text.strip():
                raise ValueError("No text provided for processing")
            
            # Prepare the prompt
            prompt = self._build_prompt(text, language)
            
            # Generate response from the model
            response = await self._generate_ai_response(prompt)
            
            # Parse and validate the response
            result = self._parse_ai_response(response.text)
            
            return {
                "success": True,
                "data": result,
                "metadata": {
                    "model": "gemini-pro",
                    "language": language,
                    "characters_processed": len(text)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in extract_certificate_data: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "data": None
            }
    
    def _build_prompt(self, text: str, language: str) -> str:
        """Build the prompt for the AI model"""
        return f"""
        You are an expert in processing and extracting information from various types of certificates. 
        Your task is to analyze the following text extracted from a certificate and extract the relevant information.
        
        INSTRUCTIONS:
        1. Extract all available information from the text.
        2. For dates, use the format YYYY-MM-DD.
        3. If a field is not found, use null.
        4. The certificate could be in {language} language.
        5. Be careful with similar-looking characters and numbers.
        6. The certificate may contain both printed text and handwritten text.
        
        TEXT TO PROCESS:
        {text}
        
        Return the extracted information in a structured JSON format matching this schema:
        {json.dumps(self.certificate_schema, indent=2)}
        
        Only respond with the JSON object, no additional text or explanation.
        """
    
    async def _generate_ai_response(self, prompt: str) -> Any:
        """Generate a response from the AI model"""
        try:
            # For Gemini, we use the generate_content method
            response = await asyncio.get_event_loop().run_in_executor(
                None,  # Uses default executor
                lambda: self.model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": 0.2,  # Lower temperature for more deterministic output
                        "top_p": 0.95,
                        "top_k": 40,
                        "max_output_tokens": 2048,
                    },
                    safety_settings=[
                        {
                            "category": "HARM_CATEGORY_HARASSMENT",
                            "threshold": "BLOCK_NONE"
                        },
                        {
                            "category": "HARM_CATEGORY_HATE_SPEECH",
                            "threshold": "BLOCK_NONE"
                        },
                        {
                            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            "threshold": "BLOCK_NONE"
                        },
                        {
                            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                            "threshold": "BLOCK_NONE"
                        },
                    ]
                )
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            raise
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse and validate the AI response"""
        try:
            # Extract JSON from the response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON data found in the response")
                
            json_str = response_text[json_start:json_end]
            result = json.loads(json_str)
            
            # Basic validation
            if not isinstance(result, dict):
                raise ValueError("Invalid response format: expected a JSON object")
                
            # Add confidence score if not present
            if 'confidence' not in result:
                result['confidence'] = 0.9  # Default confidence
                
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            raise ValueError(f"Invalid JSON in AI response: {e}")
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            raise
    
    async def verify_certificate(self, certificate_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify the authenticity of a certificate using AI
        
        Args:
            certificate_data: Extracted certificate data
            
        Returns:
            Verification result with confidence score
        """
        try:
            # Prepare the verification prompt
            prompt = f"""
            You are an expert in certificate verification. 
            Analyze the following certificate data and determine if it appears to be valid and authentic.
            
            CERTIFICATE DATA:
            {json.dumps(certificate_data, indent=2)}
            
            Check for:
            1. Logical consistency in dates (issue date before expiry date)
            2. Valid certificate number format
            3. Recognized issuer and certificate type
            4. Any suspicious patterns or anomalies
            
            Return a JSON object with:
            - is_valid (boolean): Overall validity
            - confidence (0-1): Confidence in the assessment
            - issues (array): List of potential issues or anomalies
            - verification_notes (string): Additional notes
            """
            
            # Get verification from AI
            response = await self._generate_ai_response(prompt)
            verification = self._parse_ai_response(response.text)
            
            return {
                "success": True,
                "is_valid": verification.get("is_valid", False),
                "confidence": verification.get("confidence", 0.0),
                "issues": verification.get("issues", []),
                "verification_notes": verification.get("verification_notes", "")
            }
            
        except Exception as e:
            logger.error(f"Error in verify_certificate: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "is_valid": False,
                "confidence": 0.0,
                "issues": ["Verification failed due to an error"],
                "verification_notes": f"Error during verification: {str(e)}"
            }

# Create a singleton instance
ai_service = AIService()
