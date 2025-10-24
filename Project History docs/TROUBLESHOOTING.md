# Troubleshooting Guide

## Current Status

### Backend ✅
- **Status**: Running on `http://localhost:8000`
- **CORS**: Properly configured and working
- **Endpoints**: All auth endpoints responding correctly
- **Test User Created**: 
  - Email: `admin@scap.com`
  - Password: `admin123`
  - Role: `admin`

### Frontend ⚠️
- **Status**: Running but API calls failing
- **Issue**: Empty error objects in console
- **Environment**: `.env.local` file created with `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Steps to Fix

### 1. Restart Frontend Development Server

The frontend needs to be restarted to pick up the new `.env.local` file:

```powershell
# Stop the current dev server (Ctrl+C in the terminal where it's running)
# Then restart it:
cd "D:\AI Projects\SCAP(Supply Chain AI Compliance Platform)\frontend"
npm run dev
```

### 2. Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 3. Test Login

Use these credentials to test:
- **Email**: `admin@scap.com`
- **Password**: `admin123`

### 4. Check Browser Console

After restarting, check the browser console for:
- `[API] Base URL:` should show `http://localhost:8000`
- Network requests should go to `http://localhost:8000/api/auth/login`
- Look for detailed error logs with `fullUrl`, `errorCode`, etc.

## Common Issues

### Issue: "Network Error" or Empty Error Object
**Cause**: Frontend not connecting to backend
**Solution**: 
1. Verify backend is running: `netstat -ano | findstr :8000`
2. Restart frontend to pick up environment variables
3. Clear browser cache

### Issue: CORS Errors
**Cause**: Origin not allowed
**Solution**: Backend already configured for `http://localhost:3000`

### Issue: 401 Unauthorized
**Cause**: Invalid credentials or expired token
**Solution**: Use the test credentials above or register a new user

## Backend API Endpoints

All endpoints are prefixed with `/api/auth`:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth token)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

## Testing Backend Directly

You can test the backend using PowerShell:

```powershell
# Test login
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"admin@scap.com","password":"admin123"}'
```

## Next Steps

1. **Restart frontend** to pick up environment variables
2. **Clear browser cache** to remove any cached API responses
3. **Try logging in** with the test credentials
4. **Check console logs** for detailed error information
5. If still failing, check the Network tab in DevTools to see the actual request/response

## Files Modified

- `frontend/.env.local` - Created with API URL
- `frontend/src/lib/api/auth.ts` - Fixed endpoint paths
- `frontend/src/lib/api/client.ts` - Improved error logging
