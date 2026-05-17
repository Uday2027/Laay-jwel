import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const [totalOrders, pendingOrders, totalCustomers, totalProducts, lowStockProducts, outOfStockProducts, totalReviews] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count(),
    prisma.product.findMany({
      where: { stock: { gt: 0, lte: 3 } },
      orderBy: { stock: 'asc' },
      take: 5,
      select: { id: true, name: true, slug: true, stock: true, images: true }
    }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.review.count(),
  ])

  const revenueResult = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { not: 'CANCELLED' } }
  })

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, orderNumber: true, name: true, total: true, status: true, createdAt: true }
  })

  return NextResponse.json({
    totalOrders,
    pendingOrders,
    totalCustomers,
    totalProducts,
    totalRevenue: revenueResult._sum.total || 0,
    recentOrders,
    lowStockProducts,
    outOfStockProducts,
    totalReviews,
  })
}
