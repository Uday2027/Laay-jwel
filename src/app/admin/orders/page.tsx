'use client'
import { useState, useEffect, useCallback } from 'react'

interface Order {
  id: number; orderNumber: string; name: string; phone: string; status: string;
  total: number; paymentMethod: string; transactionId: string | null;
  createdAt: string; couponCode: string | null; discount: number; paidDelivery: boolean;
  items: Array<{ quantity: number; price: number; product: { name: string; slug: string; images: string } }>;
}

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_COLORS: Record<string, string> = { PENDING: 'badge-orange', PROCESSING: 'badge-blue', SHIPPED: 'badge-blue', DELIVERED: 'badge-green', CANCELLED: 'badge-red' }

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (statusFilter) p.set('status', statusFilter)
    fetch(`/api/orders?${p}`).then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false) })
  }, [search, statusFilter])

  useEffect(() => { const t = setTimeout(loadOrders, 300); return () => clearTimeout(t) }, [loadOrders])

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    loadOrders()
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem' }}>Orders</h1>
        <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/admin/orders/new'}>+ Create Order</button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order#, phone, or TrxID..." style={{ flex: 1, minWidth: '260px' }} />
        <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Table */}
        <div className="admin-card">
          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order #</th><th>Customer</th><th>Phone</th><th>TrxID</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {orders.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No orders found</td></tr>}
                  {orders.map(o => (
                    <tr key={o.id} style={{ cursor: 'pointer', background: selected?.id === o.id ? 'var(--cream)' : '' }} onClick={() => setSelected(o)}>
                      <td style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', whiteSpace: 'nowrap' }}>{o.orderNumber}</td>
                      <td>{o.name}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{o.phone}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.transactionId || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>৳{o.total.toLocaleString()}</td>
                      <td><span className={`badge ${STATUS_COLORS[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="admin-card" style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', fontSize: '1.1rem' }}>{selected.orderNumber}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem' }}>×</button>
            </div>
            {[
              ['Customer', selected.name],
              ['Phone', selected.phone],
              ['Payment', selected.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'],
              ...(selected.transactionId ? [['TrxID', selected.transactionId]] : []),
              ...(selected.couponCode ? [['Coupon', selected.couponCode]] : []),
              ['Discount', selected.discount ? `৳${selected.discount.toLocaleString()}` : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Items</p>
              {selected.items?.map((item, i) => {
                const images = (() => { try { return JSON.parse(item.product.images) } catch { return [] } })()
                const img = images[0] || '/placeholder.jpg'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <img src={img} alt="" style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      <a href={`/shop/${item.product.slug}`} target="_blank" style={{ color: 'var(--charcoal)' }}>{item.product?.name} × {item.quantity}</a>
                    </div>
                    <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-serif)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', fontWeight: 500 }}>৳{selected.total.toLocaleString()}</span>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Update Status</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {STATUSES.map(s => (
                  <button key={s} className={`btn btn-sm ${selected.status === s ? 'btn-gold' : 'btn-outline'}`} onClick={() => updateStatus(selected.id, s)} style={{ fontSize: '0.68rem' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
