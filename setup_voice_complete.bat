@echo off
echo ========================================
echo Complete Voice Feature Setup
echo ========================================
echo.

echo This script will:
echo 1. Download and install FFmpeg
echo 2. Configure PATH
echo 3. Install Whisper AI
echo 4. Verify installation
echo.
pause

echo.
echo [Step 1/4] Downloading FFmpeg...
echo.

REM Create temp directory
if not exist "temp" mkdir temp
cd temp

echo Downloading FFmpeg (this may take a few minutes)...
powershell -Command "& {Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile 'ffmpeg.zip'}"

if not exist "ffmpeg.zip" (
    echo ❌ Download failed. Please download manually from:
    echo    https://www.gyan.dev/ffmpeg/builds/
    pause
    exit /b 1
)

echo ✅ Download complete
echo.

echo [Step 2/4] Extracting FFmpeg...
powershell -Command "& {Expand-Archive -Path 'ffmpeg.zip' -DestinationPath '.' -Force}"

REM Find the extracted folder
for /d %%i in (ffmpeg-*) do set FFMPEG_FOLDER=%%i

if not defined FFMPEG_FOLDER (
    echo ❌ Extraction failed
    pause
    exit /b 1
)

echo ✅ Extraction complete
echo.

echo [Step 3/4] Installing FFmpeg to C:\ffmpeg...
if exist "C:\ffmpeg" (
    echo Removing old installation...
    rmdir /s /q "C:\ffmpeg"
)

move "%FFMPEG_FOLDER%" "C:\ffmpeg"
echo ✅ FFmpeg installed to C:\ffmpeg
echo.

echo [Step 4/4] Adding FFmpeg to PATH...
REM Add to user PATH
setx PATH "%PATH%;C:\ffmpeg\bin"
echo ✅ PATH updated (restart terminal for changes to take effect)
echo.

REM Clean up
cd ..
rmdir /s /q temp

echo.
echo ========================================
echo FFmpeg Installation Complete!
echo ========================================
echo.

echo Now installing Whisper AI...
echo.

cd backend
call .venv\Scripts\activate.bat

echo Installing openai-whisper...
pip install openai-whisper

echo.
echo Downloading Whisper model (first time only)...
python -c "import whisper; print('Loading model...'); model = whisper.load_model('base'); print('✅ Model loaded successfully')"

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo ✅ FFmpeg installed to C:\ffmpeg\bin
echo ✅ PATH configured
echo ✅ Whisper AI installed
echo ✅ Whisper model downloaded
echo.
echo IMPORTANT: Close and reopen your terminal for PATH changes to take effect
echo.
echo To verify installation:
echo   1. Open NEW terminal
echo   2. Run: ffmpeg -version
echo   3. Run: cd backend
echo   4. Run: python main.py
echo   5. Look for: ✅ Whisper AI initialized
echo.
pause
