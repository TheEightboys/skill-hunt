import { getDb } from "./server/queries/connection.js";
import * as schema from "./db/schema.js";
import { eq } from "drizzle-orm";

async function run() {
  const db = getDb();
  
  // Find admin user
  const admins = await db.query.users.findMany({ where: eq(schema.users.role, "admin") });
  if (admins.length > 0) {
    const adminId = admins[0].id;
    console.log("Found admin user ID:", adminId);
    
    // Check if faculty profile exists
    const profiles = await db.query.facultyProfiles.findMany({ where: eq(schema.facultyProfiles.userId, adminId) });
    if (profiles.length === 0) {
      // Create faculty profile for admin
      await db.insert(schema.facultyProfiles).values({
        userId: adminId,
        department: "Computer Science",
        designation: "professor",
        verifiedByAdmin: true,
        verifiedAt: new Date(),
      });
      console.log("Created verified faculty profile for admin!");
    } else {
      // Ensure it's verified
      await db.update(schema.facultyProfiles)
        .set({ verifiedByAdmin: true, verifiedAt: new Date() })
        .where(eq(schema.facultyProfiles.userId, adminId));
      console.log("Admin already had a faculty profile. Ensured it is verified.");
    }
  } else {
    console.log("No admin found.");
  }
  process.exit(0);
}
run();
