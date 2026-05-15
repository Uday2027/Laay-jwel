import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import ProductDetailClient from './ProductDetailClient'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [product, authUser] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    getAuthUser().catch(() => null),
  ])

  if (!product) notFound()

  const [related, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { category: product.category, id: { not: product.id } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true },
    }),
    prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const isAdmin = authUser?.role === 'ADMIN'

  return <ProductDetailClient product={product} related={related} reviews={reviews} isAdmin={isAdmin} />
}
