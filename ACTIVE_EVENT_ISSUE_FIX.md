# Active Event Not Showing - Fix Guide

## Problem
After creating a new event "Spring Hackathon", it's not showing as the active event. The old "CS Project Showcase 2026" is still showing even though it was marked as completed.

## Root Cause
Events have an `isActive` flag in the database. When you:
1. Created "Spring Hackathon" - it was created with `isActive = false` (default)
2. Marked "CS Project Showcase 2026" as complete - it set `isActive = false`
3. Result: **NO event has `isActive = true`** → System falls back to old event

## Solution

### Step 1: Access Admin Panel on Correct Port
**IMPORTANT**: Make sure you're on the correct server port!
- ✅ **USE**: `http://localhost:3001/admin`
- ❌ **DON'T USE**: `http://localhost:3000/admin` (old server)

### Step 2: Set Spring Hackathon as Active
1. In Admin panel, go to "Events" section
2. Find "Spring Hackathon" event card
3. Click "Edit" button
4. Look for "Active" toggle/checkbox
5. **Set `isActive` to `true`**
6. Click "Save" or "Update"

### Step 3: Verify
1. Refresh the homepage (`http://localhost:3001/`)
2. Active event should now show "Spring Hackathon"
3. Dashboard should show "Spring Hackathon" details
4. All pages should reference the new active event

---

## Understanding Event States

### Event Flags
| Flag | Purpose | Values |
|------|---------|--------|
| `isActive` | Marks THE active event users interact with | `true` / `false` |
| `isPublic` | Controls visibility to users | `true` / `false` |
| `isCompleted` | Marks event as finished/archived | `true` / `false` |
| `status` | Event workflow stage | `draft`, `registration_open`, `submission_open`, etc. |

### Only ONE Event Should Be Active
- Only **ONE** event can have `isActive = true` at a time
- When you set a new event as active, the system should auto-deactivate others
- The `getActiveEvent()` query finds the event where `isActive = true`

---

## Common Issues

### Issue 1: Wrong Port
**Symptom**: Changes not appearing
**Fix**: Ensure you're on `http://localhost:3001/` not `3000`

### Issue 2: Multiple Active Events
**Symptom**: Wrong event showing
**Fix**: Check database, ensure only ONE event has `isActive = true`

### Issue 3: Event Not Public
**Symptom**: Active event set but still not showing
**Fix**: Also set `isPublic = true` on the event

---

## Quick Database Check (Optional)

If you have database access, you can check/fix directly:

```sql
-- Check which events are active
SELECT id, name, isActive, isPublic, isCompleted, status 
FROM events;

-- Deactivate all events
UPDATE events SET isActive = false;

-- Activate Spring Hackathon (replace ID)
UPDATE events SET isActive = true WHERE name = 'spring hackathon';

-- Also make it public if needed
UPDATE events SET isPublic = true WHERE name = 'spring hackathon';
```

---

## Prevention

When creating a new event and completing an old one:
1. **Complete old event** - Sets `isActive = false`, `isCompleted = true`
2. **Create new event** - Created with `isActive = false` by default
3. **Edit new event** - Manually set `isActive = true`

**Future Enhancement**: Add a "Set as Active" button directly on event cards to make this one-click.

---

## Current Status

✅ Code changes complete (Faculty button removal, user type signup)
✅ Dev server running on port 3001
❌ Spring Hackathon needs to be set as active
❌ Old port 3000 server has been stopped

**Next Step**: Set Spring Hackathon as active in Admin panel.

