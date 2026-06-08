'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Small delay to ensure the URL is fully resolved
    const timeout = setTimeout(() => {
      trackPageView(window.location.pathname + window.location.search)
    }, 100)
    return () => clearTimeout(timeout)
  }, [pathname])

  return null
}
