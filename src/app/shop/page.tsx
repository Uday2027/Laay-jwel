import { prisma } from '@/lib/prisma'
import ShopContent from './ShopContent'

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: catParam } = await searchParams
  const category = (catParam || 'ALL').trim().toUpperCase()

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true, createdAt: true },
  })

  return <ShopContent initialProducts={products} initialCategory={category} />
}
