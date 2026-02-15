import { InsultGenerator } from "../_components/insult-generator";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CreditCard, LogOut, Settings } from "lucide-react";

import { AccessModal } from "../_components/access-modal";
import { LogoutButton } from "../_components/logout-button";
import { Logo } from "../_components/logo";

import { BUTTON_LABELS, TOPIC_LABELS } from "../constants";

export default async function JerkstorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const subscription = await prisma.user_subscription.findUnique({
    where: {
      userId_siteSlug: {
        userId: session.user.id,
        siteSlug: "jerkstore",
      },
    },
  });

  const totalUsage = await prisma.jerkstore_insult.count({
    where: { userId: session.user.id }
  });

  const isActive = !!(subscription &&
    (subscription.status === "active" || subscription.status === "trialing") &&
    new Date(subscription.expiresAt) > new Date());

  const canRoast = isActive; // Must have a card/sub to even try
  const plan = isActive ? (subscription?.plan || "standard") : "trial";

  const randomButtonLabel = BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)];
  const randomTopicLabel = TOPIC_LABELS[Math.floor(Math.random() * TOPIC_LABELS.length)];

  return (
    <div className="min-h-screen bg-neutral-100 p-4 relative overflow-x-hidden">

      {/* App Header */}
      <header className="max-w-2xl mx-auto mb-6 sm:mb-8 flex justify-between items-center bg-white border-4 border-black p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Logo textClassName="text-lg sm:text-xl font-black uppercase italic tracking-tighter" />
        <div className="flex gap-2 sm:gap-4">
          <Link
            href="/app/settings"
            className="p-1.5 sm:p-2 hover:bg-yellow-300 border-2 border-transparent hover:border-black transition-all"
            title="Settings & API Keys"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <Link
            href="/billing"
            className="p-1.5 sm:p-2 hover:bg-yellow-300 border-2 border-transparent hover:border-black transition-all"
            title="Manage Subscription"
          >
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="flex items-center justify-center w-full">
        <InsultGenerator
          isActive={canRoast}
          plan={plan}
          initialButtonLabel={randomButtonLabel}
          initialTopicLabel={randomTopicLabel}
        />
      </main>

      <footer className="max-w-xl mx-auto mt-12 mb-8 text-center font-mono text-[9px] sm:text-[10px] text-neutral-400 uppercase tracking-widest flex flex-col gap-2">
        <div>Logged in as {session.user.email}</div>
        <a
          href="https://x.com/chieftrashofcr"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black transition-colors underline decoration-dotted underline-offset-4"
        >
          Contact: @chieftrashofcr
        </a>
      </footer>
    </div>
  );
}
