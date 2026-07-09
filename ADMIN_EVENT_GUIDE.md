# Admin Event Management Guide

## Overview

This guide explains how to manage events in the Skill Hunt platform, from creation through completion, with emphasis on date-based phase management and lifecycle control.

## Event Lifecycle

### 1. Creating an Event

Navigate to **Admin → Events tab** and click **Create New Event**.

#### Required Fields:
- **Event Name**: Display name (e.g., "CS Project Showcase 2026")
- **Slug**: URL-friendly identifier (e.g., "cs-showcase-2026")
- **Description**: Event details and objectives
- **Status**: Initial status (usually "draft")

#### Optional Timeline Fields:
- **Registration Start**: When students can register
- **Submission Deadline**: When to stop accepting project submissions
- **Voting Start**: When peer voting begins
- **Review Deadline**: When faculty reviews must be submitted

### 2. Event States

```
Draft → Registration Open → Submission Open → 
Review & Voting Open → Results Ready → Published → Archived
```

| State | Meaning | Actions Available |
|-------|---------|-------------------|
| **draft** | Event created, not visible | Edit all fields |
| **registration_open** | Students can register | Edit, set submission deadline |
| **submission_open** | Projects can be submitted | Edit, monitor submissions |
| **review_and_voting_open** | Faculty reviewing, voting open | Monitor progress |
| **results_ready** | Scoring complete, ready to publish | Review leaderboard, publish |
| **published** | Results public, event active | View stats, mark complete |
| **archived** | Event completed and archived | View-only mode |

### 3. Automatic Phase Detection

**Important**: Event phases automatically update based on current date and configured deadlines. You don't need to manually change the status for each phase.

#### How It Works:
```
Now < Submission Deadline  →  Show "SUBMISSION OPEN"
Submission Deadline ≤ Now < Review Deadline  →  Show "REVIEW & VOTING"
Now ≥ Review Deadline  →  Show "RESULTS PENDING"
Status = "published"  →  Show "RESULTS PUBLISHED"
isCompleted = true  →  Show "COMPLETED"
```

### 4. Configuring Timelines

When creating/editing an event, set these dates:

**Example Timeline for 8-Week Event:**

```
Week 0 (Today):
- Registration Start: Jan 1, 2026

Week 2:
- Submission Deadline: Jan 15, 2026 (11:59 PM)

Week 6:
- Review Deadline: Mar 1, 2026 (11:59 PM)

Week 7:
- Publish Results: Mar 8, 2026

Week 8:
- Mark Event as Completed
```

### 5. Publishing Results

Once all reviews and voting are complete:

1. Go to **Admin → Leaderboard tab**
2. Click **Recompute All** to recalculate scores
3. Review results for accuracy
4. Click **Publish to Public** 
5. Results become visible to students at `/leaderboard`

### 6. Marking Events as Complete

After publishing results:

1. Go to **Admin → Events tab**
2. Find the published event
3. Click **Complete** button
4. Event moves to "Previous Events" list automatically
5. Timestamp recorded in `completedAt`

## Date-Based Status Tags

The system automatically assigns status tags based on current date and event deadlines:

### Status Tags

| Tag | Color | Trigger | Action |
|-----|-------|---------|--------|
| REGISTRATION OPEN | Cyan | Now ≥ registrationStart & Now < submissionDeadline | Students register |
| SUBMISSION OPEN | Blue | Now < submissionDeadline | Students submit projects |
| REVIEW & VOTING | Purple | submissionDeadline ≤ Now < reviewDeadline | Faculty reviews, voting active |
| RESULTS PENDING | Amber | status = results_ready | Scores computed, not published |
| RESULTS PUBLISHED | Green | status = published | Leaderboard visible |
| COMPLETED | Gray | isCompleted = true | Event archived |
| UPCOMING | Gray | Future event | Not yet started |

### Key Point
**Deadlines are Critical**: Ensure all dates are set correctly. The system uses these to:
- Display current phase automatically
- Lock submissions after deadline
- Trigger review phases
- Calculate progress indicators

## Event Dashboard Monitoring

### Quick Stats (Dashboard Tab)

Monitor these metrics in real-time:

```
┌─────────────────────────────────────────┐
│ Active Event: CS Project Showcase 2026  │
├─────────────────────────────────────────┤
│ 125 Projects | 48 Reviews | 890 Votes   │
└─────────────────────────────────────────┘
```

### Events Tab Overview

For each event card, see:
- **Event name & description**
- **Current status badge**
- **Registration & submission dates**
- **Completion date** (if completed)
- **Edit button** (disabled for completed events)
- **Complete button** (for published events)

### Analytics Dashboard (Future)

Monitor comprehensive metrics:
- Registration trends over time
- Submission rate and timeline
- Faculty review progress
- Voting engagement
- Department & category distribution
- Completion rate indicators

## Multi-Event Registration

### Managing Multiple Events

Students can register for multiple concurrent events:

1. View `/events` page
2. See "My Registered Events" section
3. Each registered event shows:
   - Event name and status
   - Submission deadline
   - Project status for that event

### Admin Monitoring

Monitor registrations:

1. Go to **Admin → Events tab**
2. Each event card shows registration count
3. Registrations automatically tracked in database

### Bulk Operations (Future)

Planned features:
- Notify all registered students
- Export registration list
- View registration trends
- Capacity limits per event

## Faculty Review Management

### Tracking Reviews

In **Admin → Evaluations tab**, monitor:
- Which faculty reviewed which project
- Weighted scores calculated
- Review submission status (draft vs submitted)
- Timestamp of each review

### Review Deadlines

Ensure faculty know:
- Review deadline clearly shown on their dashboard
- Event context visible when reviewing
- Scoring guidance in rubric
- Progress tracking on faculty portal

### Conflict Management

The system prevents faculty from reviewing:
- Their own projects
- Projects by students they mentor
- Projects flagged with conflicts

## Voting Management

### Peer Voting Setup

To enable peer voting:

1. Set `votingStartAt` date in event
2. Event automatically moves to "REVIEW & VOTING" phase
3. Students can vote for projects (except their own)
4. Each student gets one vote per event

### Monitoring Votes

In **Admin → Voting tab**, see:
- Which student voted for which project
- Vote timestamps
- Total vote count per project
- Engagement metrics

### Vote Transfers

If a student changes their vote:
- Previous vote recorded in history
- New vote recorded
- Vote history maintained for transparency

## Event Communications

### Student Notifications (Email)

When events reach key milestones:
- **Event Created**: Event is now open for registration
- **Submission Opens**: Start submitting projects
- **Submission Deadline (24h)**: Reminder to submit
- **Review Phase Starts**: Evaluation beginning
- **Results Published**: See your ranking

### Faculty Notifications

- **Event Created**: Faculty can now review projects
- **Assignment Details**: Which projects to review
- **Review Deadline (24h)**: Reminder to complete
- **Review Phase Complete**: All reviews received

## Event Analytics & Reporting

### Key Metrics to Track

**Engagement:**
- Total registrations
- Submission rate (submitted / registered × 100)
- Review completion rate (completed / required × 100)
- Voting engagement (voters / participants × 100)

**Quality:**
- Average review score
- Vote distribution
- Project categories
- Department participation

**Timeline:**
- Submissions by day
- Reviews by day
- Final ranking stability

### Export Reports

Use **Admin → Leaderboard → Export CSV** to:
- Generate final results
- Share with stakeholders
- Archive event data
- Analyze participation

## Troubleshooting

### Issue: Event status not changing to next phase

**Cause**: Deadline might not be set correctly
**Solution**: 
1. Edit event
2. Verify dates are correct and in future/past as needed
3. Ensure dates are in proper format
4. Save and refresh

### Issue: Students can still submit after deadline

**Cause**: Submission deadline not reached yet or deadline not set
**Solution**:
1. Check current date vs deadline
2. Verify deadline is set to past date to close submissions
3. Manually update event status if needed

### Issue: Faculty can't access project to review

**Cause**: Conflict detected or faculty not verified
**Solution**:
1. Check for conflicts in database
2. Verify faculty is approved by admin
3. Ensure faculty profile is complete
4. Remove conflict if necessary

### Issue: Leaderboard shows zero scores

**Cause**: Reviews not submitted or recompute hasn't run
**Solution**:
1. Check if reviews are in "draft" vs "submitted"
2. Click "Recompute All" in leaderboard tab
3. Wait for calculation to complete
4. Refresh page

### Issue: Can't mark event as complete

**Cause**: Event not in "published" status
**Solution**:
1. Ensure event status is "published"
2. Results must be published first
3. Use "Publish to Public" button
4. Then "Complete" button becomes available

## Best Practices

### Timeline Planning

1. **Set realistic durations**: 
   - 2-3 weeks for submissions
   - 2-3 weeks for reviews
   - 1 week for voting (parallel with reviews)

2. **Coordinate with stakeholders**:
   - Notify faculty of review schedule
   - Alert students of deadlines
   - Set calendar reminders

3. **Buffer time**:
   - Add extra days for unexpected delays
   - Account for weekends/holidays
   - Final day for edge cases

### Communication

1. **Before event starts**:
   - Announce event timeline
   - Share registration deadline
   - Provide submission guidelines

2. **During event**:
   - Send deadline reminders
   - Answer student questions
   - Monitor progress

3. **After publication**:
   - Celebrate winners
   - Share learnings
   - Archive for future reference

### Quality Control

1. **Before publishing**:
   - Recompute scores
   - Review top projects
   - Check for anomalies
   - Verify submission quality

2. **After publishing**:
   - Monitor feedback
   - Document issues
   - Plan improvements
   - Archive data

## Advanced Features

### Event Themes (Future)
- Brand events with custom colors/logos
- Create event categories
- Link related events

### Recurring Events
- Template popular events
- Quick cloning of past events
- Duplicate rubrics and criteria

### Integration
- Calendar sync (iCal export)
- Email reminders
- Slack notifications
- External platform sync

## Reference

### Database Schema

```sql
-- Events table
events {
  id: number
  name: string
  slug: string (unique)
  description: text
  status: enum (draft, registration_open, submission_open, review_and_voting_open, results_ready, published, archived)
  isActive: boolean
  isPublic: boolean
  isCompleted: boolean
  registrationStartAt: timestamp
  submissionDeadline: timestamp
  votingStartAt: timestamp
  reviewDeadline: timestamp
  resultsPublishedAt: timestamp
  completedAt: timestamp
}

-- Event registrations
event_registrations {
  id: number
  userId: bigint
  eventId: bigint
  registeredAt: timestamp (unique per user+event)
}
```

### API Endpoints

```
GET  /api/event/list              - All events
GET  /api/event/active            - Currently active event
GET  /api/event/activeEvents      - All non-completed public events
GET  /api/event/completed         - All completed/archived events
GET  /api/event/registrationCount - Registration count for event
POST /api/event/create            - Create new event (admin)
PUT  /api/event/update            - Update event (admin)
POST /api/event/complete          - Mark event completed (admin)
```

## Quick Checklist

### Creating New Event
- [ ] Set event name and slug
- [ ] Write description
- [ ] Set registration start date
- [ ] Set submission deadline
- [ ] Set review deadline (optional)
- [ ] Set voting start date (optional)
- [ ] Create rubric criteria if needed
- [ ] Make event public
- [ ] Announce to community

### Before Publishing Results
- [ ] Verify all reviews submitted
- [ ] Check faculty review count meets minimum
- [ ] Click "Recompute All" scores
- [ ] Review top 10 projects
- [ ] Look for anomalies
- [ ] Confirm voting results
- [ ] Click "Publish to Public"

### Post-Publication
- [ ] Notify students results available
- [ ] Share leaderboard link
- [ ] Celebrate winners
- [ ] Collect feedback
- [ ] Mark event as "Completed"
- [ ] Archive data
- [ ] Plan next event

## Support & Feedback

For issues or feature requests:
1. Check this guide
2. Review error logs
3. Contact development team
4. Submit issue with details
