import { connectDB, getNextSequence } from './db'
import Settings from '@/models/Settings'
import PathaoToken from '@/models/PathaoToken'

export interface PathaoConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  username: string
  password: string
  storeId: number | null
  enabled: boolean
}

export interface PathaoTokenData {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  expiresAt: Date
}

export interface PathaoStore {
  store_id: number
  store_name: string
  store_address: string
  is_active: number
  city_id: number
  zone_id: number
  hub_id: number
  is_default_store: number
  is_default_return_store: number
}

export interface PathaoCity {
  city_id: number
  city_name: string
}

export interface PathaoZone {
  zone_id: number
  zone_name: string
}

export interface PathaoArea {
  area_id: number
  area_name: string
  home_delivery_available: boolean
  pickup_available: boolean
}

export interface PathaoPricePlan {
  price: number
  discount: number
  promo_discount: number
  plan_id: number
  cod_enabled: number
  cod_percentage: number
  additional_charge: number
  final_price: number
}

export interface PathaoOrderPayload {
  store_id: number
  merchant_order_id?: string
  recipient_name: string
  recipient_phone: string
  recipient_secondary_phone?: string
  recipient_address: string
  recipient_city?: number
  recipient_zone?: number
  recipient_area?: number
  delivery_type: 48 | 12
  item_type: 1 | 2
  special_instruction?: string
  item_quantity: number
  item_weight: number | string
  item_description?: string
  amount_to_collect: number
}

export interface PathaoOrderResponse {
  consignment_id: string
  merchant_order_id: string
  order_status: string
  delivery_fee: number
}

export interface PathaoOrderInfo {
  consignment_id: string
  merchant_order_id: string
  order_status: string
  order_status_slug: string
  updated_at: string
  invoice_id: string | null
}

// ─── Config ───────────────────────────────────────────────

export async function getPathaoConfig(): Promise<PathaoConfig | null> {
  // Environment variables take precedence over DB settings
  const envBaseUrl = process.env.PATHAO_BASE_URL
  const envClientId = process.env.PATHAO_CLIENT_ID
  const envClientSecret = process.env.PATHAO_CLIENT_SECRET
  const envUsername = process.env.PATHAO_USERNAME
  const envPassword = process.env.PATHAO_PASSWORD

  await connectDB()
  const settings = await Settings.findById(1).lean()

  const baseUrl = envBaseUrl || settings?.pathaoBaseUrl || ''
  const clientId = envClientId || settings?.pathaoClientId || ''
  const clientSecret = envClientSecret || settings?.pathaoClientSecret || ''
  const username = envUsername || settings?.pathaoUsername || ''
  const password = envPassword || settings?.pathaoPassword || ''

  if (!baseUrl || !clientId || !clientSecret || !username || !password) {
    return null
  }

  return {
    baseUrl,
    clientId,
    clientSecret,
    username,
    password,
    storeId: settings?.pathaoStoreId || null,
    enabled: settings?.pathaoEnabled || false,
  }
}

// ─── Token Management ─────────────────────────────────────

async function saveToken(data: PathaoTokenData, baseUrl: string): Promise<void> {
  await connectDB()
  await PathaoToken.findOneAndUpdate(
    { _id: 1 },
    {
      _id: 1,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenType: data.tokenType,
      expiresIn: data.expiresIn,
      issuedAt: new Date(),
      expiresAt: data.expiresAt,
      baseUrl,
    },
    { upsert: true, new: true }
  )
}

export async function getStoredToken(): Promise<PathaoTokenData | null> {
  await connectDB()
  const token = await PathaoToken.findById(1).lean()
  if (!token) return null
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    tokenType: token.tokenType,
    expiresIn: token.expiresIn,
    expiresAt: token.expiresAt,
  }
}

export async function clearStoredToken(): Promise<void> {
  await connectDB()
  await PathaoToken.deleteOne({ _id: 1 })
}

export async function issueToken(config?: PathaoConfig): Promise<PathaoTokenData> {
  const cfg = config || await getPathaoConfig()
  if (!cfg || !cfg.baseUrl || !cfg.clientId || !cfg.clientSecret || !cfg.username || !cfg.password) {
    throw new Error('Pathao credentials not configured')
  }

  const res = await fetch(`${cfg.baseUrl}/aladdin/api/v1/issue-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      grant_type: 'password',
      username: cfg.username,
      password: cfg.password,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || `Failed to issue Pathao token (HTTP ${res.status})`)
  }

  const tokenData: PathaoTokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type || 'Bearer',
    expiresIn: data.expires_in || 432000,
    expiresAt: new Date(Date.now() + (data.expires_in || 432000) * 1000),
  }

  await saveToken(tokenData, cfg.baseUrl)
  return tokenData
}

export async function refreshToken(config?: PathaoConfig): Promise<PathaoTokenData> {
  const cfg = config || await getPathaoConfig()
  if (!cfg || !cfg.baseUrl || !cfg.clientId || !cfg.clientSecret) {
    throw new Error('Pathao credentials not configured')
  }

  const stored = await getStoredToken()
  if (!stored) {
    return issueToken(cfg)
  }

  const res = await fetch(`${cfg.baseUrl}/aladdin/api/v1/issue-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: stored.refreshToken,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // If refresh fails, try issuing a new token with credentials
    return issueToken(cfg)
  }

  const tokenData: PathaoTokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type || 'Bearer',
    expiresIn: data.expires_in || 432000,
    expiresAt: new Date(Date.now() + (data.expires_in || 432000) * 1000),
  }

  await saveToken(tokenData, cfg.baseUrl)
  return tokenData
}

async function getValidToken(): Promise<string> {
  const cfg = await getPathaoConfig()
  if (!cfg) throw new Error('Pathao not configured')

  const stored = await getStoredToken()
  if (stored && stored.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    return stored.accessToken
  }

  // Token expired or about to expire — refresh
  const refreshed = await refreshToken(cfg)
  return refreshed.accessToken
}

// ─── Generic API Caller with auto-retry ───────────────────

async function pathaoFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; code: number; message: string; type: string }> {
  const token = await getValidToken()
  const cfg = await getPathaoConfig()
  if (!cfg) throw new Error('Pathao not configured')

  const url = `${cfg.baseUrl}${endpoint}`
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json; charset=UTF-8',
    ...(options.headers as Record<string, string> || {}),
  }

  let res = await fetch(url, { ...options, headers })
  let data = await res.json().catch(() => ({}))

  // If unauthorized, refresh token and retry once
  if (res.status === 401 || data.code === 401) {
    const newToken = await refreshToken(cfg)
    headers['Authorization'] = `Bearer ${newToken.accessToken}`
    res = await fetch(url, { ...options, headers })
    data = await res.json().catch(() => ({}))
  }

  const isSuccess = res.ok && (!data.code || data.code === 200 || data.code === 202)
  if (!isSuccess) {
    const errMsg = data.message || data.error || `Pathao API error (HTTP ${res.status})`
    const details = data.errors ? JSON.stringify(data.errors) : ''
    throw new Error(details ? `${errMsg}: ${details}` : errMsg)
  }

  return data
}

// ─── API Endpoints ────────────────────────────────────────

export async function listPathaoStores(): Promise<PathaoStore[]> {
  const data = await pathaoFetch<{ data: PathaoStore[] }>('/aladdin/api/v1/stores', { method: 'GET' })
  return data.data.data || []
}

export async function createPathaoStore(payload: {
  name: string
  contact_name: string
  contact_number: string
  secondary_contact?: string
  otp_number?: string
  address: string
  city_id: number
  zone_id: number
  area_id: number
}): Promise<{ message: string; store_name: string }> {
  const data = await pathaoFetch<any>('/aladdin/api/v1/stores', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return { message: data.message, store_name: data.data?.store_name }
}

export async function listCities(): Promise<PathaoCity[]> {
  const data = await pathaoFetch<{ data: PathaoCity[] }>('/aladdin/api/v1/city-list', { method: 'GET' })
  return data.data.data || []
}

export async function listZones(cityId: number): Promise<PathaoZone[]> {
  const data = await pathaoFetch<{ data: PathaoZone[] }>(`/aladdin/api/v1/cities/${cityId}/zone-list`, { method: 'GET' })
  return data.data.data || []
}

export async function listAreas(zoneId: number): Promise<PathaoArea[]> {
  const data = await pathaoFetch<{ data: PathaoArea[] }>(`/aladdin/api/v1/zones/${zoneId}/area-list`, { method: 'GET' })
  return data.data.data || []
}

export async function calculatePrice(payload: {
  store_id: number
  item_type: number
  delivery_type: number
  item_weight: number
  recipient_city: number
  recipient_zone: number
}): Promise<PathaoPricePlan> {
  const data = await pathaoFetch<PathaoPricePlan>('/aladdin/api/v1/merchant/price-plan', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.data
}

export async function createPathaoOrder(payload: PathaoOrderPayload): Promise<PathaoOrderResponse> {
  const data = await pathaoFetch<PathaoOrderResponse>('/aladdin/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.data
}

export async function createBulkPathaoOrders(orders: PathaoOrderPayload[]): Promise<{ message: string }> {
  const data = await pathaoFetch<any>('/aladdin/api/v1/orders/bulk', {
    method: 'POST',
    body: JSON.stringify({ orders }),
  })
  return { message: data.message }
}

export async function getPathaoOrderInfo(consignmentId: string): Promise<PathaoOrderInfo> {
  const data = await pathaoFetch<PathaoOrderInfo>(`/aladdin/api/v1/orders/${consignmentId}/info`, { method: 'GET' })
  return data.data
}
