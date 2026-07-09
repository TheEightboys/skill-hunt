import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";

async function run() {
  try {
    const db = getDb();
    const events = await db.query.events.findMany();
    console.log("All Events in DB:", events.map(e => ({ id: e.id, name: e.name, isActive: e.isActive })));
  } catch (e) {
    console.error("DB Error:", e);
  }
  process.exit(0);
}
run();
