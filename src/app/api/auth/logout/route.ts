import { NextResponse } from 'next/server'
import { AUTH_COOKIE } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' })
  res.cookies.delete(AUTH_COOKIE)
  return res
}
