'use client'
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductCard from '@/components/shop/ProductCard'
import { useApp } from '@/lib/context'

gsap.registerPlugin(ScrollTrigger)

interface Product {
  id: number; name: string; slug: string; price: number;
  images: string; category: string; featured: boolean;
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useApp()
  const [products, setProducts] = React.useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products?featured=true&limit=6').then(r => r.json()).then(d => setProducts(d.products || []))
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from(titleRef.current, { y: 70, opacity: 0, duration: 1.3 })
        .from(subtitleRef.current, { y: 30, opacity: 0, duration: 0.9 }, '-=0.7')
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.hero-ornament', { scaleX: 0, opacity: 0, duration: 1.2, ease: 'power2.inOut' }, '-=0.8')

      gsap.utils.toArray<HTMLElement>('.product-card-wrap').forEach((el, i) => {
        gsap.from(el, { y: 50, opacity: 0, duration: 0.8, delay: (i % 3) * 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
        })
      })

      gsap.utils.toArray<HTMLElement>('.cat-card').forEach((el, i) => {
        gsap.from(el, { y: 40, opacity: 0, duration: 0.7, delay: i * 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        })
      })

      gsap.from('.about-text', { y: 30, opacity: 0, duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.about-text', start: 'top 85%' }
      })

      gsap.from('.perk-item', { y: 25, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.perk-item', start: 'top 88%', toggleActions: 'play none none none' }
      })
    })
    return () => ctx.revert()
  }, [products])

  const categories = [
    { name: 'Bracelets', slug: 'BRACELETS', image: '/products/bracelet-hero.jpg', desc: 'Wrist adornments' },
    { name: 'Earrings', slug: 'EARRINGS', image: '/products/earring-hero.jpg', desc: 'Ear jewels' },
    { name: 'Rings', slug: 'RINGS', image: '/products/ring-hero.jpg', desc: 'Finger artistry' },
  ]

  return (
    <>
      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(155deg, #FDFAF7 0%, var(--cream-dark) 55%, var(--blush) 100%)`,
        paddingTop: 'var(--header-offset)', position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        {/* Large decorative circles */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.12 }} viewBox="0 0 1400 900" fill="none">
          <circle cx="150" cy="200" r="320" stroke="#C9A96E" strokeWidth="0.6"/>
          <circle cx="1250" cy="700" r="280" stroke="#C9A96E" strokeWidth="0.6"/>
          <circle cx="700" cy="450" r="500" stroke="#C9A96E" strokeWidth="0.3"/>
          <circle cx="700" cy="450" r="350" stroke="#C9A96E" strokeWidth="0.2"/>
        </svg>

        {/* Floating jewelry previews */}
        <div className="hidden-mobile" style={{ position: 'absolute', right: '6%', top: '18%', width: '200px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(44,40,38,0.18)', opacity: 0.9, transform: 'rotate(2deg)' }}>
          <img src="/products/bracelet-hero.jpg" alt="" style={{ width: '100%', display: 'block' }} />
        </div>
        <div className="hidden-mobile" style={{ position: 'absolute', left: '5%', bottom: '18%', width: '155px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(44,40,38,0.18)', opacity: 0.85, transform: 'rotate(-2.5deg)' }}>
          <img src="/products/ring-hero.jpg" alt="" style={{ width: '100%', display: 'block' }} />
        </div>

        <div style={{ maxWidth: '680px', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
          {/* Category tags */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
            {['Bracelets', 'Earrings', 'Rings'].map(c => (
              <span key={c} style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', padding: '0.3rem 0.9rem', border: '1px solid rgba(201,169,110,0.4)', borderRadius: '100px' }}>{c}</span>
            ))}
          </div>

          <div className="hero-ornament" style={{ height: '1px', width: '80px', background: 'var(--gold)', margin: '0 auto 2.5rem', transformOrigin: 'left' }} />

          <h1 ref={titleRef} style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, lineHeight: 1.05, marginBottom: '1.75rem', color: 'var(--charcoal)' }}>
            Fine Jewelry<br /><em style={{ fontStyle: 'italic', color: 'var(--gold-dark)' }}>Crafted for Her</em>
          </h1>

          <p ref={subtitleRef} style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 3rem' }}>
            Bracelets, earrings and rings of extraordinary beauty — curated for the woman who knows her worth.
          </p>

          <div ref={ctaRef} className="hero-cta-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-primary btn-lg">Explore Collection</Link>
            <Link href="/shop?category=RINGS" className="btn btn-outline-gold btn-lg">Shop Rings</Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.4 }}>
          <span style={{ fontSize: '0.58rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Discover</span>
          <div style={{ width: '1px', height: '44px', background: 'var(--charcoal)', animation: 'scrollPulse 1.8s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ─── CATEGORIES ─────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ height: '1px', width: '40px', background: 'var(--gold)' }} />
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>Our Jewelry</span>
              <div style={{ height: '1px', width: '40px', background: 'var(--gold)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginTop: '0.25rem' }}>Shop by Collection</h2>
          </div>
          {/* 3-column grid for 3 categories */}
          <div className="grid-3">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="cat-card" style={{ display: 'block', textDecoration: 'none' }}>
                <div className="cat-card-img-wrap" style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '3/4', marginBottom: '1.25rem', boxShadow: 'var(--shadow-md)' }}>
                  <img src={cat.image} alt={cat.name} className="cat-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(44,40,38,0.6) 0%, transparent 55%)' }} />
                  {/* Bottom text */}
                  <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1rem, 3vw, 1.6rem)', fontWeight: 300, color: 'var(--white)', marginBottom: '0.25rem' }}>{cat.name}</p>
                    <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ height: '1px', width: '24px', background: 'var(--gold)' }} />
                      <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{cat.desc}</p>
                    </div>
                  </div>
                </div>
                {/* Shop link */}
                <div className="hidden-mobile" style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', borderBottom: '1px solid rgba(201,169,110,0.4)', paddingBottom: '2px' }}>Shop {cat.name} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DISCOUNT PERKS ─────────────────────────────────────── */}
      <section style={{ background: 'var(--charcoal)', padding: '4rem 0', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,169,110,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(201,169,110,0.06) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="perk-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { icon: '👑', title: 'Member Discount', desc: 'Sign in for an instant 5% off every order' },
              { icon: '💎', title: 'Bundle Reward', desc: 'Buy 3+ pieces and save an additional 5%' },
              { icon: '📦', title: 'Advance Delivery', desc: 'Pre-pay delivery fee and enjoy 5% off' },
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

      {/* ─── FEATURED PRODUCTS ──────────────────────────────────── */}
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
            {products.map(p => (
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

      {/* ─── BRAND STRIP ────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream-dark)', padding: '7rem 0', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '3rem', left: '50%', transform: 'translateX(-50%)', height: '1px', width: '80px', background: 'var(--gold)' }} />
        <div className="container-sm text-center about-text">
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>Our Promise</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginTop: '0.75rem', marginBottom: '1.75rem', lineHeight: 1.2 }}>
            Every Piece Tells<br />a Love Story
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.95, color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 3rem' }}>
            At Laay, we believe that the right piece of jewelry holds the power to transform how you feel — and how the world sees you. Each item is curated for quality, crafted for longevity, and designed to become part of your story.
          </p>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['12+', 'Unique Designs'], ['100%', 'Handpicked'], ['★ 4.9', 'Customer Rating']].map(([stat, label]) => (
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
