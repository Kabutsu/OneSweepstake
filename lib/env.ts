/**
 * Validates that all required environment variables are set
 * Call this at app startup to fail fast if configuration is missing
 */
export function validateEnv() {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    POSTGRES_URL: process.env.POSTGRES_URL,
    SITE_PASSWORD: process.env.SITE_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join("\n")}\n\nPlease check your .env.local file.`
    );
  }
}

/**
 * Type-safe access to environment variables
 */
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  database: {
    url: process.env.POSTGRES_URL!,
  },
  auth: {
    sitePassword: process.env.SITE_PASSWORD!,
    jwtSecret: process.env.JWT_SECRET!,
  },
} as const;
