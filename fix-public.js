import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm";

async function run() {
  const db = getDb();
  await db.update(schema.events)
    .set({ isPublic: true })
    .where(eq(schema.events.name, 'spring hackathon'));
  console.log("Updated spring hackathon to be public");
  process.exit(0);
}
run();
