'use client'
import React, { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { useRouter } from 'next/navigation'
import { calculateDiscounts } from '@/lib/discount'

interface Settings { bkashNumber: string; bankName: string; bankAccount: string; bankBranch: string; bankHolder: string; deliveryFee: number }

export default function CheckoutPage() {
  const { cart, user, clearCart, deliveryFee } = useApp()
  const router = useRouter()
  const [step, setStep] = useState(1) // 1=info, 2=payment, 3=review
  const [settings, setSettings] = useState<Settings | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [paidDelivery, setPaidDelivery] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '', city: '', notes: '' })

  useEffect(() => {
    fetch('/api/settings/public').then(r => r.ok ? r.json() : null).then(d => { if (d) setSettings(d) })
    if (user) setForm(f => ({ ...f, name: user.name }))
  }, [user])

  if (cart.length === 0 && step !== 3) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-offset) + 4rem)', textAlign: 'center', padding: '8rem 2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Your cart is empty</h2>
        <a href="/shop" className="btn btn-primary">Shop Now</a>
      </div>
    )
  }

  const discounts = calculateDiscounts({
    items: cart, isLoggedIn: !!user, paidDelivery, couponDiscount,
    couponCode: couponApplied ? couponCode : '', deliveryFee: settings?.deliveryFee || deliveryFee,
  })

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponError('')
    const res = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponCode }) })
    const data = await res.json()
    if (res.ok) { setCouponDiscount(data.discount); setCouponApplied(true) }
    else { setCouponError(data.error); setCouponDiscount(0); setCouponApplied(false) }
  }

  const placeOrder = async () => {
    if (paymentMethod === 'online' && !transactionId.trim()) { alert('Please enter your Transaction ID'); return }
    setLoading(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form, items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        paymentMethod, transactionId: transactionId || null,
        couponCode: couponApplied ? couponCode : null, paidDelivery,
        subtotal: discounts.subtotal, deliveryFee: discounts.deliveryFee,
        discount: discounts.subtotalDiscount, total: discounts.finalTotal,
        discountBreakdown: { login: discounts.loginDiscount, bulk: discounts.bulkDiscount, delivery: discounts.deliveryDiscount, coupon: discounts.couponDiscount },
      })
    })
    const data = await res.json()
    if (res.ok) { clearCart(); router.push(`/checkout/success?order=${data.orderNumber}`) }
    else { alert(data.error || 'Something went wrong'); setLoading(false) }
  }

  return (
    <div style={{ paddingTop: 'var(--header-offset)', minHeight: '100vh', background: 'var(--cream)' }}>
      <div className="checkout-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(1rem, 5vw, 3rem) clamp(0.75rem, 3vw, 2rem)', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'clamp(1.5rem, 5vw, 3rem)', alignItems: 'start' }}>

        {/* Left: Form */}
        <div>
          {/* Steps */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
            {['Information', 'Payment', 'Review'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step > i + 1 ? 'var(--gold)' : step === i + 1 ? 'var(--charcoal)' : 'var(--border)',
                  color: step >= i + 1 ? 'var(--white)' : 'var(--text-muted)',
                  fontSize: '0.72rem', fontWeight: 500, cursor: step > i + 1 ? 'pointer' : 'default',
                  transition: 'all 0.3s',
                }} onClick={() => { if (step > i + 1) setStep(i + 1) }}>{i + 1}</div>
                <span style={{ margin: '0 0.5rem', fontSize: '0.8rem', color: step === i + 1 ? 'var(--charcoal)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 500 : 400 }}>{s}</span>
                {i < 2 && <div style={{ width: '2rem', height: '1px', background: 'var(--border)', margin: '0 0.5rem' }} />}
              </div>
            ))}
          </div>

          {/* Step 1: Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '0.5rem' }}>Contact Information</h2>
              {!user && <div style={{ padding: '0.875rem', background: 'rgba(201,169,110,0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(201,169,110,0.3)', fontSize: '0.82rem', color: 'var(--charcoal)' }}>
                💡 <a href="/account" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>Login</a> to get 5% member discount automatically!
              </div>}
              <div className="form-row">
                <div className="input-group">
                  <label className="label">Full Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="input-group">
                  <label className="label">Phone Number *</label>
                  <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
                </div>
              </div>
              <div className="input-group">
                <label className="label">Delivery Address *</label>
                <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" />
              </div>
              <div className="input-group">
                <label className="label">City *</label>
                <input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Dhaka, Chittagong, etc." />
              </div>
              <div className="input-group">
                <label className="label">Order Notes (optional)</label>
                <textarea className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special instructions..." />
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => {
                if (!form.name || !form.phone || !form.address || !form.city) { alert('Please fill all required fields'); return }
                setStep(2)
              }}>Continue to Payment →</button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '0.5rem' }}>Payment Method</h2>

              {/* Payment options */}
              {[
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                { value: 'online', label: 'Online Payment', desc: 'bKash / Bank Transfer — enter Transaction ID' },
              ].map(opt => (
                <label key={opt.value} style={{
                  display: 'flex', gap: '1rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `2px solid ${paymentMethod === opt.value ? 'var(--gold)' : 'var(--border)'}`, background: paymentMethod === opt.value ? 'rgba(201,169,110,0.08)' : 'var(--white)', transition: 'all 0.2s',
                }}>
                  <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value as 'cod' | 'online')} style={{ marginTop: '2px' }} />
                  <div>
                    <p style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{opt.label}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}

              {/* Online payment details */}
              {paymentMethod === 'online' && settings && (
                <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem', fontWeight: 500 }}>Payment Details</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>bKash Number</p>
                      <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{settings.bkashNumber}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(Personal)</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{settings.bankName}</p>
                      <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{settings.bankAccount}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{settings.bankHolder} · {settings.bankBranch}</p>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="label">Transaction ID *</label>
                    <input className="input" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Enter your TrxID after payment" />
                  </div>
                </div>
              )}

              {/* Advance delivery discount */}
              <label style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `2px solid ${paidDelivery ? 'var(--gold)' : 'var(--border)'}`, background: paidDelivery ? 'rgba(201,169,110,0.08)' : 'var(--white)', transition: 'all 0.2s', alignItems: 'flex-start' }}>
                <input type="checkbox" checked={paidDelivery} onChange={e => setPaidDelivery(e.target.checked)} style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontWeight: 500, marginBottom: '0.2rem' }}>💰 Pay Delivery Fee in Advance</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Include delivery fee (৳{settings?.deliveryFee || deliveryFee}) with your payment now and get 5% off your order!</p>
                </div>
              </label>

              {/* Coupon */}
              <div>
                <label className="label">Coupon Code</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
                  <input className="input" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(false); setCouponDiscount(0) }} placeholder="Enter code" style={{ flex: 1 }} />
                  <button className="btn btn-outline-gold" onClick={applyCoupon}>Apply</button>
                </div>
                {couponApplied && <p style={{ fontSize: '0.78rem', color: 'var(--gold)', marginTop: '0.35rem' }}>✓ Coupon applied! {couponDiscount}% off</p>}
                {couponError && <p className="error-msg" style={{ marginTop: '0.35rem' }}>{couponError}</p>}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep(3)}>Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '1.5rem' }}>Review Your Order</h2>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Delivery To</p>
                    <p style={{ fontWeight: 500 }}>{form.name}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{form.phone}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{form.address}, {form.city}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment</p>
                    <p style={{ fontWeight: 500 }}>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                    {transactionId && <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>TrxID: {transactionId}</p>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-gold btn-lg" style={{ flex: 1 }} onClick={placeOrder} disabled={loading}>
                  {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Placing Order...</> : '✓ Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div style={{ position: 'sticky', top: 'calc(var(--header-offset) + 2rem)' }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.25rem, 4vw, 1.75rem)', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Order Summary</h3>
            {cart.map(item => (
              <div key={item.productId} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
                <img src={item.image} alt={item.name} style={{ width: 52, height: 62, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.3 }}>{item.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              {[
                { label: 'Subtotal', value: `৳${discounts.subtotal.toLocaleString()}` },
                ...(discounts.loginDiscount ? [{ label: `Member discount (${discounts.loginDiscount}%)`, value: `-৳${Math.round(discounts.subtotal * discounts.loginDiscount / 100).toLocaleString()}`, gold: true }] : []),
                ...(discounts.bulkDiscount ? [{ label: `Bulk discount (${discounts.bulkDiscount}%)`, value: `-৳${Math.round(discounts.subtotal * discounts.bulkDiscount / 100).toLocaleString()}`, gold: true }] : []),
                ...(discounts.deliveryDiscount ? [{ label: `Advance delivery (${discounts.deliveryDiscount}%)`, value: `-৳${Math.round(discounts.subtotal * discounts.deliveryDiscount / 100).toLocaleString()}`, gold: true }] : []),
                ...(discounts.couponDiscount ? [{ label: `Coupon (${couponCode})`, value: `-৳${Math.round(discounts.subtotal * discounts.couponDiscount / 100).toLocaleString()}`, gold: true }] : []),
                { label: 'Delivery Fee', value: `৳${discounts.deliveryFee}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span style={{ color: (row as { gold?: boolean }).gold ? 'var(--gold)' : 'var(--charcoal)', fontWeight: (row as { gold?: boolean }).gold ? 500 : 400 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--gold)' }}>৳{discounts.finalTotal.toLocaleString()}</span>
              </div>
              {discounts.subtotalDiscount > 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--gold)', textAlign: 'right', marginTop: '0.25rem' }}>
                  You save ৳{discounts.subtotalDiscount.toLocaleString()}! 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
