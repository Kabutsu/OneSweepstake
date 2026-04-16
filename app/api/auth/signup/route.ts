import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createSupabaseUser,
  deleteSupabaseUser,
  generateSessionToken,
  supabaseUserExists,
  getSupabaseUserByEmail,
} from "@/lib/auth/admin";

export async function POST(request: NextRequest) {
  try {
    const { email, displayName } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    // Validate display name
    const trimmedName = displayName.trim();
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: "Display name cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedName.length > 50) {
      return NextResponse.json(
        { error: "Display name must be 50 characters or less" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists in database
    const existingDbUser = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (existingDbUser) {
      return NextResponse.json(
        { error: "User already exists. Please log in instead." },
        { status: 400 }
      );
    }

    // Check if display name is already taken
    const existingDisplayName = await db.query.users.findFirst({
      where: eq(users.displayName, trimmedName),
    });

    if (existingDisplayName) {
      return NextResponse.json(
        { error: "This display name is already taken. Please choose another." },
        { status: 400 }
      );
    }

    // Step 1: Check if Supabase user exists
    let supabaseUser;
    let createdNewSupabaseUser = false;
    try {
      supabaseUser = await getSupabaseUserByEmail(normalizedEmail);
    } catch (error: any) {
      console.error("Error checking Supabase user:", error);
    }

    // Step 2: Create Supabase user if they don't exist
    if (!supabaseUser) {
      try {
        supabaseUser = await createSupabaseUser(normalizedEmail);
        createdNewSupabaseUser = true;
      } catch (error: any) {
        console.error("Supabase user creation error:", error);
        return NextResponse.json(
          { error: "Sorry, we couldn't create your account right now. Please try again." },
          { status: 500 }
        );
      }
    }

    // Step 3: Insert into database
    try {
      await db.insert(users).values({
        id: supabaseUser.id,
        email: normalizedEmail,
        displayName: trimmedName,
      });
    } catch (error: any) {
      console.error("Database insert error:", error);
      
      // Check if it's a unique constraint violation
      if (error.code === '23505') { // PostgreSQL unique violation error code
        if (error.message.includes('display_name')) {
          return NextResponse.json(
            { error: "This display name is already taken. Please choose another." },
            { status: 400 }
          );
        }
      }
      
      // Only rollback if we just created the Supabase user
      // (don't delete if they already had an account)
      if (createdNewSupabaseUser) {
        try {
          await deleteSupabaseUser(supabaseUser.id);
        } catch (cleanupError) {
          console.error("Failed to cleanup Supabase user:", cleanupError);
        }
      }

      return NextResponse.json(
        { error: "Sorry, we couldn't create your account right now. Please try again." },
        { status: 500 }
      );
    }

    // Step 4: Generate session token
    try {
      const sessionToken = await generateSessionToken(normalizedEmail);
      
      return NextResponse.json({
        success: true,
        sessionToken,
      });
    } catch (error: any) {
      console.error("Session generation error:", error);
      return NextResponse.json(
        { error: "Account created but couldn't log you in. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
