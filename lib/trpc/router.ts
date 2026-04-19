import { router } from "./init";
import { authRouter } from "./routers/auth";
import { adminRouter } from "./routers/admin";

/**
 * Root tRPC router - combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
