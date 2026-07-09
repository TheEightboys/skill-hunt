import { eq, and, count } from "drizzle-orm";
import { getDb } from "../queries/connection.js";
import * as schema from "../../db/schema.js";

export async function getUserVoteForEvent(userId: number, eventId: number) {
  return getDb().query.peerVotes.findFirst({
    where: and(
      eq(schema.peerVotes.voterUserId, userId),
      eq(schema.peerVotes.eventId, eventId),
    ),
    with: {
      project: true,
    },
  });
}

export async function getVoteCountsForEvent(eventId: number) {
  const db = getDb();

  const result = await db
    .select({
      projectId: schema.peerVotes.projectId,
      voteCount: count(schema.peerVotes.id),
    })
    .from(schema.peerVotes)
    .where(eq(schema.peerVotes.eventId, eventId))
    .groupBy(schema.peerVotes.projectId);

  const map = new Map<number, number>();
  for (const row of result) {
    map.set(row.projectId, row.voteCount);
  }
  return map;
}

export async function getVoteCountForProject(projectId: number) {
  const db = getDb();

  const [result] = await db
    .select({ count: count(schema.peerVotes.id) })
    .from(schema.peerVotes)
    .where(eq(schema.peerVotes.projectId, projectId));

  return result?.count ?? 0;
}

export async function castVote(
  eventId: number,
  userId: number,
  projectId: number,
): Promise<{ action: "cast" | "transferred"; previousProjectId?: number }> {
  const db = getDb();

  // Check if user already has a vote
  const existingVote = await db.query.peerVotes.findFirst({
    where: and(
      eq(schema.peerVotes.voterUserId, userId),
      eq(schema.peerVotes.eventId, eventId),
    ),
  });

  if (existingVote) {
    const previousProjectId = existingVote.projectId;

    // Record transfer history
    await db.insert(schema.peerVoteHistory).values({
      eventId,
      voterUserId: userId,
      fromProjectId: previousProjectId,
      toProjectId: projectId,
    });

    // Update vote
    await db
      .update(schema.peerVotes)
      .set({ projectId, updatedAt: new Date() })
      .where(eq(schema.peerVotes.id, existingVote.id));

    return { action: "transferred", previousProjectId };
  }

  // Create new vote
  await db.insert(schema.peerVotes).values({
    eventId,
    voterUserId: userId,
    projectId,
  });

  return { action: "cast" };
}

export async function canUserVoteForProject(
  userId: number,
  projectId: number,
): Promise<{ canVote: boolean; reason?: string }> {
  const db = getDb();

  // Get project
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
    with: {
      teamMembers: true,
    },
  });

  if (!project) {
    return { canVote: false, reason: "Project not found" };
  }

  // Check if user is the owner
  if (project.ownerUserId === userId) {
    return { canVote: false, reason: "You cannot vote for your own project" };
  }

  // Check if user is a team member
  const isTeamMember = (project.teamMembers as any[]).some(
    (tm) => tm.studentUserId === userId,
  );
  if (isTeamMember) {
    return { canVote: false, reason: "You cannot vote for your team's project" };
  }

  return { canVote: true };
}

export async function getAllVotesForEvent(eventId: number) {
  return getDb().query.peerVotes.findMany({
    where: eq(schema.peerVotes.eventId, eventId),
    with: {
      project: true,
      voter: true,
    },
  });
}
