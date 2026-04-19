/**
 * Auth Configuration - Singleton dependencies
 * Internal module, not exposed to callers
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { db } from "@/db";

/**
 * Supabase admin client for auth operations
 * Reused across all auth handlers
 */
export const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Database instance for user queries
 */
export const database = db;

/**
 * Auth secrets
 */
export const secrets = {
  jwt: new TextEncoder().encode(env.auth.jwtSecret),
  jwtString: env.auth.jwtSecret,
  sitePassword: env.auth.sitePassword,
};

/**
 * Supabase configuration for client creation
 */
export const supabaseConfig = {
  url: env.supabase.url,
  publishableKey: env.supabase.publishableKey,
};
