# Event Management System - Local Testing Checklist

## ✅ Status: RUNNING

- **Dev Server**: http://localhost:3000
- **Database**: Migration applied successfully
- **Build**: Successful (no errors)

---

## 🧪 Testing Instructions

### Phase 1: Event Creation (Admin)

1. **Navigate to Admin Panel**
   - Go to http://localhost:3000/admin
   - Login as admin user
   - Go to "Events" tab

2. **Create Test Event**
   - Click "Create New Event" button
   - Fill in:
     - Name: "Test Event 2026"
     - Slug: "test-event-2026"
     - Description: "Testing event management system"
     - Status: "registration_open"
     - Registration Start: Today
     - Submission Deadline: 7 days from now
     - Voting Start: 14 days from now
     - Review Deadline: 21 days from now
   - Click Create

3. **Expected Result**
   - ✅ Event appears in Events tab
   - ✅ Shows as card with timeline
   - ✅ Has "REGISTRATION OPEN" badge (date-based)
   - ✅ Displays all deadlines

---

### Phase 2: Multi-Event Registration (Student)

1. **Navigate to Events Page**
   - Go to http://localhost:3000/events
   - Should see:
     - "Active Events" tab (default)
     - "Previous Events" tab
     - "My Registered Events" section (empty initially)

2. **Create Multiple Test Events** (Admin)
   - Repeat Phase 1, creating 2-3 more events
   - Set different phases for each

3. **Register for Multiple Events** (Student)
   - Click "Register for Events" button
   - Modal opens showing:
     - Total events available
     - Selection checkboxes
     - Summary of selected events
   - Select 2+ events
   - Click "Register for X Events"

4. **Verify Registrations**
   - ✅ "My Registered Events" section populates
   - ✅ Each event shows name, status, deadline
   - ✅ Can see multiple events
   - ✅ No duplicate registrations allowed

5. **Dashboard Update**
   - Go to http://localhost:3000/dashboard
   - ✅ See "My Registered Events" section
   - ✅ See "Register for Events" button
   - ✅ Shows all registered events

---

### Phase 3: Event Status Tags (Date-Based)

1. **Create Events with Different Phases**
   - Event 1: Submission Deadline = tomorrow
   - Event 2: Submission Deadline = 7 days ago
   - Event 3: Submission Deadline = 30 days from now

2. **Verify Status Badges**
   - Event 1: Should show "SUBMISSION OPEN" (blue)
   - Event 2: Should show "REVIEW & VOTING" or based on dates (purple)
   - Event 3: Should show "UPCOMING" (gray)

3. **Check Color Coding**
   - ✅ Cyan badge = Registration Open
   - ✅ Blue badge = Submission Open
   - ✅ Purple badge = Review & Voting
   - ✅ Green badge = Results Published
   - ✅ Gray badge = Completed/Upcoming

---

### Phase 4: Event Context Awareness (Faculty)

1. **Faculty Portal**
   - Go to http://localhost:3000/faculty (after faculty login)
   - ✅ Should see event name badge in navigation: "Reviewing: [Event Name]"

2. **Create Test Submission**
   - Student submits a project to one of registered events
   - Faculty goes to /faculty dashboard
   - ✅ Event context badge shows which event

3. **Review Page**
   - Click on project to review
   - Go to http://localhost:3000/review/[projectId]
   - ✅ Event context shown in header
   - ✅ Faculty knows which competition being evaluated

4. **Admin Operations**
   - Go to /admin → Events
   - ✅ Event context shown throughout

---

### Phase 5: Event Lifecycle (Completion)

1. **Publish Event Results**
   - Admin goes to /admin → Leaderboard tab
   - Click "Publish to Public"
   - ✅ Event status changes to "published"
   - ✅ Results become visible

2. **Mark Event Complete**
   - Go back to /admin → Events tab
   - Find published event
   - Click "Complete" button
   - Confirm action
   - ✅ Event moves to "Previous Events" section
   - ✅ Completion timestamp recorded
   - ✅ Event grayed out

3. **Verify Archive**
   - Student goes to /events
   - Click "Previous Events" tab
   - ✅ Completed event appears here
   - ✅ Shows "COMPLETED" badge (gray)

4. **Check Timestamps**
   - Admin can see `completedAt` timestamp
   - ✅ Timestamp is current date/time

---

### Phase 6: API Endpoint Testing

Test the new endpoints using browser console or Postman:

```javascript
// Get active events
await fetch('/api/event/activeEvents')

// Get completed events
await fetch('/api/event/completed')

// Get user registrations
await fetch('/api/event/myRegistrations')

// Register for event
await fetch('/api/event/register', {
  method: 'POST',
  body: JSON.stringify({ eventId: 1 })
})

// Unregister from event
await fetch('/api/event/unregister', {
  method: 'POST',
  body: JSON.stringify({ eventId: 1 })
})

// Get registration count
await fetch('/api/event/registrationCount?eventId=1')
```

**Expected**: All endpoints return 200 OK with proper data

---

### Phase 7: Component Rendering

1. **EventCard Component**
   - Navigate to /events
   - ✅ Event cards display correctly
   - ✅ Status badges show
   - ✅ Register button visible
   - ✅ Responsive on mobile

2. **EventSelectionModal**
   - Click "Register for Events"
   - ✅ Modal opens
   - ✅ All events listed
   - ✅ Checkboxes work
   - ✅ Summary updates
   - ✅ Submit button works

3. **Dashboard Components**
   - Go to /dashboard
   - ✅ "My Registered Events" section renders
   - ✅ Shows correct events
   - ✅ Register button visible

4. **Admin Components**
   - Go to /admin → Events
   - ✅ Event cards display
   - ✅ Completion button shows for published
   - ✅ Timeline information visible

---

### Phase 8: Data Validation

1. **Duplicate Registration Prevention**
   - Try registering for same event twice
   - ✅ System prevents duplicate
   - ✅ Shows "Already registered" message

2. **Deadline Enforcement**
   - Try submitting after submission deadline
   - ✅ System blocks submission
   - ✅ Shows deadline error

3. **Date Calculation**
   - Verify phase status matches dates
   - ✅ Phases update correctly based on current date

---

## 🚀 Test Execution Steps

### Quick Test (15 minutes)

```
1. Create 1 event (Admin)
   - Register for it (Student)
   - Check status badge
   - Complete event (Admin)
   - Verify archive

2. Check home page shows event phase info
3. Check /events page functionality
```

### Complete Test (1 hour)

```
Run through all 8 phases above
```

### Stress Test (Optional)

```
1. Create 10 events
2. Register for all
3. Check performance
4. Verify no database errors
```

---

## 🔍 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Event not showing status badge | Check deadline dates are set |
| Can't register | Ensure logged in and event is public |
| Completion button missing | Ensure event status is "published" |
| Console errors | Check browser console, verify build |
| Database migration failed | Run: npm run db:push again |

---

## 📝 Test Results Template

### Environment
- Node Version: `npm -v`
- OS: Windows
- Browser: Chrome/Edge/Firefox
- Database: PostgreSQL

### Results

**Phase 1: Event Creation**
- [ ] Event created successfully
- [ ] Shows correct status badge
- [ ] Timeline displays properly

**Phase 2: Multi-Event Registration**
- [ ] Can register for multiple events
- [ ] Dashboard shows all registered events
- [ ] No duplicates allowed

**Phase 3: Status Tags**
- [ ] Status badges update automatically
- [ ] Color coding correct
- [ ] Date calculation accurate

**Phase 4: Event Context**
- [ ] Faculty sees event context
- [ ] Admin sees event context
- [ ] Context shown in review page

**Phase 5: Event Lifecycle**
- [ ] Can publish results
- [ ] Can mark complete
- [ ] Event moves to archive
- [ ] Timestamp recorded

**Phase 6: API Endpoints**
- [ ] All endpoints working
- [ ] Proper error handling
- [ ] Correct data returned

**Phase 7: Components**
- [ ] All components render
- [ ] No console errors
- [ ] Responsive design working

**Phase 8: Data Validation**
- [ ] Validation working
- [ ] Error messages clear
- [ ] No data corruption

---

## ✅ Success Criteria

All tests pass when:
- ✅ No TypeScript errors
- ✅ No runtime errors in console
- ✅ All features working as described
- ✅ Database changes applied
- ✅ UI displays correctly
- ✅ Data saved properly
- ✅ No performance issues

---

## 📞 Support

If issues occur:
1. Check browser console for errors
2. Check server logs
3. Review database connection
4. Check .env configuration
5. Verify migration ran (npm run db:push)

---

## 🎯 Next Steps After Testing

1. ✅ Verify all tests pass
2. Document any issues found
3. Fix critical bugs
4. Test edge cases
5. Deploy to staging
6. User acceptance testing
7. Deploy to production

---

**Test Started**: Now
**Status**: Ready to test
**Dev Server**: http://localhost:3000

Happy testing! 🎉
