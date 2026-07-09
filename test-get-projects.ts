import { getDb } from "./server/queries/connection.js";


async function run() {
  const db = getDb();
  const events = await db.query.events.findMany();
  console.log("Events:", events);
  
  const projects = await db.query.projects.findMany();
  console.log("Projects:", projects.length, projects.map(p => p.eventId));
  process.exit(0);
}

run();
