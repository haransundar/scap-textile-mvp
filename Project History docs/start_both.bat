@echo off
echo ========================================
echo   SCAP - Starting Backend and Frontend
echo ========================================
echo.
echo This will start both servers in separate windows:
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:3000
echo.
pause

echo Starting Backend Server...
start "SCAP Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && python main.py"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "SCAP Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window (servers will keep running)
pause > nul
