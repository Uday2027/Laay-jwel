'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PathaoConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  username: string
  password: string
  storeId: number | null
  enabled: boolean
}

interface FromEnvFlags {
  baseUrl: boolean
  clientId: boolean
  clientSecret: boolean
  username: boolean
  password: boolean
}

interface TokenStatus {
  hasToken: boolean
  token: { tokenType: string; expiresIn: number; expiresAt: string } | null
}

export default function PathaoDashboard() {
  const router = useRouter()
  const [config, setConfig] = useState<PathaoConfig>({
    baseUrl: 'https://courier-api-sandbox.pathao.com',
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
    storeId: null,
    enabled: false,
  })
  const [fromEnv, setFromEnv] = useState<FromEnvFlags>({
    baseUrl: false, clientId: false, clientSecret: false, username: false, password: false,
  })
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/pathao/config').then(r => r.json()).then(d => {
      if (d.config) setConfig(d.config)
      if (d.fromEnv) setFromEnv(d.fromEnv)
      setLoading(false)
    })
    fetchTokenStatus()
  }, [])

  const fetchTokenStatus = () => {
    fetch('/api/admin/pathao/token').then(r => r.json()).then(setTokenStatus)
  }

  const saveConfig = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    const res = await fetch('/api/admin/pathao/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    const data = await res.json()
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(data.error || 'Failed to save')
    }
    setSaving(false)
  }

  const issueToken = async () => {
    setTokenLoading(true)
    setError('')
    setMessage('')
    const res = await fetch('/api/admin/pathao/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'issue' }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage('Token issued successfully')
      fetchTokenStatus()
    } else {
      setError(data.error || 'Failed to issue token')
    }
    setTokenLoading(false)
  }

  const refreshToken = async () => {
    setTokenLoading(true)
    setError('')
    setMessage('')
    const res = await fetch('/api/admin/pathao/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh' }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage('Token refreshed successfully')
      fetchTokenStatus()
    } else {
      setError(data.error || 'Failed to refresh token')
    }
    setTokenLoading(false)
  }

  const clearToken = async () => {
    setTokenLoading(true)
    await fetch('/api/admin/pathao/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' }),
    })
    fetchTokenStatus()
    setTokenLoading(false)
  }

  // Setup checklist
  const hasCredentials = !!(config.baseUrl && config.clientId && config.username)
  const hasToken = tokenStatus?.hasToken || false
  const isEnabled = config.enabled

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  return (
    <div>
      {/* Alerts */}
      {message && <div className="admin-card" style={{ marginBottom: '1.5rem', background: 'rgba(52,168,83,0.08)', border: '1px solid rgba(52,168,83,0.2)', color: '#2d7a47' }}>{message}</div>}
      {error && <div className="admin-card" style={{ marginBottom: '1.5rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: '#c0392b' }}>{error}</div>}

      {/* Setup Checklist */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Setup Checklist</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <SetupStep number={1} label="Configure API Credentials" done={hasCredentials} />
          <SetupStep number={2} label="Issue Access Token" done={hasToken} action={!hasToken ? 'Issue Token' : undefined} onAction={issueToken} loading={tokenLoading} />
          <SetupStep number={3} label="Create a Store & Set Default Store ID" done={!!config.storeId} action={!config.storeId ? 'Go to Stores' : undefined} onAction={() => router.push('/admin/pathao/stores')} />
          <SetupStep number={4} label="Enable Pathao Integration" done={isEnabled} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Configuration */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>API Configuration</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fromEnv.baseUrl && <EnvBadge />}
            <div className="input-group">
              <label className="label">Environment {fromEnv.baseUrl && <ReadOnlyTag />}</label>
              <select className="input" value={config.baseUrl} disabled={fromEnv.baseUrl} onChange={e => setConfig(c => ({ ...c, baseUrl: e.target.value }))}>
                <option value="https://courier-api-sandbox.pathao.com">Sandbox (Test)</option>
                <option value="https://api-hermes.pathao.com">Production (Live)</option>
              </select>
            </div>

            {fromEnv.clientId && <EnvBadge />}
            <div className="input-group">
              <label className="label">Client ID {fromEnv.clientId && <ReadOnlyTag />}</label>
              <input className="input" value={config.clientId} disabled={fromEnv.clientId} onChange={e => setConfig(c => ({ ...c, clientId: e.target.value }))} placeholder="e.g. 7N1aMJQbWm" />
            </div>

            {fromEnv.clientSecret && <EnvBadge />}
            <div className="input-group">
              <label className="label">Client Secret {fromEnv.clientSecret && <ReadOnlyTag />}</label>
              <input className="input" type="password" value={config.clientSecret} disabled={fromEnv.clientSecret} onChange={e => setConfig(c => ({ ...c, clientSecret: e.target.value }))} placeholder="Enter client secret" />
            </div>

            {fromEnv.username && <EnvBadge />}
            <div className="input-group">
              <label className="label">Username / Email {fromEnv.username && <ReadOnlyTag />}</label>
              <input className="input" value={config.username} disabled={fromEnv.username} onChange={e => setConfig(c => ({ ...c, username: e.target.value }))} placeholder="test@pathao.com" />
            </div>

            {fromEnv.password && <EnvBadge />}
            <div className="input-group">
              <label className="label">Password {fromEnv.password && <ReadOnlyTag />}</label>
              <input className="input" type="password" value={config.password} disabled={fromEnv.password} onChange={e => setConfig(c => ({ ...c, password: e.target.value }))} placeholder="Enter password" />
            </div>

            <div className="input-group">
              <label className="label">Default Store ID</label>
              <input className="input" type="number" value={config.storeId || ''} onChange={e => setConfig(c => ({ ...c, storeId: e.target.value ? parseInt(e.target.value) : null }))} placeholder="e.g. 1234" />
            </div>

            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={config.enabled} onChange={e => setConfig(c => ({ ...c, enabled: e.target.checked }))} />
              <span style={{ fontSize: '0.85rem' }}>Enable Pathao Courier integration</span>
            </label>

            <button className="btn btn-primary" onClick={saveConfig} disabled={saving}>
              {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Right Column: Token + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Token Status */}
          <div className="admin-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1rem' }}>Token Status</h3>
            {tokenStatus ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${tokenStatus.hasToken ? 'badge-green' : 'badge-red'}`}>
                    {tokenStatus.hasToken ? 'Active' : 'No Token'}
                  </span>
                  {tokenStatus.token && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Expires: {new Date(tokenStatus.token.expiresAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-outline" onClick={refreshToken} disabled={tokenLoading}>Refresh Token</button>
                  <button className="btn btn-sm btn-primary" onClick={issueToken} disabled={tokenLoading}>Issue Token</button>
                  {tokenStatus.hasToken && (
                    <button className="btn btn-sm btn-outline" onClick={clearToken} style={{ color: 'var(--text-muted)' }}>Clear</button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="spinner" style={{ width: 14, height: 14 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Checking...</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="admin-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => router.push('/admin/pathao/stores')} style={{ justifyContent: 'flex-start' }}>🏪 Manage Stores</button>
              <button className="btn btn-outline" onClick={() => router.push('/admin/pathao/orders')} style={{ justifyContent: 'flex-start' }}>📦 Send Orders to Pathao</button>
              <button className="btn btn-outline" onClick={() => router.push('/admin/pathao/tracking')} style={{ justifyContent: 'flex-start' }}>🔍 Track Parcels</button>
            </div>
          </div>

          {/* Reference */}
          <div className="admin-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Quick Reference</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <p><strong style={{ color: 'var(--text-primary)' }}>Base URL:</strong> {config.baseUrl}</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>Delivery Types:</strong> 48 = Normal, 12 = On Demand</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>Item Types:</strong> 1 = Document, 2 = Parcel</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>Weight:</strong> 0.5 KG to 10 KG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SetupStep({ number, label, done, action, onAction, loading }: {
  number: number
  label: string
  done: boolean
  action?: string
  onAction?: () => void
  loading?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: done ? 'rgba(52,168,83,0.06)' : 'var(--cream)', borderRadius: 'var(--radius-sm)', border: `1px solid ${done ? 'rgba(52,168,83,0.2)' : 'var(--border-light)'}` }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 600,
        background: done ? 'rgba(52,168,83,0.15)' : 'var(--border)',
        color: done ? '#2d7a47' : 'var(--text-muted)',
      }}>
        {done ? '✓' : number}
      </div>
      <span style={{ flex: 1, fontSize: '0.85rem', color: done ? '#2d7a47' : 'var(--text-primary)' }}>{label}</span>
      {done && <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>Done</span>}
      {!done && action && onAction && (
        <button className="btn btn-sm btn-primary" onClick={onAction} disabled={loading} style={{ fontSize: '0.65rem' }}>
          {loading ? '...' : action}
        </button>
      )}
    </div>
  )
}

function EnvBadge() {
  return <div className="badge badge-blue" style={{ fontSize: '0.6rem', width: 'fit-content', marginBottom: '-0.5rem' }}>Set from .env</div>
}

function ReadOnlyTag() {
  return <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>(read-only)</span>
}
