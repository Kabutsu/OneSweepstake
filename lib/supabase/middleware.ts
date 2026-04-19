import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(env.auth.jwtSecret);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/auth/enter", "/auth/signout", "/auth/callback", "/auth/complete-profile"];

// Check if the route is an API route
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/**
 * Check if a path should be stored as a redirect destination
 */
function shouldStoreRedirect(pathname: string): boolean {
  // Don't store root (default destination anyway)
  if (pathname === "/") return false;
  
  // Don't store auth routes
  if (pathname.startsWith("/auth/")) return false;
  
  // Don't store internal/dev paths
  if (pathname.includes(".well-known")) return false;
  if (pathname.includes("devtools")) return false;
  
  // Don't store Next.js internals
  if (pathname.startsWith("/_next/")) return false;
  
  return true;
}

/**
 * Create redirect destination cookie
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
 * Create password verified cookie
 */
async function createPasswordToken(): Promise<string> {
  const token = await new SignJWT({ passwordVerified: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${60 * 24 * 60 * 60}s`) // 60 days
    .setIssuedAt()
    .sign(JWT_SECRET);
  return token;
}

export async function updateSession(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  if (isApiRoute(pathname)) {
    return NextResponse.next({ request });
  }
  
  // Create Supabase client for session management
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.supabase.url,
    env.supabase.publishableKey,
    {
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
    }
  );

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Step 1: Handle password parameter in URL (optional override)
  const passwordParam = searchParams.get("password");
  if (passwordParam && passwordParam === env.auth.sitePassword) {
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

  // Step 2: Check if route is public
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // If user is already logged in and tries to access /auth/enter, redirect to home
    if (pathname.startsWith("/auth/enter") && user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
    
    return supabaseResponse;
  }

  // Step 3: If user has valid Supabase session, allow through
  if (user) {
    return supabaseResponse;
  }

  // Step 4: No session - redirect to /auth/enter with destination stored
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth/enter";
  redirectUrl.search = "";

  const response = NextResponse.redirect(redirectUrl);

  // Store original destination if valid
  if (shouldStoreRedirect(pathname)) {
    const redirectToken = await createRedirectToken(pathname);
    response.cookies.set("redirect_destination", redirectToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
  }

  return response;
}
