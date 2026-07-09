import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../queries/connection.js";
import * as schema from "../../db/schema.js";
import type { InsertProject } from "../../db/schema.js";

export async function getProjects(filters?: {
  eventId?: number;
  category?: string;
  department?: string;
  ownerUserId?: number;
}) {
  const db = getDb();
  const conditions = [];

  if (filters?.eventId) {
    conditions.push(eq(schema.projects.eventId, filters.eventId));
  }
  if (filters?.category) {
    conditions.push(eq(schema.projects.category, filters.category));
  }
  if (filters?.department) {
    conditions.push(eq(schema.projects.department, filters.department));
  }
  if (filters?.ownerUserId) {
    conditions.push(eq(schema.projects.ownerUserId, filters.ownerUserId));
  }

  if (conditions.length === 0) {
    return db.query.projects.findMany({
      orderBy: [desc(schema.projects.createdAt)],
      with: {
        screenshots: true,
        teamMembers: true,
      },
    });
  }

  return db.query.projects.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.projects.createdAt)],
    with: {
      screenshots: true,
      teamMembers: true,
    },
  });
}

export async function getProjectById(id: number) {
  return getDb().query.projects.findFirst({
    where: eq(schema.projects.id, id),
  });
}

export async function getProjectWithDetails(id: number) {
  const db = getDb();
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, id),
    with: {
      teamMembers: true,
      screenshots: true,
      tagLinks: {
        with: {
          tag: true,
        },
      },
      owner: true,
      event: true,
      scoreSnapshot: true,
    },
  });
  return project;
}

export async function getProjectBySlugAndEvent(slug: string, eventId: number) {
  return getDb().query.projects.findFirst({
    where: and(eq(schema.projects.slug, slug), eq(schema.projects.eventId, eventId)),
  });
}

export async function getStudentProjectForEvent(userId: number, eventId: number) {
  return getDb().query.projects.findFirst({
    where: and(
      eq(schema.projects.ownerUserId, userId),
      eq(schema.projects.eventId, eventId),
    ),
    with: {
      teamMembers: true,
      screenshots: true,
      scoreSnapshot: true,
    },
  });
}

export async function createProject(data: {
  eventId: number;
  ownerUserId: number;
  title: string;
  slug: string;
  abstract?: string;
  category?: string;
  department?: string;
  githubUrl?: string;
  previewUrl?: string;
  submissionStatus: string;
}) {
  const insertData: InsertProject = {
    eventId: data.eventId,
    ownerUserId: data.ownerUserId,
    title: data.title,
    slug: data.slug,
    abstract: data.abstract,
    category: data.category,
    department: data.department,
    githubUrl: data.githubUrl,
    previewUrl: data.previewUrl,
    submissionStatus: data.submissionStatus as InsertProject["submissionStatus"],
  };

  const result = await getDb()
    .insert(schema.projects)
    .values(insertData)
    .returning({ id: schema.projects.id });
  return result[0].id;
}

export async function updateProject(
  id: number,
  data: Partial<typeof schema.projects.$inferInsert>,
) {
  await getDb()
    .update(schema.projects)
    .set(data)
    .where(eq(schema.projects.id, id));
}

export async function addTeamMember(data: {
  projectId: number;
  name: string;
  email?: string;
  studentUserId?: number;
  isLeader?: boolean;
}) {
  await getDb().insert(schema.projectTeamMembers).values(data);
}

export async function removeTeamMembers(projectId: number) {
  await getDb()
    .delete(schema.projectTeamMembers)
    .where(eq(schema.projectTeamMembers.projectId, projectId));
}

export async function addScreenshot(data: {
  projectId: number;
  fileUrl: string;
  storagePath?: string;
  sortOrder?: number;
}) {
  await getDb().insert(schema.projectScreenshots).values(data);
}

export async function removeScreenshots(projectId: number) {
  await getDb()
    .delete(schema.projectScreenshots)
    .where(eq(schema.projectScreenshots.projectId, projectId));
}

export async function updatePreviewStatus(
  projectId: number,
  status: string,
  statusCode?: number,
) {
  await getDb()
    .update(schema.projects)
    .set({
      previewStatus: status as "live" | "down" | "unknown" | "pending",
      previewLastCheckedAt: new Date(),
      previewLastStatusCode: statusCode,
    })
    .where(eq(schema.projects.id, projectId));
}

export async function updateGitHubStats(
  projectId: number,
  commitCount: number,
  lastCommitAt?: Date,
) {
  await getDb()
    .update(schema.projects)
    .set({
      githubCommitCount: commitCount,
      githubLastCommitAt: lastCommitAt,
      githubLastSyncedAt: new Date(),
    })
    .where(eq(schema.projects.id, projectId));
}

export async function getCategoriesForEvent(eventId: number) {
  const result = await getDb()
    .selectDistinct({ category: schema.projects.category })
    .from(schema.projects)
    .where(eq(schema.projects.eventId, eventId));

  return result.map((r: any) => r.category).filter(Boolean) as string[];
}
