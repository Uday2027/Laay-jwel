import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { userId: user.userId },
    include: {
      items: {
        select: { id: true, quantity: true, price: true, productId: true, product: { select: { id: true, name: true, slug: true, images: true } } }
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ orders })
}
