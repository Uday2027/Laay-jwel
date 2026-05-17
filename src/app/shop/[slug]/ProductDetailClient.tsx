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

interface Review {
  id: number; name: string; email: string | null; rating: number; comment: string; createdAt: Date | string;
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width={size} height={size} viewBox="0 0 24 24" fill={star <= rating ? '#C9A96E' : 'rgba(201,169,110,0.2)'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProductDetailClient({
  product,
  related,
  reviews: initialReviews,
  isAdmin,
}: {
  product: Product
  related: RelatedProduct[]
  reviews: Review[]
  isAdmin: boolean
}) {
  const [selectedImg, setSelectedImg] = useState(0)
  const [added, setAdded] = useState(false)
  const { addToCart } = useApp()

  const images = (() => { try { return JSON.parse(product.images) } catch { return ['/placeholder.jpg'] } })()
  if (images.length === 0) images.push('/placeholder.jpg')

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      alert('This item is out of stock')
      return
    }
    addToCart({ productId: product.id, name: product.name, price: product.price, image: images[0], slug: product.slug, stock: product.stock })
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

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Description</p>
              <p style={{ lineHeight: 1.9, color: 'var(--text-secondary)' }}>{product.description}</p>
            </div>

            {/* Stock */}
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.08em', marginBottom: '1.5rem', color: product.stock > 0 ? 'var(--text-secondary)' : '#c0392b' }}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </p>

            {/* Discounts reminder */}
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--gold)' }}>💰 Save More</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {['Add 2 more items for bulk 5% off'].map(tip => (
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
                        loading="lazy"
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

      {/* Reviews */}
      <ReviewsSection productId={product.id} initialReviews={initialReviews} />
    </div>
  )
}

function ReviewsSection({ productId, initialReviews }: { productId: number; initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const average = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, rating, comment }),
    })
    if (res.ok) {
      const data = await res.json()
      setReviews(prev => [data.review, ...prev])
      setName('')
      setEmail('')
      setRating(5)
      setComment('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }
    setSubmitting(false)
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>Customer Reviews</span>
        <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
      </div>

      <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
        {/* Review List */}
        <div>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No reviews yet. Be the first to review!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--charcoal)' }}>{average.toFixed(1)}</span>
                <div>
                  <StarRating rating={Math.round(average)} size={20} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {reviews.map(r => (
                <div key={r.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{r.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={r.rating} size={14} />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Form */}
        <div className="admin-card" style={{ position: 'sticky', top: 'calc(var(--header-offset) + 2rem)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Write a Review</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="label">Your Name *</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="label">Rating *</label>
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <svg width={28} height={28} viewBox="0 0 24 24" fill={star <= rating ? '#C9A96E' : 'rgba(201,169,110,0.2)'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label className="label">Review *</label>
              <textarea className="input" value={comment} onChange={e => setComment(e.target.value)} required rows={4} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : submitted ? '✓ Review Submitted!' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
