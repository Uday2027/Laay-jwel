import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { getAuthUserFromRequest } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const ordersRaw = await Order.find({ userId: user.userId })
    .populate({
      path: 'items.productId',
      select: 'name slug images',
      model: Product
    })
    .sort({ createdAt: -1 })
    .lean()

  const orders = ordersRaw.map((o: any) => ({
    ...o,
    id: o._id,
    items: (o.items || []).map((item: any, idx: number) => {
      const prod = item.productId
      return {
        id: idx + 1,
        productId: prod ? prod._id : item.productId,
        quantity: item.quantity,
        price: item.price,
        product: prod ? {
          id: prod._id,
          name: prod.name,
          slug: prod.slug,
          images: JSON.stringify(prod.images || [])
        } : null
      }
    })
  }))

  return NextResponse.json({ orders })
}

