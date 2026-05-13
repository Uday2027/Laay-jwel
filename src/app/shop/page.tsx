import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import ShopContent from './ShopContent'

const getProducts = unstable_cache(
  async (where: object) => prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true, createdAt: true },
  }),
  ['shop-products'],
  { revalidate: 60 }
)

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: catParam } = await searchParams
  const category = catParam || 'ALL'

  const where = category !== 'ALL' ? { category } : {}
  const products = await getProducts(where)

  return <ShopContent initialProducts={products} initialCategory={category} />
}
