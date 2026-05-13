import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import ProductDetailClient from './ProductDetailClient'

const getProduct = unstable_cache(
  async (slug: string) => prisma.product.findUnique({ where: { slug } }),
  ['product-detail'],
  { revalidate: 60 }
)

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  return <ProductDetailClient product={product} />
}
