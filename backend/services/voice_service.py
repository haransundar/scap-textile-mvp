"""
Whisper AI service for speech-to-text conversion
"""
import whisper
import logging
from typing import Dict
import os

logger = logging.getLogger(__name__)


class VoiceService:
    def __init__(self):
        """Initialize Whisper model"""
        try:
            # Load base model (already downloaded)
            self.model = whisper.load_model("base")
            logger.info("✅ Whisper AI initialized (base model)")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Whisper: {e}")
            self.model = None
    
    def transcribe_audio(
        self,
        audio_path: str,
        language: str = None
    ) -> Dict[str, any]:
        """
        Transcribe audio file to text
        
        Args:
            audio_path: Path to audio file
            language: Language code (en, hi, ta) or None for auto-detect
            
        Returns:
            {
                'text': str,
                'language': str,
                'segments': list
            }
        """
        if not self.model:
            raise Exception("Whisper model not initialized")
        
        try:
            # Transcribe with language hint if provided
            options = {}
            if language:
                options['language'] = language
            
            result = self.model.transcribe(audio_path, **options)
            
            logger.info(f"✅ Transcribed audio: {len(result['text'])} chars")
            
            return {
                'text': result['text'],
                'language': result.get('language', 'unknown'),
                'segments': result.get('segments', [])
            }
            
        except Exception as e:
            logger.error(f"❌ Transcription failed: {e}")
            raise


# Global instance
voice_service = VoiceService()
