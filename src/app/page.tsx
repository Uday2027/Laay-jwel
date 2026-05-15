import { prisma } from '@/lib/prisma'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { featured: true },
    take: 12,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true },
  })

  return <HomeClient products={products} />
}
