'use client'
import { useState, useEffect } from 'react'

interface Settings { bkashNumber: string; bankName: string; bankAccount: string; bankBranch: string; bankHolder: string; deliveryFee: number; bannerText: string; bannerActive: boolean; storeName: string; storeEmail: string; storePhone: string }

export default function AdminSettings() {
  const [form, setForm] = useState<Settings>({ bkashNumber: '', bankName: '', bankAccount: '', bankBranch: '', bankHolder: '', deliveryFee: 80, bannerText: '', bannerActive: false, storeName: 'Laay', storeEmail: '', storePhone: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetch('/api/settings').then(r => r.json()).then(d => { if (d.settings) setForm(d.settings) }) }, [])

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  const Field = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: keyof Settings; type?: string; placeholder?: string }) => (
    <div className="input-group">
      <label className="label">{label}</label>
      <input className="input" type={type} value={String(form[field])} onChange={e => setForm(f => ({ ...f, [field]: type === 'number' ? parseFloat(e.target.value) : e.target.value }))} placeholder={placeholder} />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem' }}>Store Settings</h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Store Info */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Store Information</h3>
          <div className="form-row">
            <Field label="Store Name" field="storeName" />
            <Field label="Store Email" field="storeEmail" type="email" />
            <Field label="Store Phone" field="storePhone" placeholder="01XXXXXXXXX" />
            <Field label="Delivery Fee (৳)" field="deliveryFee" type="number" />
          </div>
        </div>

        {/* bKash */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>bKash Payment</h3>
          <Field label="bKash Number" field="bkashNumber" placeholder="01XXXXXXXXX" />
        </div>

        {/* Bank */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Bank Account</h3>
          <div className="form-row">
            <Field label="Bank Name" field="bankName" placeholder="Dutch-Bangla Bank" />
            <Field label="Account Number" field="bankAccount" />
            <Field label="Account Holder" field="bankHolder" />
            <Field label="Branch" field="bankBranch" />
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="admin-card">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>Announcement Banner</h3>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="label">Banner Text</label>
            <input className="input" value={form.bannerText} onChange={e => setForm(f => ({ ...f, bannerText: e.target.value }))} placeholder="e.g. Free delivery on orders above ৳2000!" />
          </div>
          <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.bannerActive} onChange={e => setForm(f => ({ ...f, bannerActive: e.target.checked }))} />
            <span style={{ fontSize: '0.85rem' }}>Show banner on website</span>
          </label>
          {form.bannerText && (
            <div style={{ marginTop: '1rem', background: 'var(--charcoal)', color: 'var(--cream)', padding: '0.6rem', textAlign: 'center', fontSize: '0.78rem', letterSpacing: '0.1em', borderRadius: 'var(--radius-sm)' }}>
              Preview: {form.bannerText}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
