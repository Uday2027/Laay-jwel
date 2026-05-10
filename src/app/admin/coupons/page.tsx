'use client'
import { useState, useEffect, useCallback } from 'react'

interface Coupon { id: number; code: string; discount: number; usageCount: number; usageLimit: number | null; active: boolean; totalRevenue: number; totalSaved: number; expiresAt: string | null; createdAt: string }

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', discount: '', usageLimit: '', expiresAt: '', active: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadCoupons = useCallback(() => {
    fetch('/api/coupons').then(r => r.json()).then(d => setCoupons(d.coupons || []))
  }, [])

  useEffect(() => { loadCoupons() }, [loadCoupons])

  const saveCoupon = async () => {
    setError(''); setSaving(true)
    const res = await fetch('/api/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: form.code, discount: parseFloat(form.discount), usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null, expiresAt: form.expiresAt || null, active: form.active })
    })
    const data = await res.json()
    if (res.ok) { loadCoupons(); setShowForm(false); setForm({ code: '', discount: '', usageLimit: '', expiresAt: '', active: true }) }
    else setError(data.error)
    setSaving(false)
  }

  const toggleActive = async (coupon: Coupon) => {
    await fetch(`/api/coupons/${coupon.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !coupon.active }) })
    loadCoupons()
  }

  const deleteCoupon = async (id: number) => {
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
    loadCoupons()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem' }}>Coupon Codes</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Create Coupon</button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: '1.5rem', border: '2px solid var(--gold)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>New Coupon</h3>
          <div className="form-row">
            <div className="input-group">
              <label className="label">Code *</label>
              <input className="input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SUMMER20" />
            </div>
            <div className="input-group">
              <label className="label">Discount % *</label>
              <input className="input" type="number" min="1" max="100" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="e.g. 15" />
            </div>
            <div className="input-group">
              <label className="label">Usage Limit (optional)</label>
              <input className="input" type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="Leave blank for unlimited" />
            </div>
            <div className="input-group">
              <label className="label">Expiry Date (optional)</label>
              <input className="input" type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
            </div>
          </div>
          {error && <p className="error-msg" style={{ marginTop: '0.5rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={saveCoupon} disabled={saving}>{saving ? 'Saving...' : 'Create Coupon'}</button>
            <button className="btn btn-outline" onClick={() => { setShowForm(false); setError('') }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <div className="admin-stat-value">{coupons.length}</div>
          <div className="admin-stat-label">Total Coupons</div>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <div className="admin-stat-value" style={{ color: 'var(--gold)' }}>৳{coupons.reduce((s, c) => s + c.totalRevenue, 0).toLocaleString()}</div>
          <div className="admin-stat-label">Revenue from Coupons</div>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <div className="admin-stat-value" style={{ color: 'var(--blush-deep)' }}>৳{coupons.reduce((s, c) => s + c.totalSaved, 0).toLocaleString()}</div>
          <div className="admin-stat-label">Total Discount Given</div>
        </div>
      </div>

      {/* Coupons table */}
      <div className="admin-card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>Discount</th><th>Used</th><th>Limit</th><th>Revenue</th><th>Saved</th><th>Status</th><th>Expires</th><th>Actions</th></tr></thead>
            <tbody>
              {coupons.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No coupons yet</td></tr>}
              {coupons.map(c => (
                <tr key={c.id}>
                  <td><span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--charcoal)' }}>{c.code}</span></td>
                  <td><span className="badge badge-gold">{c.discount}%</span></td>
                  <td>{c.usageCount}</td>
                  <td>{c.usageLimit ?? '∞'}</td>
                  <td>৳{c.totalRevenue.toLocaleString()}</td>
                  <td style={{ color: 'var(--gold)' }}>৳{c.totalSaved.toLocaleString()}</td>
                  <td>
                    <button onClick={() => toggleActive(c)} className={`badge ${c.active ? 'badge-green' : 'badge-red'}`} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}>
                      <span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#c0392b', fontSize: '0.72rem' }} onClick={() => deleteCoupon(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
