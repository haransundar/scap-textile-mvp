@echo off
echo ========================================
echo SCAP BACKEND COMPREHENSIVE VERIFICATION
echo ========================================
echo.

echo Step 1: Activating virtual environment...
cd backend
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Virtual environment not found
    echo Run setup.bat first
    pause
    exit /b 1
)
echo ✅ Virtual environment activated
echo.

echo Step 2: Verifying environment variables...
python ..\scripts\verify_env.py
if errorlevel 1 (
    echo ERROR: Environment variables not configured
    pause
    exit /b 1
)
echo.

echo Step 3: Checking MongoDB connection...
python ..\scripts\test_mongodb.py
echo.

echo Step 4: Verifying AI models...
python ..\scripts\verify_models.py
echo.

echo Step 5: Checking installed packages...
python -c "import fastapi, motor, easyocr, chromadb, xgboost; print('✅ All critical packages installed')"
if errorlevel 1 (
    echo ERROR: Missing packages
    echo Run: pip install -r requirements.txt
    pause
    exit /b 1
)
echo.

echo ========================================
echo VERIFICATION COMPLETE
echo ========================================
echo.
echo Next steps:
echo 1. If MongoDB not running: Start MongoDB service
echo 2. If models missing: Run python scripts\download_models.py
echo 3. If collections missing: Run python scripts\setup_db.py
echo 4. Start backend: python main.py
echo.
pause
