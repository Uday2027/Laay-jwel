import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import Review from '@/models/Review'
import { notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import ProductDetailClient from './ProductDetailClient'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  await connectDB()
  const [productRaw, authUser] = await Promise.all([
    Product.findOne({ slug }).lean(),
    getAuthUser().catch(() => null),
  ])

  if (!productRaw) notFound()

  const product = {
    ...productRaw,
    id: productRaw._id,
    images: JSON.stringify(productRaw.images || [])
  }

  const [relatedRaw, reviewsRaw] = await Promise.all([
    Product.find({ category: product.category, _id: { $ne: product.id } })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),
    Review.find({ productId: product.id })
      .sort({ createdAt: -1 })
      .lean()
  ])

  const related = relatedRaw.map((p: any) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    images: JSON.stringify(p.images || []),
    category: p.category,
    featured: p.featured,
    stock: p.stock
  }))

  const reviews = reviewsRaw.map((r: any) => ({
    ...r,
    id: r._id
  }))

  const isAdmin = authUser?.role === 'ADMIN'

  return <ProductDetailClient product={product as any} related={related as any} reviews={reviews as any} isAdmin={isAdmin} />
}

