# Skill Hunt University

A full-stack CS Project Showcase & Judging Platform for university-level project exhibitions. Students submit projects, faculty evaluates them using weighted rubrics, students cast peer votes, and final results are published to a public leaderboard.

## Features

### Core Workflows
- **Student Registration & Submission** — Students register with college email, submit projects with GitHub URLs, live previews, and team info
- **Faculty Review** — Faculty evaluate projects using a configurable weighted rubric with 6 criteria (Innovation, Technical Depth, Code Quality, UI/UX, Documentation, Live Demo)
- **Peer Voting** — Each student casts exactly one transferable vote per event, cannot vote for own team
- **Score Computation** — Faculty scores use designation-weighted averages; peer scores are normalized; final score uses configurable faculty/peer split (default 85/15)
- **Results Publication** — Admin publishes results; public leaderboard shows ranked projects with People's Choice badge

### Pages (12 Required)
1. **Public Landing Page** — Hero, event info, featured projects, top leaderboard preview
2. **Registration & Login** — OAuth 2.0 via Kimi auth
3. **Student Dashboard** — Project status, vote status, results, timeline
4. **Project Submission Form** — Create/edit with validation
5. **Project Browse** — Searchable, filterable grid with voting
6. **Project Detail** — Full project info, GitHub stats, reviews, vote action
7. **Faculty Review Page** — Rubric evaluation with live score, draft/submit
8. **Peer Voting** — Vote/move vote with confirmation
9. **Public Leaderboard** — Ranked projects, People's Choice, scoring explanation
10. **Student Results** — Score breakdown, faculty comments, criterion analysis
11. **Admin Panel** — Dashboard, user management, faculty verification, score recomputation, publication control
12. **Empty States** — Polished empty states throughout

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: tRPC 11 + Hono + Drizzle ORM + MySQL
- **Auth**: OAuth 2.0 with JWT sessions (Kimi auth)
- **Database**: Drizzle ORM with MySQL (PlanetScale-compatible)

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL database (or TiDB Cloud)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
# .env is auto-generated with credentials

# Push database schema
npm run db:push

# Seed demo data
npx tsx db/seed.ts

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=mysql://user:pass@host:port/db
VITE_APP_ID=your_app_id
VITE_KIMI_AUTH_URL=https://auth.kimi.com
APP_SECRET=your_app_secret
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com
OWNER_UNION_ID=admin_union_id
```

## Scoring Engine

### Faculty Designation Weights
| Designation | Weight |
|------------|--------|
| Vice Chancellor | 10 |
| Dean | 8 |
| HOD | 6 |
| Professor | 5 |
| Associate Professor | 4 |
| Assistant Professor | 3 |

### Rubric Criteria (Default)
| Criterion | Weight |
|-----------|--------|
| Innovation / Originality | 20% |
| Technical Depth | 25% |
| Code Quality | 20% |
| UI / UX | 15% |
| Documentation | 10% |
| Working Live Demo | 10% |

### Score Formulas
```
Review Score = sum(score * criterion_weight) / sum(weights) * 10
Faculty Score = sum(reviewScore * designationWeight) / sum(designationWeights)
Peer Score = (projectVotes / maxVotesInEvent) * 100
Final Score = facultyScore * facultyWeight% + peerScore * peerPeer%
```

### Rank Eligibility
- Minimum 3 faculty reviews required to be ranked
- Tie-breaking: finalScore desc, facultyScore desc, peerScore desc, submittedAt asc

## Database Schema

### Core Tables
- `users` — Accounts with roles (user/admin)
- `student_profiles` — Student metadata
- `faculty_profiles` — Faculty with designation, verification status
- `events` — Event lifecycle management
- `projects` — Project submissions with GitHub/preview URLs
- `faculty_reviews` — Rubric-based reviews
- `peer_votes` — One vote per student per event
- `project_score_snapshots` — Computed score cache

### Supporting Tables
- `rubric_criteria`, `event_score_configs`, `designation_weights`
- `project_team_members`, `project_tags`, `project_screenshots`
- `faculty_review_scores`, `peer_vote_history`
- `project_faculty_conflicts`, `preview_checks`, `github_sync_logs`
- `notifications`

## API Endpoints (tRPC Routers)

| Router | Key Procedures |
|--------|---------------|
| `event` | list, active, create, update, publishResults, recomputeScores |
| `project` | list, byId, create, update, myProject, syncGithub, recheckPreview |
| `review` | submit, byProject, forFaculty, reviewableProjects, getRubric |
| `vote` | cast, myVote, counts |
| `leaderboard` | public, preview, myResults |
| `admin` | users, updateUser, verifyFaculty, recomputeScores, exportLeaderboard |

## Testing

```bash
# Run unit tests
npm run test

# Tests cover:
# - Review weighted score calculation
# - Faculty designation-weighted average
# - Peer normalization
# - Final score computation
# - People's Choice determination
```

## Project Structure

```
src/
  pages/          — Route-level pages (12 pages)
  components/ui/  — shadcn/ui components
  hooks/          — useAuth hook
  providers/      — tRPC provider
  const.ts        — Constants

api/
  services/       — Business logic (event, project, review, vote, leaderboard)
  services/scoring/ — Scoring engine modules
  queries/        — Database query layer
  middleware.ts   — tRPC procedures (publicQuery, authedQuery, adminQuery)
  router.ts       — tRPC router aggregation
  context.ts      — Auth context

db/
  schema.ts       — Full Drizzle schema (25+ tables)
  relations.ts    — Drizzle relations
  seed.ts         — Demo data seed script

contracts/
  constants.ts    — Shared constants
  errors.ts       — Error types
```

## Supabase Migration Path

To connect to Supabase Postgres instead of MySQL:
1. Update `DATABASE_URL` in `.env` to your Supabase Postgres URL
2. Replace `drizzle-orm/mysql-core` with `drizzle-orm/pg-core` in schema
3. Replace `mysql2` driver with `postgres` in connection.ts
4. Run `npm run db:push` to sync schema

No frontend or API changes needed.

## License
MIT
