@echo off
echo ========================================
echo SCAP Complete Setup Script
echo ========================================
echo.

echo This script will:
echo 1. Check Python installation
echo 2. Create/verify virtual environment
echo 3. Install all dependencies
echo 4. Install voice dependencies (optional)
echo 5. Start the backend server
echo.
pause

echo.
echo [Step 1/5] Checking Python...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found! Please install Python 3.8+
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo [Step 2/5] Setting up virtual environment...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

echo.
echo [Step 3/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo [Step 4/5] Installing core dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo [Step 5/5] Installing voice dependencies (optional)...
echo.
echo Do you want to install voice transcription support?
echo This requires FFmpeg and will download ~140MB Whisper model.
echo.
choice /C YN /M "Install voice support"

if %ERRORLEVEL% EQU 1 (
    echo.
    echo Checking FFmpeg...
    where ffmpeg >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ⚠️  FFmpeg not found!
        echo.
        echo Please install FFmpeg first:
        echo   choco install ffmpeg
        echo.
        echo Or download from: https://ffmpeg.org/download.html
        echo.
        echo After installing FFmpeg, run this script again.
        pause
    ) else (
        echo ✅ FFmpeg found
        echo.
        echo Installing Whisper AI...
        pip install openai-whisper
        echo ✅ Whisper installed
    )
) else (
    echo Skipping voice support installation
    echo You can install it later with: pip install openai-whisper
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: start_backend_fixed.bat
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Open browser: http://localhost:3000
echo.
echo API Documentation: http://localhost:8000/docs
echo.
pause

echo.
echo Do you want to start the backend now?
choice /C YN /M "Start backend server"

if %ERRORLEVEL% EQU 1 (
    echo.
    echo Starting backend server...
    python main.py
)
