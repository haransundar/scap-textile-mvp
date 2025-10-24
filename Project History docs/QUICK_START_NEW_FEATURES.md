# Quick Start Guide - New Features

## 🚀 Get Started in 5 Minutes

### Step 1: Seed Sample Data (1 minute)

```bash
cd backend
python scripts/seed_new_features.py
```

This creates:
- ✅ 5 sample notifications
- ✅ 3 sample brands (H&M, Zara, Uniqlo)
- ✅ 3 brand connections
- ✅ Notification settings

### Step 2: Start Backend (if not running)

```bash
cd backend
.\venv\Scripts\activate
python main.py
```

Backend will be available at: http://localhost:8000

### Step 3: Start Frontend (if not running)

```bash
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:3000

### Step 4: Login

Use existing test account:
- Email: `priya@priyatextiles.com`
- Password: `password123`

### Step 5: Explore New Features

#### 📬 Notifications
http://localhost:3000/dashboard/notifications

**Try this:**
1. Click "Unread" tab to see unread notifications
2. Select multiple notifications using checkboxes
3. Click "Mark as Read" to mark them all
4. Click individual notification to see details
5. Delete a notification using the trash icon

#### 🏢 Brand Connections
http://localhost:3000/dashboard/brands

**Try this:**
1. View connected brands (H&M, Zara)
2. Click "Manage Access" on H&M
3. Toggle sharing permissions (certificates, risk score, etc.)
4. Click "Save Changes"
5. Switch to "Sharing History" tab to see activity log

#### ⚙️ Settings
http://localhost:3000/dashboard/settings

**Try this:**
1. **Profile Tab**: Update company name and location
2. **Account Tab**: Change language preference
3. **Notifications Tab**: Toggle email/SMS preferences
4. **Team Tab**: View team members (empty by default)

---

## 🎯 Key Features to Test

### Notifications
- [x] Filter by type (All, Unread, Alerts, Updates)
- [x] Mark as read/unread
- [x] Delete notifications
- [x] Bulk actions (select multiple)
- [x] Action buttons (e.g., "Renew Certificate")

### Brands
- [x] View connected brands
- [x] View pending requests
- [x] Manage data sharing permissions
- [x] View sharing history
- [x] Disconnect brand

### Settings
- [x] Update profile information
- [x] Change password
- [x] Configure notification preferences
- [x] Manage team members

---

## 📊 API Endpoints

All endpoints are documented at: http://localhost:8000/docs

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `DELETE /api/notifications/{id}` - Delete
- `POST /api/notifications/bulk-action` - Bulk operations

### Brands
- `GET /api/brands/connections` - List connections
- `PUT /api/brands/{id}/sharing` - Update permissions
- `GET /api/brands/sharing-history` - View history
- `DELETE /api/brands/{id}/disconnect` - Disconnect

### Settings
- `GET /api/settings/profile` - Get profile
- `PUT /api/settings/profile` - Update profile
- `PUT /api/settings/password` - Change password
- `GET /api/settings/notifications` - Get preferences
- `PUT /api/settings/notifications` - Update preferences
- `GET /api/settings/team` - List team members
- `POST /api/settings/team/invite` - Invite member

---

## 🔍 Troubleshooting

### "No notifications found"
Run: `python backend/scripts/seed_new_features.py`

### "Failed to fetch"
- Check backend is running on port 8000
- Check frontend is running on port 3000
- Verify you're logged in

### "Unauthorized"
- Login again at http://localhost:3000/login
- Check JWT token in browser localStorage

### Database errors
- Ensure MongoDB is running
- Check connection string in `.env`

---

## 📱 Navigation

New links added to dashboard:

**Main Navigation:**
- Dashboard
- Certificates
- Risk Analysis
- Compliance
- **Brands** ← NEW
- **Notifications** ← NEW
- Chatbot

**Top Right:**
- Theme Toggle
- Language Selector
- **Settings** ← NEW
- Logout

---

## ✅ Success Criteria

You should be able to:
1. ✅ See 5 notifications in Notifications page
2. ✅ See 2 connected brands and 1 pending in Brands page
3. ✅ Update profile in Settings page
4. ✅ All existing pages still work (Dashboard, Certificates, etc.)
5. ✅ No console errors in browser
6. ✅ No errors in backend logs

---

## 🎉 You're Done!

All three new pages are now fully functional. Explore the features and test the workflows.

**Next Steps:**
- Customize notification types
- Add more brands
- Invite team members
- Configure notification preferences

---

## 📚 Full Documentation

See `NEW_FEATURES_DOCUMENTATION.md` for:
- Complete API reference
- Database schemas
- Security details
- Future enhancements
- Troubleshooting guide

---

**Happy Testing!** 🚀
