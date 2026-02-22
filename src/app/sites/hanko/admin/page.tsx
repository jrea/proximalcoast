import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminClientView from "./admin-client-view";

export default async function HankoAdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  if (!session.session.activeOrganizationId) {
    redirect("/onboarding");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  return <AdminClientView session={session} initialCredits={user?.credits ?? 0} />;
}
