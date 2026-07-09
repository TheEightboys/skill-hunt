import { getDb } from "./server/queries/connection.js";


async function run() {
  const db = getDb();
  const p = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, 7),
    with: { teamMembers: true }
  });
  console.log(JSON.stringify(p, null, 2));
  process.exit(0);
}
run();
