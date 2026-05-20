import { NextResponse } from 'next/server'
import { connectDB, getNextSequence } from '@/lib/db'
import Product from '@/models/Product'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200)
  const sort = searchParams.get('sort') || 'newest'

  await connectDB()

  const where: any = {}
  if (category) where.category = category
  if (featured === 'true') where.featured = true
  if (search) where.name = { $regex: search, $options: 'i' }

  let sortOrder: any = { createdAt: -1 }
  if (sort === 'asc') sortOrder = { price: 1 }
  else if (sort === 'desc') sortOrder = { price: -1 }
  else if (sort === 'featured') sortOrder = { featured: -1 }

  const productsRaw = await Product.find(where)
    .sort(sortOrder)
    .limit(limit)
    .lean()

  const products = productsRaw.map((p: any) => ({
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

  return NextResponse.json({ products }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const data = await req.json()
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

  await connectDB()
  const nextId = await getNextSequence('Product')

  let images = []
  if (typeof data.images === 'string') {
    try {
      images = JSON.parse(data.images)
    } catch {
      images = [data.images]
    }
  } else if (Array.isArray(data.images)) {
    images = data.images
  }

  const product = await Product.create({
    _id: nextId,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    stock: data.stock,
    featured: data.featured,
    images: images,
    slug
  })

  revalidatePath('/')
  revalidatePath('/shop')

  const mappedProduct = {
    ...product.toObject(),
    id: product._id,
    images: JSON.stringify(product.images)
  }

  return NextResponse.json({ product: mappedProduct }, { status: 201 })
}

