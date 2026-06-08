import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import { getPathaoOrderInfo } from '@/lib/pathao'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 })

    await connectDB()
    const order = await Order.findById(parseInt(orderId)).lean()
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (!order.pathaoConsignmentId) return NextResponse.json({ error: 'No Pathao consignment ID for this order' }, { status: 400 })

    const info = await getPathaoOrderInfo(order.pathaoConsignmentId)

    await Order.findByIdAndUpdate(parseInt(orderId), {
      $set: { pathaoOrderStatus: info.order_status }
    })

    return NextResponse.json({ success: true, info })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
