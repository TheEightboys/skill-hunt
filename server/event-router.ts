import { z } from "zod";
import { createRouter, publicQuery, adminQuery, authedQuery } from "./middleware.js";
import * as eventService from "./services/event.service.js";
import { recomputeEventScores } from "./services/scoring/recompute-event-leaderboard.js";

export const eventRouter = createRouter({
  list: publicQuery.query(async () => {
    return eventService.getAllEvents();
  }),

  active: publicQuery.query(async () => {
    return eventService.getActiveEvent();
  }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return eventService.getEventBySlug(input.slug);
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return eventService.getEventById(input.id);
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        status: z.enum([
          "draft",
          "registration_open",
          "submission_open",
          "review_and_voting_open",
          "results_ready",
          "published",
          "archived",
        ]),
        registrationStartAt: z.string().datetime().optional(),
        submissionDeadline: z.string().datetime().optional(),
        votingStartAt: z.string().datetime().optional(),
        reviewDeadline: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const eventId = await eventService.createEvent({
        name: input.name,
        slug: input.slug,
        description: input.description,
        status: input.status,
        registrationStartAt: input.registrationStartAt
          ? new Date(input.registrationStartAt)
          : undefined,
        submissionDeadline: input.submissionDeadline
          ? new Date(input.submissionDeadline)
          : undefined,
        votingStartAt: input.votingStartAt
          ? new Date(input.votingStartAt)
          : undefined,
        reviewDeadline: input.reviewDeadline
          ? new Date(input.reviewDeadline)
          : undefined,
      });
      return { eventId };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum([
          "draft",
          "registration_open",
          "submission_open",
          "review_and_voting_open",
          "results_ready",
          "published",
          "archived",
        ]).optional(),
        isActive: z.boolean().optional(),
        isPublic: z.boolean().optional(),
        registrationStartAt: z.string().datetime().optional(),
        submissionDeadline: z.string().datetime().optional(),
        votingStartAt: z.string().datetime().optional(),
        reviewDeadline: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };

      if (data.registrationStartAt)
        updateData.registrationStartAt = new Date(data.registrationStartAt);
      if (data.submissionDeadline)
        updateData.submissionDeadline = new Date(data.submissionDeadline);
      if (data.votingStartAt)
        updateData.votingStartAt = new Date(data.votingStartAt);
      if (data.reviewDeadline)
        updateData.reviewDeadline = new Date(data.reviewDeadline);

      return eventService.updateEvent(id, updateData);
    }),

  stats: authedQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return eventService.getEventStats(input.eventId);
    }),

  recomputeScores: adminQuery
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input }) => {
      return recomputeEventScores(input.eventId);
    }),

  publishResults: adminQuery
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input }) => {
      return eventService.publishEventResults(input.eventId);
    }),

  dashboardStats: adminQuery.query(async () => {
    return eventService.getAdminDashboardStats();
  }),
});
