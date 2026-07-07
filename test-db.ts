import "dotenv/config";
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!);
sql`select 1`.then(res => console.log("Success:", res)).catch(console.error).finally(() => process.exit());
