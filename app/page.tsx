import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to OneSweepstake</h1>
      <p className="text-lg">You are signed in as {user.email}</p>
    </main>
  );
}
