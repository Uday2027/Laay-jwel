'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/lib/context'
import styles from './Navbar.module.css'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { cartCount, setCartOpen, user } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (pathname.startsWith('/admin')) return null

  const JEWELRY_LINKS = [
    { href: '/shop?category=BRACELETS', label: 'Bracelets' },
    { href: '/shop?category=EARRINGS', label: 'Earrings' },
    { href: '/shop?category=RINGS', label: 'Rings' },
  ]

  return (
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
          <Link href="/account" className={styles.navLink}>
            {user ? user.name.split(' ')[0] : 'Account'}
          </Link>
          <button className={styles.cartBtn} onClick={() => setCartOpen(true)} aria-label="Open cart">
            <CartIcon />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
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
          <Link href="/account" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            {user ? 'My Account' : 'Login'}
          </Link>
          <button className={styles.mobileCartBtn} onClick={() => { setCartOpen(true); setMenuOpen(false) }}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
      )}
    </header>
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
