import postgres from "postgres";

const sql = postgres("postgresql://postgres:TheBoys@2026@db.zbeiycmtcwvykectpako.supabase.co:5432/postgres", { ssl: "require" });

async function run() {
  try {
    const res = await sql`select id, email, role, "unionId", "name" from "users" order by "createdAt" desc limit 5`;
    console.log(res);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await sql.end();
  }
}
run();
