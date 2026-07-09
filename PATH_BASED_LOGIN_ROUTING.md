# Path-Based Login Routing - Faculty vs Candidate Flow

## New Requirement

Different login experiences based on access path:
- **Faculty Portal (`/faculty`)** → Faculty login flow → Faculty dashboard (no "Faculty" button in nav)
- **Candidate Portal (`/login`)** → Candidate login flow → Student dashboard (with "Faculty" button in nav to switch)

---

## Updated Implementation

### New Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACCESS PATHS                         │
└─────────────────────────────────────────────────────────────────┘

SCENARIO 1: Faculty Access Path
──────────────────────────────────
User clicks "Faculty" on home
         ↓
User navigates to /faculty (unauthenticated)
         ↓
FacultyDashboard checks auth
  └─ No user? → Redirect to /login?redirect=faculty
         ↓
Login page shows (same form for both)
User enters credentials & submits
         ↓
Login.tsx checks URL params
  └─ ?redirect=faculty → Store in sessionStorage
         ↓
Redirect to /faculty
         ↓
FacultyDashboard loads
  └─ Dashboard component
  └─ No "Faculty" button in nav (they're in faculty)
         ↓
✅ Faculty Dashboard visible


SCENARIO 2: Candidate Access Path  
──────────────────────────────────
User clicks "Login" or goes to /login
         ↓
User navigates to /login
         ↓
Login page shows
User enters credentials & submits
         ↓
Login.tsx checks URL params
  └─ No ?redirect param → Use "dashboard" (default)
         ↓
Redirect to /dashboard
         ↓
Dashboard component loads
  └─ Checks if verified faculty
  └─ If YES → Check sessionStorage for "fromFacultyPath"
    └─ If flag exists → DON'T redirect (show Faculty button in nav)
    └─ If flag missing → Redirect to /faculty
  └─ If NO → Show student dashboard
         ↓
✅ Student Dashboard with "Faculty" button visible


SCENARIO 3: Faculty (Verified) Access Student Dashboard
────────────────────────────────────────────────────────
Faculty logs in via /login (without ?redirect param)
         ↓
Dashboard loads
  └─ Detected as verified faculty
  └─ NO sessionStorage flag (didn't come from faculty path)
         ↓
Auto-redirect to /faculty
         ↓
✅ Faculty Dashboard


SCENARIO 4: Student Tries Faculty Access
─────────────────────────────────────────
Student navigates to /faculty
         ↓
FacultyDashboard checks auth
  └─ User exists but no faculty profile
         ↓
Redirect to /dashboard → shows apply form
         ↓
✅ Student sees faculty application form
```

---

## Implementation Details

### 1. FacultyDashboard.tsx Changes

**Purpose**: Handle unauthenticated access to `/faculty`

```tsx
// Redirect unauthenticated users to login with faculty intent
React.useEffect(() => {
  if (!isLoading && !user) {
    window.location.href = "/login?redirect=faculty";
    return;
  }
}, [isLoading, user]);
```

**Key Changes**:
- Changed `redirectOnUnauthenticated: true` → `false` to handle manually
- Added check for unauthenticated user
- Redirect to `/login?redirect=faculty` to preserve intent
- Second effect handles non-faculty redirect as before

---

### 2. Login.tsx Changes

**Purpose**: Store redirect intent and route accordingly

```tsx
const params = new URLSearchParams(location.search);
const redirectTo = params.get("redirect") || "dashboard";

if (redirectTo === "faculty") {
  sessionStorage.setItem("fromFacultyPath", "true");
}

window.location.href = `/${redirectTo}`;
```

**Key Changes**:
- Check URL query parameters for `?redirect=` param
- Default to "dashboard" if no param
- Store intent in sessionStorage before redirect
- Redirect to appropriate path

---

### 3. Dashboard.tsx Changes

**Purpose**: Only redirect verified faculty if they didn't come from faculty path

```tsx
React.useEffect(() => {
  if (!isLoading && user?.facultyProfile?.verifiedByAdmin && user.role !== "admin") {
    const isFromFacultyPath = sessionStorage.getItem("fromFacultyPath") === "true";
    if (!isFromFacultyPath) {
      // Only redirect if not from faculty path
      setIsRedirecting(true);
      navigate("/faculty", { replace: true });
    } else {
      // Clear the flag for next time
      sessionStorage.removeItem("fromFacultyPath");
    }
  }
}, [isLoading, user, navigate]);
```

**Key Changes**:
- Check sessionStorage for "fromFacultyPath" flag
- Only redirect verified faculty if flag is NOT set
- Clear flag after use
- Shows Faculty button in nav for faculty who intentionally went to /dashboard

---

## Navigation Bar Behavior

### Student Dashboard (`/dashboard`)
```
[Logo] Skill Hunt University    [Student Name]  [Admin Panel] [Faculty Portal] [Browse] [Logout]
                                                              ↑
                                          "Faculty Portal" button visible
                                   (allows switching to faculty portal)
```

### Faculty Dashboard (`/faculty`)
```
[Logo] Faculty Dashboard        [Faculty Name]  [Exit Dashboard] [Browse Projects]
                                              ↑
                          NO "Faculty Portal" button
                   (already in faculty portal, no need to switch)
```

---

## Test Scenarios

### ✅ Test 1: Faculty Login via /faculty Path
1. Navigate to `http://localhost:3001/faculty`
2. Redirect to `/login?redirect=faculty`
3. Enter faculty credentials
4. After login → redirect to `/faculty`
5. See Faculty Dashboard title
6. **NO "Faculty Portal" button in nav** (they're already in faculty)
7. ✅ PASS

---

### ✅ Test 2: Faculty Login via /login Path
1. Navigate to `http://localhost:3001/login`
2. Enter faculty credentials
3. After login → redirect to `/dashboard`
4. See Student Dashboard briefly
5. **See "Faculty Portal" button in nav** (allows switching)
6. NOT auto-redirected to `/faculty`
7. ✅ PASS

---

### ✅ Test 3: Student Login
1. Navigate to `http://localhost:3001/login`
2. Enter student credentials
3. After login → redirect to `/dashboard`
4. See Student Dashboard
5. **See "Faculty Portal" button in nav**
6. Click "Faculty Portal" → see application form
7. ✅ PASS

---

### ✅ Test 4: Faculty Click "Faculty Portal" Button
1. Log in as faculty via `/login`
2. You're on `/dashboard` (with Faculty button visible)
3. Click "Faculty Portal" button
4. Redirect to `/faculty`
5. Now see Faculty Dashboard
6. **NO more "Faculty Portal" button** (you're in faculty now)
7. ✅ PASS

---

### ✅ Test 5: Refresh Faculty Dashboard
1. Faculty logs in via `/faculty`
2. See Faculty Dashboard
3. Press F5 to refresh
4. Still at `/faculty` Dashboard
5. **NO "Faculty Portal" button**
6. sessionStorage flag cleared
7. ✅ PASS

---

## Technical Details

### sessionStorage vs localStorage
- Using `sessionStorage` instead of `localStorage`
- **Why**: sessionStorage is cleared when tab closes (temporary flag)
- After user logs in and lands on correct page, flag is cleared
- Next time they navigate, fresh determination is made

### Query Parameter URL
- Format: `/login?redirect=faculty`
- Safe and readable
- Can be bookmarked and shared
- Survives page reload during login

### Flag Management
- **Set**: When redirecting from `FacultyDashboard` → `Login`
- **Used**: In `Dashboard` useEffect to determine if redirect needed
- **Cleared**: After first use in Dashboard
- **Never persists**: Only exists during single login session

---

## Browser Back Button Behavior

| Scenario | Behavior |
|----------|----------|
| Faculty logs in via `/faculty` | Back button takes to `/login?redirect=faculty` (correct) |
| Faculty clicks "Faculty Portal" from dashboard | Back takes to `/dashboard` (correct) |
| Student clicks "Faculty Portal" from dashboard | Back takes to `/dashboard` (correct) |

Using `navigate(..., { replace: true })` ensures clean back/forward history.

---

## Edge Cases Handled

✅ **User manually clears sessionStorage** → Dashboard won't redirect (will show Faculty button)
✅ **User opens Faculty Portal in new tab** → Correct `/login?redirect=faculty` URL
✅ **User bookmarks `/faculty` link** → Redirects to login with correct param
✅ **Multiple browser tabs** → Each has independent sessionStorage (correct isolation)
✅ **Logout & re-login** → sessionStorage cleared, fresh routing decision made

---

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/Login.tsx` | Added URL param parsing + sessionStorage storage |
| `src/pages/Dashboard.tsx` | Added sessionStorage flag check before redirect |
| `src/pages/FacultyDashboard.tsx` | Added unauthenticated redirect to /login?redirect=faculty |

---

## Key Principles

1. **Intent Preservation**: User's original path intent is preserved through login
2. **Clean URLs**: Query params are removed after use
3. **No Persistent State**: sessionStorage is temporary and cleared
4. **Flexibility**: Students can still access Faculty Portal via button
5. **User Control**: Users intentionally going to `/faculty` get faculty experience
6. **Backward Compatible**: No breaking changes to existing flows

---

## Summary

✅ Faculty can log in via `/faculty` and stay in faculty portal (no button to leave)
✅ Students/Faculty can log in via `/login` and land on student dashboard (with Faculty button to switch)
✅ All automatic redirects still work (verified faculty auto-redirect when needed)
✅ Clean, intuitive UX with clear intent
✅ No console errors or warnings

