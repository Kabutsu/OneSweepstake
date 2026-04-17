import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardPage from "@/components/dashboard/dashboard-page";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/enter");
  }

  return <DashboardPage />;
}
