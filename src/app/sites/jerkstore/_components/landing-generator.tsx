"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { InsultGenerator } from "./insult-generator";

export function LandingGenerator() {
  const { data: session } = authClient.useSession();
  const [credits, setCredits] = useState(0);
  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    fetch("/api/credits", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data: { credits?: number } = await response.json();
        if (typeof data.credits === "number" && !controller.signal.aborted) setCredits(data.credits);
      }).catch(() => {});
    return () => controller.abort();
  }, [session]);
  return <InsultGenerator isActive plan="trial"
    initialButtonLabel="Roast it, Broseph" initialTopicLabel="Topic to Roast"
    isHomePage areFeaturesLocked={!session} credits={session ? credits : 0} />;
}
