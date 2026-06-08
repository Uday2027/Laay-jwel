'use client'
import { useState, useEffect, useCallback } from 'react'

interface Order {
  id: number
  orderNumber: string
  name: string
  phone: string
  address: string
  city: string
  total: number
  notes: string | null
  items: Array<{ quantity: number; price: number; product?: { name: string } }>
}

interface PathaoStore {
  store_id: number
  store_name: string
}

interface PathaoCity {
  city_id: number
  city_name: string
}

interface PathaoZone {
  zone_id: number
  zone_name: string
}

interface PathaoArea {
  area_id: number
  area_name: string
}

interface PriceResult {
  price: number
  discount: number
  promo_discount: number
  plan_id: number
  cod_enabled: number
  cod_percentage: number
  additional_charge: number
  final_price: number
}

function calcCodFee(amountToCollect: number): number {
  if (amountToCollect <= 0) return 0
  return amountToCollect / 100
}

function calcTotalCost(price: PriceResult, amountToCollect: number): number {
  const codFee = calcCodFee(amountToCollect)
  // final_price from Pathao = price - discount - promo_discount + additional_charge (delivery cost only)
  // Total merchant cost = final delivery price + COD fee
  return price.final_price + codFee
}

interface Props {
  order: Order | null
  stores: PathaoStore[]
  defaultStoreId: number | null
  onClose: () => void
  onSent: (consignmentId: string) => void
}

export default function SendToPathaoModal({ order, stores, defaultStoreId, onClose, onSent }: Props) {
  const [form, setForm] = useState({
    storeId: '',
    deliveryType: '48',
    itemType: '2',
    itemWeight: '0.5',
    itemQuantity: '1',
    itemDescription: '',
    specialInstruction: '',
    amountToCollect: '',
    merchantOrderId: '',
    recipientName: '',
    recipientPhone: '',
    recipientSecondaryPhone: '',
    recipientAddress: '',
    cityId: '',
    zoneId: '',
    areaId: '',
  })

  const [cities, setCities] = useState<PathaoCity[]>([])
  const [zones, setZones] = useState<PathaoZone[]>([])
  const [areas, setAreas] = useState<PathaoArea[]>([])
  const [price, setPrice] = useState<PriceResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const itemQty = order?.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1

  useEffect(() => {
    if (order) {
      setForm({
        storeId: defaultStoreId ? String(defaultStoreId) : (stores[0]?.store_id ? String(stores[0].store_id) : ''),
        deliveryType: '48',
        itemType: '2',
        itemWeight: '0.5',
        itemQuantity: String(itemQty),
        itemDescription: order.items?.map(i => `${i.quantity}x ${i.product?.name || 'Item'}`).join(', ') || 'Parcel',
        specialInstruction: order.notes || '',
        amountToCollect: String(order.total || 0),
        merchantOrderId: order.orderNumber,
        recipientName: order.name,
        recipientPhone: order.phone,
        recipientSecondaryPhone: '',
        recipientAddress: `${order.address}${order.city ? `, ${order.city}` : ''}`,
        cityId: '',
        zoneId: '',
        areaId: '',
      })
      setPrice(null)
      setError('')
      setZones([])
      setAreas([])
    }
  }, [order, stores, defaultStoreId, itemQty])

  useEffect(() => {
    fetch('/api/admin/pathao/cities').then(r => r.json()).then(d => setCities(d.cities || []))
  }, [])

  useEffect(() => {
    if (form.cityId) {
      fetch(`/api/admin/pathao/cities/${form.cityId}/zones`).then(r => r.json()).then(d => {
        setZones(d.zones || [])
        setForm(f => ({ ...f, zoneId: '', areaId: '' }))
        setAreas([])
      })
    } else {
      setZones([])
      setAreas([])
      setForm(f => ({ ...f, zoneId: '', areaId: '' }))
    }
  }, [form.cityId])

  useEffect(() => {
    if (form.zoneId) {
      fetch(`/api/admin/pathao/zones/${form.zoneId}/areas`).then(r => r.json()).then(d => {
        setAreas(d.areas || [])
        setForm(f => ({ ...f, areaId: '' }))
      })
    } else {
      setAreas([])
      setForm(f => ({ ...f, areaId: '' }))
    }
  }, [form.zoneId])

  const tryCalculatePrice = useCallback(async () => {
    if (!form.storeId || !form.cityId || !form.zoneId) return
    setCalculating(true)
    setError('')
    const res = await fetch('/api/admin/pathao/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: parseInt(form.storeId),
        item_type: parseInt(form.itemType),
        delivery_type: parseInt(form.deliveryType),
        item_weight: parseFloat(form.itemWeight),
        recipient_city: parseInt(form.cityId),
        recipient_zone: parseInt(form.zoneId),
      }),
    })
    const data = await res.json()
    if (res.ok && data.price) {
      setPrice(data.price)
    } else {
      setPrice(null)
    }
    setCalculating(false)
  }, [form.storeId, form.cityId, form.zoneId, form.itemType, form.deliveryType, form.itemWeight])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (form.storeId && form.cityId && form.zoneId) {
        tryCalculatePrice()
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [form.storeId, form.cityId, form.zoneId, form.itemType, form.deliveryType, form.itemWeight, tryCalculatePrice])

  const send = async () => {
    if (!order) return
    if (!form.storeId) {
      setError('Please select a store')
      return
    }
    setSending(true)
    setError('')
    const payload: any = {
      orderId: order.id,
      storeId: parseInt(form.storeId),
      deliveryType: parseInt(form.deliveryType),
      itemType: parseInt(form.itemType),
      itemWeight: parseFloat(form.itemWeight),
      itemDescription: form.itemDescription,
      specialInstruction: form.specialInstruction,
      amountToCollect: parseInt(form.amountToCollect),
      recipientName: form.recipientName,
      recipientPhone: form.recipientPhone,
      recipientAddress: form.recipientAddress,
    }
    if (form.merchantOrderId) payload.merchantOrderId = form.merchantOrderId
    if (form.recipientSecondaryPhone) payload.recipientSecondaryPhone = form.recipientSecondaryPhone
    if (form.cityId) payload.recipientCity = parseInt(form.cityId)
    if (form.zoneId) payload.recipientZone = parseInt(form.zoneId)
    if (form.areaId) payload.recipientArea = parseInt(form.areaId)

    const res = await fetch('/api/admin/pathao/orders/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) {
      onSent(data.pathao?.consignment_id)
    } else {
      setError(data.error || 'Failed to send order')
    }
    setSending(false)
  }

  const selectedCity = cities.find(c => String(c.city_id) === form.cityId)
  const selectedZone = zones.find(z => String(z.zone_id) === form.zoneId)
  const selectedArea = areas.find(a => String(a.area_id) === form.areaId)

  if (!order) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(44,40,38,0.5)', backdropFilter: 'blur(4px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-md)',
        maxWidth: 900, width: '100%', maxHeight: '94vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.4rem', margin: 0 }}>Create New Delivery</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.5rem' }}>×</button>
        </div>

        {error && (
          <div style={{ margin: '1rem 2rem 0', padding: '0.75rem', background: 'rgba(192,57,43,0.06)', borderRadius: 'var(--radius-sm)', color: '#c0392b', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0 }}>
          {/* LEFT: Form */}
          <div style={{ padding: '1.5rem 2rem', borderRight: '1px solid var(--border-light)' }}>

            {/* Basic Information */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Basic Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="label">Store *</label>
                  <select className="input" value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))}>
                    <option value="">Select Store</option>
                    {stores.map(s => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="label">Product Type *</label>
                  <select className="input" value={form.itemType} onChange={e => setForm(f => ({ ...f, itemType: e.target.value }))}>
                    <option value="2">Parcel</option>
                    <option value="1">Document</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="label">Merchant Order ID</label>
                  <input className="input" value={form.merchantOrderId} onChange={e => setForm(f => ({ ...f, merchantOrderId: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
            </div>

            {/* Recipient Details */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Recipient Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="label">Recipient's Phone *</label>
                    <input className="input" value={form.recipientPhone} onChange={e => setForm(f => ({ ...f, recipientPhone: e.target.value }))} placeholder="01XXXXXXXXX" />
                  </div>
                  <div className="input-group">
                    <label className="label">Recipient's Secondary Phone</label>
                    <input className="input" value={form.recipientSecondaryPhone} onChange={e => setForm(f => ({ ...f, recipientSecondaryPhone: e.target.value }))} placeholder="01XXXXXXXXX" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="label">Recipient's Name *</label>
                  <input className="input" value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="label">Recipient's Address *</label>
                  <input className="input" value={form.recipientAddress} onChange={e => setForm(f => ({ ...f, recipientAddress: e.target.value }))} placeholder="House, Road, Area, City" />
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Delivery Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="label">Delivery Type *</label>
                    <select className="input" value={form.deliveryType} onChange={e => setForm(f => ({ ...f, deliveryType: e.target.value }))}>
                      <option value="48">Normal Delivery</option>
                      <option value="12">On Demand</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="label">Amount to Collect (৳) *</label>
                    <input className="input" type="number" value={form.amountToCollect} onChange={e => setForm(f => ({ ...f, amountToCollect: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="label">Total Weight (kg) *</label>
                    <input className="input" type="number" step="0.5" min="0.5" max="10" value={form.itemWeight} onChange={e => setForm(f => ({ ...f, itemWeight: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label className="label">Quantity *</label>
                    <input className="input" type="number" min="1" value={form.itemQuantity} onChange={e => setForm(f => ({ ...f, itemQuantity: e.target.value }))} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="label">Item Description & Price</label>
                  <input className="input" value={form.itemDescription} onChange={e => setForm(f => ({ ...f, itemDescription: e.target.value }))} placeholder="Type items' names & their prices" />
                </div>
                <div className="input-group">
                  <label className="label">Special Instructions</label>
                  <input className="input" value={form.specialInstruction} onChange={e => setForm(f => ({ ...f, specialInstruction: e.target.value }))} placeholder="Type here" />
                </div>
              </div>
            </div>

            {/* Delivery Area */}
            <div>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Delivery Area</p>

              {(selectedCity || selectedZone || selectedArea) && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem',
                  padding: '0.5rem 1rem', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem',
                }}>
                  {selectedCity && <span><strong>{selectedCity.city_name}</strong></span>}
                  {selectedZone && <><span style={{ color: 'var(--text-muted)' }}>›</span><span><strong>{selectedZone.zone_name}</strong></span></>}
                  {selectedArea && <><span style={{ color: 'var(--text-muted)' }}>›</span><span><strong>{selectedArea.area_name}</strong></span></>}
                  <button
                    onClick={() => setForm(f => ({ ...f, cityId: '', zoneId: '', areaId: '' }))}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '0.75rem' }}
                  >
                    ✕ Clear
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="label">City</label>
                  <select className="input" value={form.cityId} onChange={e => setForm(f => ({ ...f, cityId: e.target.value }))}>
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="label">Zone</label>
                  <select className="input" value={form.zoneId} onChange={e => setForm(f => ({ ...f, zoneId: e.target.value }))} disabled={!zones.length}>
                    <option value="">{form.cityId ? 'Select Zone' : 'Select city first'}</option>
                    {zones.map(z => <option key={z.zone_id} value={z.zone_id}>{z.zone_name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="label">Area</label>
                  <select className="input" value={form.areaId} onChange={e => setForm(f => ({ ...f, areaId: e.target.value }))} disabled={!areas.length}>
                    <option value="">{form.zoneId ? 'Select Area' : 'Select zone first'}</option>
                    {areas.map(a => <option key={a.area_id} value={a.area_id}>{a.area_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div style={{ padding: '1.5rem 1.5rem', background: 'var(--cream)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Delivery Details Preview */}
            <div style={{ padding: '1rem', background: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>Delivery Preview</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <PreviewRow label="Merchant Order ID" value={form.merchantOrderId || order?.orderNumber || '-'} />
                <PreviewRow label="Store" value={stores.find(s => String(s.store_id) === form.storeId)?.store_name || '-'} />
                <PreviewRow label="Recipient" value={form.recipientName || '-'} />
                <PreviewRow label="Phone" value={form.recipientPhone || '-'} />
                {form.recipientSecondaryPhone && <PreviewRow label="Alt. Phone" value={form.recipientSecondaryPhone} />}
                <PreviewRow
                  label="Address"
                  value={[form.recipientAddress, selectedArea?.area_name, selectedZone?.zone_name, selectedCity?.city_name].filter(Boolean).join(', ') || '-'}
                />
                <PreviewRow label="Item" value={`${form.itemQuantity}x ${form.itemDescription || 'Parcel'}`} />
                <PreviewRow label="Weight" value={`${form.itemWeight} kg`} />
                <PreviewRow label="Type" value={form.deliveryType === '48' ? 'Normal (48h)' : 'On-Demand (12h)'} />
                <PreviewRow label="Amount to Collect" value={`৳${form.amountToCollect || '0'}`} valueStyle={{ color: '#2d7a47', fontWeight: 600 }} />
                {form.specialInstruction && <PreviewRow label="Instruction" value={form.specialInstruction} />}
              </div>
            </div>

            {/* Cost of Delivery */}
            <div>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Cost of Delivery</p>

              {calculating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calculating...</span>
                </div>
              )}

              {price ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <CostRow label="Delivery Fee" value={`৳${price.price}`} />
                  <CostRow label="COD Fee" value={`৳${calcCodFee(parseInt(form.amountToCollect) || 0)}`} />
                  <CostRow label="Discount" value={`-৳${price.discount}`} isDiscount />
                  <CostRow label="Promo Discount" value={`-৳${price.promo_discount}`} isDiscount />
                  <CostRow label="Additional Charge" value={`৳${price.additional_charge}`} />
                  <CostRow label="Compensation Cost" value={`৳0`} />
                  <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    <CostRow label="Total Cost" value={`৳${calcTotalCost(price, parseInt(form.amountToCollect) || 0)}`} labelStyle={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600 }} valueStyle={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--charcoal)', fontWeight: 600 }} />
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {form.cityId && form.zoneId ? 'Calculating...' : 'Select city and zone to see delivery cost'}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div style={{ padding: '1rem', background: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--charcoal)' }}>Normal Delivery</strong> pick-up entry last time <strong>4:00 PM</strong>
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '0.5rem' }}>
                <strong style={{ color: 'var(--charcoal)' }}>On-Delivery</strong> pick-up entry last time <strong>12:00 PM</strong>
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Quick Links</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Packaging Guideline', 'Price Planning', 'Non-deliverable products list', 'T&C', 'Merchant Help Center'].map(link => (
                  <a key={link} href="#" onClick={e => e.preventDefault()} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {link}
                    <span style={{ color: 'var(--text-muted)' }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={send} disabled={sending || !form.storeId} style={{ minWidth: 160 }}>
            {sending ? 'Sending...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PreviewRow({ label, value, valueStyle }: {
  label: string
  value: string
  valueStyle?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', gap: '0.75rem' }}>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0, minWidth: '6.5rem' }}>{label}</span>
      <span style={{ color: 'var(--charcoal)', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word', ...valueStyle }}>{value}</span>
    </div>
  )
}

function CostRow({ label, value, isDiscount, labelStyle, valueStyle }: {
  label: string
  value: string
  isDiscount?: boolean
  labelStyle?: React.CSSProperties
  valueStyle?: React.CSSProperties
}) {
  const numericValue = parseInt(value.replace(/[^0-9-]/g, '')) || 0
  const isZero = numericValue === 0
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
      <span style={{ color: 'var(--text-secondary)', ...labelStyle }}>{label}</span>
      <span style={{
        fontWeight: 500,
        color: isDiscount && isZero ? '#c0392b' : 'var(--charcoal)',
        textDecoration: isDiscount && isZero ? 'line-through' : 'none',
        ...valueStyle,
      }}>{value}</span>
    </div>
  )
}
