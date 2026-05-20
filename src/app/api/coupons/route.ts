import { NextResponse } from 'next/server'
import { connectDB, getNextSequence } from '@/lib/db'
import Coupon from '@/models/Coupon'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  await connectDB()
  const rawCoupons = await Coupon.find().sort({ createdAt: -1 }).lean()
  const coupons = rawCoupons.map((c: any) => ({ ...c, id: c._id }))
  return NextResponse.json({ coupons })
}

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { code, discount, usageLimit, expiresAt, active } = await req.json()
  if (!code || !discount) return NextResponse.json({ error: 'Code and discount required' }, { status: 400 })

  await connectDB()
  const existing = await Coupon.findOne({ code: code.toUpperCase() }).lean()
  if (existing) return NextResponse.json({ error: 'Code already exists' }, { status: 409 })

  const nextId = await getNextSequence('Coupon')
  const coupon = await Coupon.create({
    _id: nextId,
    code: code.toUpperCase(),
    discount,
    usageLimit: usageLimit || null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    active: active !== false
  })
  const mappedCoupon = { ...coupon.toObject(), id: coupon._id }
  return NextResponse.json({ coupon: mappedCoupon }, { status: 201 })
}

