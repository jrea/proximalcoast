"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { InsultGenerator } from "./insult-generator";

export function LandingGenerator({
  initialLanguage = "English",
  isHomePage = true,
  returnTo,
}: {
  initialLanguage?: string;
  isHomePage?: boolean;
  returnTo?: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;
  const [balance, setBalance] = useState<{ userId: string; credits: number } | null>(null);
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    fetch("/api/credits", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data: { credits?: number } = await response.json();
        if (typeof data.credits === "number" && !controller.signal.aborted) {
          setBalance({ userId, credits: data.credits });
        }
      }).catch(() => {});
    return () => controller.abort();
  }, [userId]);
  const credits = balance && balance.userId === userId ? balance.credits : 0;
  return (
    <fieldset disabled={isPending} aria-busy={isPending} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <InsultGenerator key={initialLanguage} isActive plan="trial"
        initialButtonLabel="Roast it, Broseph" initialTopicLabel="Topic to Roast"
        initialLanguage={initialLanguage} returnTo={returnTo}
        isHomePage={isHomePage} areFeaturesLocked={!session} credits={session ? credits : 0} />
    </fieldset>
  );
}
