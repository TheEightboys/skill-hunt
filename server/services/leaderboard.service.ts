import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../queries/connection.js";
import * as schema from "../../db/schema.js";

export async function getPublishedLeaderboard(eventId: number) {
  const db = getDb();

  // Check if event is published
  const event = await db.query.events.findFirst({
    where: eq(schema.events.id, eventId),
  });

  if (!event || event.status !== "published") {
    return [];
  }

  const snapshots = await db
    .select()
    .from(schema.projectScoreSnapshots)
    .where(
      and(
        eq(schema.projectScoreSnapshots.eventId, eventId),
        eq(schema.projectScoreSnapshots.isRanked, true),
        sql`${schema.projectScoreSnapshots.publishedAt} IS NOT NULL`,
      ),
    )
    .orderBy(schema.projectScoreSnapshots.rank);

  // Enrich with project data
  const enriched = await Promise.all(
    snapshots.map(async (snapshot) => {
      const project = await db.query.projects.findFirst({
        where: eq(schema.projects.id, snapshot.projectId),
        with: {
          teamMembers: true,
          tagLinks: {
            with: {
              tag: true,
            },
          },
        },
      });

      return {
        ...snapshot,
        project,
      };
    }),
  );

  return enriched.filter((s) => s.project);
}

export async function getLeaderboardPreview(eventId: number) {
  // Admin-only preview of computed scores before publication
  const db = getDb();

  const snapshots = await db
    .select()
    .from(schema.projectScoreSnapshots)
    .where(eq(schema.projectScoreSnapshots.eventId, eventId))
    .orderBy(sql`${schema.projectScoreSnapshots.finalScore} DESC`);

  const enriched = await Promise.all(
    snapshots.map(async (snapshot) => {
      const project = await db.query.projects.findFirst({
        where: eq(schema.projects.id, snapshot.projectId),
        with: {
          teamMembers: true,
          owner: true,
        },
      });

      return {
        ...snapshot,
        project,
      };
    }),
  );

  return enriched.filter((s) => s.project);
}

export async function getStudentResults(userId: number, eventId: number) {
  const db = getDb();

  // Get student's project
  const project = await db.query.projects.findFirst({
    where: and(
      eq(schema.projects.ownerUserId, userId),
      eq(schema.projects.eventId, eventId),
    ),
  });

  if (!project) {
    return null;
  }

  // Get score snapshot
  const snapshot = await db.query.projectScoreSnapshots.findFirst({
    where: eq(schema.projectScoreSnapshots.projectId, project.id),
  });

  // Get faculty reviews
  const reviews = await db.query.facultyReviews.findMany({
    where: eq(schema.facultyReviews.projectId, project.id),
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

  // Get vote count
  const [voteResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.peerVotes)
    .where(eq(schema.peerVotes.projectId, project.id));

  return {
    project,
    snapshot,
    reviews,
    totalVotes: voteResult?.count ?? 0,
  };
}
