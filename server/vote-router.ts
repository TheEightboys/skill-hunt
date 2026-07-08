import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware.js";
import * as voteService from "./services/vote.service.js";
import * as eventService from "./services/event.service.js";

export const voteRouter = createRouter({
  myVote: authedQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return voteService.getUserVoteForEvent(ctx.user.id, input.eventId);
    }),

  counts: authedQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return voteService.getVoteCountsForEvent(input.eventId);
    }),

  projectCount: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return voteService.getVoteCountForProject(input.projectId);
    }),

  cast: authedQuery
    .input(
      z.object({
        eventId: z.number(),
        projectId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if voting is open for this event
      const event = await eventService.getEventById(input.eventId);
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      if (event.status !== "review_and_voting_open" && event.status !== "results_ready") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Voting is not open for this event",
        });
      }

      // Check if user can vote for this project
      const canVoteResult = await voteService.canUserVoteForProject(
        ctx.user.id,
        input.projectId,
      );

      if (!canVoteResult.canVote) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: canVoteResult.reason || "Cannot vote for this project",
        });
      }

      const result = await voteService.castVote(
        input.eventId,
        ctx.user.id,
        input.projectId,
      );

      return result;
    }),
});
