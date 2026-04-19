/**
 * Core types for the authentication system
 */

export interface AuthError {
  code: string;
  message: string;
  retryable: boolean;
  field?: string;
}

export type AuthResult =
  | { type: "instant-auth"; needsProfile: boolean; redirectTo?: string; sessionToken?: string }
  | { type: "magic-link-sent"; email: string }
  | { type: "error"; error: AuthError };

export type ProfileResult =
  | { type: "success"; redirectTo: string }
  | { type: "error"; error: AuthError };

export interface Session {
  userId: string;
  email: string;
}

export interface AuthDependencies {
  supabaseUrl: string;
  supabaseServiceKey: string;
  supabasePublishableKey: string;
  db: any; // Drizzle database instance
  jwtSecret: string;
  sitePassword: string;
}
