import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Settings from '@/models/Settings'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  await connectDB()
  const settings = await Settings.findById(1).lean()

  // Environment variables take precedence
  const envBaseUrl = process.env.PATHAO_BASE_URL
  const envClientId = process.env.PATHAO_CLIENT_ID
  const envClientSecret = process.env.PATHAO_CLIENT_SECRET
  const envUsername = process.env.PATHAO_USERNAME
  const envPassword = process.env.PATHAO_PASSWORD

  return NextResponse.json({
    config: {
      baseUrl: envBaseUrl || settings?.pathaoBaseUrl || '',
      clientId: envClientId || settings?.pathaoClientId || '',
      clientSecret: envClientSecret ? '••••••••' : (settings?.pathaoClientSecret ? '••••••••' : ''),
      username: envUsername || settings?.pathaoUsername || '',
      password: envPassword ? '••••••••' : (settings?.pathaoPassword ? '••••••••' : ''),
      storeId: settings?.pathaoStoreId || null,
      enabled: settings?.pathaoEnabled || false,
    },
    fromEnv: {
      baseUrl: !!envBaseUrl,
      clientId: !!envClientId,
      clientSecret: !!envClientSecret,
      username: !!envUsername,
      password: !!envPassword,
    }
  })
}

export async function PUT(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await req.json()
  await connectDB()

  const update: any = {}
  if (body.baseUrl !== undefined) update.pathaoBaseUrl = body.baseUrl
  if (body.clientId !== undefined) update.pathaoClientId = body.clientId
  if (body.clientSecret !== undefined) update.pathaoClientSecret = body.clientSecret
  if (body.username !== undefined) update.pathaoUsername = body.username
  if (body.password !== undefined) update.pathaoPassword = body.password
  if (body.storeId !== undefined) update.pathaoStoreId = body.storeId
  if (body.enabled !== undefined) update.pathaoEnabled = body.enabled

  const settings = await Settings.findOneAndUpdate(
    { _id: 1 },
    { $set: update },
    { new: true, upsert: true, lean: true }
  )

  return NextResponse.json({
    config: {
      baseUrl: settings.pathaoBaseUrl || '',
      clientId: settings.pathaoClientId || '',
      clientSecret: '••••••••',
      username: settings.pathaoUsername || '',
      password: '••••••••',
      storeId: settings.pathaoStoreId || null,
      enabled: settings.pathaoEnabled || false,
    }
  })
}
