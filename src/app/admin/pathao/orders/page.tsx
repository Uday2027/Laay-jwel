'use client'
import { useState, useEffect, useCallback } from 'react'
import SendToPathaoModal from '@/components/admin/SendToPathaoModal'

interface Order {
  id: number
  orderNumber: string
  name: string
  phone: string
  address: string
  city: string
  total: number
  status: string
  pathaoConsignmentId: string | null
  pathaoOrderStatus: string | null
  pathaoDeliveryFee: number | null
  pathaoSentAt: string | null
  notes: string | null
  items: Array<{ quantity: number; price: number; product: { name: string } }>
}

interface PathaoStore {
  store_id: number
  store_name: string
}

export default function PathaoOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unsent' | 'sent'>('unsent')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [stores, setStores] = useState<PathaoStore[]>([])
  const [config, setConfig] = useState({ storeId: null as number | null })
  const [sendModalOrder, setSendModalOrder] = useState<Order | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    p.set('pageSize', '100')
    const res = await fetch(`/api/orders?${p}`)
    const data = await res.json()
    let list = data.orders || []
    if (filter === 'unsent') list = list.filter((o: Order) => !o.pathaoConsignmentId)
    if (filter === 'sent') list = list.filter((o: Order) => !!o.pathaoConsignmentId)
    setOrders(list)
    setLoading(false)
  }, [search, filter])

  useEffect(() => { const t = setTimeout(loadOrders, 300); return () => clearTimeout(t) }, [loadOrders])

  useEffect(() => {
    fetch('/api/admin/pathao/stores').then(r => r.json()).then(d => setStores(d.stores || []))
    fetch('/api/admin/pathao/config').then(r => r.json()).then(d => {
      if (d.config?.storeId) setConfig({ storeId: d.config.storeId })
    })
  }, [])

  const syncStatus = async (orderId: number) => {
    setSyncing(orderId)
    setError('')
    setMessage('')
    const res = await fetch('/api/admin/pathao/orders/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage(`Status synced: ${data.info?.order_status || 'Updated'}`)
      loadOrders()
    } else {
      setError(data.error || 'Failed to sync status')
    }
    setSyncing(null)
  }

  const handleSent = (consignmentId: string) => {
    setMessage(`Order sent to Pathao. Consignment: ${consignmentId}`)
    setSendModalOrder(null)
    loadOrders()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.4rem' }}>Send Orders to Pathao</h2>
      </div>

      {message && <div className="admin-card" style={{ marginBottom: '1.5rem', background: 'rgba(52,168,83,0.08)', border: '1px solid rgba(52,168,83,0.2)', color: '#2d7a47' }}>{message}</div>}
      {error && <div className="admin-card" style={{ marginBottom: '1.5rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: '#c0392b' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order#, phone..." style={{ flex: 1, minWidth: '260px' }} />
        <select className="input" value={filter} onChange={e => setFilter(e.target.value as any)} style={{ width: 'auto' }}>
          <option value="unsent">Not Sent</option>
          <option value="sent">Sent to Pathao</option>
          <option value="all">All Orders</option>
        </select>
      </div>

      <div className="admin-card">
        {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order #</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Pathao Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No orders found</td></tr>}
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', whiteSpace: 'nowrap' }}>{o.orderNumber}</td>
                    <td>{o.name}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{o.phone}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>৳{o.total.toLocaleString()}</td>
                    <td><span className="badge badge-orange">{o.status}</span></td>
                    <td>
                      {o.pathaoConsignmentId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>{o.pathaoOrderStatus || 'Pending'}</span>
                          <a href={`/track?consignment=${o.pathaoConsignmentId}`} target="_blank" style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>🔍 Track</a>
                        </div>
                      ) : (
                        <span className="badge badge-gray">Not sent</span>
                      )}
                    </td>
                    <td>
                      {!o.pathaoConsignmentId ? (
                        <button className="btn btn-sm btn-primary" onClick={() => setSendModalOrder(o)} style={{ fontSize: '0.65rem' }}>
                          Send
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-outline" onClick={() => syncStatus(o.id)} disabled={syncing === o.id} style={{ fontSize: '0.65rem' }}>
                          {syncing === o.id ? 'Syncing...' : 'Sync'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SendToPathaoModal
        order={sendModalOrder}
        stores={stores}
        defaultStoreId={config.storeId}
        onClose={() => setSendModalOrder(null)}
        onSent={handleSent}
      />
    </div>
  )
}
