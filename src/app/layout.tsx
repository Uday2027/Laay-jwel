import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react'
import { AppProvider } from '@/lib/context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'
import NavigationLoader from '@/components/layout/NavigationLoader'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { Cormorant_Garamond, Jost } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Laay — Luxury Feminine Fashion',
  description: 'Discover exquisite purses, jewelry, bags and accessories crafted for the modern woman. Shop the Laay luxury collection.',
  keywords: 'luxury bags, women jewelry, purses, feminine accessories, Bangladesh fashion',
  openGraph: {
    title: 'Laay — Luxury Feminine Fashion',
    description: 'Exquisite bags, jewelry, purses & accessories for the modern woman.',
    type: 'website',
  },
}

async function getLayoutData() {
  try {
    const [user, settings] = await Promise.all([
      getAuthUser().catch(() => null),
      prisma.settings.findUnique({ where: { id: 1 } }).catch(() => null),
    ])
    return {
      user: user ? { id: user.userId, name: user.name, email: user.email, role: user.role } : null,
      deliveryFee: settings?.deliveryFee ?? 80,
      bannerText: settings?.bannerText ?? '',
      bannerActive: settings?.bannerActive ?? false,
    }
  } catch {
    return {
      user: null,
      deliveryFee: 80,
      bannerText: '',
      bannerActive: false,
    }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await getLayoutData()

  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        <AppProvider initialUser={data.user} initialDeliveryFee={data.deliveryFee}>
          <div id="global-banner"><AnnouncementBanner text={data.bannerText} active={data.bannerActive} /></div>
          <div id="global-navbar"><Navbar /></div>
          <main id="global-main">{children}</main>
          <div id="global-footer"><Footer /></div>
          <CartDrawer />
        </AppProvider>
      </body>
    </html>
  )
}
