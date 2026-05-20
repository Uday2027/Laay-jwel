import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import Product from '@/models/Product'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50')))
  const skip = (page - 1) * pageSize

  await connectDB()

  const [reviewsRaw, total] = await Promise.all([
    Review.find()
      .populate('productId', 'name slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Review.countDocuments()
  ])

  const reviews = reviewsRaw.map((r: any) => {
    const prod = r.productId
    return {
      id: r._id,
      name: r.name,
      email: r.email,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      product: prod ? { id: prod._id, name: prod.name, slug: prod.slug, images: prod.images } : null
    }
  })

  return NextResponse.json({ reviews, total, page, pageSize })
}

export async function DELETE(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') || '')
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await connectDB()
  await Review.deleteOne({ _id: id })
  return NextResponse.json({ message: 'Deleted' })
}

