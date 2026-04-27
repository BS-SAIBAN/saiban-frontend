'use client';

export default function FamilySubPageSkeleton() {
  return (
    <div style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 880 }}>
        <div className="skeleton skeleton-text" style={{ width: '240px', marginBottom: 18 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 34 }} />
          <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 34 }} />
        </div>

        <div className="skeleton skeleton-text" style={{ width: '180px', marginBottom: 14 }} />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-row" style={{ marginBottom: 10 }}>
            <div className="skeleton skeleton-avatar" />
            <div className="skeleton-col">
              <div className="skeleton skeleton-text" style={{ width: '55%' }} />
              <div className="skeleton skeleton-text-sm" style={{ width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
