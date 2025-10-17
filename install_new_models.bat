@echo off
echo ========================================
echo Installing New AI Models for SCAP
echo ========================================
echo.

cd backend

echo [1/4] Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo [2/4] Installing Whisper AI...
pip install openai-whisper

echo.
echo [3/4] Installing FFmpeg Python bindings...
pip install ffmpeg-python

echo.
echo [4/4] Verifying installations...
python -c "import whisper; print('✅ Whisper installed')"
python -c "import ffmpeg; print('✅ FFmpeg-python installed')"
python -c "import google.generativeai as genai; print('✅ Google AI installed')"
python -c "import requests; print('✅ Requests installed')"

echo.
echo ========================================
echo ✅ All new models installed!
echo ========================================
echo.
echo IMPORTANT: You need to install FFmpeg separately:
echo.
echo Windows (Chocolatey):
echo   choco install ffmpeg
echo.
echo Or download from: https://ffmpeg.org/download.html
echo.
echo After installing FFmpeg, restart the backend:
echo   python main.py
echo.
pause
