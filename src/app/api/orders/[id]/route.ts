import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } }
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { status } = await req.json()
  const orderId = parseInt(id)

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  })

  if (!existingOrder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const oldStatus = existingOrder.status
  const newStatus = status

  // Handle stock adjustments based on status transitions
  const order = await prisma.$transaction(async (tx) => {
    // If cancelling an active order, restore stock
    if (oldStatus !== 'CANCELLED' && newStatus === 'CANCELLED') {
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })
      }
    }

    // If uncancelling a cancelled order, decrement stock again
    if (oldStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
      // Validate stock before re-decrementing
      const productIds = existingOrder.items.map(i => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true, name: true }
      })
      const stockMap = new Map(products.map(p => [p.id, p]))

      for (const item of existingOrder.items) {
        const product = stockMap.get(item.productId)
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product?.name || item.productId}" to reactivate order`)
        }
      }

      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }
    }

    return tx.order.update({ where: { id: orderId }, data: { status: newStatus } })
  })

  return NextResponse.json({ order })
}
