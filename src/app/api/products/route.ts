import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')
  const limit = parseInt(searchParams.get('limit') || '100')

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (featured === 'true') where.featured = true
  if (search) where.name = { contains: search }

  const products = await prisma.product.findMany({ where, take: limit, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ products })
}

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const data = await req.json()
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
  const product = await prisma.product.create({
    data: { ...data, slug, images: JSON.stringify(data.images || []) }
  })
  return NextResponse.json({ product }, { status: 201 })
}
