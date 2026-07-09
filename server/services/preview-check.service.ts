import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection.js";
import * as schema from "../../db/schema.js";

/**
 * Check if a preview URL is live.
 * Returns status info without throwing on network errors.
 */
export async function checkPreviewUrl(
  url: string,
): Promise<{
  status: "live" | "down" | "unknown";
  statusCode?: number;
  responseTimeMs?: number;
  resolvedUrl?: string;
  errorMessage?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const startTime = Date.now();
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    const responseTimeMs = Date.now() - startTime;
    clearTimeout(timeout);

    const isLive = response.status >= 200 && response.status < 400;

    return {
      status: isLive ? "live" : "down",
      statusCode: response.status,
      responseTimeMs,
      resolvedUrl: response.url !== url ? response.url : undefined,
    };
  } catch (error) {
    return {
      status: "down",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check preview for a project and update its status.
 */
export async function checkAndUpdatePreviewStatus(projectId: number) {
  const db = getDb();

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
  });

  if (!project?.previewUrl) {
    return { status: "unknown" as const, message: "No preview URL" };
  }

  const result = await checkPreviewUrl(project.previewUrl);

  // Update project
  await db
    .update(schema.projects)
    .set({
      previewStatus: result.status,
      previewLastCheckedAt: new Date(),
      previewLastStatusCode: result.statusCode,
    })
    .where(eq(schema.projects.id, projectId));

  // Log check
  await db.insert(schema.previewChecks).values({
    projectId,
    status: result.status,
    statusCode: result.statusCode,
    responseTimeMs: result.responseTimeMs,
    resolvedUrl: result.resolvedUrl,
    errorMessage: result.errorMessage,
  });

  return result;
}

/**
 * Check all project previews that haven't been checked in the last 6 hours.
 */
export async function checkStalePreviews() {
  const db = getDb();
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  const projects = await db
    .select()
    .from(schema.projects)
    .where(
      eq(schema.projects.previewStatus, "live"),
    );

  const staleProjects = projects.filter(
    (p) =>
      p.previewUrl &&
      (!p.previewLastCheckedAt || p.previewLastCheckedAt < sixHoursAgo),
  );

  const results = [];
  for (const project of staleProjects) {
    const result = await checkAndUpdatePreviewStatus(project.id);
    results.push({ projectId: project.id, ...result });
  }

  return results;
}
