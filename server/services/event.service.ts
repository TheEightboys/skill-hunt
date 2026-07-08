import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "../queries/connection.js";
import * as schema from "../../db/schema.js";
import { DEFAULT_RUBRIC_CRITERIA } from "../../contracts/constants.js";
import type { InsertEvent } from "../../db/schema.js";

export async function getAllEvents() {
  return getDb().query.events.findMany({
    orderBy: [desc(schema.events.createdAt)],
  });
}

export async function getActiveEvent() {
  return getDb().query.events.findFirst({
    where: eq(schema.events.isActive, true),
  });
}

export async function getEventBySlug(slug: string) {
  return getDb().query.events.findFirst({
    where: eq(schema.events.slug, slug),
  });
}

export async function getEventById(id: number) {
  return getDb().query.events.findFirst({
    where: eq(schema.events.id, id),
  });
}

export async function createEvent(data: {
  name: string;
  slug: string;
  description?: string;
  status: string;
  registrationStartAt?: Date;
  submissionDeadline?: Date;
  votingStartAt?: Date;
  reviewDeadline?: Date;
}) {
  const db = getDb();

  const insertData: InsertEvent = {
    name: data.name,
    slug: data.slug,
    description: data.description,
    status: data.status as InsertEvent["status"],
    isActive: false,
    isPublic: false,
    registrationStartAt: data.registrationStartAt,
    submissionDeadline: data.submissionDeadline,
    votingStartAt: data.votingStartAt,
    reviewDeadline: data.reviewDeadline,
  };

  const result = await db.insert(schema.events).values(insertData).returning({ id: schema.events.id });
  const eventId = result[0].id;

  // Create default score config
  await db.insert(schema.eventScoreConfigs).values({
    eventId,
    facultyWeightPercent: 85,
    peerWeightPercent: 15,
    minFacultyReviews: 3,
  });

  // Create default rubric criteria
  for (let i = 0; i < DEFAULT_RUBRIC_CRITERIA.length; i++) {
    const crit = DEFAULT_RUBRIC_CRITERIA[i];
    await db.insert(schema.rubricCriteria).values({
      eventId,
      name: crit.name,
      description: crit.description,
      weightPercent: crit.weightPercent,
      displayOrder: i,
    });
  }

  // Initialize designation weights if empty
  const existingWeights = await db.select().from(schema.designationWeights);
  if (existingWeights.length === 0) {
    const defaultWeights = [
      { designation: "vice_chancellor" as const, weight: 10 },
      { designation: "dean" as const, weight: 8 },
      { designation: "hod" as const, weight: 6 },
      { designation: "professor" as const, weight: 5 },
      { designation: "associate_professor" as const, weight: 4 },
      { designation: "assistant_professor" as const, weight: 3 },
    ];
    for (const dw of defaultWeights) {
      await db.insert(schema.designationWeights).values(dw);
    }
  }

  return eventId;
}

export async function updateEvent(
  id: number,
  data: Partial<typeof schema.events.$inferInsert>,
) {
  await getDb()
    .update(schema.events)
    .set(data)
    .where(eq(schema.events.id, id));
  return getEventById(id);
}

export async function publishEventResults(eventId: number) {
  await getDb()
    .update(schema.events)
    .set({
      status: "published",
      resultsPublishedAt: new Date(),
    })
    .where(eq(schema.events.id, eventId));

  // Mark all snapshots as published
  await getDb()
    .update(schema.projectScoreSnapshots)
    .set({ publishedAt: new Date() })
    .where(eq(schema.projectScoreSnapshots.eventId, eventId));

  return getEventById(eventId);
}

export async function getEventStats(eventId: number) {
  const db = getDb();

  const [projectCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.projects)
    .where(eq(schema.projects.eventId, eventId));

  const [reviewCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.facultyReviews)
    .where(eq(schema.facultyReviews.eventId, eventId));

  const [submittedReviewCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.facultyReviews)
    .where(
      and(
        eq(schema.facultyReviews.eventId, eventId),
        eq(schema.facultyReviews.status, "submitted"),
      ),
    );

  const [voteCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.peerVotes)
    .where(eq(schema.peerVotes.eventId, eventId));

  return {
    projectCount: projectCount?.count ?? 0,
    reviewCount: reviewCount?.count ?? 0,
    submittedReviewCount: submittedReviewCount?.count ?? 0,
    voteCount: voteCount?.count ?? 0,
  };
}

export async function getAdminDashboardStats() {
  const db = getDb();

  const [eventCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events);

  const [activeEvent] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(eq(schema.events.isActive, true));

  const [studentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.studentProfiles);

  const [facultyCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.facultyProfiles);

  const [pendingFaculty] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.facultyProfiles)
    .where(eq(schema.facultyProfiles.verifiedByAdmin, false));

  return {
    totalEvents: eventCount?.count ?? 0,
    activeEvents: activeEvent?.count ?? 0,
    totalStudents: studentCount?.count ?? 0,
    totalFaculty: facultyCount?.count ?? 0,
    pendingFaculty: pendingFaculty?.count ?? 0,
  };
}
