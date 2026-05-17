'use client'
import { useState, useEffect, useCallback } from 'react'

interface Review {
  id: number
  name: string
  email: string | null
  rating: number
  comment: string
  createdAt: string
  product: { id: number; name: string; slug: string; images: string }
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)

  const loadReviews = useCallback(() => {
    setLoading(true)
    fetch(`/api/reviews?page=${page}&pageSize=${pageSize}`)
      .then(r => r.json())
      .then(d => {
        setReviews(d.reviews || [])
        setTotal(d.total || 0)
        setLoading(false)
      })
  }, [page, pageSize])

  useEffect(() => { loadReviews() }, [loadReviews])

  const deleteReview = async (id: number) => {
    if (!confirm('Delete this review?')) return
    await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
    loadReviews()
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '2rem', marginBottom: '2rem' }}>Reviews</h1>

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No reviews found</td></tr>
                  )}
                  {reviews.map(r => {
                    const images = (() => { try { return JSON.parse(r.product.images) } catch { return [] } })()
                    const img = images[0] || '/placeholder.jpg'
                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={img} alt="" style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                            <a href={`/shop/${r.product.slug}`} target="_blank" style={{ fontSize: '0.85rem', color: 'var(--gold)' }}>{r.product.name}</a>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div>{r.name}</div>
                          {r.email && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.email}</div>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <svg key={star} width={14} height={14} viewBox="0 0 24 24" fill={star <= r.rating ? '#C9A96E' : 'rgba(201,169,110,0.2)'}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', maxWidth: '300px' }}>
                          <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.comment}</p>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-sm btn-outline" onClick={() => deleteReview(r.id)} style={{ fontSize: '0.65rem', color: '#c0392b', borderColor: 'rgba(192,57,43,0.3)' }}>Delete</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Page {page} of {totalPages}</span>
                <button className="btn btn-sm btn-outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
