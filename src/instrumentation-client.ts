import posthog from "posthog-js";
import { analyticsUrl } from "./app/sites/jerkstore/_lib/analytics-events";
import { getSiteFromHostname, getStoredConsent } from "./lib/analytics-consent";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  const site = getSiteFromHostname(window.location.hostname);
  const isJerkstore = site === "jerkstore";
  const optedOut = getStoredConsent() === "denied";

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    ui_host: "https://us.posthog.com",
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    opt_out_capturing_by_default: optedOut,
    before_send: (event) => {
      if (!event) return event;
      for (const key of ["$current_url", "$referrer", "$initial_current_url", "$initial_referrer"]) {
        const value = event.properties[key];
        if (typeof value === "string") event.properties[key] = analyticsUrl(value);
      }
      event.properties.site = site;
      return event;
    },
    ...(isJerkstore
      ? {
          autocapture: false,
          capture_dead_clicks: false,
          disable_session_recording: true,
        }
      : {}),
  });
}

export default posthog;
