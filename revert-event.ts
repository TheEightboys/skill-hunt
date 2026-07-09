import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";

async function run() {
  const db = getDb();
  
  // First, deactivate all events
  await db.update(schema.events).set({ isActive: false });
  
  // Now, activate the old event from yesterday
  await db.update(schema.events)
    .set({ isActive: true, isPublic: true })
    .where((events, { eq }) => eq(events.name, 'CS Project Showcase 2026'));
    
  console.log("Reverted active event to CS Project Showcase 2026");
  process.exit(0);
}
run();
