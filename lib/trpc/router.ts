import { router } from "./init";
import { authRouter } from "./routers/auth";
import { adminRouter } from "./routers/admin";
import { userRouter } from "./routers/user";

/**
 * Root tRPC router - combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  admin: adminRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
