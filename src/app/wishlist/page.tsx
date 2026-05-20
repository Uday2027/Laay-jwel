'use client'
import React from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/context'
import ProductCard from '@/components/shop/ProductCard'

export default function WishlistPage() {
  const { wishlist, addToCart, mounted } = useApp()

  if (!mounted) {
    return (
      <div style={{ paddingTop: 'var(--header-offset)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 'var(--header-offset)', minHeight: '80vh', background: 'var(--cream)' }}>
      {/* Page Header */}
      <div style={{ padding: '4rem 2rem 3rem', textAlign: 'center', background: 'var(--cream-dark)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ height: '1px', width: '30px', background: 'var(--gold)' }} />
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)' }}>Saved Collection</span>
          <div style={{ height: '1px', width: '30px', background: 'var(--gold)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--charcoal)' }}>My Wishlist</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
      </div>

      <div className="section" style={{ padding: '3rem 0 5rem' }}>
        <div className="container">
          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.4)" strokeWidth="1" style={{ marginBottom: '1.5rem' }}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--charcoal)' }}>Your wishlist is empty</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                Explore our fine collections of bracelets, earrings, and rings to save your favorite designs for later.
              </p>
              <Link href="/shop" className="btn btn-primary btn-lg">
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="grid-auto">
              {wishlist.map(item => (
                <ProductCard
                  key={item.productId}
                  product={{
                    id: item.productId,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    images: JSON.stringify([item.image]),
                    category: '',
                    stock: item.stock
                  }}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
