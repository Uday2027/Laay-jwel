import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  const data = await req.json()
  const coupon = await prisma.coupon.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json({ coupon })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  await prisma.coupon.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ message: 'Deleted' })
}
