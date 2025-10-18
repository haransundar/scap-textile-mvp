@echo off
echo ========================================
echo Starting SCAP - Backend and Frontend
echo ========================================
echo.

echo This will open 2 terminal windows:
echo   1. Backend (FastAPI) - Port 8000
echo   2. Frontend (Next.js) - Port 3000
echo.
pause

echo.
echo [1/2] Starting Backend...
start "SCAP Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [2/2] Starting Frontend...
start "SCAP Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Close this window when done.
echo To stop servers, close their terminal windows.
echo.
