import postgres from "postgres";

async function run() {
  const url = "postgresql://postgres:TheBoys%402026@db.zbeiycmtcwvykectpako.supabase.co:5432/postgres";
  const sql = postgres(url);
  try {
    const events = await sql`SELECT id, name, "isActive" FROM events`;
    console.log("EVENTS:", events);
    const projects = await sql`SELECT id, title, "eventId" FROM projects`;
    console.log("PROJECTS:", projects);
  } finally {
    await sql.end();
  }
}
run();
