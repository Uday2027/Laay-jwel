'use client'
import { useApp } from '@/lib/context'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, deliveryFee } = useApp()
  const drawerRef = useRef<HTMLDivElement>(null)

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const total = subtotal + deliveryFee

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setCartOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCartOpen])

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  return (
    <>
      {/* Overlay */}
      <div onClick={() => setCartOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(44,40,38,0.45)',
        backdropFilter: 'blur(4px)', zIndex: 200,
        opacity: cartOpen ? 1 : 0, pointerEvents: cartOpen ? 'all' : 'none',
        transition: 'opacity 0.35s ease',
      }} />

      {/* Drawer */}
      <div ref={drawerRef} style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(420px, 100vw)',
        background: 'var(--white)',
        zIndex: 201,
        transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(44,40,38,0.12)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.4rem' }}>Your Cart</h3>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.75rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '0.5rem' }}>Your cart is empty</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Explore our collection</p>
              <Link href="/shop" onClick={() => setCartOpen(false)} className="btn btn-primary btn-sm">Shop Now</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {cart.map(item => (
                <div key={item.productId} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 72, height: 88, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: 'var(--cream-dark)', position: 'relative' }}>
                    <Image src={item.image} alt={item.name} fill sizes="72px" style={{ objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.name}</p>
                    <p style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '0.87rem' }}>৳{item.price.toLocaleString()}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Stock: {item.stock}</p>
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ padding: '0.2rem 0.6rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)' }}>−</button>
                        <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.quantity >= item.stock) {
                              alert(`Only ${item.stock} item(s) available in stock`)
                              return
                            }
                            updateQuantity(item.productId, item.quantity + 1)
                          }}
                          style={{ padding: '0.2rem 0.6rem', background: 'none', border: 'none', cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer', fontSize: '1rem', color: item.quantity >= item.stock ? 'var(--border)' : 'var(--text-secondary)' }}
                          disabled={item.quantity >= item.stock}
                        >+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'underline' }}>Remove</button>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, color: 'var(--charcoal)', fontSize: '0.95rem', flexShrink: 0 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer totals */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-light)', padding: '1.5rem 1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Delivery</span><span>৳{deliveryFee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>
              <span>Total</span><span style={{ color: 'var(--gold)' }}>৳{total.toLocaleString()}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem', letterSpacing: '0.06em' }}>
              🏷️ Log in or add 3+ items for extra discounts!
            </p>
            <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn btn-primary btn-block btn-lg">
              Proceed to Checkout
            </Link>
            <Link href="/shop" onClick={() => setCartOpen(false)} style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'underline' }}>
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
