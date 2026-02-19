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

import { JerkstoreNav } from "../_components/nav";

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

  const canRoast = true; // Logged in users can always try to roast (credits checked on backend)
  const plan = isActive ? (subscription?.plan || "standard") : "trial";

  const userCredits = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true }
  });
  const credits = userCredits?.credits || 0;

  const randomButtonLabel = BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)];
  const randomTopicLabel = TOPIC_LABELS[Math.floor(Math.random() * TOPIC_LABELS.length)];

  return (
    <div className="min-h-screen bg-neutral-100 p-4 relative overflow-x-hidden">

      {/* App Header */}
      <JerkstoreNav />

      <main className="flex items-center justify-center w-full">
        <InsultGenerator
          isActive={canRoast}
          plan={plan}
          initialButtonLabel={randomButtonLabel}
          initialTopicLabel={randomTopicLabel}
          credits={credits}
        />
      </main>

      <footer className="max-w-xl mx-auto mt-12 mb-8 text-center font-mono text-[9px] sm:text-[10px] text-neutral-400 uppercase tracking-widest flex flex-col gap-2">
        <div>Logged in as {session.user.name} ({session.user.email})</div>
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
