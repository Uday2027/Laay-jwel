'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/orders', label: 'Orders', icon: '📋' },
  { href: '/admin/products', label: 'Products', icon: '🛍️' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🏷️' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/pathao', label: 'Pathao', icon: '🚚' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'ADMIN') router.replace('/account')
      else setChecking(false)
    }).catch(() => router.replace('/account'))
  }, [router])

  // Hide public navbar/footer when in admin panel
  useEffect(() => {
    document.body.classList.add('admin-mode')
    return () => document.body.classList.remove('admin-mode')
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/account')
  }

  if (checking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--charcoal)' }}>
      <div className="spinner" style={{ borderColor: 'rgba(201,169,110,0.3)', borderTopColor: 'var(--gold)' }} />
    </div>
  )

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 1.5rem 2rem', borderBottom: '1px solid rgba(245,239,232,0.1)' }}>
          <Image src="/logo.png" alt="Laay" width={80} height={32} style={{ filter: 'invert(1) sepia(1) saturate(0.3) brightness(1.5)' }} />
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', marginTop: '0.4rem' }}>Admin Panel</p>
        </div>
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`admin-nav-item ${active ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ borderTop: '1px solid rgba(245,239,232,0.1)', padding: '1rem 1.5rem' }}>
          <button className="admin-nav-item" onClick={handleLogout} style={{ padding: '0.75rem 0', color: 'rgba(245,239,232,0.5)' }}>
            <span>↩</span> Logout
          </button>
          <Link href="/" className="admin-nav-item" style={{ padding: '0.5rem 0', color: 'rgba(245,239,232,0.4)', fontSize: '0.72rem' }}>
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Mobile header */}
        <div className="admin-mobile-header">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Image src="/logo.png" alt="Laay" width={60} height={24} style={{ filter: 'invert(0.15)' }} />
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase' }}>Admin</span>
        </div>
        {children}
      </main>
    </div>
  )
}
