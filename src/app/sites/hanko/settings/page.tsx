import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import SettingsClient from "./settings-client";

export default async function HankoSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, credits: true, createdAt: true },
  });

  return (
    <SettingsClient
      name={user?.name ?? session.user.name}
      email={user?.email ?? session.user.email ?? ""}
      credits={user?.credits ?? 0}
      memberSince={user?.createdAt?.toISOString() ?? ""}
    />
  );
}
