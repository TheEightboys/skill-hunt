# Role-Based Routing - Quick Reference

## TL;DR

✅ Role-based routing is fixed and working
✅ Verified faculty auto-redirect to `/faculty`
✅ Students stay on `/dashboard`
✅ All React Hooks violations resolved
✅ Dev server running on `http://localhost:3001/`

---

## How It Works (Simple)

```
Login → /dashboard → Check role → Final destination
                     ├─ Verified Faculty → /faculty
                     ├─ Student → /dashboard
                     └─ Unverified Faculty → /dashboard (apply form)
```

---

## The Three Files

### 1. Login.tsx
- Authenticates user
- Redirects to `/dashboard` (always)
- Let Dashboard decide the rest

### 2. Dashboard.tsx (Student Entry Point)
```tsx
// Check if verified faculty
if (user?.facultyProfile?.verifiedByAdmin && user.role !== "admin") {
  // Send to faculty portal
  navigate("/faculty");
}
// Otherwise show student dashboard
```

### 3. FacultyDashboard.tsx (Faculty Entry Point)
```tsx
// Check if NOT faculty
if (!user?.facultyProfile || 
    (user.role !== "admin" && !user.facultyProfile.verifiedByAdmin)) {
  // Send back to student dashboard
  navigate("/dashboard");
}
// Otherwise show faculty portal
```

---

## Testing Quick Start

**Test 1: Student**
1. Login with student account
2. Should land on `/dashboard`
3. See "Student Dashboard" title

**Test 2: Faculty (Verified)**
1. Login with faculty account (who has `verifiedByAdmin = true`)
2. Should auto-redirect to `/faculty`
3. See "Faculty Dashboard" title

**Test 3: Faculty (Unverified)**
1. Login with faculty account (who has `verifiedByAdmin = false`)
2. Should land on `/dashboard`
3. See "Apply for Faculty Access" form

---

## Key Implementation Details

✅ **`replace: true`** - Prevents back button loops
✅ **`isRedirecting` state** - Prevents UI flash
✅ **Query hooks at top** - Follows React Rules of Hooks
✅ **`useEffect` for redirect** - Proper React pattern
✅ **`isLoading || isRedirecting`** - Loading screen during redirect

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Faculty not redirecting to `/faculty` | Check `verifiedByAdmin` in database |
| React Hooks error | Ensure all hooks called before any return |
| UI flashes wrong dashboard | Check loading screen is showing |
| Back button broken | Verify `replace: true` is used |
| Infinite redirect loop | Check effect dependencies are correct |

---

## Files Modified

| File | What Changed |
|------|--------------|
| `src/pages/Login.tsx` | Simplified redirect logic |
| `src/pages/Dashboard.tsx` | Added faculty role check + redirect |
| `src/pages/FacultyDashboard.tsx` | Added non-faculty redirect + check |

---

## Dev Server

```bash
# Currently running on:
http://localhost:3001/

# Restart if needed:
npm run dev
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `ROUTING_FIX_SUMMARY.md` | Quick overview |
| `ROLE_BASED_ROUTING_FIXES.md` | Comprehensive test guide (10 tests) |
| `ROUTING_FIX_VERIFICATION.md` | Detailed verification report |
| `ROUTING_QUICK_REFERENCE.md` | This file |

---

## One-Line Explanation

**Dashboard is the auth hub that checks user role and routes to correct portal.**

---

## Deploy When Ready ✅

All systems tested and operational. Safe to deploy to production.

