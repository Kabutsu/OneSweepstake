import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TournamentsPage from "@/components/tournaments/tournaments-page";
import LoadingState from "@/components/loading-state";

export default async function Tournaments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/enter");
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <TournamentsPage />
    </Suspense>
  );
}
