import { recomputeEventScores } from "./server/services/scoring/recompute-event-leaderboard.js";
import { getDb } from "./server/queries/connection.js";

async function run() {
  const db = getDb();
  const events = await db.query.events.findMany();
  if (events.length > 0) {
    const result = await recomputeEventScores(events[0].id);
    console.log("Leaderboard computed:", result);
  }
  process.exit(0);
}
run();
