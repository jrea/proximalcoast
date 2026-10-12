"use client";

import { useMemo } from "react";
import { usePostHog } from "posthog-js/react";
import type { CaptureOptions } from "posthog-js";
import { sendGAEvent } from "@next/third-parties/google";
import { analyticsUrl, googleAnalyticsEvent, safeAnalyticsProperties } from "./analytics-events";

export function useJerkstoreAnalytics() {
  const posthog = usePostHog();
  return useMemo(() => ({
    capture(event: string, properties: Record<string, unknown> = {}, options?: CaptureOptions) {
      const safe = safeAnalyticsProperties(properties);
      // Analytics must never interrupt generation, authentication or checkout.
      try {
        if (options) posthog?.capture(event, safe, options);
        else posthog?.capture(event, safe);
      } catch { /* optional tracker */ }
      const googleEvent = googleAnalyticsEvent(event, safe);
      if (process.env.NEXT_PUBLIC_GA_ID && googleEvent) {
        try {
          const gaWindow = window as Window & { dataLayer?: unknown[] };
          gaWindow.dataLayer ??= [];
          sendGAEvent("event", googleEvent.name, { ...googleEvent.params, page_location: analyticsUrl(window.location.href) });
        } catch { /* optional tracker */ }
      }
    },
  }), [posthog]);
}
