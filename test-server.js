import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm";

async function run() {
  const db = getDb();
  
  const projects = await db.query.projects.findMany({
    where: eq(schema.projects.eventId, 1),
    with: {
      teamMembers: true,
      screenshots: true
    }
  });
  console.log(JSON.stringify(projects, null, 2));
  process.exit(0);
}
run();
