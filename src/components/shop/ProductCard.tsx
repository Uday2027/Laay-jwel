'use client'
import Link from 'next/link'
import { useApp } from '@/lib/context'

interface Product {
  id: number; name: string; slug: string; price: number; images: string; category: string;
}

interface Props {
  product: Product
  onAddToCart: (item: { productId: number; name: string; price: number; image: string; slug: string }) => void
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const images = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
  const image = images[0] || '/placeholder.jpg'

  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.3s ease, transform 0.3s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLDivElement).style.transform = '' }}
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`} style={{ display: 'block', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', background: 'var(--cream-dark)' }}>
        <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.06)' }}
          onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = '' }}
          onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
        />
        {/* Category badge */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
          <span className="badge badge-gold" style={{ background: 'rgba(245,239,232,0.9)', backdropFilter: 'blur(4px)' }}>
            {product.category}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '1rem 1.1rem 1.25rem' }}>
        <Link href={`/shop/${product.slug}`}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1rem', marginBottom: '0.3rem', color: 'var(--charcoal)', lineHeight: 1.3 }}>
            {product.name}
          </h3>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
          <p style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '1rem', fontFamily: 'var(--font-sans)' }}>
            ৳{product.price.toLocaleString()}
          </p>
          <button
            onClick={() => onAddToCart({ productId: product.id, name: product.name, price: product.price, image, slug: product.slug })}
            className="btn btn-primary btn-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
