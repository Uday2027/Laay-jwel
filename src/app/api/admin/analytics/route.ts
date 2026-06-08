import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import AnalyticsEvent from '@/models/Analytics'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    await connectDB()

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Visitors (unique sessions)
    const visitorsToday = await AnalyticsEvent.distinct('sessionId', {
      type: 'pageview',
      createdAt: { $gte: todayStart },
    })
    const visitorsWeek = await AnalyticsEvent.distinct('sessionId', {
      type: 'pageview',
      createdAt: { $gte: weekAgo },
    })
    const visitorsMonth = await AnalyticsEvent.distinct('sessionId', {
      type: 'pageview',
      createdAt: { $gte: monthAgo },
    })

    // Page views
    const pageviewsToday = await AnalyticsEvent.countDocuments({
      type: 'pageview',
      createdAt: { $gte: todayStart },
    })
    const pageviewsWeek = await AnalyticsEvent.countDocuments({
      type: 'pageview',
      createdAt: { $gte: weekAgo },
    })

    // Product clicks (top 10)
    const topProductClicks = await AnalyticsEvent.aggregate([
      { $match: { type: 'product_click', createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$productId', name: { $first: '$productName' }, slug: { $first: '$productSlug' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Add to cart (top 10)
    const topAddToCart = await AnalyticsEvent.aggregate([
      { $match: { type: 'add_to_cart', createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$productId', name: { $first: '$productName' }, slug: { $first: '$productSlug' }, count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Total add-to-cart events
    const totalAddToCart = await AnalyticsEvent.countDocuments({
      type: 'add_to_cart',
      createdAt: { $gte: weekAgo },
    })

    // Recent activity (last 20 events)
    const recentActivity = await AnalyticsEvent.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select('type productName url createdAt')
      .lean()

    return NextResponse.json({
      visitors: {
        today: visitorsToday.length,
        week: visitorsWeek.length,
        month: visitorsMonth.length,
      },
      pageviews: {
        today: pageviewsToday,
        week: pageviewsWeek,
      },
      totalAddToCart,
      topProductClicks,
      topAddToCart,
      recentActivity: recentActivity.map((e: any) => ({
        type: e.type,
        label: e.productName || e.url || '-',
        createdAt: e.createdAt,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
