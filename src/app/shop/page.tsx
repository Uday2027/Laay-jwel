import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import ShopContent from './ShopContent'

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: catParam } = await searchParams
  const category = (catParam || 'ALL').trim().toUpperCase()

  await connectDB()
  const rawProducts = await Product.find().sort({ createdAt: -1 }).lean()

  const products = rawProducts.map((p: any) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    images: JSON.stringify(p.images || []),
    category: p.category,
    featured: p.featured,
    stock: p.stock,
    createdAt: p.createdAt
  }))

  return <ShopContent initialProducts={products as any} initialCategory={category} />
}

