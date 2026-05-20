'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { calculateDiscounts } from '@/lib/discount'

interface Product {
  id: number; name: string; slug: string; price: number; images: string; stock: number; category: string;
}

interface SelectedItem {
  productId: number
  name: string
  price: number
  quantity: number
  stock: number
  image: string
  slug: string
}

export default function AdminCreateOrder() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SelectedItem[]>([])
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', notes: '' })
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
  const [transactionId, setTransactionId] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [paidDelivery, setPaidDelivery] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState(80)
  const [loading, setLoading] = useState(false)
  const [placing, setPlacing] = useState(false)

  // Manual override states
  const [deliveryMode, setDeliveryMode] = useState<'auto' | 'free' | 'manual'>('auto')
  const [manualDeliveryFee, setManualDeliveryFee] = useState(80)
  const [discountMode, setDiscountMode] = useState<'auto' | 'manual' | 'none'>('auto')
  const [manualDiscount, setManualDiscount] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetch('/api/products?limit=200')
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .finally(() => setLoading(false))
    fetch('/api/settings/public')
      .then(r => r.ok ? r.json() : null)
      .then(d => { 
        if (d?.deliveryFee) {
          setDeliveryFee(d.deliveryFee)
          setManualDeliveryFee(d.deliveryFee)
        }
      })
  }, [])

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const addProduct = (product: Product) => {
    if (product.stock <= 0) return
    setSelected(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      const images = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        image: images[0] || '/placeholder.jpg',
        slug: product.slug,
      }]
    })
  }

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      setSelected(prev => prev.filter(i => i.productId !== productId))
      return
    }
    const item = selected.find(i => i.productId === productId)
    if (!item) return
    if (qty > item.stock) {
      alert(`Only ${item.stock} available in stock`)
      return
    }
    setSelected(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i))
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponError('')
    const res = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponCode }) })
    const data = await res.json()
    if (res.ok) { setCouponDiscount(data.discount); setCouponApplied(true) }
    else { setCouponError(data.error); setCouponDiscount(0); setCouponApplied(false) }
  }

  const subtotal = selected.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const finalDeliveryFee = (() => {
    if (deliveryMode === 'free') return 0
    if (deliveryMode === 'manual') return manualDeliveryFee
    return deliveryFee
  })()

  const { finalDiscount, appliedDiscountBreakdown, discounts } = (() => {
    const discounts = calculateDiscounts({
      items: selected, paidDelivery, couponDiscount,
      couponCode: couponApplied ? couponCode : '', deliveryFee: finalDeliveryFee,
    })
    
    if (discountMode === 'none') {
      return { finalDiscount: 0, appliedDiscountBreakdown: { none: true }, discounts }
    }
    if (discountMode === 'manual') {
      const finalDisc = Math.min(subtotal, manualDiscount)
      return { finalDiscount: finalDisc, appliedDiscountBreakdown: { manual: finalDisc }, discounts }
    }
    
    // discountMode === 'auto'
    return { 
      finalDiscount: discounts.subtotalDiscount, 
      appliedDiscountBreakdown: { 
        bulk: discounts.bulkDiscount, 
        delivery: discounts.deliveryDiscount, 
        coupon: discounts.couponDiscount 
      },
      discounts
    }
  })()

  const finalTotal = Math.max(0, subtotal - finalDiscount + finalDeliveryFee)

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.city) { alert('Please fill all required fields'); return }
    if (selected.length === 0) { alert('Please add at least one product'); return }
    if (paymentMethod === 'online' && !transactionId.trim()) { alert('Please enter Transaction ID'); return }
    setPlacing(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        items: selected.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        paymentMethod, transactionId: transactionId || null,
        couponCode: discountMode === 'auto' && couponApplied ? couponCode : null, 
        paidDelivery: discountMode === 'auto' ? paidDelivery : false,
        subtotal, 
        deliveryFee: finalDeliveryFee,
        discount: finalDiscount, 
        total: finalTotal,
        discountBreakdown: appliedDiscountBreakdown,
      })
    })
    const data = await res.json()
    if (res.ok) {
      router.push(`/admin/orders?highlight=${data.orderNumber}`)
    } else {
      alert(data.error || 'Something went wrong')
      setPlacing(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem' }}>Create Order</h1>
        <button className="btn btn-outline btn-sm" onClick={() => router.push('/admin/orders')}>← Back to Orders</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Product Selector */}
          <div className="admin-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1rem' }}>Select Products</h3>
            <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ marginBottom: '1rem' }} />
            {loading ? <div className="spinner" style={{ margin: '0 auto' }} /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th></th></tr></thead>
                  <tbody>
                    {filteredProducts.slice(0, 20).map(p => {
                      const inCart = selected.find(i => i.productId === p.id)
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img src={(() => { try { return JSON.parse(p.images)[0] } catch { return '/placeholder.jpg' } })()} alt="" style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                              <span style={{ fontSize: '0.85rem' }}>{p.name}</span>
                            </div>
                          </td>
                          <td>৳{p.price.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${p.stock === 0 ? 'badge-red' : p.stock <= 3 ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                              {p.stock}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-primary btn-sm" disabled={p.stock === 0 || (inCart ? inCart.quantity >= p.stock : false)} onClick={() => addProduct(p)}>
                              {inCart ? `Add (${inCart.quantity})` : 'Add'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No products found</p>}
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="admin-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1rem' }}>Customer Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="label">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="label">Phone *</label>
                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label className="label">Address *</label>
              <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label className="label">City *</label>
              <input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label className="label">Notes</label>
              <textarea className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>

          {/* Payment */}
          <div className="admin-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1rem' }}>Payment</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { value: 'cod', label: 'Cash on Delivery' },
                { value: 'online', label: 'Online Payment' },
              ].map(opt => (
                <label key={opt.value} style={{
                  flex: 1, display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `2px solid ${paymentMethod === opt.value ? 'var(--gold)' : 'var(--border)'}`, background: paymentMethod === opt.value ? 'rgba(201,169,110,0.08)' : 'var(--white)'
                }}>
                  <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value as 'cod' | 'online')} />
                  <span style={{ fontSize: '0.85rem' }}>{opt.label}</span>
                </label>
              ))}
            </div>
            {paymentMethod === 'online' && (
              <div className="input-group">
                <label className="label">Transaction ID *</label>
                <input className="input" value={transactionId} onChange={e => setTransactionId(e.target.value)} />
              </div>
            )}
          </div>

          {/* Delivery & Discount Control */}
          <div className="admin-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1rem' }}>Delivery & Discount Settings</h3>
            
            {/* Delivery Control */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
              <label className="label" style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Delivery Fee Mode</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {[
                  { value: 'auto', label: `Automatic (৳${deliveryFee})` },
                  { value: 'free', label: 'Free Delivery' },
                  { value: 'manual', label: 'Manual/Custom' }
                ].map(opt => (
                  <label key={opt.value} style={{
                    flex: 1, display: 'flex', gap: '0.4rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: `1px solid ${deliveryMode === opt.value ? 'var(--gold)' : 'var(--border-light)'}`, background: deliveryMode === opt.value ? 'rgba(201,169,110,0.06)' : 'transparent', alignItems: 'center'
                  }}>
                    <input type="radio" name="deliveryMode" value={opt.value} checked={deliveryMode === opt.value} onChange={() => setDeliveryMode(opt.value as any)} />
                    <span style={{ fontSize: '0.78rem' }}>{opt.label}</span>
                  </label>
                ))}
              </div>
              {deliveryMode === 'manual' && (
                <div className="input-group">
                  <label className="label">Custom Delivery Fee (৳)</label>
                  <input type="number" min="0" className="input" value={manualDeliveryFee} onChange={e => setManualDeliveryFee(Number(e.target.value))} />
                </div>
              )}
            </div>

            {/* Discount Control */}
            <div>
              <label className="label" style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Discount Mode</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {[
                  { value: 'auto', label: 'Automatic Rules' },
                  { value: 'manual', label: 'Manual/Custom' },
                  { value: 'none', label: 'No Discount' }
                ].map(opt => (
                  <label key={opt.value} style={{
                    flex: 1, display: 'flex', gap: '0.4rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: `1px solid ${discountMode === opt.value ? 'var(--gold)' : 'var(--border-light)'}`, background: discountMode === opt.value ? 'rgba(201,169,110,0.06)' : 'transparent', alignItems: 'center'
                  }}>
                    <input type="radio" name="discountMode" value={opt.value} checked={discountMode === opt.value} onChange={() => setDiscountMode(opt.value as any)} />
                    <span style={{ fontSize: '0.78rem' }}>{opt.label}</span>
                  </label>
                ))}
              </div>
              
              {discountMode === 'auto' && (
                <div style={{ border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--cream-light)' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Automatic discounts apply bulk (3+ items), coupon rules, or advance delivery discount.</p>
                  <label style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', cursor: 'pointer', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input type="checkbox" checked={paidDelivery} onChange={e => setPaidDelivery(e.target.checked)} />
                    <span style={{ fontSize: '0.78rem' }}>Pay delivery fee in advance (5% discount)</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input className="input" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(false); setCouponError('') }} placeholder="Coupon code" />
                    <button className="btn btn-outline-gold" onClick={applyCoupon}>Apply</button>
                  </div>
                  {couponApplied && <p style={{ fontSize: '0.78rem', color: 'var(--gold)', marginTop: '0.35rem' }}>✓ Coupon applied! {couponDiscount}% off</p>}
                  {couponError && <p className="error-msg" style={{ marginTop: '0.35rem' }}>{couponError}</p>}
                </div>
              )}

              {discountMode === 'manual' && (
                <div className="input-group">
                  <label className="label">Custom Discount Amount (৳)</label>
                  <input type="number" min="0" max={subtotal} className="input" value={manualDiscount} onChange={e => setManualDiscount(Number(e.target.value))} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="admin-card" style={{ position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Order Summary</h3>
          {selected.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No products selected</p>
          ) : (
            <>
              {selected.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ flex: 1 }}>
                    <span>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)} style={{ padding: '0 0.4rem', background: 'var(--cream)', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>−</button>
                      <span style={{ fontSize: '0.78rem', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)} style={{ padding: '0 0.4rem', background: 'var(--cream)', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>+</button>
                    </div>
                  </div>
                  <span style={{ fontWeight: 500 }}>৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                {[
                  { label: 'Subtotal', value: `৳${subtotal.toLocaleString()}` },
                  ...(discountMode === 'auto' && discounts.bulkDiscount ? [{ label: `Bulk discount (${discounts.bulkDiscount}%)`, value: `-৳${Math.round(subtotal * discounts.bulkDiscount / 100).toLocaleString()}`, gold: true }] : []),
                  ...(discountMode === 'auto' && discounts.deliveryDiscount ? [{ label: `Advance delivery (${discounts.deliveryDiscount}%)`, value: `-৳${Math.round(subtotal * discounts.deliveryDiscount / 100).toLocaleString()}`, gold: true }] : []),
                  ...(discountMode === 'auto' && discounts.couponDiscount ? [{ label: `Coupon (${couponCode})`, value: `-৳${Math.round(subtotal * discounts.couponDiscount / 100).toLocaleString()}`, gold: true }] : []),
                  ...(discountMode === 'manual' && finalDiscount > 0 ? [{ label: 'Manual discount', value: `-৳${finalDiscount.toLocaleString()}`, gold: true }] : []),
                  { label: 'Delivery Fee', value: `৳${finalDeliveryFee.toLocaleString()}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span style={{ color: (row as { gold?: boolean }).gold ? 'var(--gold)' : 'var(--charcoal)', fontWeight: (row as { gold?: boolean }).gold ? 500 : 400 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-serif)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', fontWeight: 500 }}>৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>
              <button className="btn btn-gold btn-lg btn-block" style={{ marginTop: '1.5rem' }} onClick={placeOrder} disabled={placing || selected.length === 0}>
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
