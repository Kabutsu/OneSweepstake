import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SweepstakeLobbyPage from "@/components/sweepstakes/sweepstake-lobby-page";
import LoadingState from "@/components/loading-state";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SweepstakeLobby({ params }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/enter");
  }

  const { id } = await params;

  return (
    <Suspense fallback={<LoadingState />}>
      <SweepstakeLobbyPage sweepstakeId={id} userId={user.id} />
    </Suspense>
  );
}
