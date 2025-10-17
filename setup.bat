@echo off
echo ========================================
echo SCAP Backend Setup Script
echo ========================================
echo.

echo Step 1: Creating Python virtual environment...
cd backend
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment created
echo.

echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat
echo ✅ Virtual environment activated
echo.

echo Step 3: Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo Step 4: Downloading EasyOCR models...
cd ..
python scripts\download_models.py
echo ✅ Models downloaded
echo.

echo Step 5: Setting up MongoDB...
echo Please ensure MongoDB is running on localhost:27017
echo Press any key to continue...
pause > nul
python scripts\setup_db.py
echo ✅ Database setup complete
echo.

echo Step 6: Seeding sample data...
python scripts\seed_data.py
echo ✅ Sample data created
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the backend server:
echo   cd backend
echo   venv\Scripts\activate
echo   python main.py
echo.
echo Backend will run on: http://localhost:8000
echo API docs: http://localhost:8000/docs
echo.
pause
