import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";
import { desc } from "drizzle-orm";

async function run() {
  const db = getDb();
  const projects = await db.query.projects.findMany({
    orderBy: [desc(schema.projects.createdAt)],
    limit: 5,
  });
  console.log("Recent projects:");
  for (const p of projects) {
    console.log(`- ID: ${p.id}, Title: ${p.title}, Created: ${p.createdAt}`);
  }
  process.exit(0);
}
run();
