import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createCaller } from '@/lib/trpc/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/enter");
  }

  const trpc = await createCaller();
  const { isAdmin } = await trpc.user.isUserAdmin({ id: user.id });

  // Show 404 if not admin
  if (!isAdmin) {
    notFound();
  }

  return <>{children}</>;
}
