@echo off
echo ========================================
echo Installing Voice Feature Dependencies
echo ========================================
echo.

echo [Step 1/3] Checking FFmpeg...
where ffmpeg >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ FFmpeg is already installed
) else (
    echo ❌ FFmpeg is NOT installed
    echo.
    echo Please install FFmpeg using one of these methods:
    echo.
    echo Option 1 - Chocolatey (Recommended):
    echo   choco install ffmpeg
    echo.
    echo Option 2 - Manual:
    echo   1. Download from: https://ffmpeg.org/download.html
    echo   2. Extract to C:\ffmpeg
    echo   3. Add C:\ffmpeg\bin to PATH
    echo.
    echo After installing FFmpeg, run this script again.
    pause
    exit /b 1
)

echo.
echo [Step 2/3] Activating virtual environment...
cd backend
call .venv\Scripts\activate.bat

echo.
echo [Step 3/3] Installing Whisper AI...
pip install openai-whisper

echo.
echo ========================================
echo Verifying Installation
echo ========================================
echo.

python -c "import whisper; print('✅ Whisper installed successfully')"
python -c "import torch; print('✅ PyTorch available')"

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart the backend server
echo 2. Test voice recording in the chatbot
echo.
pause
