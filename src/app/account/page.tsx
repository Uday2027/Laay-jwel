'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const { user, setUser } = useApp()
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [orders, setOrders] = useState<Array<{ id: number; orderNumber: string; total: number; status: string; createdAt: string }>>([])
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setError(''); setLoading(true)
    const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = tab === 'login' ? { email: form.email, password: form.password } : form
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (res.ok) { setUser(data.user); setError('') }
    else setError(data.error)
    setLoading(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'badge-orange', PROCESSING: 'badge-blue', SHIPPED: 'badge-blue',
    DELIVERED: 'badge-green', CANCELLED: 'badge-red'
  }

  if (user) {
    return (
      <div style={{ paddingTop: 'var(--header-offset)', minHeight: '100vh', background: 'var(--cream)' }}>
        <div style={{ background: 'var(--cream-dark)', padding: '4rem 0 3rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)' }}>My Account</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginTop: '0.5rem' }}>Welcome, {user.name.split(' ')[0]}</h1>
        </div>
        <div className="container" style={{ padding: '3rem 2rem', maxWidth: '800px' }}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            {user.role === 'ADMIN' && <button className="btn btn-gold btn-sm" onClick={() => router.push('/admin')}>Admin Panel</button>}
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </div>
          <div className="admin-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.5rem' }}>Account Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.87rem' }}>
              {[['Name', user.name], ['Email', user.email]].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</p>
                  <p style={{ color: 'var(--charcoal)' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>My Orders</h3>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No orders yet</p>
                <a href="/shop" className="btn btn-primary btn-sm">Start Shopping</a>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Order #</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)' }}>{o.orderNumber}</td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td>৳{o.total.toLocaleString()}</td>
                        <td><span className={`badge ${STATUS_COLORS[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 'var(--header-offset)', minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem' }}>{tab === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.87rem' }}>
            {tab === 'login' ? 'Sign in to manage your orders and saved details' : 'Join Laay for exclusive updates and offers'}
          </p>
        </div>

        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }} style={{
                flex: 1, padding: '0.75rem', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
                color: tab === t ? 'var(--charcoal)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom: '-1px', transition: 'all 0.2s',
              }}>{t === 'login' ? 'Login' : 'Register'}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tab === 'register' && (
              <div className="input-group">
                <label className="label">Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
              </div>
            )}
            <div className="input-group">
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="hello@example.com" />
            </div>
            {tab === 'register' && (
              <div className="input-group">
                <label className="label">Phone (optional)</label>
                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
              </div>
            )}
            <div className="input-group">
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button className="btn btn-primary btn-lg btn-block" onClick={handleAuth} disabled={loading}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
          <div className="divider" style={{ marginTop: '1.5rem' }}><span className="divider-text">or</span></div>
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            <a href="/checkout" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>Continue as guest →</a>
          </p>
        </div>
      </div>
    </div>
  )
}
