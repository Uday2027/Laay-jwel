export default function ShopLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div style={{ paddingTop: 'var(--header-offset)', background: 'var(--cream-dark)', minHeight: '280px' }}>
        <div className="container" style={{ padding: '4rem 2rem' }}>
          <div style={{ height: 16, width: 120, background: 'var(--border)', borderRadius: 4, marginBottom: '1.5rem' }} />
          <div style={{ height: 40, width: 280, background: 'var(--border)', borderRadius: 4, marginBottom: '0.75rem' }} />
          <div style={{ height: 16, width: 180, background: 'var(--border)', borderRadius: 4 }} />
        </div>
      </div>
      {/* Filters skeleton */}
      <div className="section">
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 36, width: 100, background: 'var(--border)', borderRadius: 100 }} />
            ))}
          </div>
          {/* Grid skeleton */}
          <div className="grid-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '3/4', background: 'var(--cream-dark)' }} />
                <div style={{ padding: '1rem' }}>
                  <div style={{ height: 14, width: '80%', background: 'var(--border)', borderRadius: 4, marginBottom: '0.5rem' }} />
                  <div style={{ height: 14, width: '40%', background: 'var(--border)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
