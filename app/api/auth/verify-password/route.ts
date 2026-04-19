import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  getAttemptsCookie,
  setAttemptsCookie,
  clearAttemptsCookie,
  setPasswordVerifiedCookie,
} from "@/lib/auth/cookies";

const MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Check if locked out
    const attemptsData = await getAttemptsCookie();
    if (attemptsData?.lockedUntil) {
      const now = Date.now();
      if (now < attemptsData.lockedUntil) {
        const remainingSeconds = Math.ceil(
          (attemptsData.lockedUntil - now) / 1000
        );
        return NextResponse.json(
          {
            error: `Too many failed attempts. Please try again in ${remainingSeconds} seconds.`,
            lockedUntil: attemptsData.lockedUntil,
          },
          { status: 429 }
        );
      } else {
        // Lockout expired, clear attempts
        await clearAttemptsCookie();
      }
    }

    // Verify password (case-sensitive)
    const isCorrect = password === env.auth.sitePassword;

    if (isCorrect) {
      // Clear attempts and set verified cookie
      await clearAttemptsCookie();
      await setPasswordVerifiedCookie();

      return NextResponse.json({ success: true });
    } else {
      // Increment failed attempts
      const currentAttempts = attemptsData?.attempts || 0;
      const newAttempts = currentAttempts + 1;

      if (newAttempts >= MAX_ATTEMPTS) {
        // Lock out user
        const lockedUntil = Date.now() + LOCKOUT_DURATION;
        await setAttemptsCookie(newAttempts, lockedUntil);

        return NextResponse.json(
          {
            error: `Too many failed attempts. Please try again in 5 minutes.`,
            lockedUntil,
          },
          { status: 429 }
        );
      } else {
        // Update attempts
        await setAttemptsCookie(newAttempts);

        return NextResponse.json(
          {
            error: "Incorrect password",
            attemptsRemaining: MAX_ATTEMPTS - newAttempts,
          },
          { status: 401 }
        );
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
