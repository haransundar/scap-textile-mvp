@echo off
echo ========================================
echo   Starting SCAP Frontend (Next.js)
echo ========================================
echo.
cd frontend
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting development server on http://localhost:3000
echo.
call npm run dev
