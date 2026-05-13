'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

interface Product { id: number; name: string; slug: string; price: number; category: string; stock: number; featured: boolean; images: string; description: string }
const CATEGORIES = ['BRACELETS', 'EARRINGS', 'RINGS']

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'BRACELETS', stock: '', featured: false, images: [] as string[] })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProducts = useCallback(() => {
    fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || []))
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', price: '', category: 'BRACELETS', stock: '', featured: false, images: [] }); setShowForm(true) }
  const openEdit = (p: Product) => {
    const imgs = (() => { try { return JSON.parse(p.images) } catch { return [] } })()
    setEditing(p); setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, stock: String(p.stock), featured: p.featured, images: Array.isArray(imgs) ? imgs : [] })
    setShowForm(true)
  }

  const save = async () => {
    setSaving(true)
    const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), images: form.images }
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    const formData = new FormData()
    for (const file of files) {
      formData.append('files', file)
    }
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.urls) {
        setForm(f => ({ ...f, images: [...f.images, ...data.urls] }))
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  const moveImage = (index: number, dir: number) => {
    const newImages = [...form.images]
    const swapIndex = index + dir
    if (swapIndex < 0 || swapIndex >= newImages.length) return
    const temp = newImages[index]
    newImages[index] = newImages[swapIndex]
    newImages[swapIndex] = temp
    setForm(f => ({ ...f, images: newImages }))
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

            {/* Image Upload */}
            <div className="input-group">
              <label className="label">Product Photos</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="product-images"
                />
                <label htmlFor="product-images" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  {uploading ? 'Uploading...' : 'Upload Photos'}
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{form.images.length} photo(s)</span>
              </div>

              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 100, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: i === 0 ? '2px solid var(--gold)' : '2px solid var(--border-light)', flexShrink: 0 }}>
                      <img src={img} alt="" width={80} height={100} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 2 }}>
                        <button onClick={() => moveImage(i, -1)} disabled={i === 0} style={{ width: 18, height: 18, fontSize: 10, lineHeight: 1, borderRadius: 2, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: i === 0 ? 'not-allowed' : 'pointer' }}>←</button>
                        <button onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} style={{ width: 18, height: 18, fontSize: 10, lineHeight: 1, borderRadius: 2, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: i === form.images.length - 1 ? 'not-allowed' : 'pointer' }}>→</button>
                        <button onClick={() => removeImage(i)} style={{ width: 18, height: 18, fontSize: 10, lineHeight: 1, borderRadius: 2, border: 'none', background: '#c0392b', color: '#fff', cursor: 'pointer' }}>×</button>
                      </div>
                      {i === 0 && <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 9, background: 'var(--gold)', color: '#fff', padding: '1px 4px', borderRadius: 2 }}>Main</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group"><label className="label">Description *</label><textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
              Mark as Featured (shown on homepage)
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={save} disabled={saving || uploading}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}</button>
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
                    <td><img src={img} alt="" width={48} height={56} style={{ width: 48, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }} /></td>
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
