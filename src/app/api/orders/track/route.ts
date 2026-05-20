import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('orderNumber') || ''
  const phone = searchParams.get('phone') || ''

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: 'Order number and phone required' }, { status: 400 })
  }

  await connectDB()
  const orderRaw = await Order.findOne({ orderNumber })
    .populate({
      path: 'items.productId',
      select: 'name slug images',
      model: Product
    })
    .lean()

  if (!orderRaw) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const normalize = (s: string) => s.replace(/\D/g, '')
  if (normalize(orderRaw.phone) !== normalize(phone)) {
    return NextResponse.json({ error: 'Phone number does not match' }, { status: 403 })
  }

  const order = {
    ...orderRaw,
    id: orderRaw._id,
    items: (orderRaw.items || []).map((item: any, idx: number) => {
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
  }

  return NextResponse.json({ order })
}

