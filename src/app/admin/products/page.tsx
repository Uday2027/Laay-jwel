'use client'
import { useState, useEffect, useCallback } from 'react'

interface Product { id: number; name: string; slug: string; price: number; category: string; stock: number; featured: boolean; images: string; description: string }
const CATEGORIES = ['BRACELETS', 'EARRINGS', 'RINGS']

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'BAGS', stock: '', featured: false, images: '' })
  const [saving, setSaving] = useState(false)

  const loadProducts = useCallback(() => {
    fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || []))
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', price: '', category: 'BAGS', stock: '', featured: false, images: '' }); setShowForm(true) }
  const openEdit = (p: Product) => {
    const imgs = (() => { try { return JSON.parse(p.images).join(', ') } catch { return '' } })()
    setEditing(p); setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, stock: String(p.stock), featured: p.featured, images: imgs })
    setShowForm(true)
  }

  const save = async () => {
    setSaving(true)
    const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), images: form.images.split(',').map(s => s.trim()).filter(Boolean) }
    const url = editing ? `/api/products/${editing.id}` : '/api/products'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { loadProducts(); setShowForm(false); setEditing(null) }
    setSaving(false)
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    loadProducts()
  }

  const toggleFeatured = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !p.featured }) })
    loadProducts()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem' }}>Products</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Add Product</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: '1.5rem', border: '2px solid var(--gold)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: '1.25rem' }}>{editing ? 'Edit Product' : 'New Product'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-row">
              <div className="input-group"><label className="label">Product Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="input-group"><label className="label">Category *</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="input-group"><label className="label">Price (৳) *</label><input className="input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div className="input-group"><label className="label">Stock *</label><input className="input" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
            </div>
            <div className="input-group"><label className="label">Image Paths (comma separated)</label><input className="input" value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="/products/bag-1.jpg, /uploads/photo.jpg" /></div>
            <div className="input-group"><label className="label">Description *</label><textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
              Mark as Featured (shown on homepage)
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}</button>
              <button className="btn btn-outline" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="admin-card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {products.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No products yet</td></tr>}
              {products.map(p => {
                const img = (() => { try { return JSON.parse(p.images)[0] || '/placeholder.jpg' } catch { return '/placeholder.jpg' } })()
                return (
                  <tr key={p.id}>
                    <td><img src={img} alt="" style={{ width: 48, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }} /></td>
                    <td style={{ maxWidth: '200px' }}><p style={{ fontWeight: 500, fontSize: '0.87rem' }}>{p.name}</p></td>
                    <td><span className="badge badge-gold">{p.category}</span></td>
                    <td>৳{p.price.toLocaleString()}</td>
                    <td><span className={p.stock > 0 ? '' : 'badge badge-red'} style={{ color: p.stock > 5 ? 'inherit' : '#b45309' }}>{p.stock}</span></td>
                    <td>
                      <button onClick={() => toggleFeatured(p)} className={`badge ${p.featured ? 'badge-gold' : 'badge-gray'}`} style={{ cursor: 'pointer', border: 'none' }}>
                        {p.featured ? '★ Yes' : '☆ No'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: '#c0392b' }} onClick={() => deleteProduct(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
