"""
Whisper AI service for speech-to-text conversion
"""
import logging
from typing import Dict
import os

logger = logging.getLogger(__name__)

# Try to import whisper, but don't fail if not available
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    logger.warning("⚠️ Whisper not installed. Voice transcription will not be available.")
    logger.warning("   Install with: pip install openai-whisper")


class VoiceService:
    def __init__(self):
        """Initialize Whisper model"""
        self.model = None
        
        if not WHISPER_AVAILABLE:
            logger.warning("⚠️ Whisper AI not available - voice features disabled")
            return
        
        try:
            # Load base model (will download on first use)
            logger.info("🔄 Loading Whisper model (this may take a moment on first run)...")
            self.model = whisper.load_model("base")
            logger.info("✅ Whisper AI initialized (base model)")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Whisper: {e}")
            logger.error("   Make sure FFmpeg is installed: choco install ffmpeg")
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
