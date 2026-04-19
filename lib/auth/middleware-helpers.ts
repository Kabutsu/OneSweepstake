/**
 * Auth Middleware Helpers
 *
 * Simplified helpers for auth middleware operations
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { jwtVerify, SignJWT } from "jose";

// Import only what's needed for middleware (not the database)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const SITE_PASSWORD = process.env.SITE_PASSWORD!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// ===== Types =====

export interface Auth {
  isAuthenticated(): boolean;
  getSession(): { userId: string; email: string } | null;
  redirectToLogin(): NextResponse;
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
    .sign(JWT_SECRET);
  return token;
}

/**
 * Create redirect destination JWT
 */
async function createRedirectToken(destination: string): Promise<string> {
  const token = await new SignJWT({ destination })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .setIssuedAt()
    .sign(JWT_SECRET);
  return token;
}

/**
 * Check if a path should be stored as a redirect destination
 */
function shouldStoreRedirect(pathname: string): boolean {
  if (pathname === "/") return false;
  if (pathname.startsWith("/auth/")) return false;
  if (pathname.includes(".well-known")) return false;
  if (pathname.includes("devtools")) return false;
  if (pathname.startsWith("/_next/")) return false;
  return true;
}

// ===== Public API =====

/**
 * Create Auth instance from request
 * Provides simplified auth checks and redirects
 */
export async function fromRequest(request: NextRequest): Promise<Auth> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set({ name, value, ...options });
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    isAuthenticated(): boolean {
      return !!user;
    },

    getSession() {
      if (!user || !user.email) {
        return null;
      }
      return {
        userId: user.id,
        email: user.email,
      };
    },

    redirectToLogin(): NextResponse {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/enter";
      redirectUrl.search = "";

      const response = NextResponse.redirect(redirectUrl);

      // Store original destination if valid
      if (shouldStoreRedirect(request.nextUrl.pathname)) {
        createRedirectToken(request.nextUrl.pathname).then((token) => {
          response.cookies.set("redirect_destination", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60, // 1 hour
          });
        });
      }

      return response;
    },
  };
}

/**
 * Handle password parameter in URL
 * Sets password verification cookie if correct
 */
export async function handlePasswordParam(request: NextRequest): Promise<NextResponse | null> {
  const passwordParam = request.nextUrl.searchParams.get("password");

  if (!passwordParam || passwordParam !== SITE_PASSWORD) {
    return null;
  }

  // Set password verified cookie and redirect to clean URL
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.search = "";

  const response = NextResponse.redirect(redirectUrl);

  const passwordToken = await createPasswordToken();
  response.cookies.set("site_password_verified", passwordToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return response;
}

/**
 * Check if route is public (doesn't require auth)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ["/auth/enter", "/auth/signout", "/auth/callback", "/auth/complete-profile"];
  return publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is an API route
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/**
 * Create a complete auth middleware with configuration
 */
export function createAuthMiddleware(config?: { publicRoutes?: string[] }) {
  const publicRoutes = config?.publicRoutes || [
    "/auth/enter",
    "/auth/signout",
    "/auth/callback",
    "/auth/complete-profile",
  ];

  async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip API routes
    if (isApiRoute(pathname)) {
      return NextResponse.next({ request });
    }

    // Handle password parameter
    const passwordResponse = await handlePasswordParam(request);
    if (passwordResponse) {
      return passwordResponse;
    }

    // Check if route is public
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      // If user is already logged in and tries to access /auth/enter, redirect to home
      const auth = await fromRequest(request);
      if (pathname.startsWith("/auth/enter") && auth.isAuthenticated()) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/";
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
      }

      return NextResponse.next({ request });
    }

    // Require authentication for protected routes
    const auth = await fromRequest(request);
    if (!auth.isAuthenticated()) {
      return auth.redirectToLogin();
    }

    return NextResponse.next({ request });
  }

  return {
    middleware,
    config: {
      matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
    },
  };
}
