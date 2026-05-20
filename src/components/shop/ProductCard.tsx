'use client'
import Link from 'next/link'
import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/images'
import { useApp } from '@/lib/context'

interface Product {
  id: number; name: string; slug: string; price: number; images: string; category: string; stock?: number;
}

interface Props {
  product: Product
  onAddToCart: (item: { productId: number; name: string; price: number; image: string; slug: string; stock: number }) => void
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useApp()
  const images = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
  const image = images[0] || '/placeholder.jpg'
  const outOfStock = (product.stock ?? 0) <= 0
  const lowStock = (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 3
  const isWish = isInWishlist(product.id)

  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', position: 'relative', transition: 'box-shadow 0.3s ease, transform 0.3s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLDivElement).style.transform = '' }}
    >
      {/* Floating Heart Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (isWish) {
            removeFromWishlist(product.id)
          } else {
            addToWishlist({
              productId: product.id,
              name: product.name,
              price: product.price,
              image,
              slug: product.slug,
              stock: product.stock ?? 0
            })
          }
        }}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'rgba(245, 239, 232, 0.85)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isWish ? '#c0392b' : 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
          zIndex: 10
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'var(--white)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(245, 239, 232, 0.85)' }}
        aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isWish ? '#c0392b' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </button>

      <Link href={`/shop/${product.slug}`} style={{ display: 'block', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', background: 'var(--cream-dark)' }}>
        <Image
          src={cloudinaryUrl(image, { width: 400 })}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
          loading="lazy"
          onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.06)' }}
          onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = '' }}
          onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
        />
        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="badge badge-gold" style={{ background: 'rgba(245,239,232,0.9)', backdropFilter: 'blur(4px)', fontSize: '0.58rem' }}>
            {product.category}
          </span>
          {outOfStock && (
            <span className="badge badge-red" style={{ background: 'rgba(192,57,43,0.9)', color: '#fff', backdropFilter: 'blur(4px)', fontSize: '0.58rem' }}>
              Out of Stock
            </span>
          )}
          {lowStock && (
            <span className="badge badge-orange" style={{ background: 'rgba(180,83,9,0.9)', color: '#fff', backdropFilter: 'blur(4px)', fontSize: '0.58rem' }}>
              Low Stock
            </span>
          )}
        </div>
      </Link>

      <div style={{ padding: 'clamp(0.6rem, 2vw, 1rem) clamp(0.7rem, 2vw, 1.1rem) clamp(0.75rem, 2vw, 1.25rem)' }}>
        <Link href={`/shop/${product.slug}`}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(0.82rem, 2vw, 1rem)', marginBottom: '0.25rem', color: 'var(--charcoal)', lineHeight: 1.3 }}>
            {product.name}
          </h3>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', gap: '0.4rem' }}>
          <p style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 'clamp(0.82rem, 2vw, 1rem)', fontFamily: 'var(--font-sans)', flexShrink: 0 }}>
            ৳{product.price.toLocaleString()}
          </p>
          <button
            onClick={() => onAddToCart({ productId: product.id, name: product.name, price: product.price, image, slug: product.slug, stock: product.stock ?? 0 })}
            className="btn btn-primary"
            disabled={outOfStock}
            style={{ padding: 'clamp(0.35rem, 1vw, 0.6rem) clamp(0.5rem, 1.5vw, 1.25rem)', fontSize: 'clamp(0.6rem, 1.5vw, 0.72rem)', whiteSpace: 'nowrap', opacity: outOfStock ? 0.5 : 1, cursor: outOfStock ? 'not-allowed' : 'pointer' }}
          >
            {outOfStock ? 'Out of Stock' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
