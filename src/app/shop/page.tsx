'use client'
import React, { useState, useEffect, useCallback } from 'react'
import ProductCard from '@/components/shop/ProductCard'
import { useApp } from '@/lib/context'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Product {
  id: number; name: string; slug: string; price: number; images: string; category: string; featured: boolean;
}

const CATEGORIES = [
  { label: 'All Jewelry', value: 'ALL' },
  { label: 'Bracelets', value: 'BRACELETS' },
  { label: 'Earrings', value: 'EARRINGS' },
  { label: 'Rings', value: 'RINGS' },
]

const SORTS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low–High', value: 'asc' },
  { label: 'Price: High–Low', value: 'desc' },
]

const CAT_HERO: Record<string, { image: string; desc: string }> = {
  BRACELETS: { image: '/products/bracelet-hero.jpg', desc: 'Wrist jewels crafted to dazzle' },
  EARRINGS: { image: '/products/earring-hero.jpg', desc: 'From subtle studs to grand chandeliers' },
  RINGS: { image: '/products/ring-hero.jpg', desc: 'From solitaires to statement cocktails' },
}

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('ALL')
  const [sort, setSort] = useState('featured')
  const { addToCart } = useApp()
  const searchParams = useSearchParams()

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== 'ALL') params.set('category', category)
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => {
      let p = d.products || []
      if (sort === 'asc') p = [...p].sort((a: Product, b: Product) => a.price - b.price)
      if (sort === 'desc') p = [...p].sort((a: Product, b: Product) => b.price - a.price)
      if (sort === 'featured') p = [...p].sort((a: Product) => a.featured ? -1 : 1)
      setProducts(p)
      setLoading(false)
    })
  }, [category, sort])

  const hero = CAT_HERO[category]
  const catLabel = CATEGORIES.find(c => c.value === category)?.label || 'All Jewelry'

  return (
    <>
      {/* Header */}
      <div style={{
        paddingTop: 'var(--nav-height)',
        background: hero
          ? `linear-gradient(to right, var(--cream-dark) 40%, transparent 100%)`
          : 'var(--cream-dark)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Category hero image on right */}
        {hero && (
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', overflow: 'hidden' }} className="hidden-mobile">
            <img src={hero.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--cream-dark) 0%, transparent 60%)' }} />
          </div>
        )}

        <div className="container" style={{ position: 'relative', padding: '5rem 2rem 4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ height: '1px', width: '30px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)' }}>Laay Collection</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '0.5rem' }}>{catLabel}</h1>
          {hero && <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', fontStyle: 'italic' }}>{hero.desc}</p>}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.5rem' }}>{products.length} pieces</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.value} className={`tag ${category === cat.value ? 'active' : ''}`} onClick={() => setCategory(cat.value)}>
                  {cat.label}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} className="input" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No pieces found</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try a different category</p>
            </div>
          ) : (
            <div className="grid-auto">
              {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function ShopPage() {
  return <Suspense fallback={<div style={{ paddingTop: 'var(--nav-height)', minHeight: '60vh' }} />}><ShopContent /></Suspense>
}
