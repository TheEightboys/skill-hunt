import { z } from "zod";
import { createRouter, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { recomputeEventScores } from "./services/scoring/recompute-event-leaderboard.js";

export const adminRouter = createRouter({
  events: adminQuery.input(z.any().optional()).query(async () => {
    return getDb().query.events.findMany({
      orderBy: [desc(schema.events.createdAt)],
    });
  }),
  
  evaluations: adminQuery.input(z.object({ eventId: z.number().optional() }).optional()).query(async ({ input }) => {
    const whereClause = input?.eventId ? eq(schema.facultyReviews.eventId, input.eventId) : undefined;
    return getDb().query.facultyReviews.findMany({
      where: whereClause,
      with: {
        faculty: { with: { user: true } },
        project: true,
      },
      orderBy: [desc(schema.facultyReviews.submittedAt)],
    });
  }),
  
  votes: adminQuery.input(z.object({ eventId: z.number().optional() }).optional()).query(async ({ input }) => {
    const whereClause = input?.eventId ? eq(schema.peerVotes.eventId, input.eventId) : undefined;
    return getDb().query.peerVotes.findMany({
      where: whereClause,
      with: {
        voter: true,
        project: true,
      },
      orderBy: [desc(schema.peerVotes.createdAt)],
    });
  }),

  users: adminQuery.input(z.any().optional()).query(async () => {
    return getDb().query.users.findMany({
      orderBy: [desc(schema.users.createdAt)],
      with: {
        studentProfile: true,
        facultyProfile: true,
      },
    });
  }),

  updateUser: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]).optional(),
        accountStatus: z.enum(["pending", "active", "rejected", "disabled"]).optional(),
        name: z.string().optional(),
        email: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb()
        .update(schema.users)
        .set(data)
        .where(eq(schema.users.id, id));
      return { success: true };
    }),

  pendingFaculty: adminQuery.input(z.any().optional()).query(async () => {
    return getDb().query.facultyProfiles.findMany({
      where: eq(schema.facultyProfiles.verifiedByAdmin, false),
      with: {
        user: true,
      },
    });
  }),

  verifyFaculty: adminQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.facultyProfiles)
        .set({
          verifiedByAdmin: true,
          verifiedAt: new Date(),
        })
        .where(eq(schema.facultyProfiles.userId, input.userId));
      return { success: true };
    }),

  rejectFaculty: adminQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.facultyProfiles)
        .set({
          verifiedByAdmin: false,
        })
        .where(eq(schema.facultyProfiles.userId, input.userId));

      await getDb()
        .update(schema.users)
        .set({ accountStatus: "rejected" })
        .where(eq(schema.users.id, input.userId));

      return { success: true };
    }),

  updateRubric: adminQuery
    .input(
      z.object({
        eventId: z.number(),
        criteria: z.array(
          z.object({
            id: z.number().optional(),
            name: z.string().min(1),
            description: z.string().optional(),
            weightPercent: z.string(),
            displayOrder: z.number(),
            isActive: z.boolean().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      for (const crit of input.criteria) {
        if (crit.id) {
          await db
            .update(schema.rubricCriteria)
            .set({
              name: crit.name,
              description: crit.description,
              weightPercent: crit.weightPercent,
              displayOrder: crit.displayOrder,
              isActive: crit.isActive ?? true,
            })
            .where(eq(schema.rubricCriteria.id, crit.id));
        } else {
          await db.insert(schema.rubricCriteria).values({
            eventId: input.eventId,
            name: crit.name,
            description: crit.description,
            weightPercent: crit.weightPercent,
            displayOrder: crit.displayOrder,
            isActive: crit.isActive ?? true,
          });
        }
      }

      return { success: true };
    }),

  updateScoreConfig: adminQuery
    .input(
      z.object({
        eventId: z.number(),
        facultyWeightPercent: z.number().min(0).max(100),
        peerWeightPercent: z.number().min(0).max(100),
        minFacultyReviews: z.number().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .insert(schema.eventScoreConfigs)
        .values({
          eventId: input.eventId,
          facultyWeightPercent: input.facultyWeightPercent,
          peerWeightPercent: input.peerWeightPercent,
          minFacultyReviews: input.minFacultyReviews,
        })
        .onConflictDoUpdate({
          target: [schema.eventScoreConfigs.eventId],
          set: {
            facultyWeightPercent: input.facultyWeightPercent,
            peerWeightPercent: input.peerWeightPercent,
            minFacultyReviews: input.minFacultyReviews,
          },
        });
      return { success: true };
    }),

  recomputeScores: adminQuery
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input }) => {
      return recomputeEventScores(input.eventId);
    }),

  exportLeaderboard: adminQuery
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const snapshots = await db
        .select()
        .from(schema.projectScoreSnapshots)
        .where(eq(schema.projectScoreSnapshots.eventId, input.eventId))
        .orderBy(schema.projectScoreSnapshots.rank);

      const enriched = await Promise.all(
        snapshots.map(async (snapshot) => {
          const project = await db.query.projects.findFirst({
            where: eq(schema.projects.id, snapshot.projectId),
            with: {
              teamMembers: true,
              owner: true,
            },
          });

          return {
            rank: snapshot.rank ?? "Unranked",
            projectTitle: project?.title ?? "Unknown",
            team: (project?.teamMembers as any[])?.map((t) => t.name).join(", ") ?? "",
            category: project?.category ?? "",
            finalScore: snapshot.finalScore,
            facultyScore: snapshot.facultyScore,
            peerScore: snapshot.peerScore,
            reviewCount: snapshot.facultyReviewCount,
            totalVotes: snapshot.totalVotes,
            isRanked: snapshot.isRanked,
            hasPeoplesChoice: snapshot.hasPeoplesChoice,
          };
        }),
      );

      return enriched;
    }),
});
