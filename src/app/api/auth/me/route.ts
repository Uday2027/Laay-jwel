import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ user: null }, { status: 401 })
  try {
    await connectDB()
    const user = await User.findById(authUser.userId).select('name email role phone').lean()
    if (!user) return NextResponse.json({ user: null }, { status: 404 })
    return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } })
  } catch {
    return NextResponse.json({ user: null }, { status: 500 })
  }
}

