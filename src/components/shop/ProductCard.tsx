'use client'
import Link from 'next/link'
import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/images'

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
        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
          <span className="badge badge-gold" style={{ background: 'rgba(245,239,232,0.9)', backdropFilter: 'blur(4px)', fontSize: '0.58rem' }}>
            {product.category}
          </span>
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
            onClick={() => onAddToCart({ productId: product.id, name: product.name, price: product.price, image, slug: product.slug })}
            className="btn btn-primary"
            style={{ padding: 'clamp(0.35rem, 1vw, 0.6rem) clamp(0.5rem, 1.5vw, 1.25rem)', fontSize: 'clamp(0.6rem, 1.5vw, 0.72rem)', whiteSpace: 'nowrap' }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
