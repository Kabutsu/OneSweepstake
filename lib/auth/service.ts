import { type NextRequest } from "next/server";
import { createClient as createAdminClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import type {
  AuthResult,
  ProfileResult,
  Session,
  AuthDependencies,
} from "./types";

/**
 * AuthService - Consolidated authentication logic
 * 
 * Handles:
 * - Email-based authentication (instant for password-verified, magic link otherwise)
 * - User profile completion
 * - Session validation
 * - Display name availability checking
 */
export class AuthService {
  private adminClient: SupabaseClient;
  private serverClient: ReturnType<typeof createServerClient>;
  private db: typeof db;
  private jwtSecret: Uint8Array;
  private sitePassword: string;
  private request: NextRequest;

  constructor(deps: AuthDependencies, request: NextRequest) {
    // Admin client for admin operations
    this.adminClient = createAdminClient(deps.supabaseUrl, deps.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Server client for reading user sessions from cookies
    this.serverClient = createServerClient(
      deps.supabaseUrl,
      deps.supabasePublishableKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({ name, value, ...options });
            });
          },
        },
      }
    );
    
    this.db = deps.db;
    this.jwtSecret = new TextEncoder().encode(deps.jwtSecret);
    this.sitePassword = deps.sitePassword;
    this.request = request;
  }

  /**
   * Authenticate user via email submission
   * - If password-verified: instant auth + session creation
   * - If not: send magic link to email
   */
  async authenticateWithEmail(email: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user has password verification
    const hasPassword = await this.hasPasswordVerification();

    // Check if user exists in database
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (hasPassword) {
      // Instant authentication path
      return this.instantAuth(normalizedEmail, !!existingUser);
    } else {
      // Magic link path
      return this.sendMagicLink(normalizedEmail);
    }
  }

  /**
   * Complete user profile after authentication
   * - Creates database user record
   * - Returns redirect destination
   */
  async completeProfile(displayName: string): Promise<ProfileResult> {
    // Get authenticated user from session
    const session = await this.validateSession();
    if (!session) {
      return {
        type: "error",
        error: {
          code: "UNAUTHENTICATED",
          message: "You must be logged in to complete your profile",
          retryable: false,
        },
      };
    }

    // Validate display name
    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName.length > 50) {
      return {
        type: "error",
        error: {
          code: "INVALID_DISPLAY_NAME",
          message: "Display name must be between 1 and 50 characters",
          retryable: true,
          field: "displayName",
        },
      };
    }

    // Check if display name is taken
    const nameTaken = await this.isDisplayNameTaken(trimmedName);
    if (nameTaken) {
      return {
        type: "error",
        error: {
          code: "DISPLAY_NAME_TAKEN",
          message: `The display name "${trimmedName}" is already taken`,
          retryable: true,
          field: "displayName",
        },
      };
    }

    // Create user record
    try {
      await this.db.insert(users).values({
        id: session.userId,
        email: session.email,
        displayName: trimmedName,
      });

      // Get redirect destination
      const redirectTo = await this.getRedirectDestination() || "/";

      return {
        type: "success",
        redirectTo,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        type: "error",
        error: {
          code: "USER_CREATION_FAILED",
          message: "Failed to create user account",
          retryable: true,
        },
      };
    }
  }

  /**
   * Validate session from request cookies
   */
  async validateSession(): Promise<Session | null> {
    try {
      const {
        data: { user },
      } = await this.serverClient.auth.getUser();

      if (!user || !user.email) {
        return null;
      }

      return {
        userId: user.id,
        email: user.email,
      };
    } catch (error) {
      console.error("Session validation error:", error);
      return null;
    }
  }

  /**
   * Check if password cookie exists (determines instant vs magic link)
   */
  async hasPasswordVerification(): Promise<boolean> {
    const passwordCookie = this.request.cookies.get("site_password_verified")?.value;
    if (!passwordCookie) return false;

    try {
      const { payload } = await jwtVerify(passwordCookie, this.jwtSecret);
      return payload.passwordVerified === true;
    } catch {
      return false;
    }
  }

  /**
   * Check if display name is already taken
   */
  async isDisplayNameTaken(displayName: string): Promise<boolean> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.displayName, displayName.trim()),
    });
    return !!existing;
  }

  /**
   * Check display name availability (public method for API)
   */
  async isDisplayNameAvailable(displayName: string): Promise<boolean> {
    return !(await this.isDisplayNameTaken(displayName));
  }

  // ===== Private methods =====

  /**
   * Instant authentication (password-verified users)
   */
  private async instantAuth(
    email: string,
    userExists: boolean
  ): Promise<AuthResult> {
    try {
      // Check if Supabase user exists
      const { data: existingSupabaseUser } =
        await this.adminClient.auth.admin.listUsers();
      const supabaseUser = existingSupabaseUser?.users.find(
        (u) => u.email === email
      );

      let userId: string;

      if (!supabaseUser) {
        // Create Supabase user
        const { data, error } = await this.adminClient.auth.admin.createUser({
          email,
          email_confirm: true,
        });

        if (error) throw error;
        userId = data.user.id;
      } else {
        userId = supabaseUser.id;
      }

      // Generate session token using magic link
      const { data, error } = await this.adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

      if (error) throw error;

      // Extract token from magic link
      const url = new URL(data.properties.action_link);
      const token = url.searchParams.get("token");

      if (!token) {
        throw new Error("Failed to extract token from magic link");
      }

      // Return the token so the client can establish the session
      // Get redirect destination for existing users
      const redirectTo = userExists
        ? await this.getRedirectDestination()
        : undefined;

      return {
        type: "instant-auth",
        needsProfile: !userExists,
        redirectTo,
        sessionToken: token, // Include token for client to use
      };
    } catch (error) {
      console.error("Instant auth error:", error);
      return {
        type: "error",
        error: {
          code: "AUTH_FAILED",
          message: "Authentication failed. Please try again.",
          retryable: true,
        },
      };
    }
  }

  /**
   * Send magic link to email
   */
  private async sendMagicLink(email: string): Promise<AuthResult> {
    try {
      const { error } = await this.adminClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${this.getBaseUrl()}/auth/callback`,
        },
      });

      if (error) throw error;

      return {
        type: "magic-link-sent",
        email,
      };
    } catch (error) {
      console.error("Magic link error:", error);
      return {
        type: "error",
        error: {
          code: "MAGIC_LINK_FAILED",
          message: "Failed to send magic link. Please try again.",
          retryable: true,
        },
      };
    }
  }

  /**
   * Get redirect destination from cookie
   */
  private async getRedirectDestination(): Promise<string | null> {
    const redirectCookie = this.request.cookies.get("redirect_destination")?.value;
    if (!redirectCookie) return null;

    try {
      const { payload } = await jwtVerify(redirectCookie, this.jwtSecret);
      return (payload.destination as string) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get base URL for redirects
   */
  private getBaseUrl(): string {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = this.request.headers.get("host") || "localhost:3000";
    return `${protocol}://${host}`;
  }
}

/**
 * Factory function to create AuthService from request
 */
export function createAuthService(request: NextRequest): AuthService {
  const deps: AuthDependencies = {
    supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    db,
    jwtSecret: process.env.JWT_SECRET!,
    sitePassword: process.env.SITE_PASSWORD!,
  };

  return new AuthService(deps, request);
}
