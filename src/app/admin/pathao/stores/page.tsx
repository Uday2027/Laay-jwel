'use client'
import { useState, useEffect } from 'react'

interface PathaoStore {
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

interface City { city_id: number; city_name: string }
interface Zone { zone_id: number; zone_name: string }
interface Area { area_id: number; area_name: string; home_delivery_available: boolean; pickup_available: boolean }

export default function PathaoStores() {
  const [stores, setStores] = useState<PathaoStore[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', contact_name: '', contact_number: '', secondary_contact: '',
    otp_number: '', address: '', city_id: '', zone_id: '', area_id: ''
  })

  useEffect(() => {
    loadStores()
    loadCities()
  }, [])

  useEffect(() => {
    if (form.city_id) loadZones(parseInt(form.city_id))
    else setZones([])
  }, [form.city_id])

  useEffect(() => {
    if (form.zone_id) loadAreas(parseInt(form.zone_id))
    else setAreas([])
  }, [form.zone_id])

  const loadStores = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/pathao/stores')
    const data = await res.json()
    setStores(data.stores || [])
    setLoading(false)
  }

  const loadCities = async () => {
    const res = await fetch('/api/admin/pathao/cities')
    const data = await res.json()
    setCities(data.cities || [])
  }

  const loadZones = async (cityId: number) => {
    const res = await fetch(`/api/admin/pathao/cities/${cityId}/zones`)
    const data = await res.json()
    setZones(data.zones || [])
  }

  const loadAreas = async (zoneId: number) => {
    const res = await fetch(`/api/admin/pathao/zones/${zoneId}/areas`)
    const data = await res.json()
    setAreas(data.areas || [])
  }

  const createStore = async () => {
    setCreating(true)
    setError('')
    setMessage('')
    const res = await fetch('/api/admin/pathao/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        city_id: parseInt(form.city_id),
        zone_id: parseInt(form.zone_id),
        area_id: parseInt(form.area_id),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage(data.message || 'Store created successfully')
      setShowCreate(false)
      setForm({ name: '', contact_name: '', contact_number: '', secondary_contact: '', otp_number: '', address: '', city_id: '', zone_id: '', area_id: '' })
      loadStores()
    } else {
      setError(data.error || 'Failed to create store')
    }
    setCreating(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.4rem' }}>Your Stores</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Cancel' : '+ Create Store'}</button>
      </div>

      {message && <div className="admin-card" style={{ marginBottom: '1.5rem', background: 'rgba(52,168,83,0.08)', border: '1px solid rgba(52,168,83,0.2)', color: '#2d7a47' }}>{message}</div>}
      {error && <div className="admin-card" style={{ marginBottom: '1.5rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: '#c0392b' }}>{error}</div>}

      {showCreate && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Create New Store</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="label">Store Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="3-50 characters" />
            </div>
            <div className="input-group">
              <label className="label">Contact Name *</label>
              <input className="input" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="3-50 characters" />
            </div>
            <div className="input-group">
              <label className="label">Contact Number *</label>
              <input className="input" value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} placeholder="01XXXXXXXXX" maxLength={11} />
            </div>
            <div className="input-group">
              <label className="label">Secondary Contact</label>
              <input className="input" value={form.secondary_contact} onChange={e => setForm(f => ({ ...f, secondary_contact: e.target.value }))} placeholder="01XXXXXXXXX" maxLength={11} />
            </div>
            <div className="input-group">
              <label className="label">OTP Number</label>
              <input className="input" value={form.otp_number} onChange={e => setForm(f => ({ ...f, otp_number: e.target.value }))} placeholder="01XXXXXXXXX" maxLength={11} />
            </div>
            <div className="input-group">
              <label className="label">City *</label>
              <select className="input" value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value, zone_id: '', area_id: '' }))}>
                <option value="">Select City</option>
                {cities.map(c => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="label">Zone *</label>
              <select className="input" value={form.zone_id} onChange={e => setForm(f => ({ ...f, zone_id: e.target.value, area_id: '' }))} disabled={!zones.length}>
                <option value="">Select Zone</option>
                {zones.map(z => <option key={z.zone_id} value={z.zone_id}>{z.zone_name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="label">Area *</label>
              <select className="input" value={form.area_id} onChange={e => setForm(f => ({ ...f, area_id: e.target.value }))} disabled={!areas.length}>
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.area_id} value={a.area_id}>{a.area_name}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Address *</label>
              <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="15-120 characters" />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={createStore} disabled={creating}>{creating ? 'Creating...' : 'Create Store'}</button>
          </div>
        </div>
      )}

      <div className="admin-card">
        {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Address</th><th>City</th><th>Zone</th><th>Active</th><th>Default</th></tr></thead>
              <tbody>
                {stores.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No stores found</td></tr>}
                {stores.map(s => (
                  <tr key={s.store_id}>
                    <td style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)' }}>{s.store_id}</td>
                    <td>{s.store_name}</td>
                    <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.store_address}</td>
                    <td>{s.city_id}</td>
                    <td>{s.zone_id}</td>
                    <td><span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>{s.is_active ? 'Yes' : 'No'}</span></td>
                    <td><span className={`badge ${s.is_default_store ? 'badge-green' : 'badge-gray'}`}>{s.is_default_store ? 'Yes' : 'No'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
