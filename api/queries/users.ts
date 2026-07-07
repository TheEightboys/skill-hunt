import { eq } from "drizzle-orm";
import * as schema from "../../db/schema.js";
import type { InsertUser } from "../../db/schema.js";
import { getDb } from "./connection.js";
import { env } from "../lib/env.js";

export async function findUserByUnionId(unionId: string) {
  const user = await getDb().query.users.findFirst({
    where: eq(schema.users.unionId, unionId),
    with: {
      studentProfile: true,
      facultyProfile: true,
    },
  });
  return user;
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  const isAdminEmail = 
    values.email === "admin@skillhunt.com" || 
    values.email === "admin@skillhuntcom";

  if (
    values.role === undefined &&
    (isAdminEmail || (values.unionId && values.unionId === env.ownerUnionId))
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onConflictDoUpdate({ target: schema.users.unionId, set: updateSet });
}
