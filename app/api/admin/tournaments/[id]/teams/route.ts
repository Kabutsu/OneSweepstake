import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCompetitionTeams } from "@/lib/football-data";
import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    // Get tournament details
    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id))
      .limit(1);

    if (!tournament || tournament.length === 0) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Fetch teams from Football-Data.org using the tournament's apiId
    const teams = await fetchCompetitionTeams(tournament[0].apiId);

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch teams";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
