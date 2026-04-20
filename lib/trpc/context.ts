import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { jwtVerify } from "jose";
import { COOKIE_NAMES } from "../auth/cookies";

const JWT_SECRET = new TextEncoder().encode(env.auth.jwtSecret);

/**
 * Context available to all tRPC procedures
 * Contains auth state, Supabase client, and request info
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  const { req } = opts;
  
  // Create Supabase client for session management
  const supabase = createServerClient(
    env.supabase.url,
    env.supabase.publishableKey,
    {
      cookies: {
        getAll() {
          const cookieHeader = req.headers.get("cookie") || "";
          return cookieHeader.split("; ").map((cookie) => {
            const [name, ...rest] = cookie.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll() {
          // No-op for read-only context
        },
      },
    }
  );

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  // Check if password verified cookie exists
  let hasPasswordCookie = false;
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [name, ...rest] = c.split("=");
      return [name, rest.join("=")];
    })
  );
  
  const passwordCookie = cookies[COOKIE_NAMES.PASSWORD_VERIFIED];
  if (passwordCookie) {
    try {
      const { payload } = await jwtVerify(passwordCookie, JWT_SECRET);
      hasPasswordCookie = payload.passwordVerified === true;
    } catch {
      hasPasswordCookie = false;
    }
  }

  return {
    user,
    supabase,
    hasPasswordCookie,
    req,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
