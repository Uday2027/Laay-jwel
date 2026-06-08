'use client'
import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/images'

interface TrackItem {
  id: number
  quantity: number
  price: number
  product: { id: number; name: string; slug: string; images: string }
}

interface TrackOrder {
  orderNumber: string
  status: string
  name: string
  phone: string
  address: string
  city: string
  notes: string | null
  paymentMethod: string
  transactionId: string | null
  couponCode: string | null
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  createdAt: string
  pathaoConsignmentId: string | null
  pathaoOrderStatus: string | null
  pathaoDeliveryFee: number | null
  pathaoSentAt: string | null
  items: TrackItem[]
}

interface PathaoInfo {
  consignment_id: string
  merchant_order_id: string
  order_status: string
  order_status_slug: string
  updated_at: string
  invoice_id: string | null
}

type TrackMode = 'order' | 'phone' | 'consignment'

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#C9A96E',
  PROCESSING: '#4A90D9',
  SHIPPED: '#9B59B6',
  DELIVERED: '#27AE60',
  CANCELLED: '#E74C3C',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const PATHAO_STATUS_FLOW = [
  { key: 'Pending', label: 'Order Placed', icon: '📦' },
  { key: 'Picked', label: 'Picked Up', icon: '🚚' },
  { key: 'In Transit', label: 'In Transit', icon: '🛣️' },
  { key: 'At Hub', label: 'At Hub', icon: '🏭' },
  { key: 'Out For Delivery', label: 'Out for Delivery', icon: '📍' },
  { key: 'Delivered', label: 'Delivered', icon: '✅' },
]

function productImage(images: string): string {
  try {
    const arr = JSON.parse(images)
    if (Array.isArray(arr) && arr.length) return cloudinaryUrl(arr[0], { width: 120, height: 120, quality: 80 })
  } catch { /* empty */ }
  return '/placeholder.jpg'
}

function PathaoTimeline({ status }: { status: string }) {
  const currentIndex = PATHAO_STATUS_FLOW.findIndex(s =>
    s.key.toLowerCase() === (status || '').toLowerCase()
  )
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {PATHAO_STATUS_FLOW.map((step, idx) => {
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
                transition: 'all 0.3s ease',
              }}>
                {isCompleted ? (isCurrent ? '●' : '✓') : step.icon}
              </div>
              {idx < PATHAO_STATUS_FLOW.length - 1 && (
                <div style={{
                  width: 2, height: 24, background: idx < effectiveIndex ? 'var(--gold)' : 'var(--border)',
                  transition: 'all 0.3s ease',
                }} />
              )}
            </div>
            <div style={{ paddingTop: 4, paddingBottom: idx < PATHAO_STATUS_FLOW.length - 1 ? 12 : 0 }}>
              <p style={{
                fontSize: '0.85rem', fontWeight: isCurrent ? 600 : 400,
                color: isCompleted ? 'var(--charcoal)' : 'var(--text-muted)',
              }}>{step.label}</p>
              {isCurrent && <p style={{ fontSize: '0.72rem', color: 'var(--gold)', marginTop: 2 }}>Current status</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TrackContent() {
  const searchParams = useSearchParams()
  const prefilledOrder = searchParams.get('order') || ''
  const prefilledConsignment = searchParams.get('consignment') || ''

  const [mode, setMode] = useState<TrackMode>(prefilledConsignment ? 'consignment' : 'order')
  const [orderNumber, setOrderNumber] = useState(prefilledOrder)
  const [consignmentId, setConsignmentId] = useState(prefilledConsignment)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<TrackOrder | null>(null)
  const [pathao, setPathao] = useState<PathaoInfo | null>(null)
  const [ordersList, setOrdersList] = useState<any[]>([])
  const [viewingDetail, setViewingDetail] = useState(false)

  useEffect(() => {
    if (prefilledOrder) setOrderNumber(prefilledOrder)
    if (prefilledConsignment) {
      setConsignmentId(prefilledConsignment)
      setMode('consignment')
    }
  }, [prefilledOrder, prefilledConsignment])

  const track = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)
    setPathao(null)
    setOrdersList([])
    setViewingDetail(false)

    let url = ''
    if (mode === 'consignment') {
      if (!consignmentId.trim()) { setLoading(false); return }
      url = `/api/orders/track?consignmentId=${encodeURIComponent(consignmentId.trim())}`
    } else if (mode === 'phone') {
      if (!phone.trim()) { setLoading(false); return }
      url = `/api/orders/track?phone=${encodeURIComponent(phone.trim())}`
    } else {
      if (!orderNumber.trim() || !phone.trim()) { setLoading(false); return }
      url = `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
    }

    const res = await fetch(url)
    const data = await res.json()

    if (res.ok) {
      if (data.orders) {
        setOrdersList(data.orders)
      }
      if (data.order) {
        setOrder(data.order)
        setViewingDetail(true)
      }
      if (data.pathao) setPathao(data.pathao)
      if (data.order?.pathaoConsignmentId && !data.pathao) {
        refreshPathao(data.order.pathaoConsignmentId)
      }
    } else {
      setError(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

  const viewOrderDetail = async (ordNum: string) => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(ordNum)}&phone=${encodeURIComponent(phone.trim())}`)
    const data = await res.json()
    if (res.ok) {
      if (data.order) setOrder(data.order)
      if (data.pathao) setPathao(data.pathao)
      if (data.order?.pathaoConsignmentId && !data.pathao) {
        refreshPathao(data.order.pathaoConsignmentId)
      }
      setViewingDetail(true)
    } else {
      setError(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

  const refreshPathao = useCallback(async (cid?: string) => {
    const id = cid || order?.pathaoConsignmentId || consignmentId
    if (!id) return
    setRefreshing(true)
    const res = await fetch(`/api/orders/track?consignmentId=${encodeURIComponent(id)}`)
    const data = await res.json()
    if (res.ok && data.pathao) {
      setPathao(data.pathao)
    }
    setRefreshing(false)
  }, [order?.pathaoConsignmentId, consignmentId])

  const printReceipt = () => window.print()

  return (
    <div style={{ paddingTop: 'var(--header-offset)', minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/">
            <Image src="/logo.png" alt="Laay" width={140} height={56} style={{ filter: 'invert(0.15)', display: 'inline-block' }} priority />
          </Link>
        </div>

        {!order && !pathao && ordersList.length === 0 && (
          <>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--charcoal)' }}>Track Your Parcel</h1>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
              {mode === 'order' ? 'Enter your order number and phone to track delivery' : mode === 'phone' ? 'Enter your phone number to see all your orders' : 'Enter your Pathao consignment ID to track delivery'}
            </p>

            {/* Mode Switch */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                className={`btn btn-sm ${mode === 'order' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setMode('order'); setError('') }}
              >By Order</button>
              <button
                className={`btn btn-sm ${mode === 'phone' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setMode('phone'); setError('') }}
              >By Phone</button>
              <button
                className={`btn btn-sm ${mode === 'consignment' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setMode('consignment'); setError('') }}
              >By Consignment ID</button>
            </div>

            <form onSubmit={track} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
              {mode === 'order' && (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Order Number</label>
                    <input className="input" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="e.g. LAAY-20260115-1234" required style={{ width: '100%' }} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone Number</label>
                    <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 01712345678" required style={{ width: '100%' }} />
                  </div>
                </>
              )}
              {mode === 'phone' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone Number</label>
                  <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 01712345678" required style={{ width: '100%' }} />
                </div>
              )}
              {mode === 'consignment' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pathao Consignment ID</label>
                  <input className="input" value={consignmentId} onChange={e => setConsignmentId(e.target.value)} placeholder="e.g. PTH-12345678" required style={{ width: '100%' }} />
                </div>
              )}
              {error && <p style={{ color: '#c0392b', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Looking up...' : mode === 'phone' ? 'Find My Orders' : 'Track Delivery'}
              </button>
            </form>
          </>
        )}

        {/* ===== RESULTS ===== */}
        {(order || pathao || ordersList.length > 0) && (
          <div>
            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button onClick={() => {
                if (viewingDetail && ordersList.length > 0) {
                  setViewingDetail(false)
                  setOrder(null)
                  setPathao(null)
                  setError('')
                } else {
                  setOrder(null)
                  setPathao(null)
                  setOrdersList([])
                  setViewingDetail(false)
                  setError('')
                }
              }} className="btn btn-outline btn-sm">
                {viewingDetail && ordersList.length > 0 ? '← Back to Orders' : '← Track Another'}
              </button>
              {order && (
                <button onClick={printReceipt} className="btn btn-primary btn-sm">Print Receipt</button>
              )}
            </div>

            {/* ORDERS LIST — shown when tracking by phone */}
            {ordersList.length > 0 && !viewingDetail && (
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.25rem' }}>Your Orders</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {ordersList.map((o: any) => (
                    <button
                      key={o.orderNumber}
                      onClick={() => viewOrderDetail(o.orderNumber)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem 1.25rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)', cursor: 'pointer', textAlign: 'left', width: '100%',
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--charcoal)', marginBottom: '0.25rem' }}>{o.orderNumber}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {o.name} · {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--charcoal)' }}>৳{o.total?.toLocaleString()}</p>
                        {o.pathaoConsignmentId ? (
                          <span className="badge badge-blue" style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>
                            {o.pathaoOrderStatus || 'Pathao'}
                          </span>
                        ) : (
                          <span className="badge badge-orange" style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PATHAO TRACKING CARD — shown first & prominent when available */}
            {(pathao || order?.pathaoConsignmentId) && (
              <div className="receipt-box" style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>Pathao Courier Tracking</p>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.8rem', color: 'var(--charcoal)' }}>
                      {pathao?.consignment_id || order?.pathaoConsignmentId}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.78rem', padding: '0.4rem 1rem' }}>
                      {pathao?.order_status || order?.pathaoOrderStatus || 'Pending'}
                    </span>
                    <button
                      onClick={() => refreshPathao()}
                      disabled={refreshing}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '0.65rem' }}
                      title="Refresh status"
                    >
                      {refreshing ? '⟳' : '↻ Refresh'}
                    </button>
                  </div>
                </div>

                {/* Live timeline */}
                <PathaoTimeline status={pathao?.order_status || order?.pathaoOrderStatus || 'Pending'} />

                {pathao?.updated_at && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'right' }}>
                    Last updated: {new Date(pathao.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* ORDER RECEIPT CARD */}
            {order && (
              <div className="receipt-box" style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
                {/* Receipt header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Order Receipt</p>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem', color: 'var(--charcoal)', marginBottom: '0.5rem' }}>{order.orderNumber}</h2>
                  <span style={{
                    display: 'inline-block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '0.35rem 1rem', borderRadius: '100px', color: '#fff', background: STATUS_COLORS[order.status] || '#999'
                  }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Customer info */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Customer</p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--charcoal)', lineHeight: 1.8 }}>
                    <p><strong>{order.name}</strong></p>
                    <p>{order.phone}</p>
                    <p>{order.address}{order.city ? `, ${order.city}` : ''}</p>
                    {order.notes && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>Note: {order.notes}</p>}
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Items</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: 'var(--cream-dark)' }}>
                          <Image src={productImage(item.product.images)} alt={item.product.name} width={56} height={56} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--charcoal)' }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Subtotal', value: `৳${order.subtotal.toLocaleString()}` },
                    ...(order.discount > 0 ? [{ label: 'Discount', value: `-৳${order.discount.toLocaleString()}`, gold: true }] : []),
                    { label: 'Delivery Fee', value: `৳${order.deliveryFee.toLocaleString()}` },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ color: (row as { gold?: boolean }).gold ? 'var(--gold)' : 'var(--charcoal)', fontWeight: (row as { gold?: boolean }).gold ? 500 : 400 }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--gold)' }}>৳{order.total.toLocaleString()}</span>
                  </div>
                  {order.couponCode && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--gold)', textAlign: 'right', marginTop: '0.25rem' }}>Coupon applied: {order.couponCode}</p>
                  )}
                </div>

                {/* Payment */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>Payment</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--charcoal)' }}>
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    {order.transactionId && <span style={{ color: 'var(--text-muted)' }}> · TID: {order.transactionId}</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div style={{ paddingTop: 'var(--header-offset)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    }>
      <TrackContent />
    </Suspense>
  )
}
