import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SeedingConfig } from "@/types/admin";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tournament seeding config
    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id))
      .limit(1);

    if (!tournament || tournament.length === 0) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      seedingConfig: tournament[0].seedingConfig || null,
    });
  } catch (error) {
    console.error("Error fetching seeding config:", error);
    return NextResponse.json(
      { error: "Failed to fetch seeding configuration" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const seedingConfig: SeedingConfig = body.seedingConfig;

    // Validate seeding config structure
    if (!seedingConfig || !Array.isArray(seedingConfig.tiers)) {
      return NextResponse.json(
        { error: "Invalid seeding configuration" },
        { status: 400 }
      );
    }

    // Update tournament with new seeding config
    await db
      .update(tournaments)
      .set({
        seedingConfig: seedingConfig,
        updatedAt: new Date(),
      })
      .where(eq(tournaments.id, id));

    return NextResponse.json({ success: true, seedingConfig });
  } catch (error) {
    console.error("Error saving seeding config:", error);
    return NextResponse.json(
      { error: "Failed to save seeding configuration" },
      { status: 500 }
    );
  }
}
