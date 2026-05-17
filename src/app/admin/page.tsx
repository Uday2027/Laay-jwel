'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  totalOrders: number
  pendingOrders: number
  totalCustomers: number
  totalProducts: number
  totalRevenue: number
  outOfStockProducts: number
  totalReviews: number
  recentOrders: Array<{ id: number; orderNumber: string; name: string; total: number; status: string; createdAt: string }>
  lowStockProducts: Array<{ id: number; name: string; slug: string; stock: number; images: string }>
}

const STATUS_COLORS: Record<string, string> = { PENDING: 'badge-orange', PROCESSING: 'badge-blue', SHIPPED: 'badge-blue', DELIVERED: 'badge-green', CANCELLED: 'badge-red' }

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => { fetch('/api/admin/stats').then(r => r.json()).then(setStats) }, [])

  if (!stats) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  const STAT_CARDS = [
    { label: 'Total Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'var(--gold)' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'var(--charcoal)' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: '#b45309' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: '👥', color: '#1d4ed8' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem', color: 'var(--charcoal)' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Welcome back, Admin. Here's what's happening.</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" onClick={() => router.push('/admin/orders/new')}>+ Create Order</button>
        <button className="btn btn-outline btn-sm" onClick={() => router.push('/admin/products')}>+ Add Product</button>
        <button className="btn btn-outline btn-sm" onClick={() => router.push('/admin/coupons')}>+ Add Coupon</button>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        {STAT_CARDS.map(card => (
          <div key={card.label} className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="admin-stat">
                <div className="admin-stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="admin-stat-label">{card.label}</div>
              </div>
              <span style={{ fontSize: '1.75rem' }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Alerts */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Inventory Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.outOfStockProducts > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(192,57,43,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(192,57,43,0.15)' }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.9rem', color: '#c0392b' }}>{stats.outOfStockProducts} product{stats.outOfStockProducts !== 1 ? 's' : ''} out of stock</p>
                  <button className="btn btn-sm btn-outline" style={{ marginTop: '0.5rem', fontSize: '0.65rem' }} onClick={() => router.push('/admin/products')}>View Products →</button>
                </div>
              </div>
            )}
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map(p => {
                const images = (() => { try { return JSON.parse(p.images) } catch { return [] } })()
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(180,83,9,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(180,83,9,0.1)' }}>
                    <img src={images[0] || '/placeholder.jpg'} alt="" style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</p>
                      <p style={{ fontSize: '0.72rem', color: '#b45309' }}>Only {p.stock} left in stock</p>
                    </div>
                    <button className="btn btn-sm btn-outline" onClick={() => router.push(`/admin/products?edit=${p.id}`)} style={{ fontSize: '0.65rem' }}>Edit</button>
                  </div>
                )
              })
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No low stock alerts 🎉</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '1.25rem' }}>At a Glance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Products', value: stats.totalProducts, href: '/admin/products' },
              { label: 'Reviews', value: stats.totalReviews, href: '/admin/reviews' },
              { label: 'Out of Stock', value: stats.outOfStockProducts, href: '/admin/products', alert: true },
            ].map(item => (
              <button key={item.label} onClick={() => router.push(item.href)} style={{ textAlign: 'left', padding: '1rem', background: 'var(--cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <p style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', color: item.alert ? '#c0392b' : 'var(--charcoal)' }}>{item.value}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.1rem' }}>Recent Orders</h3>
          <a href="/admin/orders" className="btn btn-outline btn-sm">View All</a>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {stats.recentOrders.map(o => (
                <tr key={o.id}>
                  <td><a href={`/admin/orders?id=${o.id}`} style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}>{o.orderNumber}</a></td>
                  <td>{o.name}</td>
                  <td>৳{o.total.toLocaleString()}</td>
                  <td><span className={`badge ${STATUS_COLORS[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
