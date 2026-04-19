import { AdminPanelPage } from "@/components/admin/shared";
import { createCaller } from '@/lib/trpc/server';

export default async function AdminPage() {
  const trpc = await createCaller();
  const { tournaments } = await trpc.admin.listTournaments();

  return <AdminPanelPage initialTournaments={tournaments} />;
}
