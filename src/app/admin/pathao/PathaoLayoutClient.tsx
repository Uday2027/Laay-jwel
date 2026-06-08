'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const PATHAO_NAV = [
  { href: '/admin/pathao', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/pathao/stores', label: 'Stores', icon: '🏪' },
  { href: '/admin/pathao/orders', label: 'Send Orders', icon: '📦' },
  { href: '/admin/pathao/tracking', label: 'Track Parcels', icon: '🔍' },
]

export default function PathaoLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      {/* Pathao Sub-header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem', color: 'var(--charcoal)' }}>Pathao Courier</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Manage stores, send orders, and track parcels</p>
        </div>
      </div>

      {/* Secondary Nav */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        {PATHAO_NAV.map(item => {
          const active = item.href === '/admin/pathao' ? pathname === '/admin/pathao' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                background: active ? 'var(--charcoal)' : 'transparent',
                color: active ? 'var(--cream)' : 'var(--text-secondary)',
                border: active ? '1px solid var(--charcoal)' : '1px solid var(--border)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
