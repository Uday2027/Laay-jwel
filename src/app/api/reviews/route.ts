import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50')))
  const skip = (page - 1) * pageSize

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: { product: { select: { id: true, name: true, slug: true, images: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.review.count(),
  ])

  return NextResponse.json({ reviews, total, page, pageSize })
}

export async function DELETE(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') || '')
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await prisma.review.delete({ where: { id } })
  return NextResponse.json({ message: 'Deleted' })
}
