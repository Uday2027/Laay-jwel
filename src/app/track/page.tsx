'use client'
import React, { useState, useEffect, Suspense } from 'react'
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
  items: TrackItem[]
}

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

function productImage(images: string): string {
  try {
    const arr = JSON.parse(images)
    if (Array.isArray(arr) && arr.length) return cloudinaryUrl(arr[0], { width: 120, height: 120, quality: 80 })
  } catch { /* empty */ }
  return '/placeholder.jpg'
}

function TrackContent() {
  const searchParams = useSearchParams()
  const prefilledOrder = searchParams.get('order') || ''

  const [orderNumber, setOrderNumber] = useState(prefilledOrder)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<TrackOrder | null>(null)

  useEffect(() => {
    if (prefilledOrder) {
      setOrderNumber(prefilledOrder)
    }
  }, [prefilledOrder])

  const track = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim() || !phone.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)

    const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`)
    const data = await res.json()

    if (res.ok) {
      setOrder(data.order)
    } else {
      setError(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

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

        {!order && (
          <>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--charcoal)' }}>Track Your Order</h1>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>Enter your order number and phone to view your receipt</p>

            <form onSubmit={track} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Order Number</label>
                <input className="input" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="e.g. LAAY-20260115-1234" required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone Number</label>
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 01712345678" required style={{ width: '100%' }} />
              </div>
              {error && <p style={{ color: '#c0392b', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Looking up...' : 'View Receipt'}
              </button>
            </form>
          </>
        )}

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

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={printReceipt} className="btn btn-primary" style={{ flex: 1, minWidth: 140 }}>Print Receipt</button>
              <button onClick={() => { setOrder(null); setError('') }} className="btn btn-outline" style={{ flex: 1, minWidth: 140 }}>Track Another</button>
            </div>
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
