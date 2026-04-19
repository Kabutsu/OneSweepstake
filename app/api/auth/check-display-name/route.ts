import { NextRequest, NextResponse } from "next/server";
import { createAuthService } from "@/lib/auth/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const displayName = searchParams.get("name");

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    const authService = createAuthService(request);
    const available = await authService.isDisplayNameAvailable(displayName);

    return NextResponse.json({ available });
  } catch (error) {
    console.error("Check display name error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
