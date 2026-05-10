'use client'
import { useEffect, useState } from 'react'
import { useApp } from '@/lib/context'
import { notFound } from 'next/navigation'

interface Product {
  id: number; name: string; slug: string; price: number; description: string;
  images: string; category: string; stock: number; featured: boolean;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [added, setAdded] = useState(false)
  const { addToCart } = useApp()
  const [slug, setSlug] = useState('')

  useEffect(() => { params.then(p => setSlug(p.slug)) }, [params])

  useEffect(() => {
    if (!slug) return
    fetch(`/api/products/${slug}`).then(r => r.ok ? r.json() : null).then(d => {
      setProduct(d?.product || null)
      setLoading(false)
    })
  }, [slug])

  if (loading) return <div style={{ paddingTop: '140px', textAlign: 'center' }}><div className="spinner" style={{ margin: '4rem auto' }} /></div>
  if (!product) return <div style={{ paddingTop: '140px', textAlign: 'center', padding: '8rem 2rem' }}><h2 style={{ fontFamily: 'var(--font-serif)' }}>Product not found</h2></div>

  const images = (() => { try { return JSON.parse(product.images) } catch { return ['/placeholder.jpg'] } })()
  if (images.length === 0) images.push('/placeholder.jpg')

  const handleAddToCart = () => {
    addToCart({ productId: product.id, name: product.name, price: product.price, image: images[0], slug: product.slug })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div style={{ paddingTop: 'var(--nav-height)' }}>
      <div className="container section">
        <div className="grid-2" style={{ gap: '4rem', alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem', background: 'var(--cream-dark)', aspectRatio: '4/5' }}>
              <img src={images[selectedImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }} />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImg(i)} style={{
                    width: 72, height: 88, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: selectedImg === i ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', padding: 0, background: 'var(--cream-dark)',
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '1rem' }}>{product.category}</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', lineHeight: 1.2, marginBottom: '1rem' }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--gold)' }}>৳{product.price.toLocaleString()}</span>
            </div>

            <p style={{ lineHeight: 1.9, color: 'var(--text-secondary)', marginBottom: '2rem' }}>{product.description}</p>

            {/* Stock */}
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.08em', marginBottom: '1.5rem', color: product.stock > 0 ? 'var(--text-secondary)' : '#c0392b' }}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </p>

            {/* Discounts reminder */}
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--gold)' }}>💰 Save More</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {['Log in for 5% member discount', 'Add 2 more items for bulk 5% off', 'Pay delivery in advance for 5% off'].map(tip => (
                  <p key={tip} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>• {tip}</p>
                ))}
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={product.stock === 0} className={`btn btn-primary btn-lg btn-block ${added ? 'btn-gold' : ''}`} style={{ marginBottom: '1rem', transition: 'all 0.3s' }}>
              {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
