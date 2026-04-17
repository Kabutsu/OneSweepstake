import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { eq } from "drizzle-orm";
import SeedingPage from "./seeding-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSeedingPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/enter");
  }

  // Get tournament details
  const tournament = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.id, id))
    .limit(1);

  if (!tournament || tournament.length === 0) {
    redirect("/");
  }

  return (
    <SeedingPage
      tournamentId={id}
      tournamentName={tournament[0].name}
      apiId={tournament[0].apiId}
    />
  );
}
