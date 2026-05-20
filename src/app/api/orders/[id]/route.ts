import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  await connectDB()
  const orderRaw = await Order.findById(parseInt(id))
    .populate({
      path: 'items.productId',
      select: 'name slug images description price category stock featured',
      model: Product
    })
    .populate({
      path: 'userId',
      select: 'name email',
      model: User
    })
    .lean()

  if (!orderRaw) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const order = {
    ...orderRaw,
    id: orderRaw._id,
    user: orderRaw.userId ? { name: orderRaw.userId.name, email: orderRaw.userId.email } : null,
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { status } = await req.json()
  const orderId = parseInt(id)

  await connectDB()
  const existingOrder = await Order.findById(orderId).lean()

  if (!existingOrder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const oldStatus = existingOrder.status
  const newStatus = status

  try {
    // If cancelling an active order, restore stock
    if (oldStatus !== 'CANCELLED' && newStatus === 'CANCELLED') {
      for (const item of existingOrder.items || []) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } }
        )
      }
    }

    // If uncancelling a cancelled order, decrement stock again
    if (oldStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
      // Validate stock before re-decrementing
      const productIds = (existingOrder.items || []).map((i: any) => i.productId)
      const products = await Product.find({ _id: { $in: productIds } }).lean()
      const stockMap = new Map(products.map((p: any) => [p._id, p]))

      for (const item of existingOrder.items || []) {
        const product: any = stockMap.get(item.productId)
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product?.name || item.productId}" to reactivate order`)
        }
      }

      for (const item of existingOrder.items || []) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        )
      }
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { status: newStatus } },
      { new: true, lean: true }
    )

    const order = updatedOrder ? { ...updatedOrder, id: updatedOrder._id } : null
    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 })
  }
}

