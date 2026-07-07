import { authRouter } from "./auth-router.js";
import { eventRouter } from "./event-router.js";
import { projectRouter } from "./project-router.js";
import { reviewRouter } from "./review-router.js";
import { voteRouter } from "./vote-router.js";
import { leaderboardRouter } from "./leaderboard-router.js";
import { adminRouter } from "./admin-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  event: eventRouter,
  project: projectRouter,
  review: reviewRouter,
  vote: voteRouter,
  leaderboard: leaderboardRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
