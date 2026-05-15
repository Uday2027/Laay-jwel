import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import HomeClient from './HomeClient'

export const revalidate = 60

const getFeaturedProducts = unstable_cache(
  async () => {
    // Ensure at least one from each category
    const [bracelets, earrings, rings, extras] = await Promise.all([
      prisma.product.findMany({ where: { featured: true, category: 'BRACELETS' }, take: 1, select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true } }),
      prisma.product.findMany({ where: { featured: true, category: 'EARRINGS' }, take: 1, select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true } }),
      prisma.product.findMany({ where: { featured: true, category: 'RINGS' }, take: 1, select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true } }),
      prisma.product.findMany({ where: { featured: true }, take: 6, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true } }),
    ])

    const required = [...bracelets, ...earrings, ...rings]
    const existingIds = new Set(required.map(p => p.id))
    const filler = extras.filter(p => !existingIds.has(p.id))
    const combined = [...required, ...filler].slice(0, 6)
    return combined
  },
  ['featured-products'],
  { revalidate: 60 }
)

export default async function HomePage() {
  const products = await getFeaturedProducts()
  return <HomeClient products={products} />
}
