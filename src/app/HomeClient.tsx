'use client'
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductCard from '@/components/shop/ProductCard'
import { useApp } from '@/lib/context'
import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/images'

gsap.registerPlugin(ScrollTrigger)

interface Product {
  id: number; name: string; slug: string; price: number;
  images: string; category: string; featured: boolean; stock: number;
}

const categories = [
  { name: 'Bracelets', slug: 'BRACELETS', image: '/Hero/bracelet.png', desc: 'Wrist adornments' },
  { name: 'Earrings', slug: 'EARRINGS', image: '/Hero/earrings.png', desc: 'Ear jewels' },
  { name: 'Rings', slug: 'RINGS', image: '/Hero/rings.png', desc: 'Finger artistry' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function HomeClient({ products }: { products: Product[] }) {
  const [shuffled, setShuffled] = React.useState<Product[]>(products)
  const heroRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useApp()

  useEffect(() => {
    // Ensure at least 1 from each category, then fill remaining slots
    const byCategory: Record<string, Product[]> = { BRACELETS: [], EARRINGS: [], RINGS: [] }
    products.forEach(p => { if (byCategory[p.category]) byCategory[p.category].push(p) })

    const picked: Product[] = []
    const usedIds = new Set<number>()

    // Pick one from each category
    ;(['BRACELETS', 'EARRINGS', 'RINGS'] as const).forEach(cat => {
      const item = byCategory[cat].find(p => !usedIds.has(p.id))
      if (item) { picked.push(item); usedIds.add(item.id) }
    })

    // Fill remaining slots up to 6
    for (const p of products) {
      if (picked.length >= 6) break
      if (!usedIds.has(p.id)) { picked.push(p); usedIds.add(p.id) }
    }

    setShuffled(shuffle(picked))
  }, [products])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entry animations
      const tl = gsap.timeline()
      
      tl.from('.hero-title-word', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      })
      
      tl.from('.hero-col-left', {
        opacity: 0,
        x: -30,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.6')
      
      tl.from('.hero-col-right', {
        opacity: 0,
        x: 30,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.7')
      
      tl.from('.hero-col-center', {
        opacity: 0,
        y: 35,
        duration: 0.75,
        ease: 'power3.out',
      }, '-=0.6')
      
      tl.from('.hero-tagline', {
        opacity: 0,
        y: 15,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.4')

      // Mobile hero animations (highly optimized, fast & snappy)
      tl.from('.hero-mobile-title', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      }, '0')
      
      tl.from('.hero-mobile-tagline', {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.45')
      
      tl.from('.hero-mobile-grid-item', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      }, '-=0.35')

      gsap.utils.toArray<HTMLElement>('.product-card-wrap').forEach((el, i) => {
        gsap.from(el, { y: 30, duration: 0.7, delay: (i % 3) * 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' }
        })
      })

      gsap.utils.toArray<HTMLElement>('.cat-card').forEach((el, i) => {
        gsap.from(el, { y: 24, duration: 0.6, delay: i * 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
        })
      })

      gsap.from('.about-text', { y: 20, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: '.about-text', start: 'top 88%' }
      })

      gsap.from('.perk-item', { y: 16, duration: 0.5, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.perk-item', start: 'top 90%', toggleActions: 'play none none none' }
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <>
      <section ref={heroRef} style={{
        minHeight: 'calc(100vh - var(--header-offset))',
        marginTop: 'var(--header-offset)',
        background: '#FAF7F2',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 1rem 2rem',
      }}>
        {/* Desktop layout */}
        <div className="hidden-mobile" style={{ width: '100%', maxWidth: '1100px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left — Earrings */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="hero-col-left">
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', color: '#7A6A5A', marginBottom: '0.5rem' }}>Earring</span>
              <Link href="/shop?category=EARRINGS" style={{ position: 'relative', aspectRatio: '1/1.2', width: '100%', overflow: 'hidden', borderRadius: '2px', cursor: 'pointer' }}>
                <Image src="/Hero/earrings.png" alt="Earrings" fill priority sizes="33vw" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} className="hero-img-hover" />
              </Link>
            </div>

            {/* Center — New Arrival + Bracelet */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, lineHeight: 1.05, color: '#7A6A5A', textAlign: 'center' }} className="hero-title-word">
                <span style={{ display: 'block', fontFamily: 'var(--font-signature)', fontSize: '3.2rem', lineHeight: 1.1 }}>We Are Here</span>
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }} className="hero-col-center">
                <Link href="/shop?category=BRACELETS" style={{ marginTop: '1.5rem', position: 'relative', aspectRatio: '1.35/1', width: '100%', overflow: 'hidden', borderRadius: '2px', cursor: 'pointer' }}>
                  <Image src="/Hero/bracelet.png" alt="Bracelet" fill priority sizes="40vw" style={{ objectFit: 'cover', objectPosition: 'center 25%', transition: 'transform 0.4s ease' }} className="hero-img-hover" />
                </Link>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', color: '#7A6A5A', marginTop: '0.5rem' }}>Bracelet</span>
              </div>
            </div>

            {/* Right — Rings */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="hero-col-right">
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', color: '#7A6A5A', marginBottom: '0.5rem' }}>Ring</span>
              <Link href="/shop?category=RINGS" style={{ position: 'relative', aspectRatio: '1/1.2', width: '100%', overflow: 'hidden', borderRadius: '2px', cursor: 'pointer' }}>
                <Image src="/Hero/rings.png" alt="Rings" fill priority sizes="33vw" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} className="hero-img-hover" />
              </Link>
            </div>
          </div>

          {/* Tagline */}
          <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: '#7A6A5A', letterSpacing: '0.1em', lineHeight: 1.7, textAlign: 'center' }} className="hero-tagline">
            Behind every compliment is a LAAY piece<br />
            Jewelry that starts conversations
          </p>
        </div>

        {/* Mobile layout */}
        <div className="hidden-desktop" style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Header text */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, lineHeight: 1.05, color: '#7A6A5A', marginBottom: '0.75rem' }} className="hero-mobile-title">
                <span style={{ display: 'block', fontFamily: 'var(--font-signature)', fontSize: 'clamp(2.4rem, 7vw, 3.8rem)', lineHeight: 1.1 }}>We Are Here</span>
              </h1>
              <p style={{ fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)', color: '#7A6A5A', letterSpacing: '0.1em', lineHeight: 1.7 }} className="hero-mobile-tagline">
                Behind every compliment is a LAAY piece<br />
                Jewelry that starts conversations
              </p>
            </div>

            {/* Image grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
              <Link href="/shop?category=EARRINGS" style={{ position: 'relative', aspectRatio: '1/1.25', overflow: 'hidden', borderRadius: '2px', cursor: 'pointer' }} className="hero-mobile-grid-item">
                <Image src="/Hero/earrings.png" alt="Earrings" fill priority sizes="(max-width: 520px) 50vw, 260px" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} className="hero-img-hover" />
                <span className="hero-tap-badge">Shop Earrings →</span>
              </Link>
              <Link href="/shop?category=RINGS" style={{ position: 'relative', aspectRatio: '1/1.25', overflow: 'hidden', borderRadius: '2px', cursor: 'pointer' }} className="hero-mobile-grid-item">
                <Image src="/Hero/rings.png" alt="Rings" fill priority sizes="(max-width: 520px) 50vw, 260px" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} className="hero-img-hover" />
                <span className="hero-tap-badge">Shop Rings →</span>
              </Link>
              <Link href="/shop?category=BRACELETS" style={{ position: 'relative', aspectRatio: '2/1.1', overflow: 'hidden', borderRadius: '2px', gridColumn: '1 / -1', cursor: 'pointer' }} className="hero-mobile-grid-item">
                <Image src="/Hero/bracelet.png" alt="Bracelet" fill priority sizes="(max-width: 520px) 100vw, 520px" style={{ objectFit: 'cover', objectPosition: 'center 25%', transition: 'transform 0.4s ease' }} className="hero-img-hover" />
                <span className="hero-tap-badge">Shop Bracelets →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ height: '1px', width: '40px', background: 'var(--gold)' }} />
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>Curated Selection</span>
              <div style={{ height: '1px', width: '40px', background: 'var(--gold)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginTop: '0.25rem' }}>Featured Pieces</h2>
          </div>
          <div className="grid-auto">
            {shuffled.map(p => (
              <div key={p.id} className="product-card-wrap">
                <ProductCard product={p} onAddToCart={addToCart} />
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '3.5rem' }}>
            <Link href="/shop" className="btn btn-outline">View Full Collection →</Link>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--charcoal)', padding: '2.5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,169,110,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(201,169,110,0.06) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="perk-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { icon: '💎', title: 'Bundle Reward', desc: 'Buy 3+ pieces and save an additional 5%' },
              { icon: '🏷️', title: 'Exclusive Codes', desc: 'Unlock extra savings with coupon codes' },
            ].map(perk => (
              <div key={perk.title} className="perk-item">
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', background: 'rgba(201,169,110,0.06)' }}>{perk.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--gold)', marginBottom: '0.5rem', fontSize: '1rem' }}>{perk.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'rgba(245,239,232,0.45)', lineHeight: 1.7 }}>{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ height: '1px', width: '40px', background: 'var(--gold)' }} />
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>Our Jewelry</span>
              <div style={{ height: '1px', width: '40px', background: 'var(--gold)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginTop: '0.25rem' }}>Shop by Collection</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'clamp(0.4rem, 1.5vw, 1.5rem)', width: '100%' }}>
            {categories.map(cat => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="cat-card" style={{ display: 'block', textDecoration: 'none', minWidth: 0 }}>
                <div className="cat-card-img-wrap" style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: 'clamp(6px, 1.5vw, 12px)', overflow: 'hidden', background: 'var(--cream-dark)', boxShadow: '0 4px 16px rgba(44,40,38,0.12)' }}>
                  <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 768px) 33vw, 33vw" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }} className="cat-card-img" loading="lazy" />
                  <div className="cat-card-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(44,40,38,0)', transition: 'background 0.4s ease' }} />
                </div>
                <div style={{ paddingTop: 'clamp(0.4rem, 1.5vw, 0.9rem)', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(0.75rem, 2.5vw, 1.3rem)', fontWeight: 400, color: 'var(--charcoal)', margin: '0 0 clamp(0.2rem, 0.8vw, 0.5rem)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</p>
                  <span style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.65rem)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', borderBottom: '1px solid rgba(201,169,110,0.5)', paddingBottom: '1px' }}>Shop →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--cream-dark)', padding: '4rem 0', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '3rem', left: '50%', transform: 'translateX(-50%)', height: '1px', width: '80px', background: 'var(--gold)' }} />
        <div className="container-sm text-center about-text">
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}></span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginTop: '0.75rem', marginBottom: '1.75rem', lineHeight: 1.2 }}>
            Every Piece Tells<br />a Love Story
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.95, color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 3rem' }}>
            At Laay, we believe that the right piece of jewelry holds the power to transform how you feel — and how the world sees you. Each item is curated for quality, crafted for longevity, and designed to become part of your story.
          </p>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['37+', 'Unique Designs'], ['100%', 'Handpicked']].map(([stat, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>{stat}</p>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', height: '1px', width: '80px', background: 'var(--gold)' }} />
      </section>
    </>
  )
}
