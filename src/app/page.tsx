import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import HomeClient from './HomeClient'

export const revalidate = 60

const getFeaturedProducts = unstable_cache(
  async () => prisma.product.findMany({
    where: { featured: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true },
  }),
  ['featured-products'],
  { revalidate: 60 }
)

export default async function HomePage() {
  const products = await getFeaturedProducts()
  const shuffled = [...products].sort(() => Math.random() - 0.5)
  return <HomeClient products={shuffled} />
}
