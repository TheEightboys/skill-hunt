import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm";
import "dotenv/config";

async function run() {
  const db = getDb();
  const facultyUsers = await db.query.users.findMany({ where: eq(schema.users.role, "faculty") });
  const studentUsers = await db.query.users.findMany({ where: eq(schema.users.role, "user") });
  console.log("Faculty:", facultyUsers.length);
  console.log("Students:", studentUsers.length);

  const events = await db.query.events.findMany();
  const event = events[0];
  console.log("Event:", event.id);

  const projects = await db.query.projects.findMany({ where: eq(schema.projects.eventId, event.id) });
  console.log("Projects:", projects.length);

  const criteria = await db.query.rubricCriteria.findMany({ where: eq(schema.rubricCriteria.eventId, event.id) });
  console.log("Criteria:", criteria.length);

  process.exit(0);
}
run();
