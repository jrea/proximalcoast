import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    ui_host: 'https://us.posthog.com',
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  })
}

export default posthog
