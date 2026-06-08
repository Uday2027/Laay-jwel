import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { getPathaoOrderInfo } from '@/lib/pathao'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('orderNumber') || ''
  const phone = searchParams.get('phone') || ''
  const consignmentId = searchParams.get('consignmentId') || ''

  await connectDB()

  const normalize = (s: string) => s.replace(/\D/g, '')

  // Track by Pathao consignment ID directly
  if (consignmentId) {
    try {
      const info = await getPathaoOrderInfo(consignmentId)
      return NextResponse.json({ pathao: info })
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Tracking failed' }, { status: 400 })
    }
  }

  // Track by phone only — return all orders for this phone
  if (!orderNumber && phone) {
    const normalizedPhone = normalize(phone)
    const ordersRaw = await Order.find({})
      .select('orderNumber name phone address city status total createdAt pathaoConsignmentId pathaoOrderStatus pathaoSentAt')
      .sort({ createdAt: -1 })
      .lean()

    const orders = ordersRaw.filter((o: any) => normalize(o.phone) === normalizedPhone)

    // Refresh live Pathao status for each order
    const ordersWithPathao = await Promise.all(
      orders.map(async (o: any) => {
        let pathaoStatus = o.pathaoOrderStatus
        if (o.pathaoConsignmentId) {
          try {
            const info = await getPathaoOrderInfo(o.pathaoConsignmentId)
            pathaoStatus = info.order_status
          } catch {
            // keep existing status
          }
        }
        return {
          orderNumber: o.orderNumber,
          name: o.name,
          phone: o.phone,
          address: o.address,
          city: o.city,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          pathaoConsignmentId: o.pathaoConsignmentId,
          pathaoOrderStatus: pathaoStatus,
          pathaoSentAt: o.pathaoSentAt,
        }
      })
    )

    return NextResponse.json({ orders: ordersWithPathao })
  }

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: 'Order number and phone required' }, { status: 400 })
  }

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

  if (normalize(orderRaw.phone) !== normalize(phone)) {
    return NextResponse.json({ error: 'Phone number does not match' }, { status: 403 })
  }

  // Fetch Pathao status if available
  let pathaoInfo = null
  if (orderRaw.pathaoConsignmentId) {
    try {
      pathaoInfo = await getPathaoOrderInfo(orderRaw.pathaoConsignmentId)
    } catch {
      // Silently ignore Pathao tracking errors
    }
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

  return NextResponse.json({ order, pathao: pathaoInfo })
}

