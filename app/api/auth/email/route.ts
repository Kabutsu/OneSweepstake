import { NextRequest, NextResponse } from "next/server";
import { createAuthService } from "@/lib/auth/service";
import { validateEmail } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const validation = validateEmail(email);
    if (!validation.isValid) {
      console.error("Email validation error:", validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const authService = createAuthService(request);
    const result = await authService.authenticateWithEmail(email);

    if (result.type === "error") {
      console.error("Auth email error:", result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
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
