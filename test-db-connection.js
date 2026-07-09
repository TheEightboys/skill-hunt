import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm";

process.env.DATABASE_URL = "postgres://postgres:TheBoys%402026@db.zbeiycmtcwvykectpako.supabase.co:5432/postgres";

async function run() {
  try {
    const db = getDb();
    const activeEvent = await db.query.events.findFirst({
      where: eq(schema.events.isActive, true)
    });
    console.log("Active Event:", activeEvent?.name);
  } catch (e) {
    console.error("DB Error:", e);
  }
  process.exit(0);
}
run();
