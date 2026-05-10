import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/lib/context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import AnnouncementBanner from '@/components/layout/AnnouncementBanner'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AppProvider>
          <AnnouncementBanner />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </AppProvider>
      </body>
    </html>
  )
}
