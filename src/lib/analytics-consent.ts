export type AnalyticsConsentState = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "jerkstore-cookie-consent";

const KNOWN_SUBSITES = new Set(["backlinks", "bkd", "jerkstore", "overmake", "slice", "x-rewards"]);

export function getSiteFromHostname(hostname: string): string {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  const firstLabel = normalized.split(".")[0];
  if (firstLabel && KNOWN_SUBSITES.has(firstLabel)) {
    return firstLabel;
  }
  return "proximalcoast";
}

export function getStoredConsent(): AnalyticsConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === "granted" || raw === "true") return "granted";
    if (raw === "denied") return "denied";
  } catch {
    // Storage can be disabled in private browsing contexts.
  }
  return null;
}

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function callGtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const gaWindow = window as GtagWindow;
  if (typeof gaWindow.gtag === "function") {
    gaWindow.gtag(...args);
    return;
  }
  gaWindow.dataLayer ??= [];
  gaWindow.dataLayer.push(args);
}

export function updateAnalyticsConsent(
  state: AnalyticsConsentState,
  posthog?: { opt_in_capturing?: () => void; opt_out_capturing?: () => void } | null,
) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
    } catch {
      // Proceed even if storage is unavailable.
    }
    callGtag("consent", "update", {
      analytics_storage: state,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
  try {
    if (state === "granted") {
      posthog?.opt_in_capturing?.();
    } else {
      posthog?.opt_out_capturing?.();
    }
  } catch {
    // Optional tracker
  }
}
