import { NextResponse } from 'next/server'
import { listZones } from '@/lib/pathao'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { id } = await params
    const zones = await listZones(parseInt(id))
    return NextResponse.json({ zones })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
