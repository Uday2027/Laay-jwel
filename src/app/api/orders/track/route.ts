import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('orderNumber') || ''
  const phone = searchParams.get('phone') || ''

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: 'Order number and phone required' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: true } }
        }
      }
    }
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const normalize = (s: string) => s.replace(/\D/g, '')
  if (normalize(order.phone) !== normalize(phone)) {
    return NextResponse.json({ error: 'Phone number does not match' }, { status: 403 })
  }

  return NextResponse.json({ order })
}
