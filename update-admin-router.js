import fs from "fs";
import path from "path";

const filepath = path.join(process.cwd(), "server/admin-router.ts");
let content = fs.readFileSync(filepath, "utf8");

const additionalRoutes = `
  events: adminQuery.query(async () => {
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
`;

// Insert before the last `});`
content = content.replace(/export const adminRouter = createRouter\(\{/, `export const adminRouter = createRouter({${additionalRoutes}`);

fs.writeFileSync(filepath, content);
console.log("Updated admin-router.ts");
