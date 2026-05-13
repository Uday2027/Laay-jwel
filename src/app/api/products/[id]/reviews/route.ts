import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = parseInt(id)
  if (isNaN(productId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  })

  const avg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  })

  return NextResponse.json({ reviews, average: avg._avg.rating || 0, count: avg._count.rating })
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

  const review = await prisma.review.create({
    data: { productId, name, email: email || null, rating: parseInt(rating), comment },
  })

  return NextResponse.json({ review }, { status: 201 })
}
