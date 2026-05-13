'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/context'
import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/images'

interface Product {
  id: number; name: string; slug: string; price: number; description: string;
  images: string; category: string; stock: number; featured: boolean;
}

interface RelatedProduct {
  id: number; name: string; slug: string; price: number;
  images: string; category: string; stock: number; featured: boolean;
}

export default function ProductDetailClient({
  product,
  related,
  isAdmin,
}: {
  product: Product
  related: RelatedProduct[]
  isAdmin: boolean
}) {
  const [selectedImg, setSelectedImg] = useState(0)
  const [added, setAdded] = useState(false)
  const { addToCart } = useApp()

  const images = (() => { try { return JSON.parse(product.images) } catch { return ['/placeholder.jpg'] } })()
  if (images.length === 0) images.push('/placeholder.jpg')

  const handleAddToCart = () => {
    addToCart({ productId: product.id, name: product.name, price: product.price, image: images[0], slug: product.slug })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div style={{ paddingTop: 'var(--header-offset)' }}>
      <div className="container section">
        <div className="grid-2" style={{ gap: '4rem', alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem', background: 'var(--cream-dark)', aspectRatio: '4/5', position: 'relative' }}>
              <Image
                src={cloudinaryUrl(images[selectedImg], { width: 800 })}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg' }}
              />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImg(i)} style={{
                    width: 72, height: 88, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: selectedImg === i ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', padding: 0, background: 'var(--cream-dark)', position: 'relative',
                  }}>
                    <Image
                      src={cloudinaryUrl(img, { width: 150 })}
                      alt=""
                      fill
                      sizes="72px"
                      style={{ objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ padding: '0 clamp(0.5rem, 4vw, 2rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span className="badge badge-gold">{product.category}</span>
              {isAdmin && (
                <Link href={`/admin/products?edit=${product.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.65rem' }}>
                  ✎ Edit Product
                </Link>
              )}
            </div>
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

      {/* Related Products */}
      {related.length > 0 && (
        <div className="container" style={{ paddingBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>You May Also Like</span>
            <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          </div>
          <div className="grid-auto">
            {related.map(p => {
              const relImages = (() => { try { return JSON.parse(p.images) } catch { return [] } })()
              const relImg = relImages[0] || '/placeholder.jpg'
              return (
                <Link key={p.id} href={`/shop/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.3s ease, transform 0.3s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLDivElement).style.transform = '' }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--cream-dark)' }}>
                      <Image
                        src={cloudinaryUrl(relImg, { width: 400 })}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: 'clamp(0.6rem, 2vw, 1rem)' }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(0.82rem, 2vw, 1rem)', marginBottom: '0.25rem', color: 'var(--charcoal)', lineHeight: 1.3 }}>{p.name}</h3>
                      <p style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 'clamp(0.82rem, 2vw, 1rem)' }}>৳{p.price.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
