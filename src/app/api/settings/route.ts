import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Settings from '@/models/Settings'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  await connectDB()
  const settings = await Settings.findById(1).lean()
  const mappedSettings = settings ? { ...settings, id: settings._id } : null
  return NextResponse.json({ settings: mappedSettings })
}

export async function PUT(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const data = await req.json()
  await connectDB()
  const settings = await Settings.findOneAndUpdate(
    { _id: 1 },
    { $set: data },
    { new: true, upsert: true, lean: true }
  )
  const mappedSettings = settings ? { ...settings, id: settings._id } : null
  return NextResponse.json({ settings: mappedSettings })
}

