import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ user: null }, { status: 401 })
  try {
    const user = await prisma.user.findUnique({ where: { id: authUser.userId }, select: { id: true, name: true, email: true, role: true, phone: true } })
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
