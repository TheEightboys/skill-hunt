import "dotenv/config";
import postgres from "postgres";
const directUrl = "postgresql://postgres:ManiKandans@db.hurxjxtgdpepngvcmmcw.supabase.co:5432/postgres";
const sql = postgres(directUrl);
sql`select 1`.then(res => console.log("Success with direct URL:", res)).catch(console.error).finally(() => process.exit());
