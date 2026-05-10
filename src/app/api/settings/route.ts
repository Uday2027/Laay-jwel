import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const settings = await prisma.settings.findUnique({ where: { id: 1 } })
  return NextResponse.json({ settings })
}

export async function PUT(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const data = await req.json()
  const settings = await prisma.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } })
  return NextResponse.json({ settings })
}
