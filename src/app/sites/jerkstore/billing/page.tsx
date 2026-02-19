import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { BillingContent } from "../_components/billing-content";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default async function BillingManagementPage() {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    redirect("/");
  }

  // Fetch user credit balance
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.user.id },
    select: { credits: true }
  });

  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>}>
      <BillingContent creditBalance={user?.credits ?? 0} />
    </Suspense>
  );
}
