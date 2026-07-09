import { getDb } from "./server/queries/connection.js";


async function run() {
  const db = getDb();
  const projects = await db.query.projects.findMany();
  console.log("Projects eventIds:", projects.map(p => p.eventId));
  process.exit(0);
}
run();
