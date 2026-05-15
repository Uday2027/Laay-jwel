export default function ProductDetailLoading() {
  return (
    <div style={{ paddingTop: 'var(--header-offset)' }}>
      <div className="container section">
        <div className="grid-2" style={{ gap: '4rem', alignItems: 'start' }}>
          {/* Image skeleton */}
          <div>
            <div style={{ borderRadius: 'var(--radius-lg)', aspectRatio: '4/5', background: 'var(--cream-dark)', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: 72, height: 88, borderRadius: 'var(--radius-sm)', background: 'var(--cream-dark)' }} />
              ))}
            </div>
          </div>
          {/* Info skeleton */}
          <div style={{ padding: '0 clamp(0.5rem, 4vw, 2rem)' }}>
            <div style={{ height: 24, width: 80, background: 'var(--border)', borderRadius: 100, marginBottom: '1rem' }} />
            <div style={{ height: 40, width: '90%', background: 'var(--border)', borderRadius: 4, marginBottom: '1rem' }} />
            <div style={{ height: 32, width: 120, background: 'var(--border)', borderRadius: 4, marginBottom: '1.5rem' }} />
            <div style={{ height: 12, width: '100%', background: 'var(--border)', borderRadius: 4, marginBottom: '0.5rem' }} />
            <div style={{ height: 12, width: '100%', background: 'var(--border)', borderRadius: 4, marginBottom: '0.5rem' }} />
            <div style={{ height: 12, width: '80%', background: 'var(--border)', borderRadius: 4, marginBottom: '2rem' }} />
            <div style={{ height: 48, width: '100%', background: 'var(--border)', borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
