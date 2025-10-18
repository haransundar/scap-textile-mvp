# 🚀 SCAP Quick Start Guide

## First Time Setup

### Option 1: Automated Setup (Recommended)
```cmd
setup_complete.bat
```

This will:
- ✅ Check Python installation
- ✅ Create virtual environment
- ✅ Install all dependencies
- ✅ Optionally install voice support
- ✅ Start the backend

---

### Option 2: Manual Setup

**1. Create Virtual Environment**
```cmd
cd backend
python -m venv venv
```

**2. Activate Virtual Environment**
```cmd
venv\Scripts\activate
```

**3. Install Dependencies**
```cmd
pip install -r requirements.txt
```

**4. (Optional) Install Voice Support**
```cmd
# Install FFmpeg first
choco install ffmpeg

# Then install Whisper
pip install openai-whisper
```

**5. Start Backend**
```cmd
python main.py
```

---

## Daily Usage

### Start Backend
```cmd
start_backend_fixed.bat
```

Or manually:
```cmd
cd backend
venv\Scripts\activate
python main.py
```

### Start Frontend
```cmd
cd frontend
npm run dev
```

### Start Both
```cmd
start_both.bat
```

---

## Common Issues

### Issue: "ModuleNotFoundError: No module named 'uvicorn'"

**Cause**: Virtual environment not activated

**Fix**:
```cmd
cd backend
venv\Scripts\activate
python main.py
```

---

### Issue: "Voice transcription failed"

**Cause**: Whisper or FFmpeg not installed

**Fix**:
```cmd
# Install FFmpeg
choco install ffmpeg

# Install Whisper
cd backend
venv\Scripts\activate
pip install openai-whisper

# Restart backend
python main.py
```

See `VOICE_TROUBLESHOOTING.md` for detailed guide.

---

### Issue: "Database not connected"

**Cause**: MongoDB not running

**Fix**:
```cmd
# Start MongoDB
net start MongoDB

# Or if using MongoDB Compass, start it there
```

---

### Issue: "Port 8000 already in use"

**Cause**: Another process using port 8000

**Fix**:
```cmd
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in backend/.env
API_PORT=8001
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] Backend starts without errors
- [ ] Can access http://localhost:8000/docs
- [ ] Can access http://localhost:8000/health
- [ ] MongoDB connection shows "connected"
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can login with test credentials
- [ ] Dashboard loads properly

---

## Test Credentials

**Email**: `priya@textiles.com`  
**Password**: `password123`

---

## API Endpoints

- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Voice Status**: http://localhost:8000/api/voice/status

---

## Project Structure

```
SCAP/
├── backend/              # FastAPI backend
│   ├── venv/            # Virtual environment
│   ├── api/             # API routes
│   ├── services/        # Business logic
│   ├── database/        # Database connections
│   ├── main.py          # Entry point
│   └── requirements.txt # Dependencies
│
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/        # Pages
│   │   ├── components/ # React components
│   │   └── lib/        # Utilities
│   └── package.json
│
└── scripts/            # Setup scripts
    ├── setup_complete.bat
    ├── start_backend_fixed.bat
    └── start_both.bat
```

---

## Environment Variables

### Backend (.env)
```env
# AI Services
GOOGLE_AI_API_KEY=your_key
GROQ_API_KEY=your_key
OPENROUTER_API_KEY=your_key

# Database
MONGODB_URI=mongodb://localhost:27017/scap_local

# Server
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Development Workflow

### 1. Start Development
```cmd
# Terminal 1: Backend
start_backend_fixed.bat

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Make Changes
- Edit files in `backend/` or `frontend/src/`
- Backend auto-reloads on file changes
- Frontend hot-reloads automatically

### 3. Test Changes
- Backend: http://localhost:8000/docs
- Frontend: http://localhost:3000

### 4. Commit Changes
```cmd
git add .
git commit -m "Your message"
git push origin main
```

---

## Useful Commands

### Backend
```cmd
# Install new package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt

# Run tests
python -m pytest

# Check logs
python main.py
```

### Frontend
```cmd
# Install new package
npm install package-name

# Build for production
npm run build

# Run production build
npm start
```

---

## Getting Help

### Documentation
- `README.md` - Project overview
- `ARCHITECTURE.md` - System design
- `VOICE_TROUBLESHOOTING.md` - Voice feature help
- `FRONTEND_DASHBOARD_FIX.md` - Dashboard issues

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Logs
- Backend: Console output
- Frontend: Browser console (F12)

---

## Production Deployment

See `DEPLOYMENT.md` for production setup instructions.

---

## Quick Reference

| Task | Command |
|------|---------|
| Setup everything | `setup_complete.bat` |
| Start backend | `start_backend_fixed.bat` |
| Start frontend | `cd frontend && npm run dev` |
| Start both | `start_both.bat` |
| Install voice | `pip install openai-whisper` |
| Check API | http://localhost:8000/docs |
| Check frontend | http://localhost:3000 |

---

**Status**: Ready to develop! 🚀
