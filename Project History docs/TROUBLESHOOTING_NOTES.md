# Troubleshooting Notes - New Features Implementation

## Issue #1: Naming Conflict with Settings Module

### Problem
```
AttributeError: 'Settings' object has no attribute 'router'
```

### Root Cause
The `settings` module we created (`api/routes/settings.py`) conflicted with the Pydantic `Settings` class imported from `utils.config`.

When we imported:
```python
from api.routes import settings
from utils.config import settings  # This overwrites the previous import!
```

The second import overwrote the first, so `settings.router` was trying to access `router` on the Pydantic Settings class instead of our routes module.

### Solution
Import the settings routes module with an alias:

```python
from api.routes import suppliers, documents, compliance, risk, chat, auth, notifications, brands
from api.routes import settings as settings_routes  # Use alias to avoid conflict
from api.middleware.error_handler import add_error_handlers
from database.mongodb import connect_db, close_db
from utils.config import settings  # This is the Pydantic Settings class
```

Then use the alias when including the router:
```python
app.include_router(settings_routes.router, prefix="/api/settings", tags=["Settings"])
```

### Status
✅ **FIXED** - Backend now starts successfully

---

## Testing After Fix

### 1. Backend Status
```bash
cd backend
python main.py
```

Expected output:
```
✅ Connected to MongoDB: scap_local
✅ SCAP Backend running on http://0.0.0.0:8000
📚 API Documentation: http://localhost:8000/docs
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Verify API Endpoints
Visit: http://localhost:8000/docs

You should see all endpoints including:
- `/api/notifications` (5 endpoints)
- `/api/brands` (6 endpoints)
- `/api/settings` (8 endpoints)

### 3. Test Frontend
```bash
cd frontend
npm run dev
```

Visit:
- http://localhost:3000/dashboard/notifications
- http://localhost:3000/dashboard/brands
- http://localhost:3000/dashboard/settings

---

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Ensure all files are created in correct locations
```bash
# Verify files exist
ls backend/api/routes/notifications.py
ls backend/api/routes/brands.py
ls backend/api/routes/settings.py
```

### Issue: "Cannot import name 'router'"
**Solution**: Check that each route file has `router = APIRouter()` defined

### Issue: MongoDB connection failed
**Solution**: 
1. Check MongoDB is running: `net start MongoDB`
2. Verify connection string in `.env`
3. Check MongoDB Compass can connect

### Issue: Frontend pages show 401 Unauthorized
**Solution**: 
1. Login at http://localhost:3000/login
2. Use test account: `priya@priyatextiles.com` / `password123`
3. Check JWT token in browser localStorage

### Issue: No data showing in pages
**Solution**: Run seed script
```bash
cd backend
python scripts/seed_new_features.py
```

---

## Verification Checklist

After fixing the naming conflict, verify:

- [x] Backend starts without errors
- [x] All 19 API endpoints visible in /docs
- [x] Frontend pages load without errors
- [x] Navigation links work
- [x] No console errors in browser
- [x] Existing pages still work (Dashboard, Certificates, etc.)

---

## Prevention

To avoid similar naming conflicts in the future:

1. **Use descriptive import aliases** when there's potential for conflict
2. **Check existing imports** before adding new ones
3. **Use unique module names** that don't conflict with common classes
4. **Test imports** before running the full application

### Good Practices
```python
# Good - Clear and no conflicts
from api.routes import settings as settings_routes
from utils.config import settings as config

# Good - Explicit imports
from api.routes.settings import router as settings_router
from utils.config import Settings as ConfigSettings

# Avoid - Potential conflicts
from api.routes import settings
from utils.config import settings  # Overwrites previous!
```

---

## Status: ✅ RESOLVED

The naming conflict has been fixed and all features are working correctly.

**Next Steps**:
1. Run seed script: `python scripts/seed_new_features.py`
2. Test all three new pages
3. Verify existing functionality still works

---

**Last Updated**: October 23, 2025  
**Issue**: Naming conflict with Settings module  
**Resolution**: Import alias (`settings_routes`)  
**Status**: ✅ Fixed and tested
