"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { authClient } from "@/lib/auth-client";
import { useJerkstoreAnalytics } from "../_lib/analytics-client";

export function JerkstoreAnalytics() {
  const analytics = useJerkstoreAnalytics();
  const posthog = usePostHog();
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const previousPage = useRef<string | null>(null);
  const previousUser = useRef<string | null>(null);
  const completedAuth = useRef<string | null>(null);

  useEffect(() => {
    if (previousPage.current !== pathname && window.location.pathname === "/") analytics.capture("jerkstore_landing_viewed");
    previousPage.current = pathname;
  }, [pathname, analytics]);

  useEffect(() => {
    if (isPending) return;
    const userId = session?.user.id ?? null;
    try {
      if (previousUser.current && previousUser.current !== userId) posthog?.reset();
      if (userId && previousUser.current !== userId) posthog?.identify(userId);
    } catch { /* optional tracker */ }
    previousUser.current = userId;

    const result = searchParams.get("auth_result");
    const provider = searchParams.get("auth_provider");
    if (!result) { completedAuth.current = null; return; }
    if (!userId || (result !== "signup" && result !== "login") || (provider !== "google" && provider !== "email")) return;
    const completion = `${userId}:${result}:${provider}`;
    if (completedAuth.current === completion) return;
    completedAuth.current = completion;
    analytics.capture("auth_completed", { provider, type: result });
    const cleaned = new URLSearchParams(searchParams.toString());
    cleaned.delete("auth_result"); cleaned.delete("auth_provider");
    router.replace(`${window.location.pathname}${cleaned.size ? `?${cleaned}` : ""}`, { scroll: false });
  }, [session, isPending, searchParams, router, posthog, analytics]);

  return null;
}
