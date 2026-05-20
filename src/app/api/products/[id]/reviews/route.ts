import { NextResponse } from 'next/server'
import { connectDB, getNextSequence } from '@/lib/db'
import Review from '@/models/Review'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = parseInt(id)
  if (isNaN(productId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await connectDB()
  const rawReviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean()
  const reviews = rawReviews.map((r: any) => ({ ...r, id: r._id }))

  const agg = await Review.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ])

  const average = agg[0]?.avgRating || 0
  const count = agg[0]?.count || 0

  return NextResponse.json({ reviews, average, count })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = parseInt(id)
  if (isNaN(productId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const data = await req.json()
  const { name, email, rating, comment } = data

  if (!name || !rating || !comment) {
    return NextResponse.json({ error: 'Name, rating and comment are required' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  await connectDB()
  const nextId = await getNextSequence('Review')
  const review = await Review.create({
    _id: nextId,
    productId,
    name,
    email: email || null,
    rating: parseInt(rating),
    comment
  })

  const mappedReview = { ...review.toObject(), id: review._id }
  return NextResponse.json({ review: mappedReview }, { status: 201 })
}

