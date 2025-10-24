# SCAP New Features Documentation

**Date**: October 23, 2025  
**Features Added**: Notifications, Brand Connections, Settings

---

## Overview

Three new pages have been added to the SCAP platform:

1. **Notifications Center** - Centralized hub for alerts and updates
2. **Brand Connections** - Manage brand partnerships and data sharing
3. **Settings** - User profile, account settings, and team management

---

## 1. Notifications Center

### Location
`/dashboard/notifications`

### Features
- **Filter Tabs**: All, Unread, Alerts, Updates
- **Notification Types**:
  - 🔴 Alert: Certificate expiring, regulation changes, risk increases
  - 🔵 Update: New regulations, profile updates
  - 🟢 Success: Certificate uploaded, risk score improved
  - 🟡 Reminder: Audit due, renewal needed
- **Bulk Actions**: Mark as read, delete multiple notifications
- **Individual Actions**: Mark as read/unread, delete
- **Real-time Updates**: Auto-refresh on actions

### API Endpoints

#### Get Notifications
```
GET /api/notifications?type=all&page=1&limit=20
Headers: Authorization: Bearer <token>

Response:
{
  "notifications": [...],
  "total": 45,
  "unread": 12,
  "page": 1,
  "limit": 20
}
```

#### Mark as Read
```
PUT /api/notifications/{id}/read
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### Delete Notification
```
DELETE /api/notifications/{id}
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Notification deleted"
}
```

#### Bulk Action
```
POST /api/notifications/bulk-action
Headers: Authorization: Bearer <token>
Body:
{
  "ids": ["id1", "id2", "id3"],
  "action": "read" | "delete"
}

Response:
{
  "success": true,
  "modified": 3
}
```

#### Get/Update Settings
```
GET /api/notifications/settings
PUT /api/notifications/settings
Headers: Authorization: Bearer <token>
Body (PUT):
{
  "email": true,
  "sms": false,
  "certificate_expiry": true,
  "regulatory_updates": true,
  "risk_alerts": true
}
```

### Database Schema

```javascript
// Collection: notifications
{
  _id: ObjectId,
  user_id: String,
  type: 'alert' | 'update' | 'success' | 'reminder',
  title: String,
  message: String,
  read: Boolean,
  action_required: Boolean,
  action_text: String (optional),
  action_url: String (optional),
  created_at: Date,
  read_at: Date (optional)
}
```

---

## 2. Brand Connections

### Location
`/dashboard/brands`

### Features
- **Connection Management**: View connected and pending brands
- **Data Sharing Controls**: Granular permissions for:
  - Certificates
  - Risk Score
  - Supply Network
  - Audit Reports
- **Sharing History**: Track all data sharing activities
- **Stats Dashboard**: Connected brands, pending requests, shared items
- **One-click Disconnect**: Remove brand connections

### API Endpoints

#### Get Connections
```
GET /api/brands/connections
Headers: Authorization: Bearer <token>

Response:
{
  "connected": [...],
  "pending": [...],
  "stats": {
    "connected": 2,
    "pending": 1,
    "total_shared": 15
  }
}
```

#### Connect Brand
```
POST /api/brands/connect
Headers: Authorization: Bearer <token>
Body:
{
  "brand_id": "brand123",
  "request_message": "Would like to connect..."
}

Response:
{
  "success": true,
  "connection": {...}
}
```

#### Update Sharing Permissions
```
PUT /api/brands/{brand_id}/sharing
Headers: Authorization: Bearer <token>
Body:
{
  "certificates": true,
  "risk_score": false,
  "network": true,
  "audits": false
}

Response:
{
  "success": true,
  "permissions": {...}
}
```

#### Disconnect Brand
```
DELETE /api/brands/{brand_id}/disconnect
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Brand disconnected"
}
```

#### Get Sharing History
```
GET /api/brands/sharing-history
Headers: Authorization: Bearer <token>

Response:
{
  "history": [
    {
      "_id": "...",
      "brand_name": "H&M",
      "data_type": "certificates",
      "action": "shared",
      "date": "2025-10-23 10:30"
    }
  ]
}
```

#### Share Profile
```
POST /api/brands/{brand_id}/share-profile
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "shared_items": 5,
  "items": [...]
}
```

### Database Schemas

```javascript
// Collection: brand_connections
{
  _id: ObjectId,
  supplier_id: String,
  brand_id: String,
  status: 'connected' | 'pending' | 'rejected',
  sharing_permissions: {
    certificates: Boolean,
    risk_score: Boolean,
    network: Boolean,
    audits: Boolean
  },
  connected_at: Date,
  last_shared_at: Date,
  requested_at: Date (for pending)
}

// Collection: sharing_history
{
  _id: ObjectId,
  supplier_id: String,
  brand_id: String,
  data_type: String,
  action: 'shared' | 'revoked' | 'updated',
  timestamp: Date,
  items_count: Number (optional)
}

// Collection: brands
{
  _id: ObjectId,
  name: String,
  logo: String (optional),
  location: String,
  industry: String,
  created_at: Date
}
```

---

## 3. Settings

### Location
`/dashboard/settings`

### Features

#### Profile Tab
- Company name
- Location
- Tier level (2, 3, 4)
- Industry type
- Contact information

#### Account Tab
- Language preference (English, Tamil, Hindi)
- Password change

#### Notifications Tab
- Email notifications toggle
- SMS alerts toggle
- Certificate expiry reminders
- Regulatory updates
- Risk alerts

#### Team Tab
- View team members
- Invite new members
- Manage roles (admin, member, viewer)
- Remove members

### API Endpoints

#### Get/Update Profile
```
GET /api/settings/profile
PUT /api/settings/profile
Headers: Authorization: Bearer <token>
Body (PUT):
{
  "company_name": "Priya Textiles",
  "location": "Tirupur, Tamil Nadu",
  "tier_level": "Tier 2",
  "industry": "Textile - Dyeing",
  "contact_email": "contact@priya.com",
  "phone": "+91 9876543210"
}
```

#### Change Password
```
PUT /api/settings/password
Headers: Authorization: Bearer <token>
Body:
{
  "current_password": "old_password",
  "new_password": "new_password"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Get/Update Notification Preferences
```
GET /api/settings/notifications
PUT /api/settings/notifications
Headers: Authorization: Bearer <token>
Body (PUT):
{
  "email": true,
  "sms": false,
  "certificate_expiry": true,
  "regulatory_updates": true,
  "risk_alerts": true
}
```

#### Team Management
```
GET /api/settings/team
POST /api/settings/team/invite
DELETE /api/settings/team/{member_id}

Invite Body:
{
  "email": "member@example.com",
  "role": "admin" | "member" | "viewer"
}
```

### Database Schema

```javascript
// Collection: users (extended)
{
  _id: ObjectId,
  email: String,
  password: String,
  full_name: String,
  company_name: String,
  location: String,
  tier_level: String,
  industry: String,
  contact_email: String,
  phone: String,
  language_preference: String,
  notification_settings: {
    email: Boolean,
    sms: Boolean,
    certificate_expiry: Boolean,
    regulatory_updates: Boolean,
    risk_alerts: Boolean
  },
  team_members: [{
    user_id: String,
    role: String,
    invited_at: Date
  }],
  created_at: Date,
  updated_at: Date,
  password_updated_at: Date
}
```

---

## Installation & Setup

### 1. Backend Setup

The new API routes are already registered in `backend/main.py`:

```python
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(brands.router, prefix="/api/brands", tags=["Brands"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
```

### 2. Seed Sample Data

Run the seed script to create sample data:

```bash
cd backend
python scripts/seed_new_features.py
```

This will create:
- 5 sample notifications
- 3 sample brands
- 3 brand connections (2 connected, 1 pending)
- 4 sharing history records
- Notification settings for the user

### 3. Start the Application

```bash
# Backend
cd backend
.\venv\Scripts\activate
python main.py

# Frontend
cd frontend
npm run dev
```

### 4. Access New Pages

- Notifications: http://localhost:3000/dashboard/notifications
- Brands: http://localhost:3000/dashboard/brands
- Settings: http://localhost:3000/dashboard/settings

---

## Navigation Updates

The dashboard layout has been updated with new navigation links:

- **Brands** link added to main navigation
- **Notifications** link added to main navigation
- **Settings** link added to top-right menu

---

## Testing Checklist

### Notifications
- [ ] View all notifications
- [ ] Filter by unread
- [ ] Filter by alerts
- [ ] Filter by updates
- [ ] Mark single notification as read
- [ ] Delete single notification
- [ ] Select multiple notifications
- [ ] Bulk mark as read
- [ ] Bulk delete
- [ ] View notification settings

### Brands
- [ ] View connected brands
- [ ] View pending requests
- [ ] View sharing history
- [ ] Open sharing modal
- [ ] Toggle certificate sharing
- [ ] Toggle risk score sharing
- [ ] Toggle network sharing
- [ ] Toggle audit sharing
- [ ] Save sharing permissions
- [ ] Disconnect brand

### Settings
- [ ] View profile tab
- [ ] Update company name
- [ ] Update location
- [ ] Change tier level
- [ ] Change industry
- [ ] Save profile changes
- [ ] View account tab
- [ ] Change language preference
- [ ] Change password
- [ ] View notifications tab
- [ ] Toggle email notifications
- [ ] Toggle SMS alerts
- [ ] Toggle certificate expiry reminders
- [ ] Save notification preferences
- [ ] View team tab
- [ ] Invite team member
- [ ] Remove team member

---

## Performance Considerations

### Backend
- All queries use indexes on `user_id` and `supplier_id`
- Pagination implemented for notifications (default 20 per page)
- Bulk operations use MongoDB `update_many` and `delete_many`
- Async/await for all database operations

### Frontend
- Loading states for all API calls
- Optimistic UI updates where appropriate
- Error handling with user-friendly messages
- Responsive design for mobile devices

---

## Security

### Authentication
- All endpoints require JWT authentication
- Token validation on every request
- User can only access their own data

### Authorization
- Suppliers can only manage their own connections
- Team members have role-based permissions
- Password changes require current password verification

### Data Privacy
- Sharing permissions are granular and explicit
- Sharing history is logged for audit trail
- Users can revoke access at any time

---

## Future Enhancements

### Notifications
- [ ] Push notifications (browser)
- [ ] Email notifications (SendGrid integration)
- [ ] SMS notifications (Twilio integration)
- [ ] Notification preferences per type
- [ ] Notification scheduling

### Brands
- [ ] Brand verification workflow
- [ ] Data access requests
- [ ] Temporary access links
- [ ] Access expiration dates
- [ ] Brand ratings and reviews

### Settings
- [ ] Two-factor authentication
- [ ] API key management
- [ ] Webhook configuration
- [ ] Data export
- [ ] Account deletion

---

## Troubleshooting

### Notifications not loading
- Check MongoDB connection
- Verify user is authenticated
- Check browser console for errors
- Verify API endpoint is accessible

### Brand connections not showing
- Run seed script to create sample data
- Check MongoDB `brand_connections` collection
- Verify user_id matches in database

### Settings not saving
- Check form validation
- Verify API endpoint returns success
- Check MongoDB update operations
- Look for errors in backend logs

---

## API Documentation

Full API documentation is available at:
http://localhost:8000/docs

The Swagger UI includes:
- All endpoint definitions
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

---

## Files Created

### Backend (3 files)
- `backend/api/routes/notifications.py` (200 lines)
- `backend/api/routes/brands.py` (250 lines)
- `backend/api/routes/settings.py` (220 lines)

### Frontend (3 files)
- `frontend/src/app/dashboard/notifications/page.tsx` (280 lines)
- `frontend/src/app/dashboard/brands/page.tsx` (350 lines)
- `frontend/src/app/dashboard/settings/page.tsx` (400 lines)

### Scripts (1 file)
- `backend/scripts/seed_new_features.py` (200 lines)

### Documentation (1 file)
- `NEW_FEATURES_DOCUMENTATION.md` (this file)

### Modified Files (2 files)
- `backend/main.py` (added 3 router imports)
- `frontend/src/app/dashboard/layout.tsx` (added 3 navigation links)

**Total**: 10 files (8 new, 2 modified)  
**Total Lines**: ~1,900 lines of code

---

## Support

For issues or questions:
1. Check this documentation
2. Review API docs at `/docs`
3. Check browser console for errors
4. Review backend logs
5. Run seed script if data is missing

---

**Implementation Complete!** ✅

All three new pages are fully functional with backend APIs, frontend UI, and sample data.
