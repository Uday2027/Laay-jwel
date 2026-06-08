import { NextResponse } from 'next/server'
import { listCities } from '@/lib/pathao'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const cities = await listCities()
    return NextResponse.json({ cities })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
