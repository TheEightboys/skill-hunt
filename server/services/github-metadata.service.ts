import { eq } from "drizzle-orm";
import { getDb } from "../queries/connection.js";
import * as schema from "../../db/schema.js";

interface GithubApiRepo {
  size: number;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  description: string | null;
}

/**
 * Extract owner and repo from a GitHub URL.
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - github.com/owner/repo
 */
export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = url.replace(/\.git$/, "");
    const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

/**
 * Fetch GitHub repository metadata.
 * Uses the public API (no token required for public repos).
 */
export async function fetchGithubMetadata(owner: string, repo: string) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "SkillHunt-University",
        },
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error: `GitHub API error: ${response.status}`,
      };
    }

    const data = (await response.json()) as GithubApiRepo;

    return {
      success: true,
      commitCount: data.size ?? 0,
      lastCommitAt: data.pushed_at ? new Date(data.pushed_at) : undefined,
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      language: data.language,
      description: data.description,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sync GitHub metadata for a project and update the database.
 */
export async function syncGithubMetadataForProject(projectId: number) {
  const db = getDb();

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
  });

  if (!project?.githubUrl) {
    return { success: false, error: "No GitHub URL" };
  }

  const parsed = parseGithubUrl(project.githubUrl);
  if (!parsed) {
    return { success: false, error: "Invalid GitHub URL format" };
  }

  const metadata = await fetchGithubMetadata(parsed.owner, parsed.repo);

  if (!metadata.success) {
    // Log error
    await db.insert(schema.githubSyncLogs).values({
      projectId,
      status: "error",
      errorMessage: metadata.error,
    });
    return metadata;
  }

  const { commitCount, lastCommitAt } = metadata;

  // Update project
  await db
    .update(schema.projects)
    .set({
      githubCommitCount: commitCount ?? 0,
      githubLastCommitAt: lastCommitAt,
      githubLastSyncedAt: new Date(),
    })
    .where(eq(schema.projects.id, projectId));

  // Log success
  await db.insert(schema.githubSyncLogs).values({
    projectId,
    commitCount: commitCount ?? 0,
    lastCommitAt,
    status: "success",
  });

  return metadata;
}

/**
 * Get mock GitHub metadata for demo/seed data.
 */
export function getMockGithubMetadata() {
  return {
    success: true,
    commitCount: Math.floor(Math.random() * 200) + 20,
    lastCommitAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    stars: Math.floor(Math.random() * 50),
    forks: Math.floor(Math.random() * 10),
  };
}
