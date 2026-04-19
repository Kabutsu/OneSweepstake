import { createAuthMiddleware } from "@/lib/auth/middleware-helpers";

export const { middleware, config } = createAuthMiddleware();
