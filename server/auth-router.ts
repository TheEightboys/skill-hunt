import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";

export const authRouter = createRouter({
  me: authedQuery.query(({ ctx }) => ctx.user),
  logout: authedQuery.mutation(async () => {
    return { success: true };
  }),
  applyFaculty: authedQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        department: z.string().min(1),
        designation: z.enum([
          "vice_chancellor",
          "dean",
          "hod",
          "professor",
          "associate_professor",
          "assistant_professor",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Update the user's name
      await db.update(schema.users)
        .set({ name: input.name })
        .where(eq(schema.users.id, ctx.user!.id));

      // Insert or update the faculty profile
      await db.insert(schema.facultyProfiles).values({
        userId: ctx.user!.id,
        department: input.department,
        designation: input.designation,
        verifiedByAdmin: false,
      }).onConflictDoUpdate({
        target: schema.facultyProfiles.userId,
        set: {
          department: input.department,
          designation: input.designation,
          verifiedByAdmin: false,
        }
      });
      return { success: true };
    }),
});
