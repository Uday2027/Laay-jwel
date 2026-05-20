'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/lib/context'
import styles from './Navbar.module.css'
import { usePathname } from 'next/navigation'
import { cloudinaryUrl } from '@/lib/images'

export default function Navbar() {
  const { cartCount, setCartOpen, user, mounted, wishlistCount } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    const timeout = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
        .then(r => r.json())
        .then(data => {
          setSearchResults(data.products || [])
          setSearchLoading(false)
        })
        .catch(() => {
          setSearchLoading(false)
        })
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  if (pathname.startsWith('/admin')) return null

  const JEWELRY_LINKS = [
    { href: '/shop?category=BRACELETS', label: 'Bracelets' },
    { href: '/shop?category=EARRINGS', label: 'Earrings' },
    { href: '/shop?category=RINGS', label: 'Rings' },
  ]

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Left nav */}
          <nav className={styles.navLeft}>
            <Link href="/shop" className={styles.navLink}>Collection</Link>
            {JEWELRY_LINKS.slice(0, 2).map(l => (
              <Link key={l.href} href={l.href} className={styles.navLink}>{l.label}</Link>
            ))}
          </nav>

          {/* Logo center */}
          <Link href="/" className={styles.logo}>
            <Image src="/logo.png" alt="Laay" width={110} height={44} priority />
          </Link>

          {/* Right nav */}
          <nav className={styles.navRight}>
            <Link href="/shop?category=RINGS" className={styles.navLink}>Rings</Link>
            
            {/* Search Button */}
            <button className={styles.searchBtn} onClick={() => setSearchOpen(true)} aria-label="Search products">
              <SearchIcon />
            </button>

            {/* Wishlist Button */}
            <Link href="/wishlist" className={styles.wishlistBtn} aria-label="Open wishlist">
              <HeartIcon />
              {mounted && wishlistCount > 0 && <span className={styles.wishlistBadge}>{wishlistCount}</span>}
            </Link>

            <Link href="/account" className={styles.navLink}>
              {user ? user.name.split(' ')[0] : 'Account'}
            </Link>

            <button className={styles.cartBtn} onClick={() => setCartOpen(true)} aria-label="Open cart">
              <CartIcon />
              {mounted && cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={menuOpen ? styles.open : ''} />
            <span className={menuOpen ? styles.open : ''} />
            <span className={menuOpen ? styles.open : ''} />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/shop" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>All Jewelry</Link>
            {JEWELRY_LINKS.map(l => (
              <Link key={l.href} href={l.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{l.label}</Link>
            ))}
            <Link href="/wishlist" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              Wishlist {mounted && wishlistCount > 0 ? `(${wishlistCount})` : ''}
            </Link>
            <button 
              className={styles.mobileLink} 
              style={{ border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }} 
              onClick={() => { setSearchOpen(true); setMenuOpen(false) }}
            >
              Search Collection
            </button>
            <Link href="/account" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {user ? 'My Account' : 'Login'}
            </Link>
            <button className={styles.mobileCartBtn} onClick={() => { setCartOpen(true); setMenuOpen(false) }}>
              Cart {mounted && cartCount > 0 ? `(${cartCount})` : ''}
            </button>
          </div>
        )}
      </header>

      {/* Autocomplete Search Overlay */}
      {searchOpen && (
        <div className={styles.searchOverlay} onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
          <div className={styles.searchContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.searchHeader}>
              <h2 className={styles.searchTitle}>Search our Collection</h2>
              <button className={styles.closeBtn} onClick={() => { setSearchOpen(false); setSearchQuery('') }} aria-label="Close search">
                ✕
              </button>
            </div>
            <div className={styles.searchInputWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchLoading && <div className={styles.searchSpinner} />}
            </div>
            <div className={styles.searchResults}>
              {searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                  {searchResults.map(p => {
                    const imgs = (() => { try { return JSON.parse(p.images) } catch { return [] } })()
                    const img = imgs[0] || '/placeholder.jpg'
                    return (
                      <Link
                        key={p.id}
                        href={`/shop/${p.slug}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                        className={styles.searchResultItem}
                      >
                        <div className={styles.searchResultThumb}>
                          <Image src={cloudinaryUrl(img, { width: 80 })} alt={p.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)' }}>{p.name}</h4>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>{p.category}</p>
                        </div>
                        <p style={{ fontWeight: 500, color: 'var(--gold)', fontSize: '0.85rem' }}>৳{p.price.toLocaleString()}</p>
                      </Link>
                    )
                  })}
                </div>
              ) : searchQuery.trim() && !searchLoading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.85rem' }}>No products found matching your search.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function HeartIcon({ fill = 'none' }: { fill?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
