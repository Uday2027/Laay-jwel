import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200)
  const sort = searchParams.get('sort') || 'newest'

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (featured === 'true') where.featured = true
  if (search) where.name = { contains: search, mode: 'insensitive' }

  const orderBy: Record<string, string> =
    sort === 'asc' ? { price: 'asc' }
    : sort === 'desc' ? { price: 'desc' }
    : sort === 'featured' ? { featured: 'desc' }
    : { createdAt: 'desc' }

  const products = await prisma.product.findMany({
    where,
    take: limit,
    orderBy,
    select: { id: true, name: true, slug: true, price: true, images: true, category: true, featured: true, stock: true, createdAt: true },
  })

  return NextResponse.json({ products }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const data = await req.json()
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
  const product = await prisma.product.create({
    data: { ...data, slug, images: JSON.stringify(data.images || []) }
  })

  revalidatePath('/')
  revalidatePath('/shop')

  return NextResponse.json({ product }, { status: 201 })
}
