import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";

async function run() {
  try {
    const db = getDb();
    const event = await db.query.events.findFirst({ where: (events, { eq }) => eq(events.name, 'spring hackathon') });
    console.log("Event:", event);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
