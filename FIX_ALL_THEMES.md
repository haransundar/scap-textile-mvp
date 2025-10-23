# 🎨 Theme Fix - Color Mapping Guide

## ❌ OLD (Hardcoded Dark Colors) → ✅ NEW (Theme-Aware)

### Background Colors:
- `bg-[#0f1419]` → `bg-background`
- `bg-[#1a2332]` → `bg-card`
- `bg-[#1f2937]` → `bg-muted`
- `bg-[#1e3a8a]` → `bg-primary`

### Text Colors:
- `text-white` → `text-foreground`
- `text-gray-100` → `text-foreground`
- `text-gray-300` → `text-muted-foreground`
- `text-gray-400` → `text-muted-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-gray-600` → `text-muted-foreground`
- `text-blue-400` → `text-primary`
- `text-blue-600` → `text-primary`

### Border Colors:
- `border-gray-700` → `border-border`
- `border-gray-800` → `border-border`

### Button Colors:
- `bg-blue-600` → `bg-primary`
- `bg-blue-700` → `bg-primary/80`
- `bg-gray-700` → `bg-secondary`
- `hover:bg-blue-700` → `hover:bg-primary/80`

## 🔧 Quick Find & Replace Commands

Search in all `.tsx` files under `/app/dashboard/`:

1. `bg-\[#0f1419\]` → `bg-background`
2. `bg-\[#1a2332\]` → `bg-card`
3. `bg-\[#1f2937\]` → `bg-muted`
4. `bg-\[#1e3a8a\]` → `bg-primary`
5. `text-white` → `text-foreground` (context-dependent)
6. `text-gray-400` → `text-muted-foreground`
7. `border-gray-800` → `border-border`
8. `bg-blue-600` → `bg-primary`

## ✅ Pages Already Fixed:
- [x] `/dashboard/chatbot/page.tsx` - ALL colors updated
- [x] `/dashboard/layout.tsx` - Navigation bar updated

## ⏳ Pages Still Need Fixing:
- [ ] `/dashboard/page.tsx` - Main dashboard
- [ ] `/dashboard/certificates/page.tsx` - Certificate list
- [ ] `/dashboard/certificates/upload/page.tsx` - Upload wizard
- [ ] `/dashboard/risk/page.tsx` - Risk analysis
- [ ] `/dashboard/compliance/page.tsx` - Compliance page

## 🎨 Tailwind Theme Classes Reference

### Layout:
- `bg-background` - Main background color
- `bg-card` - Card backgrounds
- `bg-popover` - Popover/modal backgrounds

### Text:
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `text-card-foreground` - Text on cards

### Interactive:
- `bg-primary` - Primary buttons/accents
- `text-primary-foreground` - Text on primary
- `bg-secondary` - Secondary buttons
- `text-secondary-foreground` - Text on secondary

### States:
- `bg-muted` - Muted/disabled states
- `bg-accent` - Accent backgrounds
- `bg-destructive` - Error/delete buttons

### Borders:
- `border-border` - Default borders
- `border-input` - Input borders
- `ring-ring` - Focus rings

## 📝 Example Conversion:

### Before (Hardcoded):
```tsx
<div className="min-h-screen bg-[#0f1419] text-white">
  <div className="bg-[#1a2332] border border-gray-800">
    <h1 className="text-white">Dashboard</h1>
    <p className="text-gray-400">Description</p>
    <button className="bg-blue-600 hover:bg-blue-700 text-white">
      Click Me
    </button>
  </div>
</div>
```

### After (Theme-Aware):
```tsx
<div className="min-h-screen bg-background text-foreground">
  <div className="bg-card border border-border">
    <h1 className="text-foreground">Dashboard</h1>
    <p className="text-muted-foreground">Description</p>
    <button className="bg-primary hover:bg-primary/80 text-primary-foreground">
      Click Me
    </button>
  </div>
</div>
```

## 🧪 How to Test:

1. Make the changes
2. Refresh browser
3. Click "Light" button in nav
4. **Expected:** All colors should change
5. **Dark Mode:** Dark backgrounds, light text
6. **Light Mode:** Light backgrounds, dark text

## ✅ Success Criteria:

- [ ] Navigation bar changes color
- [ ] Page background changes
- [ ] Cards change background
- [ ] Text remains readable
- [ ] Buttons change colors
- [ ] Borders adapt to theme
- [ ] All pages consistent

---

**Status:** IN PROGRESS  
**Completed:** 2/7 pages  
**Next:** Update remaining 5 pages
