"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsUrl } from "./sites/jerkstore/_lib/analytics-events";
import { callGtag, CONSENT_STORAGE_KEY, getSiteFromHostname } from "@/lib/analytics-consent";

function GoogleAnalyticsPageView({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !gaId) return;
    const query = searchParams.toString();
    const rawUrl = `${window.location.origin}${pathname}${query ? `?${query}` : ""}`;
    const pageLocation = analyticsUrl(rawUrl);
    if (!pageLocation) return;

    callGtag("event", "page_view", {
      page_location: pageLocation,
      page_title: document.title,
      site: getSiteFromHostname(window.location.hostname),
    });
  }, [pathname, searchParams, gaId]);

  return null;
}

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  if (!gaId) return null;

  const initScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
var storedConsent = null;
try { storedConsent = window.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}); } catch (e) {}
var analyticsStorage = (storedConsent === 'granted' || storedConsent === 'true') ? 'granted' : 'denied';
gtag('consent', 'default', {
  analytics_storage: analyticsStorage,
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)}, { send_page_view: false });
`;

  return (
    <>
      <Script id="_ga4-consent-init" strategy="afterInteractive">
        {initScript}
      </Script>
      <Script
        id="_ga4-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView gaId={gaId} />
      </Suspense>
    </>
  );
}
