import postgres from "postgres";

async function run() {
  const url1 = "postgresql://postgres.zbeiycmtcwvykectpako:TheBoys2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
  const url2 = "postgresql://postgres:TheBoys2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
  
  for (const url of [url1, url2]) {
    console.log(`Testing: ${url.replace(/:[^:@]+@/, ":****@")}`);
    try {
      const sql = postgres(url, { max: 1, idle_timeout: 1 });
      const result = await sql`SELECT 1 as connected`;
      console.log("Success!", result[0]);
      await sql.end();
    } catch (e) {
      console.log("Failed:", e.message);
    }
  }
}
run();
