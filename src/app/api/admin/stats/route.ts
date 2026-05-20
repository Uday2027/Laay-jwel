import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import Review from '@/models/Review'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  await connectDB()

  const [
    totalOrders,
    pendingOrders,
    totalCustomers,
    totalProducts,
    lowStockProductsRaw,
    outOfStockProducts,
    totalReviews
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'PENDING' }),
    User.countDocuments({ role: 'CUSTOMER' }),
    Product.countDocuments(),
    Product.find({ stock: { $gt: 0, $lte: 3 } })
      .sort({ stock: 1 })
      .limit(5)
      .select('_id name slug stock images')
      .lean(),
    Product.countDocuments({ stock: 0 }),
    Review.countDocuments(),
  ])

  const lowStockProducts = lowStockProductsRaw.map((p: any) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    stock: p.stock,
    images: JSON.stringify(p.images || [])
  }))

  const revenueResult = await Order.aggregate([
    { $match: { status: { $ne: 'CANCELLED' } } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ])
  const totalRevenue = revenueResult[0]?.total || 0

  const recentOrdersRaw = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('_id orderNumber name total status createdAt')
    .lean()

  const recentOrders = recentOrdersRaw.map((o: any) => ({
    ...o,
    id: o._id
  }))

  return NextResponse.json({
    totalOrders,
    pendingOrders,
    totalCustomers,
    totalProducts,
    totalRevenue,
    recentOrders,
    lowStockProducts,
    outOfStockProducts,
    totalReviews,
  })
}

