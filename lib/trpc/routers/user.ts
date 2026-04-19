import z from "zod";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../init";
import { db } from "@/db";
import { users } from "@/db/schema";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  getUser: protectedProcedure
    .input(z.object({
      id: z.uuid(),
    }))
    .query(async ({ input }) => {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return { user };
    }),
});
