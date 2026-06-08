import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''

  await connectDB()

  const query: any = { pathaoConsignmentId: { $ne: null } }
  if (status) {
    query.pathaoOrderStatus = status
  }

  const orders = await Order.find(query)
    .populate({
      path: 'items.productId',
      select: 'name slug images',
      model: Product
    })
    .sort({ pathaoSentAt: -1 })
    .limit(200)
    .lean()

  return NextResponse.json({ orders: orders.map((o: any) => ({ ...o, id: o._id })) })
}
