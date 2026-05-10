import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ coupons })
}

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { code, discount, usageLimit, expiresAt, active } = await req.json()
  if (!code || !discount) return NextResponse.json({ error: 'Code and discount required' }, { status: 400 })

  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (existing) return NextResponse.json({ error: 'Code already exists' }, { status: 409 })

  const coupon = await prisma.coupon.create({
    data: { code: code.toUpperCase(), discount, usageLimit: usageLimit || null, expiresAt: expiresAt ? new Date(expiresAt) : null, active: active !== false }
  })
  return NextResponse.json({ coupon }, { status: 201 })
}
