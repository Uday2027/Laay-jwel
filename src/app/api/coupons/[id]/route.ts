import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Coupon from '@/models/Coupon'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  const data = await req.json()
  await connectDB()
  const coupon = await Coupon.findOneAndUpdate(
    { _id: parseInt(id) },
    { $set: data },
    { new: true, lean: true }
  )
  const mappedCoupon = coupon ? { ...coupon, id: coupon._id } : null
  return NextResponse.json({ coupon: mappedCoupon })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  await connectDB()
  await Coupon.deleteOne({ _id: parseInt(id) })
  return NextResponse.json({ message: 'Deleted' })
}

