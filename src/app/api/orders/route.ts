import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

  const where = {
    ...(search ? {
      OR: [
        { orderNumber: { contains: search } },
        { phone: { contains: search } },
        { transactionId: { contains: search } },
        { name: { contains: search } },
      ]
    } : {}),
    ...(status ? { status } : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          select: { id: true, quantity: true, price: true, productId: true, product: { select: { id: true, name: true, slug: true, images: true } } }
        },
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, pageSize })
}

export async function POST(req: Request) {
  const body = await req.json()
  const authUser = await getAuthUserFromRequest(req)

  const { name, phone, address, city, notes, items, paymentMethod, transactionId, couponCode, paidDelivery, subtotal, deliveryFee, discount, total } = body

  if (!name || !phone || !address || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const orderNumber = generateOrderNumber()

  const order = await prisma.order.create({
    data: {
      orderNumber, name, phone, address, city, notes: notes || '',
      userId: authUser?.userId || null,
      status: 'PENDING',
      items: {
        create: items.map((item: { productId: number; quantity: number; price: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }))
      },
      subtotal, deliveryFee, discount: discount || 0, total,
      paymentMethod: paymentMethod || 'cod',
      transactionId: transactionId || null,
      couponCode: couponCode || null,
      paidDelivery: paidDelivery || false,
      discountBreakdown: JSON.stringify(body.discountBreakdown || {}),
    },
    include: { items: true }
  })

  // Update coupon stats if used
  if (couponCode) {
    await prisma.coupon.updateMany({
      where: { code: couponCode },
      data: {
        usageCount: { increment: 1 },
        totalRevenue: { increment: total },
        totalSaved: { increment: discount || 0 },
      }
    }).catch(() => {})
  }

  return NextResponse.json({ order, orderNumber }, { status: 201 })
}
