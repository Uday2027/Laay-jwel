'use client'
import { useState, useEffect, useCallback } from 'react'

interface TrackItem {
  quantity: number
  price: number
  productId: any
}

interface TrackOrder {
  id: number
  orderNumber: string
  name: string
  phone: string
  address: string
  city: string
  notes: string
  status: string
  items: TrackItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: string
  pathaoConsignmentId: string
  pathaoOrderStatus: string | null
  pathaoDeliveryFee: number | null
  pathaoSentAt: string | null
  pathaoStoreId: number | null
  pathaoPayload: any
}

interface PathaoInfo {
  consignment_id: string
  merchant_order_id: string
  order_status: string
  order_status_slug: string
  updated_at: string
  invoice_id: string | null
}

const STATUS_FLOW = [
  { key: 'Pending', label: 'Order Placed', icon: '📦' },
  { key: 'Picked', label: 'Picked Up', icon: '🚚' },
  { key: 'In Transit', label: 'In Transit', icon: '🛣️' },
  { key: 'At Hub', label: 'At Hub', icon: '🏭' },
  { key: 'Out For Delivery', label: 'Out for Delivery', icon: '📍' },
  { key: 'Delivered', label: 'Delivered', icon: '✅' },
]

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', gap: '0.75rem', padding: '0.4rem 0' }}>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ color: highlight ? '#2d7a47' : 'var(--charcoal)', fontWeight: highlight ? 600 : 500, textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}

export default function PathaoTracking() {
  const [orders, setOrders] = useState<TrackOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<TrackOrder | null>(null)
  const [pathaoInfo, setPathaoInfo] = useState<PathaoInfo | null>(null)
  const [fetching, setFetching] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (statusFilter) p.set('status', statusFilter)
    const res = await fetch(`/api/admin/pathao/orders/sent?${p}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const fetchPathaoStatus = async (consignmentId: string) => {
    setFetching(true)
    const res = await fetch(`/api/orders/track?consignmentId=${encodeURIComponent(consignmentId)}`)
    const data = await res.json()
    if (res.ok && data.pathao) {
      setPathaoInfo(data.pathao)
    } else {
      setPathaoInfo(null)
    }
    setFetching(false)
  }

  const selectOrder = (order: TrackOrder) => {
    setSelected(order)
    if (order.pathaoConsignmentId) {
      fetchPathaoStatus(order.pathaoConsignmentId)
    }
  }

  const currentIndex = pathaoInfo
    ? STATUS_FLOW.findIndex(s => s.key.toLowerCase() === (pathaoInfo.order_status || '').toLowerCase())
    : selected?.pathaoOrderStatus
      ? STATUS_FLOW.findIndex(s => s.key.toLowerCase() === (selected.pathaoOrderStatus || '').toLowerCase())
      : -1
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex

  const filteredOrders = orders.filter(o =>
    search ?
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      o.pathaoConsignmentId.toLowerCase().includes(search.toLowerCase())
    : true
  )

  const payload = selected?.pathaoPayload || {}
  const itemDesc = payload.item_description || selected?.items?.map((i: any) => `${i.quantity}x ${i.productId?.name || 'Item'}`).join(', ') || 'Parcel'

  return (
    <div>
      {/* Search & Filters */}
      <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          className="input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order#, name, phone, or consignment ID..."
          style={{ flex: 1, minWidth: '260px' }}
        />
        <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Picked">Picked</option>
          <option value="In Transit">In Transit</option>
          <option value="At Hub">At Hub</option>
          <option value="Out For Delivery">Out For Delivery</option>
          <option value="Delivered">Delivered</option>
        </select>
        <button className="btn btn-outline btn-sm" onClick={loadOrders} style={{ whiteSpace: 'nowrap' }}>↻ Refresh List</button>
      </div>

      <div className="admin-tracking-grid" style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Orders List */}
        <div className="admin-card">
          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order #</th><th>Customer</th><th>Phone</th><th>Consignment</th><th>Pathao Status</th><th>Sent</th></tr></thead>
                <tbody>
                  {filteredOrders.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No Pathao orders found</td></tr>}
                  {filteredOrders.map(o => (
                    <tr key={o.id} style={{ cursor: 'pointer', background: selected?.id === o.id ? 'var(--cream)' : '' }} onClick={() => selectOrder(o)}>
                      <td style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', whiteSpace: 'nowrap' }}>{o.orderNumber}</td>
                      <td>{o.name}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{o.phone}</td>
                      <td style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{o.pathaoConsignmentId}</td>
                      <td>
                        <span className={`badge ${o.pathaoOrderStatus === 'Delivered' ? 'badge-green' : o.pathaoOrderStatus === 'Pending' ? 'badge-orange' : 'badge-blue'}`} style={{ fontSize: '0.6rem' }}>
                          {o.pathaoOrderStatus || 'Pending'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {o.pathaoSentAt ? new Date(o.pathaoSentAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="admin-card admin-detail-panel" style={{ position: 'sticky', top: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', fontSize: '1.1rem' }}>{selected.orderNumber}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selected.name} — {selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem' }}>×</button>
            </div>

            {/* Consignment */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Consignment ID</p>
                <a href={`/track?consignment=${selected.pathaoConsignmentId}`} target="_blank" style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>🔍 Customer View →</a>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 500 }}>{selected.pathaoConsignmentId}</p>
            </div>

            {/* Status */}
            {fetching ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <span className={`badge ${pathaoInfo?.order_status === 'Delivered' ? 'badge-green' : pathaoInfo?.order_status === 'Pending' ? 'badge-orange' : 'badge-blue'}`}>
                    {pathaoInfo?.order_status || selected.pathaoOrderStatus || 'Pending'}
                  </span>
                  {pathaoInfo?.updated_at && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Updated {new Date(pathaoInfo.updated_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Timeline */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Delivery Progress</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {STATUS_FLOW.map((step, idx) => {
                      const isCompleted = idx <= effectiveIndex
                      const isCurrent = idx === effectiveIndex
                      return (
                        <div key={step.key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', background: isCompleted ? 'var(--gold)' : 'var(--cream-dark)',
                              border: `2px solid ${isCompleted ? 'var(--gold)' : 'var(--border)'}`,
                              color: isCompleted ? '#fff' : 'var(--text-muted)',
                            }}>
                              {isCompleted ? (isCurrent ? '●' : '✓') : step.icon}
                            </div>
                            {idx < STATUS_FLOW.length - 1 && (
                              <div style={{ width: 2, height: 24, background: idx < effectiveIndex ? 'var(--gold)' : 'var(--border)' }} />
                            )}
                          </div>
                          <div style={{ paddingTop: 4, paddingBottom: idx < STATUS_FLOW.length - 1 ? 12 : 0 }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 600 : 400, color: isCompleted ? 'var(--charcoal)' : 'var(--text-muted)' }}>
                              {step.label}
                            </p>
                            {isCurrent && <p style={{ fontSize: '0.72rem', color: 'var(--gold)', marginTop: 2 }}>Current status</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Parcel Details */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Parcel Details</p>
              <DetailRow label="Recipient" value={payload.recipient_name || selected.name} />
              <DetailRow label="Phone" value={payload.recipient_phone || selected.phone} />
              {payload.recipient_secondary_phone && <DetailRow label="Alt. Phone" value={payload.recipient_secondary_phone} />}
              <DetailRow label="Address" value={payload.recipient_address || `${selected.address}${selected.city ? `, ${selected.city}` : ''}`} />
              {payload.recipient_city && <DetailRow label="City ID" value={String(payload.recipient_city)} />}
              {payload.recipient_zone && <DetailRow label="Zone ID" value={String(payload.recipient_zone)} />}
              {payload.recipient_area && <DetailRow label="Area ID" value={String(payload.recipient_area)} />}
              <DetailRow label="Item" value={itemDesc} />
              {payload.item_weight && <DetailRow label="Weight" value={`${payload.item_weight} kg`} />}
              {payload.item_quantity && <DetailRow label="Quantity" value={String(payload.item_quantity)} />}
              <DetailRow label="Delivery Type" value={payload.delivery_type === 12 ? 'On-Demand (12h)' : 'Normal (48h)'} />
              <DetailRow label="Store ID" value={String(selected.pathaoStoreId || payload.store_id || '-')} />
              {payload.special_instruction && <DetailRow label="Instruction" value={payload.special_instruction} />}
              <div style={{ borderTop: '1px dashed var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <DetailRow label="Amount to Collect" value={`৳${payload.amount_to_collect ?? selected.total}`} highlight />
                <DetailRow label="Delivery Fee" value={`৳${selected.pathaoDeliveryFee ?? '-'}`} />
                <DetailRow label="Order Total" value={`৳${selected.total.toLocaleString()}`} />
              </div>
            </div>

            {/* Order Items */}
            {selected.items?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Order Items</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selected.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ color: 'var(--charcoal)' }}>
                        {item.quantity}x {item.productId?.name || 'Item'}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-outline btn-sm btn-block" onClick={() => fetchPathaoStatus(selected.pathaoConsignmentId)} disabled={fetching}>
              {fetching ? 'Refreshing...' : '↻ Refresh Status'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
