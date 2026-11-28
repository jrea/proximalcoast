'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { usePostHog } from 'posthog-js/react'
import { analyticsUrl } from './sites/jerkstore/_lib/analytics-events'
import { getSiteFromHostname } from '@/lib/analytics-consent'

function PageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        '$current_url': analyticsUrl(url) || window.origin + pathname,
        site: getSiteFromHostname(window.location.hostname),
      })
    }
  }, [pathname, searchParams, posthog])

  return null
}

export default function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PageView />
    </Suspense>
  )
}
