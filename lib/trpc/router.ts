import { router } from "./init";
import { authRouter } from "./routers/auth";
import { adminRouter } from "./routers/admin";
import { userRouter } from "./routers/user";
import { tournamentsRouter } from "./routers/tournaments";
import { sweepstakesRouter } from "./routers/sweepstakes";

/**
 * Root tRPC router - combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  admin: adminRouter,
  user: userRouter,
  tournaments: tournamentsRouter,
  sweepstakes: sweepstakesRouter,
});

export type AppRouter = typeof appRouter;
