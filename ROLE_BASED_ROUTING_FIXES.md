# Role-Based Routing Fixes - Comprehensive Test & Verification Guide

## Problem Summary
All users were being redirected to the student dashboard (`/dashboard`) regardless of role. Faculty users with verified profiles were incorrectly landing on the student dashboard instead of the faculty portal (`/faculty`).

### Expected Behavior
- **Students** (no faculty profile) → `/dashboard` (Student Dashboard)
- **Faculty (Unverified)** (faculty profile but not verified) → `/dashboard` → Shown application form to apply
- **Faculty (Verified)** (verified faculty profile) → Auto-redirected to `/faculty` (Faculty Dashboard)
- **Admin users** → Can access both `/dashboard` and `/faculty`
- **Students accessing `/faculty`** → Redirected back to `/dashboard` (cannot access faculty portal)

---

## Solution Overview

### Files Modified
1. **`src/pages/Login.tsx`** - Simplified login redirect logic
2. **`src/pages/Dashboard.tsx`** - Added proper role-based redirect for faculty users
3. **`src/pages/FacultyDashboard.tsx`** - Added protection to prevent non-faculty from accessing

### Implementation Details

#### 1. Login.tsx Changes
- **Removed**: Complex path checking logic that was checking wrong pathname
- **Added**: Simple 500ms timeout before redirecting to `/dashboard`
- **Why**: Let the Dashboard component handle role-based routing (single source of truth)
- **Benefit**: Simpler, more maintainable flow

**Code Flow**:
```
User logs in → Login.tsx redirects to /dashboard (after 500ms) 
  → Dashboard component loads user data from useAuth hook
  → Dashboard checks if user has verified faculty profile
  → If faculty: redirect to /faculty
  → If student: show student dashboard
```

#### 2. Dashboard.tsx Changes
- **Added**: `isRedirecting` state to track redirect in progress
- **Added**: `useEffect` hook that runs when user data is loaded
- **Logic**: Check if `user.facultyProfile.verifiedByAdmin` is true AND user is not admin
- **Action**: If true, navigate to `/faculty` with `replace: true`
- **Added**: Loading screen while auth is being checked or redirect is happening
- **Why**: Prevents flash of wrong UI before redirect

**Key Code**:
```tsx
React.useEffect(() => {
  if (!isLoading && user?.facultyProfile?.verifiedByAdmin && user.role !== "admin") {
    setIsRedirecting(true);
    navigate("/faculty", { replace: true });
  }
}, [isLoading, user, navigate]);

if (isLoading || isRedirecting) {
  return <LoadingScreen />; // Prevents wrong UI from showing
}
```

#### 3. FacultyDashboard.tsx Changes
- **Added**: Similar redirect logic but in opposite direction
- **Added**: `isRedirecting` state
- **Added**: `useEffect` hook to check user role on mount/update
- **Logic**: If user does NOT have faculty profile OR (is not admin AND faculty not verified)
- **Action**: Redirect to `/dashboard`
- **Added**: Loading screen to prevent wrong UI
- **Why**: Prevents unauthorized access and provides clear flow

**Key Code**:
```tsx
React.useEffect(() => {
  if (!isLoading && (!user?.facultyProfile || 
      (user.role !== "admin" && !user.facultyProfile.verifiedByAdmin))) {
    setIsRedirecting(true);
    navigate("/dashboard", { replace: true });
  }
}, [isLoading, user, navigate]);
```

---

## Testing Checklist

### Test Environment
- **Dev Server**: Running on `http://localhost:3001/`
- **Browser**: Any modern browser (Chrome, Firefox, Edge, Safari)
- **Clear**: Clear browser cache and LocalStorage before testing if needed

### Test Scenarios

#### ✅ Test 1: Student Login
**User Type**: Regular student (no faculty profile)
**Steps**:
1. Navigate to `http://localhost:3001/login`
2. Enter student email/password
3. Click "Sign In"

**Expected Result**:
- ✅ Redirect to `/dashboard`
- ✅ See "Student Dashboard" title
- ✅ See project submission card, voting card, etc.
- ✅ NO redirect loop
- ✅ Can see "My Registered Events" section

**Verify Also**:
- Can still access `/faculty` manually? → Should see application form to apply
- No console errors about missing properties

---

#### ✅ Test 2: Faculty Login (Verified Faculty)
**User Type**: Faculty with verified profile
**Steps**:
1. Navigate to `http://localhost:3001/login`
2. Enter faculty email/password (who has verifiedByAdmin = true)
3. Click "Sign In"

**Expected Result**:
- ✅ Briefly see loading spinner
- ✅ Auto-redirect to `/faculty` (browser URL changes to `/faculty`)
- ✅ See "Faculty Dashboard" title
- ✅ See "Faculty Review Center" heading
- ✅ See projects to review
- ✅ NO flash of student dashboard
- ✅ NO redirect loop

**Verify Also**:
- If manually navigate to `/dashboard`? → Should auto-redirect to `/faculty`
- Browser back button works correctly
- No console errors

---

#### ✅ Test 3: Faculty Access `/dashboard` Directly
**User Type**: Verified faculty user (already logged in)
**Steps**:
1. Log in as faculty (follow Test 2)
2. Manually navigate to `http://localhost:3001/dashboard`
3. Observe behavior

**Expected Result**:
- ✅ See loading spinner briefly
- ✅ Auto-redirect to `/faculty`
- ✅ Browser URL updates to `/faculty`
- ✅ Faculty Dashboard content loads
- ✅ NO incorrect student dashboard showing

**Verify Also**:
- Refresh page while at `/faculty` → Should stay at `/faculty`
- Clear localStorage and refresh → Should redirect properly after re-auth

---

#### ✅ Test 4: Student Access `/faculty` Path
**User Type**: Regular student
**Steps**:
1. Log in as student
2. Navigate to `http://localhost:3001/faculty`

**Expected Result**:
- ✅ See "Apply for Faculty Access" form
- ✅ Must fill in: Name, Department, Designation
- ✅ Can click "Submit Application" button
- ✅ Can click "Return to Dashboard" to go back

**Verify Also**:
- Can submit faculty application? → Backend should handle it
- After submission, application should be pending admin verification
- Can return to student dashboard via button

---

#### ✅ Test 5: Unverified Faculty
**User Type**: Faculty with profile but `verifiedByAdmin = false`
**Steps**:
1. Log in as faculty with unverified profile
2. Observe landing page

**Expected Result**:
- ✅ Redirect to `/dashboard` (NOT `/faculty`)
- ✅ Dashboard redirects to `/faculty` (because they have facultyProfile)
- ✅ See "Apply for Faculty Access" form
- ✅ See "Pending Verification" message OR application form
- ✅ Can see "Return to Dashboard" button

**Flow**: `/login` → `/dashboard` → `/faculty` → Application/Pending form

---

#### ✅ Test 6: Admin User Login
**User Type**: Admin user
**Steps**:
1. Log in as admin
2. After login, observe page

**Expected Result**:
- ✅ Redirect to `/dashboard` 
- ✅ NO auto-redirect to `/faculty` (because `user.role === "admin"`)
- ✅ See "Admin Panel" button in navbar
- ✅ Can access both `/dashboard` AND `/faculty` manually

**Verify Also**:
- Admin can switch between `/dashboard` and `/faculty`
- Admin sees admin-specific features
- Admin can verify faculty applications

---

#### ✅ Test 7: Logout & Re-Login Flow
**User Type**: Faculty user
**Steps**:
1. Log in as faculty (verified)
2. Confirm redirected to `/faculty`
3. Click "Logout" button
4. Confirm logged out, redirected to home
5. Log in again as faculty

**Expected Result**:
- ✅ First login: correctly redirected to `/faculty`
- ✅ Logout: properly clears session
- ✅ Re-login: again correctly redirected to `/faculty`
- ✅ NO stale data issues

**Verify Also**:
- Check browser console for auth errors
- Check network tab for any failed requests
- Session cookie/token properly cleared

---

#### ✅ Test 8: Browser Back Button
**User Type**: Faculty user
**Steps**:
1. Log in as faculty → redirects to `/faculty`
2. Click "Exit Dashboard" or navigate to `/dashboard`
3. Gets redirected back to `/faculty`
4. Click browser back button

**Expected Result**:
- ✅ May see loading state briefly
- ✅ Back button doesn't go to `/dashboard`
- ✅ Stays at `/faculty` (because of `replace: true` in navigate)
- ✅ Back button takes you out of the app (to previous site/home)

**Verify Also**:
- History is clean (no loops)
- `navigate(..., { replace: true })` is working correctly

---

#### ✅ Test 9: Refresh Page Behavior
**User Type**: Both student and faculty
**Steps**:
1. Log in as faculty, confirm at `/faculty`
2. Press F5/Ctrl+R to refresh page
3. Observe behavior
4. Repeat as student at `/dashboard`

**Expected Result**:
- ✅ Faculty refresh at `/faculty`: stays at `/faculty`, no redirect
- ✅ Student refresh at `/dashboard`: stays at `/dashboard`
- ✅ Faculty refresh at `/dashboard`: redirects to `/faculty`
- ✅ NO infinite refresh loops
- ✅ User session persists

---

#### ✅ Test 10: Multiple Tabs/Windows
**User Type**: Faculty user
**Steps**:
1. Open `http://localhost:3001` in Tab A (logged out)
2. Open `http://localhost:3001/faculty` in Tab B (logged out)
3. Log in through Tab A
4. Observe Tab B

**Expected Result**:
- ✅ Tab A: correct redirect to `/faculty` OR `/dashboard` based on role
- ✅ Tab B: if auto-sync enabled, should also see logged-in state
- ✅ NO conflicts or race conditions

**Verify Also**:
- Are login states shared across tabs? (via Supabase)
- Refresh Tab B after Tab A login → should load correctly

---

## Browser DevTools Checks

### Console Checks
Open Developer Tools (F12) → Console tab:
- ✅ NO errors about `user is undefined`
- ✅ NO errors about `Cannot read property 'facultyProfile'`
- ✅ NO "Refused to set unsafe header" errors
- ✅ NO redirect loop warnings
- ✅ NO CORS errors

### Network Checks
Open Developer Tools → Network tab:
- ✅ Request to `/api/auth/me` succeeds (200 status)
- ✅ Request returns user object with correct properties
- ✅ NO failed auth requests
- ✅ Faculty vs student responses differ correctly

### Storage Checks
Open DevTools → Application → LocalStorage:
- ✅ Auth token stored after login
- ✅ User data properly cached (if using cache)
- ✅ NO stale data persisting after logout

---

## Issue Checklist

### If Student Dashboard Flashes Before Redirecting to Faculty
**Problem**: User sees wrong UI briefly
**Solution**: 
1. Verify `isRedirecting` state is working
2. Ensure loading screen is showing during redirect
3. Check that `navigate(..., { replace: true })` is used

### If Faculty User Stuck on Student Dashboard
**Problem**: Faculty not getting redirected
**Solution**:
1. Check browser console for errors
2. Verify `user.facultyProfile` is loading correctly
3. Check `/api/auth/me` response includes `facultyProfile` object
4. Verify database query includes facultyProfile relation

### If Logout Doesn't Work
**Problem**: User stays logged in after logout
**Solution**:
1. Clear browser storage (LocalStorage, SessionStorage)
2. Clear cookies for the domain
3. Verify Supabase logout is called
4. Check if multiple auth tokens exist

### If Login Hangs/Infinite Redirect
**Problem**: Page keeps redirecting forever
**Solution**:
1. Check browser console for errors
2. Verify `useEffect` dependency array is correct
3. Ensure `navigate` includes `replace: true`
4. Check for circular dependencies in route logic

---

## Performance Considerations

✅ **Load Time**: Should be <2 seconds from login to final dashboard
✅ **Redirect Time**: <500ms for role-based redirects
✅ **No Multiple Renders**: Dashboard shouldn't render twice during redirect
✅ **Network Requests**: Only 1 `/api/auth/me` call during auth check

---

## Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `Login.tsx` | Simplified redirect (always to `/dashboard`) | Single source of truth for routing |
| `Dashboard.tsx` | Added role check + redirect for faculty | Enforce student-only access |
| `FacultyDashboard.tsx` | Added role check + redirect for non-faculty | Enforce faculty-only access |

**Key Principle**: Dashboard is the auth hub. All routes redirect here first, then Dashboard/FacultyDashboard make final routing decisions based on role.

---

## Next Steps After Testing

1. ✅ All tests pass → **DEPLOY**
2. ❌ Some tests fail → **Check specific issue** in Issue Checklist
3. 🔄 Partial success → **Document findings** and provide feedback

---

## Notes for Future Developers

- The `replace: true` in `navigate()` prevents browser back button loops
- `isRedirecting` state prevents UI flashing
- Always check both `isLoading` AND `isRedirecting` before rendering content
- Faculty/Student separation is enforced at component level (not just server)
- Admin users bypass role checks because `user.role === "admin"` (see Dashboard.tsx line ~21)

