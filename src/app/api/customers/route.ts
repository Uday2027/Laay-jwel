import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  await connectDB()
  const customers = await User.aggregate([
    { $match: { role: 'CUSTOMER' } },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'userId',
        as: 'orders'
      }
    },
    {
      $project: {
        id: '$_id',
        name: 1,
        email: 1,
        phone: 1,
        createdAt: 1,
        _count: { orders: { $size: '$orders' } }
      }
    },
    { $sort: { createdAt: -1 } }
  ])

  return NextResponse.json({ customers })
}

