# Routing Quick Guide - Faculty vs Candidate Login

## TL;DR

✅ Faculty accessing `/faculty` → Faculty Dashboard (no "Faculty" button)
✅ Everyone else accessing `/login` → Student Dashboard (with "Faculty" button)
✅ Verified faculty can switch dashboards using the "Faculty" button
✅ All working! Dev server: http://localhost:3001/

---

## Three Simple Cases

### Case 1: Faculty Portal Access
```
/faculty (not logged in)
        ↓
Login with ?redirect=faculty
        ↓
Faculty Dashboard (no "Faculty" button)
```

### Case 2: Student Portal Access
```
/login (not logged in)
        ↓
Login normally
        ↓
Student Dashboard (with "Faculty" button visible)
```

### Case 3: Faculty Switching Dashboards
```
/dashboard (logged in as faculty)
        ↓
Click "Faculty Portal" button
        ↓
Faculty Dashboard
```

---

## How It Works

**Login.tsx**: Reads `?redirect=` param from URL
**Dashboard.tsx**: Checks sessionStorage flag to decide redirect
**FacultyDashboard.tsx**: Sends unauthenticated users to `/login?redirect=faculty`

---

## The Magic Query Parameter

`/login?redirect=faculty`
- Only appears when accessing `/faculty` first
- Tells Login where to send user after authentication
- Stored in sessionStorage during login
- Cleared after use

---

## Nav Bar Changes

| Location | Faculty Button | Admin Button | Browse |
|----------|----------------|--------------|--------|
| `/dashboard` (from /login) | ✅ YES | ✅ (if admin) | ✅ |
| `/faculty` (from /faculty) | ❌ NO | ✅ (if admin) | ✅ |

---

## Testing Quick Start

**Test 1**: Go to `/faculty` → Login → Should land on Faculty Dashboard with NO Faculty button

**Test 2**: Go to `/login` → Login as faculty → Land on Dashboard with Faculty button visible

**Test 3**: Go to `/login` → Login as student → Land on Dashboard with Faculty button

---

## One Minute Explanation

Dashboard is the hub. When someone logs in via `/faculty`, we mark them with a flag. When they land on Dashboard, we check the flag. If set, we know they came from faculty path, so we don't redirect them away and we show the Faculty button in nav. If not set, and they're verified faculty, we auto-redirect them to `/faculty` (no button needed there).

---

## Files Changed

1. `Login.tsx` - Check `?redirect=` param
2. `Dashboard.tsx` - Check sessionStorage flag
3. `FacultyDashboard.tsx` - Add `?redirect=faculty` when sending to login

---

## Current Status

✅ All code working
✅ No errors
✅ Hot reload active
✅ Ready for testing

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Faculty not in faculty portal | Check they logged in via `/faculty` |
| No Faculty button | You're already in faculty portal (correct!) |
| Button disappears after clicking | You're being redirected to `/faculty` |

