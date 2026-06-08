import { NextResponse } from 'next/server'
import { calculatePrice } from '@/lib/pathao'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const body = await req.json()
    const price = await calculatePrice(body)
    return NextResponse.json({ price })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
