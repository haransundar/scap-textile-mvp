@echo off
echo ========================================
echo Starting SCAP Backend Server
echo ========================================
echo.

cd backend

echo [1/2] Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo [2/2] Starting FastAPI server...
echo.
echo Server will be available at:
echo   - API: http://localhost:8000
echo   - Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py
