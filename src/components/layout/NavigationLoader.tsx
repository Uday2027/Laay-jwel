'use client'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NavigationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 500)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  if (!isNavigating) return null

  return (
    <>
      <style>{`
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseLoader {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.1); opacity: 0.75; }
        }
        @keyframes fadeInLoader {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(250, 247, 242, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        animation: 'fadeInLoader 0.25s ease-out forwards',
      }}>
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          {/* Spinning gold halo */}
          <div style={{
            position: 'absolute',
            inset: -8,
            border: '2px solid transparent',
            borderTopColor: 'var(--gold)',
            borderBottomColor: 'var(--gold)',
            borderRadius: '50%',
            animation: 'spinLoader 1s linear infinite',
          }} />
          {/* Pulsing Favicon */}
          <img 
            src="/favicon.ico" 
            alt="Loading..." 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              animation: 'pulseLoader 1.6s ease-in-out infinite',
            }} 
          />
        </div>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
          color: 'var(--charcoal)',
          textTransform: 'uppercase',
          fontWeight: 400,
        }}>
          Laay
        </p>
      </div>
    </>
  )
}

