# Event Management System - Quick Start Guide

## 🚀 Quick Setup

### 1. Apply Database Migration
```bash
npm run db:push
```

This will add:
- `event_registrations` table for multi-event registration
- `isCompleted` and `completedAt` columns to events table

### 2. Access New Features

| Feature | URL | User Role |
|---------|-----|-----------|
| Events Listing | `/events` | All users |
| Multi-Event Registration | `/events` | Authenticated |
| Event Management | `/admin` → Events tab | Admin |
| Event Context (Faculty) | `/faculty` | Faculty |
| Event Context (Review) | `/review/:projectId` | Faculty |

## 📅 Event Status Tags (Date-Based)

Events automatically show their current phase based on dates:

| Status Badge | Condition | Color | Icon |
|--------------|-----------|-------|------|
| **REGISTRATION OPEN** | Before submission deadline | Cyan | Users |
| **SUBMISSION OPEN** | Before submission deadline | Blue | Upload |
| **REVIEW & VOTING** | Between submission & review deadline | Purple | Eye |
| **RESULTS PENDING** | After review, before publish | Amber | Clock |
| **RESULTS PUBLISHED** | Status = published | Green | Trophy |
| **COMPLETED** | Event archived | Gray | Check |
| **UPCOMING** | Not yet started | Gray | Calendar |

## 🎯 Key Features

### For Students
```typescript
// Register for an event
trpc.event.register.mutate({ eventId: 123 })

// Unregister from an event
trpc.event.unregister.mutate({ eventId: 123 })

// Get my registered events
trpc.event.myRegistrations.useQuery()
```

### For Faculty
- Event name badge shown in navigation when reviewing
- Always know which competition you're evaluating
- Clear context maintained throughout review process

### For Admins
```typescript
// Mark event as completed (moves to "Previous Events")
trpc.event.update.mutate({ 
  id: eventId, 
  isCompleted: true,
  status: "archived"
})
```

## 🎨 Component Usage

### EventCard Component
```tsx
import { EventCard } from "@/components/EventCard";

// Full card with registration
<EventCard 
  event={event} 
  showRegistration={true} 
/>

// Compact card without registration
<EventCard 
  event={event} 
  compact={true}
/>
```

## 📊 Event Lifecycle

```
draft → registration_open → submission_open → 
review_and_voting_open → results_ready → published → archived
```

### Timeline Setup (Admin)
1. Create event with proper dates:
   - `registrationStartAt`: When registration opens
   - `submissionDeadline`: Last date for submissions
   - `votingStartAt`: When peer voting begins
   - `reviewDeadline`: Last date for reviews

2. Status badges automatically update based on current date

3. Mark as completed when done:
   - Click "Complete" button in Admin → Events tab
   - Event moves to "Previous Events" automatically

## 🔄 API Endpoints

### Event Registration
```typescript
// GET /api/event/activeEvents
// Returns all non-completed public events

// GET /api/event/completed  
// Returns archived events

// GET /api/event/myRegistrations
// Returns user's registered events

// POST /api/event/register
{ eventId: number }

// POST /api/event/unregister
{ eventId: number }

// GET /api/event/registrationCount
{ eventId: number }
```

## 💡 Pro Tips

1. **Auto Phase Detection**: Set event deadlines properly - phases auto-update!
2. **Multiple Events**: Students can register for as many events as they want
3. **Event Context**: Faculty always see which event they're reviewing
4. **Clean Archive**: Complete events to keep active list manageable
5. **Registration Tracking**: Monitor registrations per event in real-time

## 🎭 User Flows

### Student Registration Flow
1. Visit `/events` page
2. Browse Active Events tab
3. Click "Register" on desired events
4. See registered events at top of page
5. Navigate to dashboard to submit projects

### Faculty Review Flow
1. Login as faculty
2. Go to `/faculty` dashboard
3. See current event name in navigation badge
4. Click project to review
5. Event context maintained on review page
6. Submit review with full context awareness

### Admin Completion Flow
1. Go to `/admin` → Events tab
2. Find published event
3. Click "Complete" button
4. Confirm action
5. Event moves to "Previous Events" automatically
6. Completed timestamp recorded

## 🛠️ Troubleshooting

### Issue: Event status not updating
**Solution**: Check that dates are properly set in event configuration

### Issue: Can't register for event
**Solution**: Ensure user is authenticated and event is public

### Issue: Completed event still showing as active
**Solution**: Verify `isCompleted` flag is set to true in database

### Issue: Registration count not showing
**Solution**: Check that `event_registrations` table exists (run migration)

## 📝 Database Schema Reference

```sql
-- Event Registrations
CREATE TABLE event_registrations (
  id SERIAL PRIMARY KEY,
  userId BIGINT NOT NULL REFERENCES users(id),
  eventId BIGINT NOT NULL REFERENCES events(id),
  registeredAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, eventId)
);

-- Events (new columns)
ALTER TABLE events ADD COLUMN
  isCompleted BOOLEAN DEFAULT FALSE,
  completedAt TIMESTAMP;
```

## 🎓 Best Practices

1. **Set Realistic Deadlines**: Give enough time for each phase
2. **Complete Events Promptly**: Archive events after results published
3. **Monitor Registrations**: Track engagement metrics
4. **Maintain Context**: Use event badges for clarity
5. **Test Phase Transitions**: Verify dates trigger correct statuses

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review `IMPLEMENTATION_SUMMARY.md` for technical details
3. Examine event service code in `server/services/event.service.ts`
4. Check component implementations in `src/components/EventCard.tsx`
