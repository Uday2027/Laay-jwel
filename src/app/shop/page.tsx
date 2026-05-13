import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import ShopContent from './ShopContent'

export const revalidate = 60

const getProducts = unstable_cache(
  async () => prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true, createdAt: true },
  }),
  ['shop-products'],
  { revalidate: 60 }
)

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: catParam } = await searchParams
  const category = catParam || 'ALL'

  const products = await getProducts()

  return <ShopContent initialProducts={products} initialCategory={category} />
}
