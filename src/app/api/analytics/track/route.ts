import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import AnalyticsEvent from '@/models/Analytics'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, url, productId, productName, productSlug, quantity, sessionId } = body

    if (!type || !sessionId) {
      return NextResponse.json({ error: 'Type and sessionId required' }, { status: 400 })
    }

    await connectDB()

    // Get IP and user agent from headers
    const headers = req.headers
    const forwarded = headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : headers.get('x-real-ip') || 'unknown'
    const userAgent = headers.get('user-agent') || 'unknown'

    // Simple rate limit: for pageviews, only track once per URL per session per hour
    if (type === 'pageview') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const existing = await AnalyticsEvent.findOne({
        type: 'pageview',
        sessionId,
        url,
        createdAt: { $gte: oneHourAgo },
      }).lean()
      if (existing) {
        return NextResponse.json({ success: true, deduped: true })
      }
    }

    // For add_to_cart, dedupe rapid clicks (same product, same session within 5 seconds)
    if (type === 'add_to_cart') {
      const fiveSecondsAgo = new Date(Date.now() - 5 * 1000)
      const existing = await AnalyticsEvent.findOne({
        type: 'add_to_cart',
        sessionId,
        productId,
        createdAt: { $gte: fiveSecondsAgo },
      }).lean()
      if (existing) {
        return NextResponse.json({ success: true, deduped: true })
      }
    }

    await AnalyticsEvent.create({
      type,
      url: url || null,
      productId: productId || null,
      productName: productName || null,
      productSlug: productSlug || null,
      quantity: quantity || null,
      sessionId,
      ip,
      userAgent,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
