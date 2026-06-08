import { NextResponse } from 'next/server'
import { listAreas } from '@/lib/pathao'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { id } = await params
    const areas = await listAreas(parseInt(id))
    return NextResponse.json({ areas })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
