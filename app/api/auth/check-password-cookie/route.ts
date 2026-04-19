import { NextResponse } from "next/server";
import { isPasswordVerified } from "@/lib/auth/cookies";

export async function GET() {
  try {
    const verified = await isPasswordVerified();
    
    return NextResponse.json({ verified });
  } catch (error) {
    console.error("Check password cookie error:", error);
    return NextResponse.json({ verified: false });
  }
}
