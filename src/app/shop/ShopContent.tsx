'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import ProductCard from '@/components/shop/ProductCard'
import { useApp } from '@/lib/context'

interface Product {
  id: number; name: string; slug: string; price: number; images: string; category: string; featured: boolean; createdAt: Date | string;
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
  BRACELETS: { image: '/Hero/bracelet.png', desc: 'Wrist jewels crafted to dazzle' },
  EARRINGS: { image: '/Hero/earrings.png', desc: 'From subtle studs to grand chandeliers' },
  RINGS: { image: '/Hero/rings.png', desc: 'From solitaires to statement cocktails' },
}

export default function ShopContent({ initialProducts, initialCategory }: { initialProducts: Product[]; initialCategory: string }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState('featured')
  const { addToCart } = useApp()

  // Sync category state when URL changes via <Link> navigation
  useEffect(() => {
    setCategory(initialCategory)
  }, [initialCategory])

  useEffect(() => {
    setLoading(true)
    let filtered = initialProducts
    if (category !== 'ALL') {
      filtered = initialProducts.filter(p => (p.category || '').trim().toUpperCase() === category)
    }
    setProducts(filtered)
    setLoading(false)
  }, [category, initialProducts])

  const sortedProducts = React.useMemo(() => {
    let p = [...products]
    if (sort === 'asc') p.sort((a, b) => a.price - b.price)
    if (sort === 'desc') p.sort((a, b) => b.price - a.price)
    if (sort === 'featured') p.sort((a) => a.featured ? -1 : 1)
    if (sort === 'newest') p.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return p
  }, [products, sort])

  const hero = CAT_HERO[category]
  const catLabel = CATEGORIES.find(c => c.value === category)?.label || 'All Jewelry'

  return (
    <>
      {/* Header */}
      <div style={{
        paddingTop: 'var(--header-offset)',
        background: hero
          ? `linear-gradient(to right, var(--cream-dark) 40%, transparent 100%)`
          : 'var(--cream-dark)',
        position: 'relative', overflow: 'hidden',
      }}>
        {hero && (
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', overflow: 'hidden' }} className="hidden-mobile">
            <Image src={hero.image} alt="" fill sizes="45vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} priority />
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.5rem' }}>{sortedProducts.length} pieces</p>
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
          ) : sortedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No pieces found</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try a different category</p>
            </div>
          ) : (
            <div className="grid-auto">
              {sortedProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
