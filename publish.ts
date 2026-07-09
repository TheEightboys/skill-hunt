import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm";

async function run() {
  const db = getDb();
  await db.update(schema.events)
    .set({ status: "published", resultsPublishedAt: new Date() });
  console.log("Results published to public!");
  process.exit(0);
}
run();
