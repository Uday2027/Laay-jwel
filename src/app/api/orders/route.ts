import { NextResponse } from 'next/server'
import { connectDB, getNextSequence } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import Coupon from '@/models/Coupon'
import { generateOrderNumber } from '@/lib/discount'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50')))
  const skip = (page - 1) * pageSize

  await connectDB()

  const query: any = {}
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { transactionId: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ]
  }
  if (status) {
    query.status = status
  }

  const [ordersRaw, total] = await Promise.all([
    Order.find(query)
      .populate({
        path: 'items.productId',
        select: 'name slug images',
        model: Product
      })
      .populate({
        path: 'userId',
        select: 'name email',
        model: User
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Order.countDocuments(query),
  ])

  const orders = ordersRaw.map((o: any) => {
    return {
      ...o,
      id: o._id,
      user: o.userId ? { name: o.userId.name, email: o.userId.email } : null,
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
    }
  })

  return NextResponse.json({ orders, total, page, pageSize })
}

export async function POST(req: Request) {
  const body = await req.json()
  const authUser = await getAuthUserFromRequest(req)
  const { name, phone, address, city, notes, items, paymentMethod, transactionId, couponCode, paidDelivery, subtotal, deliveryFee, discount, total } = body

  if (!name || !phone || !address || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await connectDB()

  // Validate stock for each item
  const productIds = items.map((item: { productId: number }) => item.productId)
  const products = await Product.find({ _id: { $in: productIds } }).lean()

  const stockMap = new Map(products.map((p: any) => [p._id, p]))
  const stockErrors: string[] = []

  for (const item of items as { productId: number; quantity: number }[]) {
    const product: any = stockMap.get(item.productId)
    if (!product) {
      stockErrors.push(`Product #${item.productId} not found`)
    } else if (product.stock < item.quantity) {
      stockErrors.push(`Insufficient stock for "${product.name}" (available: ${product.stock}, requested: ${item.quantity})`)
    }
  }

  if (stockErrors.length > 0) {
    return NextResponse.json({ error: stockErrors.join('; ') }, { status: 400 })
  }

  const orderNumber = generateOrderNumber()

  // Decrement stock
  for (const item of items as { productId: number; quantity: number }[]) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.quantity } }
    )
  }

  // Create order
  const nextOrderId = await getNextSequence('Order')
  const orderDoc = await Order.create({
    _id: nextOrderId,
    orderNumber,
    userId: authUser?.userId || null,
    name,
    phone,
    address,
    city,
    notes: notes || '',
    status: 'PENDING',
    items: items.map((item: { productId: number; quantity: number; price: number }) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal,
    deliveryFee,
    discount: discount || 0,
    total,
    paymentMethod: paymentMethod || 'cod',
    transactionId: transactionId || null,
    couponCode: couponCode || null,
    paidDelivery: paidDelivery || false,
    discountBreakdown: body.discountBreakdown || {},
  })

  // Update coupon stats if used
  if (couponCode) {
    await Coupon.updateMany(
      { code: couponCode },
      {
        $inc: {
          usageCount: 1,
          totalRevenue: total,
          totalSaved: discount || 0,
        }
      }
    ).catch(() => {})
  }

  const order = {
    ...orderDoc.toObject(),
    id: orderDoc._id
  }

  return NextResponse.json({ order, orderNumber }, { status: 201 })
}

