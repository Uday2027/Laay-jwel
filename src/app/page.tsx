import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import HomeClient from './HomeClient'

export default async function HomePage() {
  await connectDB()
  const rawProducts = await Product.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean()

  const products = rawProducts.map((p: any) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    images: JSON.stringify(p.images || []),
    category: p.category,
    featured: p.featured,
    stock: p.stock
  }))

  return <HomeClient products={products as any} />
}

