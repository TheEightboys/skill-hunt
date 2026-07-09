import { getDb } from "./dist/server/queries/connection.js";
console.log("Testing DB connection...");
try {
  const db = getDb();
  const res = await db.execute("SELECT 1");
  console.log("DB connected:", res);
} catch (e) {
  console.error("DB Error:", e);
}
