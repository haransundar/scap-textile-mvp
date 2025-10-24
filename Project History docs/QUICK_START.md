# 🚀 SCAP - Quick Start Guide

## ⚡ Start Everything in 1 Command

```cmd
start_both.bat
```

This will open two windows:
- **Backend**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000

---

## 📋 What Happens

### Backend Window
```
✅ Connected to MongoDB: scap_local
✅ SCAP Backend running on http://0.0.0.0:8000
📚 API Documentation: http://localhost:8000/docs
INFO: Application startup complete.
```

### Frontend Window
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

---

## 🎯 First Steps

### 1. Open Frontend
Visit: http://localhost:3000

### 2. Register Account
- Click "Register" or go to http://localhost:3000/register
- Fill in your details
- Submit

### 3. Login
- Use your credentials
- Access dashboard

### 4. Test Features
- Upload documents
- Run OCR
- Check compliance
- Chat with AI

---

## 🔧 Alternative Start Methods

### Start Backend Only
```cmd
start_backend.bat
```
Access API docs: http://localhost:8000/docs

### Start Frontend Only
```cmd
start_frontend.bat
```
Access app: http://localhost:3000

### Manual Start

**Backend**:
```cmd
cd backend
.\venv\Scripts\activate
python main.py
```

**Frontend**:
```cmd
cd frontend
npm run dev
```

---

## 🧪 Test the API

### Option 1: Interactive Docs
Visit: http://localhost:8000/docs

### Option 2: Automated Tests
```cmd
python test_working_features.py
```

### Option 3: Manual cURL
```cmd
curl http://localhost:8000/health
```

---

## 🛑 Stop Servers

### If Started with start_both.bat
- Close both command windows
- Or press `Ctrl+C` in each window

### If Started Manually
- Press `Ctrl+C` in each terminal

---

## ⚠️ Troubleshooting

### MongoDB Not Running
```cmd
net start MongoDB
```

### Port Already in Use
```cmd
# Backend (port 8000)
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Frontend (port 3000)
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### Dependencies Missing

**Backend**:
```cmd
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend**:
```cmd
cd frontend
npm install
```

---

## 📚 Next Steps

1. ✅ Explore the dashboard
2. ✅ Upload sample documents
3. ✅ Test OCR features
4. ✅ Try the AI chatbot
5. ✅ Check compliance reports

---

## 🔗 Quick Links

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

**🎉 You're ready to go!**

Run `start_both.bat` and start developing!
