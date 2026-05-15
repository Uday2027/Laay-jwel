'use client'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NavigationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 400)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  if (!isNavigating) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      zIndex: 9999,
      background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
      animation: 'navLoader 0.6s ease-in-out infinite',
    }} />
  )
}
