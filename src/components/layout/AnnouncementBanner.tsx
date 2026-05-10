'use client'
import { useEffect, useState } from 'react'

export default function AnnouncementBanner() {
  const [text, setText] = useState('')
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    fetch('/api/settings/public').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.bannerText) { setText(data.bannerText); setActive(data.bannerActive) }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    // Push a CSS variable so navbar can offset itself
    const el = document.documentElement
    if (active && text && visible) {
      el.style.setProperty('--banner-height', '36px')
    } else {
      el.style.setProperty('--banner-height', '0px')
    }
    return () => el.style.setProperty('--banner-height', '0px')
  }, [active, text, visible])

  if (!active || !text || !visible) return null

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, var(--charcoal) 0%, #3a3330 50%, var(--charcoal) 100%)',
        color: 'var(--cream)',
        padding: '0 1rem',
        textAlign: 'center',
        fontSize: '0.72rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        position: 'relative',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
      }}
    >
      {/* gold shimmer line */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ color: 'var(--gold)', fontSize: '0.65rem' }}>✦</span>
        {text}
        <span style={{ color: 'var(--gold)', fontSize: '0.65rem' }}>✦</span>
      </span>
      <button
        onClick={() => setVisible(false)}
        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(245,239,232,0.5)', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1 }}
        aria-label="Close banner"
      >×</button>
    </div>
  )
}
