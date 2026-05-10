import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'laay-luxury-brand-jwt-secret-2024'
const COOKIE_NAME = 'laay_auth'

export interface JWTPayload {
  userId: number
  email: string
  role: string
  name: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getAuthUserFromRequest(req: Request): Promise<JWTPayload | null> {
  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  return verifyToken(match[1])
}

export function isAdmin(user: JWTPayload | null): boolean {
  return user?.role === 'ADMIN'
}

export const AUTH_COOKIE = COOKIE_NAME
