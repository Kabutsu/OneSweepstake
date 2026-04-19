import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(env.auth.jwtSecret);

/**
 * Create admin Supabase client for auth operations
 */
function createAdminClient() {
  return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get base URL for redirects
 */
function getBaseUrl(req: Request): string {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = req.headers.get("host") || "localhost:3000";
  return `${protocol}://${host}`;
}

/**
 * Get redirect destination from cookie
 */
async function getRedirectFromCookie(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [name, ...rest] = c.split("=");
      return [name, rest.join("=")];
    })
  );
  
  const redirectCookie = cookies["redirect_destination"];
  if (!redirectCookie) return null;

  try {
    const { payload } = await jwtVerify(redirectCookie, JWT_SECRET);
    return (payload.destination as string) || null;
  } catch {
    return null;
  }
}

/**
 * Check if redirect path is valid
 */
function isValidRedirectPath(path: string | null): boolean {
  if (!path) return false;
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (path.startsWith('/auth/')) return false;
  if (path.includes('.well-known')) return false;
  if (path.includes('devtools')) return false;
  return true;
}

export const authRouter = router({
  /**
   * Check if email exists in database
   */
  checkEmail: publicProcedure
    .input(z.object({
      email: z.email({ message: "Please enter a valid email address" }),
    }))
    .query(async ({ input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();
      
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
      });

      return {
        exists: !!existingUser,
        email: normalizedEmail,
      };
    }),

  /**
   * Authenticate with email - instant auth if password cookie exists, otherwise send magic link
   */
  authenticateEmail: publicProcedure
    .input(z.object({
      email: z.email({ message: "Please enter a valid email address" }),
    }))
    .mutation(async ({ input, ctx }) => {
      const normalizedEmail = input.email.toLowerCase().trim();

      // Check if user exists in database
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
      });

      if (ctx.hasPasswordCookie) {
        // Instant authentication path
        const adminClient = createAdminClient();

        // Check if Supabase user exists
        const { data: existingSupabaseUser } = await adminClient.auth.admin.listUsers();
        const supabaseUser = existingSupabaseUser?.users.find(
          (u) => u.email === normalizedEmail
        );

        let userId: string;

        if (!supabaseUser) {
          // Create Supabase user
          const { data, error } = await adminClient.auth.admin.createUser({
            email: normalizedEmail,
            email_confirm: true,
          });

          if (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create user account. Please try again.",
            });
          }
          userId = data.user.id;
        } else {
          userId = supabaseUser.id;
        }

        // Generate session token using magic link
        const { data, error } = await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email: normalizedEmail,
        });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Authentication failed. Please try again.",
          });
        }

        // Extract token from magic link
        const url = new URL(data.properties.action_link);
        const token = url.searchParams.get("token");

        if (!token) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate session token.",
          });
        }

        // Get redirect destination for existing users
        const redirectTo = existingUser
          ? await getRedirectFromCookie(ctx.req)
          : null;

        return {
          type: "instant-auth" as const,
          needsProfile: !existingUser,
          redirectTo: redirectTo || undefined,
          sessionToken: token,
        };
      } else {
        // Magic link path
        const adminClient = createAdminClient();
        const baseUrl = getBaseUrl(ctx.req);

        const { error } = await adminClient.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            emailRedirectTo: `${baseUrl}/auth/callback`,
          },
        });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send magic link. Please try again.",
          });
        }

        return {
          type: "magic-link-sent" as const,
          email: normalizedEmail,
        };
      }
    }),

  /**
   * Complete user profile (create database record)
   */
  completeProfile: protectedProcedure
    .input(z.object({
      displayName: z.string()
        .min(1, { message: "Display name is required" })
        .max(50, { message: "Display name must be 50 characters or less" })
        .trim(),
    }))
    .mutation(async ({ input, ctx }) => {
      const trimmedName = input.displayName.trim();

      // Check if display name is taken
      const existingDisplayName = await db.query.users.findFirst({
        where: eq(users.displayName, trimmedName),
      });

      if (existingDisplayName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `The display name "${trimmedName}" is already taken. Please choose another.`,
        });
      }

      // Create user record
      try {
        await db.insert(users).values({
          id: ctx.user.id,
          email: ctx.user.email!,
          displayName: trimmedName,
        });
      } catch (error) {
        console.error("Error creating user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user account. Please try again.",
        });
      }

      // Get redirect destination
      const redirectTo = await getRedirectFromCookie(ctx.req);

      return {
        redirectTo: isValidRedirectPath(redirectTo) ? redirectTo! : "/",
      };
    }),

  /**
   * Check if display name is available
   */
  checkDisplayName: publicProcedure
    .input(z.object({
      displayName: z.string().trim(),
    }))
    .query(async ({ input }) => {
      if (!input.displayName) {
        return { available: false };
      }

      const existing = await db.query.users.findFirst({
        where: eq(users.displayName, input.displayName),
      });

      return {
        available: !existing,
      };
    }),

  /**
   * Get redirect destination and clear cookie
   */
  getRedirect: publicProcedure
    .query(async ({ ctx }) => {
      const destination = await getRedirectFromCookie(ctx.req);
      
      return {
        destination: isValidRedirectPath(destination) ? destination! : "/",
      };
    }),
});
