import { initTRPC, TRPCError } from "@trpc/server";
import { type Context } from "./context";
import superjson from "superjson";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authenticated user
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource"
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now TypeScript knows user is defined
    },
  });
});

/**
 * Admin procedure - requires authenticated user with admin privileges
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource"
    });
  }

  // Check if user is admin
  const userRecord = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, ctx.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!userRecord || !userRecord.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource"
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
