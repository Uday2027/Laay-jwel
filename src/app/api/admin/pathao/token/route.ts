import { NextResponse } from 'next/server'
import { issueToken, refreshToken, getStoredToken, clearStoredToken } from '@/lib/pathao'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { action } = await req.json()

    if (action === 'issue') {
      const token = await issueToken()
      return NextResponse.json({
        success: true,
        token: {
          tokenType: token.tokenType,
          expiresIn: token.expiresIn,
          expiresAt: token.expiresAt,
        }
      })
    }

    if (action === 'refresh') {
      const token = await refreshToken()
      return NextResponse.json({
        success: true,
        token: {
          tokenType: token.tokenType,
          expiresIn: token.expiresIn,
          expiresAt: token.expiresAt,
        }
      })
    }

    if (action === 'clear') {
      await clearStoredToken()
      return NextResponse.json({ success: true })
    }

    // Default: return current token status
    const stored = await getStoredToken()
    return NextResponse.json({
      hasToken: !!stored,
      token: stored ? {
        tokenType: stored.tokenType,
        expiresIn: stored.expiresIn,
        expiresAt: stored.expiresAt,
      } : null
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Token operation failed' }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const stored = await getStoredToken()
    return NextResponse.json({
      hasToken: !!stored,
      token: stored ? {
        tokenType: stored.tokenType,
        expiresIn: stored.expiresIn,
        expiresAt: stored.expiresAt,
      } : null
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
