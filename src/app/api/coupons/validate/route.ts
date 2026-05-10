import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
  if (!coupon.active) return NextResponse.json({ error: 'Coupon is no longer active' }, { status: 400 })
  if (coupon.expiresAt && new Date() > coupon.expiresAt) return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })

  return NextResponse.json({ valid: true, discount: coupon.discount, code: coupon.code })
}
