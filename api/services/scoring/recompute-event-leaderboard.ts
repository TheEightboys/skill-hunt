import { eq, and, count, sql } from "drizzle-orm";
import { getDb } from "../../queries/connection.js";
import * as schema from "../../../db/schema.js";
import { calculateFacultyScore } from "./calculate-faculty-score.js";
import { calculatePeerScore, determinePeoplesChoice } from "./calculate-peer-score.js";
import { calculateFinalScore } from "./calculate-final-score.js";
import { DEFAULT_FACULTY_WEIGHT_PERCENT, DEFAULT_PEER_WEIGHT_PERCENT, DEFAULT_MIN_FACULTY_REVIEWS } from "../../../contracts/constants.js";

export interface RecomputeResult {
  eventId: number;
  computedCount: number;
  rankedCount: number;
  unrankedCount: number;
  peoplesChoiceProjectId: number | null;
}

/**
 * Recompute all scores for an event and store snapshots.
 * This is the main scoring orchestrator.
 */
export async function recomputeEventScores(eventId: number): Promise<RecomputeResult> {
  const db = getDb();

  // Get event score config
  const [eventConfig] = await db
    .select()
    .from(schema.eventScoreConfigs)
    .where(eq(schema.eventScoreConfigs.eventId, eventId))
    .limit(1);

  const facultyWeightPercent = eventConfig?.facultyWeightPercent ?? DEFAULT_FACULTY_WEIGHT_PERCENT;
  const peerWeightPercent = eventConfig?.peerWeightPercent ?? DEFAULT_PEER_WEIGHT_PERCENT;
  const minFacultyReviews = eventConfig?.minFacultyReviews ?? DEFAULT_MIN_FACULTY_REVIEWS;

  // Get all projects for this event
  const eventProjects = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.eventId, eventId));

  if (eventProjects.length === 0) {
    return { eventId, computedCount: 0, rankedCount: 0, unrankedCount: 0, peoplesChoiceProjectId: null };
  }

  // Get all faculty reviews for this event with designation weights
  const reviewsData = await db
    .select({
      review: schema.facultyReviews,
      designation: schema.facultyProfiles.designation,
    })
    .from(schema.facultyReviews)
    .innerJoin(
      schema.facultyProfiles,
      eq(schema.facultyReviews.facultyUserId, schema.facultyProfiles.userId),
    )
    .where(
      and(
        eq(schema.facultyReviews.eventId, eventId),
        eq(schema.facultyReviews.status, "submitted"),
      ),
    );

  // Get all vote counts per project
  const voteCountsData = await db
    .select({
      projectId: schema.peerVotes.projectId,
      voteCount: count(schema.peerVotes.id),
    })
    .from(schema.peerVotes)
    .where(eq(schema.peerVotes.eventId, eventId))
    .groupBy(schema.peerVotes.projectId);

  const voteCountMap = new Map<number, number>();
  for (const vc of voteCountsData) {
    voteCountMap.set(vc.projectId, vc.voteCount);
  }

  const maxVotes = Math.max(0, ...Array.from(voteCountMap.values()));

  // Determine People's Choice
  const voteCountArray = Array.from(voteCountMap.entries()).map(
    ([projectId, count]) => ({ projectId, count }),
  );
  const peoplesChoiceProjectId = determinePeoplesChoice(voteCountArray);

  // Process each project
  let rankedCount = 0;
  let unrankedCount = 0;

  for (const project of eventProjects) {
    // Get reviews for this project
    const projectReviews = reviewsData
      .filter((r) => r.review.projectId === project.id)
      .map((r) => ({
        reviewScore: parseFloat(r.review.computedWeightedScore ?? "0"),
        designation: r.designation ?? "assistant_professor",
      }));

    const facultyScore = calculateFacultyScore(projectReviews);
    const reviewCount = projectReviews.length;

    const projectVotes = voteCountMap.get(project.id) ?? 0;
    const peerScore = calculatePeerScore(projectVotes, maxVotes);

    const finalScore = calculateFinalScore(
      facultyScore,
      peerScore,
      facultyWeightPercent,
      peerWeightPercent,
    );

    const isRanked = reviewCount >= minFacultyReviews;
    const hasPeoplesChoice = project.id === peoplesChoiceProjectId;

    if (isRanked) {
      rankedCount++;
    } else {
      unrankedCount++;
    }

    // Upsert score snapshot
    await db
      .insert(schema.projectScoreSnapshots)
      .values({
        eventId,
        projectId: project.id,
        facultyScore: facultyScore.toString(),
        peerScore: peerScore.toString(),
        finalScore: finalScore.toString(),
        facultyReviewCount: reviewCount,
        totalVotes: projectVotes,
        isRanked,
        hasPeoplesChoice,
        computedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [schema.projectScoreSnapshots.projectId],
        set: {
          facultyScore: facultyScore.toString(),
          peerScore: peerScore.toString(),
          finalScore: finalScore.toString(),
          facultyReviewCount: reviewCount,
          totalVotes: projectVotes,
          isRanked,
          hasPeoplesChoice,
          computedAt: new Date(),
        },
      });
  }

  // Assign ranks to ranked projects
  const rankedSnapshots = await db
    .select()
    .from(schema.projectScoreSnapshots)
    .where(
      and(
        eq(schema.projectScoreSnapshots.eventId, eventId),
        eq(schema.projectScoreSnapshots.isRanked, true),
      ),
    )
    .orderBy(sql`${schema.projectScoreSnapshots.finalScore} DESC`);

  // Simple rank assignment
  for (let i = 0; i < rankedSnapshots.length; i++) {
    const snapshot = rankedSnapshots[i];
    await db
      .update(schema.projectScoreSnapshots)
      .set({ rank: i + 1 })
      .where(eq(schema.projectScoreSnapshots.id, snapshot.id));
  }

  return {
    eventId,
    computedCount: eventProjects.length,
    rankedCount,
    unrankedCount,
    peoplesChoiceProjectId,
  };
}
