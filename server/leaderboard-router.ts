import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery, authedQuery } from "./middleware.js";
import * as leaderboardService from "./services/leaderboard.service.js";
import * as eventService from "./services/event.service.js";

export const leaderboardRouter = createRouter({
  public: publicQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const event = await eventService.getEventById(input.eventId);
      if (!event || event.status !== "published") {
        return [];
      }
      return leaderboardService.getPublishedLeaderboard(input.eventId);
    }),

  preview: adminQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return leaderboardService.getLeaderboardPreview(input.eventId);
    }),

  myResults: authedQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      const event = await eventService.getEventById(input.eventId);
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      // Only show results if published or admin
      if (event.status !== "published" && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Results have not been published yet",
        });
      }

      return leaderboardService.getStudentResults(ctx.user.id, input.eventId);
    }),
});
