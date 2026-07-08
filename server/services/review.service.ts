import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../queries/connection.js";
import * as schema from "../../db/schema.js";
import { calculateReviewScore, calculateCriterionContribution } from "./scoring/calculate-review-score.js";

export async function getReviewById(id: number) {
  return getDb().query.facultyReviews.findFirst({
    where: eq(schema.facultyReviews.id, id),
    with: {
      scores: {
        with: {
          criterion: true,
        },
      },
    },
  });
}

export async function getFacultyReviewForProject(
  facultyUserId: number,
  projectId: number,
  eventId: number,
) {
  return getDb().query.facultyReviews.findFirst({
    where: and(
      eq(schema.facultyReviews.facultyUserId, facultyUserId),
      eq(schema.facultyReviews.projectId, projectId),
      eq(schema.facultyReviews.eventId, eventId),
    ),
    with: {
      scores: {
        with: {
          criterion: true,
        },
      },
    },
  });
}

export async function getReviewsForProject(projectId: number) {
  return getDb().query.facultyReviews.findMany({
    where: eq(schema.facultyReviews.projectId, projectId),
    with: {
      faculty: {
        with: {
          facultyProfile: true,
        },
      },
      scores: {
        with: {
          criterion: true,
        },
      },
    },
  });
}

export async function getReviewsForFaculty(facultyUserId: number) {
  return getDb().query.facultyReviews.findMany({
    where: eq(schema.facultyReviews.facultyUserId, facultyUserId),
    with: {
      project: {
        with: {
          event: true,
        },
      },
    },
    orderBy: [sql`${schema.facultyReviews.createdAt} DESC`],
  });
}

export async function getProjectsForFacultyReview(facultyUserId: number, eventId: number) {
  const db = getDb();

  // Get conflicted project IDs
  const conflicts = await db
    .select({ projectId: schema.projectFacultyConflicts.projectId })
    .from(schema.projectFacultyConflicts)
    .where(eq(schema.projectFacultyConflicts.facultyUserId, facultyUserId));

  const conflictedProjectIds = conflicts.map((c: any) => c.projectId);

  // Get all projects for event excluding conflicted ones
  const allProjects = await db.query.projects.findMany({
    where: eq(schema.projects.eventId, eventId),
    with: {
      owner: true,
      teamMembers: true,
      event: true,
      facultyReviews: {
        where: eq(schema.facultyReviews.facultyUserId, facultyUserId),
      },
    },
  });

  return allProjects.filter((p: any) => !conflictedProjectIds.includes(p.id));
}

export async function createOrUpdateReview(data: {
  eventId: number;
  projectId: number;
  facultyUserId: number;
  status: "draft" | "submitted";
  overallComment: string;
  criterionScores: { criterionId: number; score: number; weightPercent: number }[];
}) {
  const db = getDb();

  // Check if review already exists
  const existingReview = await db.query.facultyReviews.findFirst({
    where: and(
      eq(schema.facultyReviews.facultyUserId, data.facultyUserId),
      eq(schema.facultyReviews.projectId, data.projectId),
      eq(schema.facultyReviews.eventId, data.eventId),
    ),
  });

  // Calculate weighted review score
  const reviewScore = calculateReviewScore(
    data.criterionScores.map((cs) => ({
      score: cs.score,
      weightPercent: cs.weightPercent,
    })),
  );

  let reviewId: number;

  if (existingReview) {
    reviewId = existingReview.id;

    // Update existing review
    await db
      .update(schema.facultyReviews)
      .set({
        status: data.status,
        overallComment: data.overallComment,
        computedWeightedScore: reviewScore.toString(),
        submittedAt: data.status === "submitted" ? new Date() : existingReview.submittedAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.facultyReviews.id, reviewId));

    // Delete old scores
    await db
      .delete(schema.facultyReviewScores)
      .where(eq(schema.facultyReviewScores.reviewId, reviewId));
  } else {
    // Create new review
    const result = await db
      .insert(schema.facultyReviews)
      .values({
        eventId: data.eventId,
        projectId: data.projectId,
        facultyUserId: data.facultyUserId,
        status: data.status,
        overallComment: data.overallComment,
        computedWeightedScore: reviewScore.toString(),
        submittedAt: data.status === "submitted" ? new Date() : undefined,
      })
      .returning({ id: schema.facultyReviews.id });

    reviewId = result[0].id;
  }

  // Insert new scores
  for (const cs of data.criterionScores) {
    const contribution = calculateCriterionContribution(cs.score, cs.weightPercent);
    await db.insert(schema.facultyReviewScores).values({
      reviewId,
      criterionId: cs.criterionId,
      score: cs.score,
      weightedContribution: contribution.toString(),
    });
  }

  return reviewId;
}

export async function canFacultyReviewProject(
  facultyUserId: number,
  projectId: number,
): Promise<boolean> {
  const db = getDb();

  // Check for conflict
  const conflict = await db.query.projectFacultyConflicts.findFirst({
    where: and(
      eq(schema.projectFacultyConflicts.facultyUserId, facultyUserId),
      eq(schema.projectFacultyConflicts.projectId, projectId),
    ),
  });

  if (conflict) return false;

  // Check if already reviewed
  const existing = await db.query.facultyReviews.findFirst({
    where: and(
      eq(schema.facultyReviews.facultyUserId, facultyUserId),
      eq(schema.facultyReviews.projectId, projectId),
      eq(schema.facultyReviews.status, "submitted"),
    ),
  });

  if (existing) return false;

  return true;
}

export async function getRubricCriteriaForEvent(eventId: number) {
  return getDb().query.rubricCriteria.findMany({
    where: eq(schema.rubricCriteria.eventId, eventId),
    orderBy: [schema.rubricCriteria.displayOrder],
  });
}

export async function getReviewStatsForProject(projectId: number) {
  const db = getDb();

  const [stats] = await db
    .select({
      totalReviews: sql<number>`count(*)`,
      submittedReviews: sql<number>`sum(case when ${schema.facultyReviews.status} = 'submitted' then 1 else 0 end)`,
      avgScore: sql<number>`avg(${schema.facultyReviews.computedWeightedScore})`,
    })
    .from(schema.facultyReviews)
    .where(eq(schema.facultyReviews.projectId, projectId));

  return stats;
}
