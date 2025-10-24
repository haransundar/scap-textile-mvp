@echo off
echo Starting SCAP Backend Server...
cd backend
call venv\Scripts\activate.bat
python main.py
