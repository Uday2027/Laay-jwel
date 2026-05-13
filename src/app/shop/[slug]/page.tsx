import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { getAuthUser } from '@/lib/auth'
import ProductDetailClient from './ProductDetailClient'

const getProduct = unstable_cache(
  async (slug: string) => prisma.product.findUnique({ where: { slug } }),
  ['product-detail'],
  { revalidate: 60 }
)

const getRelatedProducts = unstable_cache(
  async (category: string, excludeId: number) => prisma.product.findMany({
    where: { category, id: { not: excludeId } },
    take: 4,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true },
  }),
  ['related-products'],
  { revalidate: 60 }
)

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, authUser] = await Promise.all([
    getProduct(slug),
    getAuthUser().catch(() => null),
  ])

  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.id)
  const isAdmin = authUser?.role === 'ADMIN'

  return <ProductDetailClient product={product} related={related} isAdmin={isAdmin} />
}
