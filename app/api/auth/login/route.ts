import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createSupabaseUser,
  generateSessionToken,
  supabaseUserExists,
} from "@/lib/auth/admin";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // Verify user exists in database
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if Supabase auth user exists, if not create one
    const hasSupabaseAccount = await supabaseUserExists(normalizedEmail);
    
    if (!hasSupabaseAccount) {
      try {
        // Create Supabase account for existing DB user (migration path)
        await createSupabaseUser(normalizedEmail);
      } catch (error: any) {
        console.error("Failed to create Supabase account for existing user:", error);
        // Continue anyway - might already exist from a previous attempt
      }
    }

    // Generate session token
    try {
      const sessionToken = await generateSessionToken(normalizedEmail);
      
      return NextResponse.json({
        success: true,
        sessionToken,
      });
    } catch (error: any) {
      console.error("Session generation error:", error);
      return NextResponse.json(
        { error: "Sorry, we couldn't log you in right now. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
