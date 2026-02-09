import { InsultGenerator } from "@/components/insult-generator";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CreditCard, LogOut, Settings } from "lucide-react";

import { AccessModal } from "@/components/access-modal";

export default async function JerkstorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const isPaidBypass = params.paid === "true";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // Check for subscription
  const subscription = await prisma.user_subscription.findUnique({
    where: {
      userId_siteSlug: {
        userId: session.user.id,
        siteSlug: "jerkstore",
      },
    },
  });

  const isActive = !!(subscription &&
    subscription.status === "active" &&
    new Date(subscription.expiresAt) > new Date());

  return (
    <div className="min-h-screen bg-neutral-100 p-4 relative">

      {/* App Header */}
      <header className="max-w-2xl mx-auto mb-8 flex justify-between items-center bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="font-black uppercase italic text-xl tracking-tighter">Jerkstore App</div>
        <div className="flex gap-4">
          <Link
            href="/billing"
            className="p-2 hover:bg-yellow-300 border-2 border-transparent hover:border-black transition-all"
            title="Manage Subscription"
          >
            <CreditCard className="w-6 h-6" />
          </Link>
          <Link
            href="/sites/jerkstore"
            className="p-2 hover:bg-neutral-200 border-2 border-transparent hover:border-black transition-all"
            title="Marketing Page"
          >
            <Settings className="w-6 h-6" />
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center">
        <InsultGenerator isPaidBypass={isPaidBypass} isActive={isActive} />
      </main>

      <footer className="max-w-xl mx-auto mt-8 text-center font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
        Logged in as {session.user.email}
      </footer>
    </div>
  );
}
