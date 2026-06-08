import { NextResponse } from 'next/server'
import { createBulkPathaoOrders } from '@/lib/pathao'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { orders } = await req.json()
    if (!Array.isArray(orders) || !orders.length) {
      return NextResponse.json({ error: 'Orders array required' }, { status: 400 })
    }
    const result = await createBulkPathaoOrders(orders)
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
