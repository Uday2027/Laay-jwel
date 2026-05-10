'use client'
import { useState, useEffect } from 'react'

interface Customer { id: number; name: string; email: string; phone: string | null; createdAt: string; _count: { orders: number } }

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => { fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers || [])) }, [])

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem' }}>Customers</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.85rem' }}>{customers.length} registered customers</p>
      </div>
      <div className="admin-card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Joined</th></tr></thead>
            <tbody>
              {customers.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No customers yet</td></tr>}
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                  <td><span className="badge badge-gold">{c._count.orders} orders</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
