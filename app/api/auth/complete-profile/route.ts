import { NextRequest, NextResponse } from "next/server";
import { createAuthService } from "@/lib/auth/service";
import { validateDisplayName } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const { displayName } = await request.json();

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    // Validate display name format
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      console.error("Display name validation error:", validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const authService = createAuthService(request);
    const result = await authService.completeProfile(displayName);

    if (result.type === "error") {
      console.error("Complete profile error:", result.error);
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.code === "UNAUTHENTICATED" ? 401 : 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
