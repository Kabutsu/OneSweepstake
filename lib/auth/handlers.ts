/**
 * Auth Handlers - Pre-built request handlers for auth operations
 *
 * Each handler:
 * - Parses and validates request data
 * - Performs auth logic
 * - Returns formatted NextResponse
 * - Sets appropriate cookies
 *
 * Usage: export const POST = authHandlers.email
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { supabaseAdmin, database, secrets, supabaseConfig } from "./config";

// ===== Types =====

interface AuthError {
  code: string;
  message: string;
  retryable: boolean;
  field?: string;
}

type AuthResult =
  | { type: "instant-auth"; needsProfile: boolean; redirectTo?: string; sessionToken: string }
  | { type: "magic-link-sent"; email: string }
  | { type: "error"; error: AuthError };

type ProfileResult =
  | { type: "success"; redirectTo: string }
  | { type: "error"; error: AuthError };

interface Session {
  userId: string;
  email: string;
}

// ===== Validation =====

function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { isValid: false, error: "Email is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  return { isValid: true };
}

function validateDisplayName(displayName: string): { isValid: boolean; error?: string } {
  const trimmedName = displayName.trim();
  if (!trimmedName) {
    return { isValid: false, error: "Display name is required" };
  }
  if (trimmedName.length > 50) {
    return { isValid: false, error: "Display name must be 50 characters or less" };
  }
  return { isValid: true };
}

function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  return { isValid: true };
}

// ===== Internal Helpers =====

/**
 * Create password verification JWT
 */
async function createPasswordToken(): Promise<string> {
  const token = await new SignJWT({ passwordVerified: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${60 * 24 * 60 * 60}s`) // 60 days
    .setIssuedAt()
    .sign(secrets.jwt);
  return token;
}

/**
 * Create password attempts JWT
 */
async function createAttemptsToken(attempts: number, lockedUntil?: number): Promise<string> {
  const token = await new SignJWT({ attempts, lockedUntil })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .setIssuedAt()
    .sign(secrets.jwt);
  return token;
}

/**
 * Verify password attempts JWT
 */
async function verifyAttemptsToken(token: string): Promise<{ attempts: number; lockedUntil?: number } | null> {
  try {
    const { payload } = await jwtVerify(token, secrets.jwt);
    return {
      attempts: typeof payload.attempts === "number" ? payload.attempts : 0,
      lockedUntil: typeof payload.lockedUntil === "number" ? payload.lockedUntil : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Check if password cookie is valid
 */
async function hasPasswordVerification(request: NextRequest): Promise<boolean> {
  const passwordCookie = request.cookies.get("site_password_verified")?.value;
  if (!passwordCookie) return false;

  try {
    const { payload } = await jwtVerify(passwordCookie, secrets.jwt);
    return payload.passwordVerified === true;
  } catch {
    return false;
  }
}

/**
 * Get redirect destination from cookie
 */
async function getRedirectDestination(request: NextRequest): Promise<string | null> {
  const redirectCookie = request.cookies.get("redirect_destination")?.value;
  if (!redirectCookie) return null;

  try {
    const { payload } = await jwtVerify(redirectCookie, secrets.jwt);
    return (payload.destination as string) || null;
  } catch {
    return null;
  }
}

/**
 * Get authenticated session from request
 */
async function getSession(request: NextRequest): Promise<Session | null> {
  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.publishableKey,
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

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
 * Generate session token for a user
 */
async function generateSessionToken(email: string): Promise<string> {
  // Check if Supabase user exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  let supabaseUser = existingUsers?.users.find((u) => u.email === email);

  // Create Supabase user if doesn't exist
  if (!supabaseUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error) throw error;
    supabaseUser = data.user;
  }

  // Generate magic link to extract token
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error) throw error;

  // Extract token from magic link URL
  const url = new URL(data.properties.action_link);
  const token = url.searchParams.get("token");

  if (!token) {
    throw new Error("Failed to extract token from magic link");
  }

  return token;
}

/**
 * Instant authentication (password-verified users)
 */
async function instantAuth(request: NextRequest, email: string, userExists: boolean): Promise<AuthResult> {
  try {
    const sessionToken = await generateSessionToken(email);
    const redirectTo = userExists ? await getRedirectDestination(request) : undefined;

    return {
      type: "instant-auth",
      needsProfile: !userExists,
      redirectTo: redirectTo ?? undefined,
      sessionToken,
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
async function sendMagicLink(request: NextRequest, email: string): Promise<AuthResult> {
  try {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`,
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

// ===== Public Handlers =====

const MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Handler for password verification
 * POST /api/auth/verify-password
 */
async function passwordVerify(request: NextRequest): Promise<NextResponse> {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Validate format
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check if locked out
    const attemptsCookie = request.cookies.get("password_attempts")?.value;
    let attemptsData: { attempts: number; lockedUntil?: number } | null = null;

    if (attemptsCookie) {
      attemptsData = await verifyAttemptsToken(attemptsCookie);
    }

    if (attemptsData?.lockedUntil) {
      const now = Date.now();
      if (now < attemptsData.lockedUntil) {
        const remainingSeconds = Math.ceil((attemptsData.lockedUntil - now) / 1000);
        return NextResponse.json(
          {
            error: `Too many failed attempts. Please try again in ${remainingSeconds} seconds.`,
            lockedUntil: attemptsData.lockedUntil,
          },
          { status: 429 }
        );
      }
    }

    // Verify password
    const isCorrect = password === secrets.sitePassword;

    if (isCorrect) {
      const response = NextResponse.json({ success: true });

      // Clear attempts cookie
      response.cookies.delete("password_attempts");

      // Set password verified cookie
      const passwordToken = await createPasswordToken();
      response.cookies.set("site_password_verified", passwordToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 24 * 60 * 60, // 60 days
      });

      return response;
    } else {
      // Increment failed attempts
      const currentAttempts = attemptsData?.attempts || 0;
      const newAttempts = currentAttempts + 1;

      if (newAttempts >= MAX_ATTEMPTS) {
        // Lock out user
        const lockedUntil = Date.now() + LOCKOUT_DURATION;
        const attemptsToken = await createAttemptsToken(newAttempts, lockedUntil);

        const response = NextResponse.json(
          {
            error: "Too many failed attempts. Please try again in 5 minutes.",
            lockedUntil,
          },
          { status: 429 }
        );

        response.cookies.set("password_attempts", attemptsToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60, // 1 hour
        });

        return response;
      } else {
        // Update attempts
        const attemptsToken = await createAttemptsToken(newAttempts);

        const response = NextResponse.json(
          {
            error: "Incorrect password",
            attemptsRemaining: MAX_ATTEMPTS - newAttempts,
          },
          { status: 401 }
        );

        response.cookies.set("password_attempts", attemptsToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60, // 1 hour
        });

        return response;
      }
    }
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Handler for email submission
 * POST /api/auth/email
 *
 * Handles both instant auth (password-verified) and magic link
 */
async function email(request: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if password is verified
    const hasPassword = await hasPasswordVerification(request);

    // Check if user exists in database
    const existingUser = await database.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    let result: AuthResult;

    if (hasPassword) {
      // Instant authentication path
      result = await instantAuth(request, normalizedEmail, !!existingUser);
    } else {
      // Magic link path
      result = await sendMagicLink(request, normalizedEmail);
    }

    if (result.type === "error") {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Auth email error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Handler for profile completion
 * POST /api/auth/complete-profile
 */
async function profile(request: NextRequest): Promise<NextResponse> {
  try {
    const { displayName } = await request.json();

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    // Validate display name format
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Get authenticated user from session
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to complete your profile" },
        { status: 401 }
      );
    }

    const trimmedName = displayName.trim();

    // Check if display name is taken
    const existingDisplayName = await database.query.users.findFirst({
      where: eq(users.displayName, trimmedName),
    });

    if (existingDisplayName) {
      return NextResponse.json(
        { error: `The display name "${trimmedName}" is already taken`, code: "DISPLAY_NAME_TAKEN" },
        { status: 400 }
      );
    }

    // Create user record
    try {
      await database.insert(users).values({
        id: session.userId,
        email: session.email,
        displayName: trimmedName,
      });

      // Get redirect destination
      const redirectTo = (await getRedirectDestination(request)) || "/";

      return NextResponse.json({
        type: "success",
        redirectTo,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Handler for checking if password cookie is valid
 * GET /api/auth/check-password-cookie
 */
async function checkPasswordCookie(request: NextRequest): Promise<NextResponse> {
  try {
    const verified = await hasPasswordVerification(request);
    return NextResponse.json({ verified });
  } catch (error) {
    console.error("Check password cookie error:", error);
    return NextResponse.json({ verified: false });
  }
}

/**
 * Handler for checking if display name is available
 * GET /api/auth/check-display-name?name=...
 */
async function checkDisplayName(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const displayName = searchParams.get("name");

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    const existing = await database.query.users.findFirst({
      where: eq(users.displayName, displayName.trim()),
    });

    return NextResponse.json({ available: !existing });
  } catch (error) {
    console.error("Check display name error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Handler for getting redirect destination
 * GET /api/auth/get-redirect
 */
async function getRedirect(request: NextRequest): Promise<NextResponse> {
  try {
    const destination = await getRedirectDestination(request);

    // Validate and sanitize destination
    function isValidRedirectPath(path: string | null): boolean {
      if (!path) return false;
      if (!path.startsWith("/")) return false;
      if (path.startsWith("//")) return false;
      if (path.startsWith("/auth/")) return false;
      if (path.includes(".well-known")) return false;
      if (path.includes("devtools")) return false;
      return true;
    }

    const finalDestination = isValidRedirectPath(destination) ? destination : "/";

    // Clear the cookie after reading
    const response = NextResponse.json({ destination: finalDestination });
    response.cookies.delete("redirect_destination");

    return response;
  } catch (error) {
    console.error("Get redirect error:", error);
    return NextResponse.json({ destination: "/" });
  }
}

/**
 * Handler for checking if user exists in database
 * GET /api/auth/user-exists?email=...
 */
async function userExists(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingUser = await database.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    console.error("User exists check error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Utility for routes that require authentication
 * Returns session if authenticated, or error response if not
 */
async function requireAuth(request: NextRequest): Promise<Session | NextResponse> {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return session;
}

// ===== Exports =====

export const authHandlers = {
  passwordVerify,
  email,
  profile,
  checkPasswordCookie,
  checkDisplayName,
  getRedirect,
  userExists,
  requireAuth,
};
