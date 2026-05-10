import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--charcoal)', color: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .footer-link { display: block; margin-bottom: 0.85rem; font-size: 0.8rem; color: rgba(245,239,232,0.45); letter-spacing: 0.06em; transition: color 0.3s ease; }
        .footer-link:hover { color: var(--gold); }
        .footer-social:hover { color: var(--gold); }
        .footer-icon-link { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(245,239,232,0.4); transition: color 0.3s ease; }
        .footer-icon-link:hover { color: var(--gold); }
      `}</style>

      {/* Background decorative circles */}
      <svg style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.04, pointerEvents: 'none' }} width="400" height="400" viewBox="0 0 400 400" fill="none">
        <circle cx="350" cy="350" r="300" stroke="#C9A96E" strokeWidth="1"/>
        <circle cx="350" cy="350" r="200" stroke="#C9A96E" strokeWidth="1"/>
      </svg>

      {/* Gold top line */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

      {/* LOGO section — full size, centred */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem 3rem', borderBottom: '1px solid rgba(245,239,232,0.07)' }}>
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Laay"
            width={220}
            height={88}
            style={{ filter: 'invert(1) sepia(1) saturate(0.25) brightness(1.6)', display: 'inline-block' }}
          />
        </Link>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(245,239,232,0.3)', marginTop: '0.75rem' }}>Fine Jewelry · Bangladesh</p>
      </div>

      {/* Main footer grid */}
      <div className="container" style={{ padding: '3.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem' }}>

          {/* Collections */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '0.95rem', marginBottom: '1.5rem', color: 'var(--cream)', letterSpacing: '0.05em' }}>Collections</h4>
            {[
              ['All Jewelry', '/shop'],
              ['Bracelets', '/shop?category=BRACELETS'],
              ['Earrings', '/shop?category=EARRINGS'],
              ['Rings', '/shop?category=RINGS'],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="footer-link">{label}</Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '0.95rem', marginBottom: '1.5rem', color: 'var(--cream)', letterSpacing: '0.05em' }}>Account</h4>
            {[
              ['Login / Register', '/account'],
              ['My Orders', '/account'],
              ['Checkout', '/checkout'],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="footer-link">{label}</Link>
            ))}
          </div>

          {/* Payment Info */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '0.95rem', marginBottom: '1.5rem', color: 'var(--cream)', letterSpacing: '0.05em' }}>Payment</h4>
            <div style={{ padding: '1rem 1.25rem', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', background: 'rgba(201,169,110,0.04)' }}>
              <p style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.35rem' }}>bKash</p>
              <p style={{ fontSize: '0.82rem', color: 'rgba(245,239,232,0.65)' }}>01XXXXXXXXX (Personal)</p>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(245,239,232,0.35)', lineHeight: 1.7 }}>Cash on delivery also available nationwide.</p>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '0.95rem', marginBottom: '1.5rem', color: 'var(--cream)', letterSpacing: '0.05em' }}>Contact</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(245,239,232,0.45)', lineHeight: 2, marginBottom: '1.5rem' }}>
              hello@laay.com<br />
              Dhaka, Bangladesh<br />
              Sun–Thu, 10am–8pm
            </p>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <a href="#" className="footer-icon-link" style={{ color: 'rgba(245,239,232,0.4)' }}>Instagram</a>
              <a href="#" className="footer-icon-link" style={{ color: 'rgba(245,239,232,0.4)' }}>Facebook</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(245,239,232,0.07)', padding: '1.5rem 2rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(245,239,232,0.22)', letterSpacing: '0.06em' }}>© {year} Laay. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)', opacity: 0.5 }} />
            <p style={{ fontSize: '0.72rem', color: 'rgba(245,239,232,0.22)', letterSpacing: '0.06em' }}>Crafted with love in Bangladesh</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
