import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyAuth } from "@supabase/server/core";
import { findUserByUnionId, upsertUser } from "./queries/users.js";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: NonNullable<Awaited<ReturnType<typeof findUserByUnionId>>>;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    const { data: auth, error } = await verifyAuth(opts.req, {
      auth: "user",
    });

    if (error) {
      console.error("[context] verifyAuth error:", error);
    } else if (auth && auth.userClaims) {
      console.log("[context] verifyAuth success, user:", auth.userClaims.id);
      const email = auth.userClaims.email || "";
      const name = (auth.userClaims.userMetadata?.name as string) || email.split("@")[0] || "User";
      const avatar = (auth.userClaims.userMetadata?.avatar_url as string) || "";
      
      await upsertUser({
        unionId: auth.userClaims.id,
        email,
        name,
        avatar,
        lastSignInAt: new Date(),
      });
      ctx.user = await findUserByUnionId(auth.userClaims.id);
    }
  } catch (err) {
    console.error("[context] Auth exception caught:", err);
  }
  return ctx;
}

