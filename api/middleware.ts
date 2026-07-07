import { ErrorMessages } from "../contracts/constants.js";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context.js";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(role: string) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

// Role-based query procedures
export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("admin"));

// Helper to check student profile exists
const requireStudentProfile = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: ErrorMessages.unauthenticated });
  }
  
  // Admins bypass profile checks
  if (ctx.user.role !== "admin" && !ctx.user.studentProfile) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Student profile required" });
  }
  
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const requireFacultyProfile = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: ErrorMessages.unauthenticated });
  }
  
  // Admins bypass profile checks
  if (ctx.user.role !== "admin") {
    if (!ctx.user.facultyProfile) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Faculty profile required" });
    }
    if (!ctx.user.facultyProfile.verifiedByAdmin) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Faculty profile pending verification" });
    }
  }
  
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const studentQuery = t.procedure.use(requireAuth).use(requireStudentProfile);
export const facultyQuery = t.procedure.use(requireAuth).use(requireFacultyProfile);
