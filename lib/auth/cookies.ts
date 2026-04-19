import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";
import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const JWT_SECRET = new TextEncoder().encode(env.auth.jwtSecret);

// Cookie names
export const COOKIE_NAMES = {
  PASSWORD_VERIFIED: "site_password_verified",
  REDIRECT_DESTINATION: "redirect_destination",
} as const;

// Cookie configuration
const COOKIE_CONFIG: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

// 60 days in seconds
const PASSWORD_COOKIE_MAX_AGE = 60 * 24 * 60 * 60;

/**
 * Create a signed JWT for password verification
 */
export async function createPasswordVerifiedToken(): Promise<string> {
  const token = await new SignJWT({ passwordVerified: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${PASSWORD_COOKIE_MAX_AGE}s`)
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify the password verified JWT
 */
export async function verifyPasswordVerifiedToken(
  token: string
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.passwordVerified === true;
  } catch {
    return false;
  }
}

/**
 * Create a signed JWT for storing redirect destination
 */
async function createRedirectToken(destination: string): Promise<string> {
  const token = await new SignJWT({ destination })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h") // Short expiry for redirect
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and extract redirect destination
 */
async function verifyRedirectToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return typeof payload.destination === "string" ? payload.destination : null;
  } catch {
    return null;
  }
}

/**
 * Set the password verified cookie
 */
export async function setPasswordVerifiedCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = await createPasswordVerifiedToken();

  cookieStore.set(COOKIE_NAMES.PASSWORD_VERIFIED, token, {
    ...COOKIE_CONFIG,
    maxAge: PASSWORD_COOKIE_MAX_AGE,
  });
}

/**
 * Check if password verified cookie is valid
 */
export async function isPasswordVerified(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.PASSWORD_VERIFIED)?.value;

  if (!token) return false;
  return await verifyPasswordVerifiedToken(token);
}

/**
 * Set redirect destination cookie
 */
export async function setRedirectCookie(destination: string): Promise<void> {
  const cookieStore = await cookies();
  const token = await createRedirectToken(destination);

  cookieStore.set(COOKIE_NAMES.REDIRECT_DESTINATION, token, {
    ...COOKIE_CONFIG,
    maxAge: 60 * 60, // 1 hour
  });
}

/**
 * Get and clear redirect destination
 */
export async function getAndClearRedirectCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.REDIRECT_DESTINATION)?.value;

  if (!token) return null;

  const destination = await verifyRedirectToken(token);
  cookieStore.delete(COOKIE_NAMES.REDIRECT_DESTINATION);

  return destination;
}

/**
 * Clear all auth cookies (for logout)
 */
export async function clearAllAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.PASSWORD_VERIFIED);
  cookieStore.delete(COOKIE_NAMES.REDIRECT_DESTINATION);
}
