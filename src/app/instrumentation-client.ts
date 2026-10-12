import posthog from 'posthog-js'
import { analyticsUrl } from './sites/jerkstore/_lib/analytics-events'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  const isJerkstore = window.location.hostname.startsWith('jerkstore.');
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    ui_host: 'https://us.posthog.com',
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    ...(isJerkstore ? {
      autocapture: false,
      capture_dead_clicks: false,
      disable_session_recording: true,
      before_send: event => {
        if (!event) return event;
        for (const key of ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer']) {
          const value = event.properties[key];
          if (typeof value === 'string') event.properties[key] = analyticsUrl(value);
        }
        event.properties.site = 'jerkstore';
        return event;
      },
    } : {}),
  })
}

export default posthog
