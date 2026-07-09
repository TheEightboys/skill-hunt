import { getProjects } from "./server/services/project.service.js";
import { getDb } from "./server/queries/connection.js";


async function run() {
  const db = getDb();
  const event = await db.query.events.findFirst();
  if (!event) {
    console.log("No events");
    process.exit(0);
  }
  console.log("Event:", event.id);
  
  try {
    const projects = await getProjects({ eventId: event.id });
    console.log("Projects fetched:", projects.length);
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
  process.exit(0);
}

run();
