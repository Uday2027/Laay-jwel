'use client'
import { useEffect, useState } from 'react'

interface Stats { totalOrders: number; pendingOrders: number; totalCustomers: number; totalProducts: number; totalRevenue: number; recentOrders: Array<{ id: number; orderNumber: string; name: string; total: number; status: string; createdAt: string }> }

const STATUS_COLORS: Record<string, string> = { PENDING: 'badge-orange', PROCESSING: 'badge-blue', SHIPPED: 'badge-blue', DELIVERED: 'badge-green', CANCELLED: 'badge-red' }

export default function AdminDashboard() {
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
