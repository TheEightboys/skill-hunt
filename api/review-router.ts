import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware.js";
import * as reviewService from "./services/review.service.js";
import { SCORE_MIN, SCORE_MAX, COMMENT_MIN_LENGTH } from "../contracts/constants.js";

export const reviewRouter = createRouter({
  byProject: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return reviewService.getReviewsForProject(input.projectId);
    }),

  forFaculty: authedQuery.query(async ({ ctx }) => {
    return reviewService.getReviewsForFaculty(ctx.user.id);
  }),

  reviewableProjects: authedQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return reviewService.getProjectsForFacultyReview(ctx.user.id, input.eventId);
    }),

  getRubric: authedQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return reviewService.getRubricCriteriaForEvent(input.eventId);
    }),

  submit: authedQuery
    .input(
      z.object({
        eventId: z.number(),
        projectId: z.number(),
        status: z.enum(["draft", "submitted"]),
        overallComment: z.string().min(COMMENT_MIN_LENGTH),
        criterionScores: z.array(
          z.object({
            criterionId: z.number(),
            score: z.number().min(SCORE_MIN).max(SCORE_MAX),
            weightPercent: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if faculty can review this project
      const canReview = await reviewService.canFacultyReviewProject(
        ctx.user.id,
        input.projectId,
      );

      if (!canReview) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot review this project (conflict or already reviewed)",
        });
      }

      const reviewId = await reviewService.createOrUpdateReview({
        eventId: input.eventId,
        projectId: input.projectId,
        facultyUserId: ctx.user.id,
        status: input.status,
        overallComment: input.overallComment,
        criterionScores: input.criterionScores,
      });

      return { reviewId };
    }),

  stats: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return reviewService.getReviewStatsForProject(input.projectId);
    }),
});
