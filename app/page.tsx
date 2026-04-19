import { Suspense } from 'react';
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCaller } from "@/lib/trpc/server";
import DashboardPage from "@/components/dashboard/dashboard-page";
import LoadingState from "@/components/loading-state";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/enter");
  }

  const trpc = await createCaller();
  const { user: userData} = await trpc.user.getUser({ id: user.id });

  return (
    <Suspense fallback={<LoadingState />}>
      <DashboardPage user={userData} />
    </Suspense>
  );
}
