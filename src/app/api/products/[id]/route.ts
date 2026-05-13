import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isSlug = isNaN(parseInt(id))
  const product = isSlug
    ? await prisma.product.findUnique({ where: { slug: id } })
    : await prisma.product.findUnique({ where: { id: parseInt(id) } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  const data = await req.json()
  if (data.images) data.images = JSON.stringify(data.images)
  const product = await prisma.product.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json({ product })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  const productId = parseInt(id)

  try {
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ])
    return NextResponse.json({ message: 'Deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
