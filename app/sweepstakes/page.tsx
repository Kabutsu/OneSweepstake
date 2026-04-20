import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SweepstakesPage from "@/components/sweepstakes/sweepstakes-page";
import LoadingState from "@/components/loading-state";

export default async function Sweepstakes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/enter");
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <SweepstakesPage />
    </Suspense>
  );
}
