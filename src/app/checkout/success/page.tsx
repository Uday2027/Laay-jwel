'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || ''

  return (
    <div style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div style={{ textAlign: 'center', maxWidth: '560px', padding: '2rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2rem' }}>✓</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--charcoal)' }}>Order Placed!</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          Thank you for shopping with Laay. Your order has been received and is being processed.
        </p>
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-light)', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Order Number</p>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--gold)', fontWeight: 400 }}>{orderNumber}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Save this for tracking your order</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
          <Link href="/account" className="btn btn-outline">My Orders</Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}
