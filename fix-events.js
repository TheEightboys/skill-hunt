import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";

async function run() {
  try {
    const db = getDb();
    const allEvents = await db.query.events.findMany();
    console.log("All Events before:", allEvents.map(e => ({ id: e.id, name: e.name, isActive: e.isActive })));

    // Just use a raw SQL query if eq is failing for some reason
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`UPDATE events SET "isActive" = false`);
    await db.execute(sql`UPDATE events SET "isActive" = true, "isPublic" = true WHERE id = 1`);
    
    const allEventsAfter = await db.query.events.findMany();
    console.log("All Events after:", allEventsAfter.map(e => ({ id: e.id, name: e.name, isActive: e.isActive })));
  } catch (e) {
    console.error("DB Error:", e);
  }
  process.exit(0);
}
run();
