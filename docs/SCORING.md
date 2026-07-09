# Scoring Engine Documentation

## Overview

The Skill Hunt University scoring engine computes project rankings through a transparent, configurable multi-step process combining faculty evaluations with peer voting.

## Faculty Score Computation

### 1. Individual Review Score

Each faculty member evaluates a project across 6 rubric criteria, scoring each from 1-10.

```
Review Score = SUM(criterion_score * criterion_weight%) / SUM(criterion_weights) * 10
```

The result is normalized to a 0-100 scale.

**Example:**
| Criterion | Score | Weight | Contribution |
|-----------|-------|--------|--------------|
| Innovation | 8 | 20% | 1.6 |
| Technical Depth | 7 | 25% | 1.75 |
| Code Quality | 9 | 20% | 1.8 |
| UI/UX | 6 | 15% | 0.9 |
| Documentation | 8 | 10% | 0.8 |
| Live Demo | 7 | 10% | 0.7 |
| **Total** | | **100%** | **7.55** |

Review Score = 7.55 * 10 = **75.5**

### 2. Designation-Weighted Faculty Average

Each faculty review is weighted by the reviewer's designation:

| Designation | Weight |
|------------|--------|
| Vice Chancellor | 10 |
| Dean | 8 |
| HOD | 6 |
| Professor | 5 |
| Associate Professor | 4 |
| Assistant Professor | 3 |

```
Faculty Score = SUM(review_score * designation_weight) / SUM(designation_weights)
```

**Example:**
- Professor (weight 5): Review Score = 80
- Assistant Professor (weight 3): Review Score = 90
- Faculty Score = (80 * 5 + 90 * 3) / (5 + 3) = 670 / 8 = **83.75**

## Peer Score Computation

### Normalization

Peer votes are normalized to a 0-100 scale:

```
Peer Score = (project_vote_count / max_votes_in_event) * 100
```

**Example:**
- Event highest vote count: 25 votes
- Project A: 20 votes → Peer Score = (20/25) * 100 = **80**
- Project B: 10 votes → Peer Score = (10/25) * 100 = **40**
- Project C: 0 votes → Peer Score = **0**

### People's Choice

The project with the highest raw vote count receives the **People's Choice** badge, independent of final ranking.

## Final Score

```
Final Score = Faculty Score * faculty_weight% + Peer Score * peer_weight%
```

Default weights: Faculty 85%, Peer 15% (admin-configurable per event).

**Example:**
- Faculty Score: 83.75
- Peer Score: 80
- Final Score = 83.75 * 0.85 + 80 * 0.15 = 71.19 + 12 = **83.19**

## Rank Eligibility

- **Minimum 3 faculty reviews** required for ranking
- Projects with fewer reviews appear as "Unranked"
- Still visible in admin preview and student dashboard

## Tie-Breaking

When final scores are tied:
1. Higher faculty score wins
2. If still tied, higher peer score wins
3. If still tied, earlier submission timestamp wins

## Score Transparency

Students see:
- Final score and rank
- Faculty score breakdown
- Peer score and vote count
- Each criterion's average score
- All faculty comments with reviewer designation
- People's Choice badge if applicable
- Unranked status explanation if applicable

## Admin Controls

Admin can:
- Configure rubric criteria weights per event
- Set faculty/peer score split (default 85/15)
- Set minimum reviews for ranking (default 3)
- Designation weights
- Trigger score recomputation
- Publish/unpublish results
- Export leaderboard CSV
