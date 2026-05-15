import Link from 'next/link'
import Image from 'next/image'

const FB_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
)
const IG_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
)
const WA_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
)

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
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(20px) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .float-icon { animation: floatIn 0.5s ease backwards; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .float-icon:nth-child(1) { animation-delay: 0.1s; }
        .float-icon:nth-child(2) { animation-delay: 0.2s; }
        .float-icon:nth-child(3) { animation-delay: 0.3s; }
        .float-wa:hover { transform: scale(1.12) !important; box-shadow: 0 6px 20px rgba(37,211,102,0.5) !important; }
        .float-ig:hover { transform: scale(1.12) !important; box-shadow: 0 6px 20px rgba(220,39,67,0.5) !important; }
        .float-fb:hover { transform: scale(1.12) !important; box-shadow: 0 6px 20px rgba(24,119,242,0.5) !important; }
      `}</style>

      {/* Floating social icons */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <a href="https://wa.me/qr/JCYRNGVQFATAP1" target="_blank" rel="noopener noreferrer" className="float-icon float-wa" title="WhatsApp" style={{ width: 48, height: 48, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(37,211,102,0.35)' }}>
          {WA_SVG}
        </a>
        <a href="https://www.instagram.com/____laay____/" target="_blank" rel="noopener noreferrer" className="float-icon float-ig" title="Instagram" style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(220,39,67,0.35)' }}>
          {IG_SVG}
        </a>
        <a href="https://www.facebook.com/profile.php?id=61574705164180" target="_blank" rel="noopener noreferrer" className="float-icon float-fb" title="Facebook" style={{ width: 48, height: 48, borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(24,119,242,0.35)' }}>
          {FB_SVG}
        </a>
      </div>

      {/* Background decorative circles */}
      <svg style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.04, pointerEvents: 'none' }} width="400" height="400" viewBox="0 0 400 400" fill="none">
        <circle cx="350" cy="350" r="300" stroke="#C9A96E" strokeWidth="1"/>
        <circle cx="350" cy="350" r="200" stroke="#C9A96E" strokeWidth="1"/>
      </svg>

      {/* Gold top line */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

      {/* LOGO section */}
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
              <p style={{ fontSize: '0.82rem', color: 'rgba(245,239,232,0.65)' }}>01866249676 (Personal)</p>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(245,239,232,0.35)', lineHeight: 1.7 }}>Cash on delivery also available nationwide.</p>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '0.95rem', marginBottom: '1.5rem', color: 'var(--cream)', letterSpacing: '0.05em' }}>Contact</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(245,239,232,0.45)', lineHeight: 2, marginBottom: '1.5rem' }}>
              <a href="tel:+8801976249676" style={{ color: 'inherit', textDecoration: 'none' }}>+880 1976-249676</a><br />
              Chattagram, Bangladesh<br />
              Sun–Thu, 10am–8pm
            </p>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <a href="https://www.instagram.com/____laay____/" target="_blank" rel="noopener noreferrer" className="footer-icon-link">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61574705164180" target="_blank" rel="noopener noreferrer" className="footer-icon-link">Facebook</a>
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
