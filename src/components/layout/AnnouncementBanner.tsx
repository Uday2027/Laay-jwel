'use client'
import { useEffect, useState, useRef } from 'react'

export default function AnnouncementBanner() {
  const [text, setText] = useState('')
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(true)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/settings/public').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.bannerText) { setText(data.bannerText); setActive(data.bannerActive) }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const el = document.documentElement
    if (!active || !text || !visible) {
      el.style.setProperty('--banner-height', '0px')
      return
    }
    if (!bannerRef.current) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        el.style.setProperty('--banner-height', `${entry.contentRect.height}px`)
      }
    })
    
    observer.observe(bannerRef.current)
    
    return () => {
      observer.disconnect()
      el.style.setProperty('--banner-height', '0px')
    }
  }, [active, text, visible])

  if (!active || !text || !visible) return null

  return (
    <div
      ref={bannerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        minHeight: '44px',
        zIndex: 60,
        background: 'linear-gradient(90deg, var(--charcoal) 0%, #3a3330 50%, var(--charcoal) 100%)',
        color: 'var(--cream)',
        padding: '0.5rem 1rem',
        textAlign: 'center',
        fontSize: '0.72rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* gold shimmer line at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', maxWidth: '85%', margin: '0 auto', lineHeight: 1.5, flexWrap: 'wrap', padding: '0.2rem 0' }}>
        <span style={{ color: 'var(--gold)', fontSize: '0.65rem', flexShrink: 0 }}>✦</span>
        <span>{text}</span>
        <span style={{ color: 'var(--gold)', fontSize: '0.65rem', flexShrink: 0 }}>✦</span>
      </div>

      <button
        onClick={() => setVisible(false)}
        style={{
          position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'rgba(245,239,232,0.5)',
          cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1,
        }}
        aria-label="Close banner"
      >×</button>
    </div>
  )
}
