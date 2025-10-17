"""
Voice API routes for speech-to-text using Whisper
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import tempfile
import os
import logging

from services.voice_service import voice_service
from api.middleware.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


class TranscriptionResponse(BaseModel):
    text: str
    language: str
    duration: Optional[float] = None


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Transcribe audio file to text using Whisper AI
    
    Args:
        audio: Audio file (mp3, wav, m4a, etc.)
        language: Optional language hint (en, hi, ta)
        current_user: Authenticated user
    
    Returns:
        Transcription result with text and metadata
    """
    if not voice_service.model:
        raise HTTPException(
            status_code=503,
            detail="Voice transcription service is not available. Please install Whisper: pip install openai-whisper. Also ensure FFmpeg is installed: choco install ffmpeg"
        )
    
    # Validate file type
    allowed_types = [
        'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a',
        'audio/webm', 'audio/ogg', 'video/mp4'
    ]
    
    if audio.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format. Supported: {', '.join(allowed_types)}"
        )
    
    # Check file size (max 25MB)
    max_size = 25 * 1024 * 1024  # 25MB
    audio_content = await audio.read()
    
    if len(audio_content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Audio file too large. Maximum size: 25MB"
        )
    
    try:
        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{audio.filename.split('.')[-1]}") as temp_file:
            temp_file.write(audio_content)
            temp_path = temp_file.name
        
        try:
            # Transcribe audio
            result = voice_service.transcribe_audio(
                audio_path=temp_path,
                language=language
            )
            
            logger.info(f"✅ Transcribed audio for user {current_user.get('email')}: {len(result['text'])} chars")
            
            return TranscriptionResponse(
                text=result['text'],
                language=result['language'],
                duration=None
            )
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except Exception as e:
        logger.error(f"❌ Transcription failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages for voice transcription"""
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "hi", "name": "Hindi"},
            {"code": "ta", "name": "Tamil"},
            {"code": "auto", "name": "Auto-detect"}
        ],
        "default": "auto",
        "note": "Language parameter is optional. Whisper can auto-detect language."
    }


@router.get("/status")
async def get_voice_service_status():
    """Get voice service status"""
    return {
        "available": voice_service.model is not None,
        "model": "whisper-base" if voice_service.model else None,
        "supported_formats": [
            "mp3", "wav", "m4a", "mp4", "webm", "ogg"
        ],
        "max_file_size": "25MB",
        "languages": ["en", "hi", "ta", "auto-detect"]
    }
