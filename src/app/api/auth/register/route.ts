import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB, getNextSequence } from '@/lib/db'
import User from '@/models/User'
import { signToken, AUTH_COOKIE } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    await connectDB()
    const existing = await User.findOne({ email }).lean()
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)
    const nextId = await getNextSequence('User')
    const user = await User.create({ _id: nextId, name, email, password: hashed, phone, role: 'CUSTOMER' })

    const token = signToken({ userId: user._id, email: user.email, role: user.role, name: user.name })
    const res = NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } }, { status: 201 })
    res.cookies.set(AUTH_COOKIE, token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax' })
    return res
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

