import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, studentQuery } from "./middleware.js";
import * as projectService from "./services/project.service.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { syncGithubMetadataForProject, getMockGithubMetadata } from "./services/github-metadata.service.js";
import { checkAndUpdatePreviewStatus } from "./services/preview-check.service.js";

export const projectRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          eventId: z.number().optional(),
          category: z.string().optional(),
          department: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }: { input?: { eventId?: number; category?: string; department?: string } }) => {
      return projectService.getProjects(input ?? {});
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }: { input: { id: number } }) => {
      const project = await projectService.getProjectWithDetails(input.id);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      return project;
    }),

  myProject: authedQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }: { ctx: any; input: { eventId: number } }) => {
      return projectService.getStudentProjectForEvent(ctx.user.id, input.eventId);
    }),

  create: studentQuery
    .input(
      z.object({
        eventId: z.number(),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        abstract: z.string().optional(),
        category: z.string().optional(),
        department: z.string().optional(),
        githubUrl: z.string().url().optional(),
        previewUrl: z.string().url().optional(),
        teamMembers: z
          .array(
            z.object({
              name: z.string().min(1),
              email: z.string().email().optional(),
              studentUserId: z.number().optional(),
              isLeader: z.boolean().optional(),
            }),
          )
          .optional(),
        screenshots: z
          .array(
            z.object({
              fileUrl: z.string(),
              storagePath: z.string().optional(),
            }),
          )
          .optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { teamMembers, screenshots, tags, ...projectData } = input;

      // Check if student already has a project for this event
      const existing = await projectService.getStudentProjectForEvent(
        ctx.user.id,
        input.eventId,
      );
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a project for this event",
        });
      }

      const projectId = await projectService.createProject({
        ...projectData,
        ownerUserId: ctx.user.id,
        submissionStatus: "submitted",
      });

      // Add team members
      if (teamMembers && teamMembers.length > 0) {
        for (const member of teamMembers) {
          await projectService.addTeamMember({
            projectId,
            ...member,
          });
        }
      }

      // Add screenshots
      if (screenshots && screenshots.length > 0) {
        for (let i = 0; i < screenshots.length; i++) {
          await projectService.addScreenshot({
            projectId,
            ...screenshots[i],
            sortOrder: i,
          });
        }
      }

      // Add tags
      if (tags && tags.length > 0) {
        const db = getDb();
        for (const tagName of tags) {
          const slug = tagName.toLowerCase().replace(/\s+/g, "-");
          // Upsert tag
          await db
            .insert(schema.projectTags)
            .values({ name: tagName, slug })
            .onConflictDoNothing();

          const tag = await db.query.projectTags.findFirst({
            where: eq(schema.projectTags.slug, slug),
          });

          if (tag) {
            await db
              .insert(schema.projectTagLinks)
              .values({ projectId, tagId: tag.id })
              .onConflictDoNothing();
          }
        }
      }

      // Check preview URL if provided
      if (projectData.previewUrl) {
        await checkAndUpdatePreviewStatus(projectId);
      }

      // Sync GitHub metadata if provided
      if (projectData.githubUrl) {
        try {
          await syncGithubMetadataForProject(projectId);
        } catch {
          // Silently fail for demo - GitHub API rate limits
        }
      }

      return { projectId };
    }),

  update: studentQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        abstract: z.string().optional(),
        category: z.string().optional(),
        department: z.string().optional(),
        githubUrl: z.string().url().optional(),
        previewUrl: z.string().url().optional(),
        teamMembers: z
          .array(
            z.object({
              name: z.string().min(1),
              email: z.string().email().optional(),
              studentUserId: z.number().optional(),
              isLeader: z.boolean().optional(),
            }),
          )
          .optional(),
        screenshots: z
          .array(
            z.object({
              fileUrl: z.string(),
              storagePath: z.string().optional(),
            }),
          )
          .optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { id, teamMembers, screenshots, tags, ...projectData } = input;

      // Verify ownership
      const project = await projectService.getProjectById(id);
      if (!project || project.ownerUserId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own project",
        });
      }

      await projectService.updateProject(id, projectData);

      // Update team members
      if (teamMembers !== undefined) {
        await projectService.removeTeamMembers(id);
        for (const member of teamMembers) {
          await projectService.addTeamMember({
            projectId: id,
            ...member,
          });
        }
      }

      // Update screenshots
      if (screenshots !== undefined) {
        await projectService.removeScreenshots(id);
        for (let i = 0; i < screenshots.length; i++) {
          await projectService.addScreenshot({
            projectId: id,
            ...screenshots[i],
            sortOrder: i,
          });
        }
      }

      // Check preview if updated
      if (projectData.previewUrl) {
        await checkAndUpdatePreviewStatus(id);
      }

      return { success: true };
    }),

  recheckPreview: authedQuery
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }: { ctx: any; input: { projectId: number } }) => {
      const project = await projectService.getProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // Only owner or admin can recheck
      if (project.ownerUserId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return checkAndUpdatePreviewStatus(input.projectId);
    }),

  syncGithub: authedQuery
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }: { ctx: any; input: { projectId: number } }) => {
      const project = await projectService.getProjectById(input.projectId);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      if (project.ownerUserId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        return await syncGithubMetadataForProject(input.projectId);
      } catch {
        // Return mock data for demo
        const mock = getMockGithubMetadata();
        await projectService.updateGitHubStats(
          input.projectId,
          mock.commitCount,
          mock.lastCommitAt,
        );
        return { ...mock, fallback: true };
      }
    }),

  categories: publicQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }: { input: { eventId: number } }) => {
      return projectService.getCategoriesForEvent(input.eventId);
    }),
});
