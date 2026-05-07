'use client';

type FamilySkeletonVariant =
  | 'layout'
  | 'overview'
  | 'members'
  | 'table'
  | 'detail'
  | 'form';

interface FamilySubPageSkeletonProps {
  variant?: FamilySkeletonVariant;
}

const HeaderSkeleton = ({ withAction = true }: { withAction?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
    <div>
      <div className="skeleton skeleton-text" style={{ width: 180, height: 24, marginBottom: 8 }} />
      <div className="skeleton skeleton-text-sm" style={{ width: 240, height: 14 }} />
    </div>
    {withAction && <div className="skeleton skeleton-text-sm" style={{ width: 128, height: 36, borderRadius: 8 }} />}
  </div>
);

export default function FamilySubPageSkeleton({ variant = 'overview' }: FamilySubPageSkeletonProps) {
  if (variant === 'layout') {
    return (
      <div>
        <div className="page-header" style={{ marginBottom: 18 }}>
          <div className="skeleton skeleton-text-sm" style={{ width: 130, height: 14, marginBottom: 10 }} />
          <div className="skeleton skeleton-text" style={{ width: 280, height: 26, marginBottom: 8 }} />
          <div className="skeleton skeleton-text-sm" style={{ width: 180, height: 14 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-text-sm" style={{ width: 94, height: 30, borderRadius: 8 }} />
          ))}
        </div>
        <div className="card">
          <div className="skeleton skeleton-text" style={{ width: 220, marginBottom: 16 }} />
          <div className="skeleton skeleton-card" style={{ height: 190 }} />
        </div>
      </div>
    );
  }

  if (variant === 'members') {
    return (
      <div>
        <HeaderSkeleton />
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>CNIC/B-Form</th>
                  <th>Age</th>
                  <th>Relationship</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: 120 }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: 110 }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: 45 }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: 95 }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: 90, height: 28 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div>
        <HeaderSkeleton />
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: 120 }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: 90 }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: 75 }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: 82, height: 28 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div>
        <HeaderSkeleton withAction={false} />
        <div className="card" style={{ maxWidth: 700 }}>
          <div className="skeleton skeleton-text" style={{ width: 180, marginBottom: 14 }} />
          <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 40, marginBottom: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 40 }} />
            <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 40 }} />
          </div>
          <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 40, marginBottom: 12 }} />
          <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 108, marginBottom: 18 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="skeleton skeleton-text-sm" style={{ width: 140, height: 36 }} />
            <div className="skeleton skeleton-text-sm" style={{ width: 100, height: 36 }} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div>
        <div className="skeleton skeleton-text-sm" style={{ width: 130, height: 14, marginBottom: 16 }} />
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div className="skeleton skeleton-text" style={{ width: 210, height: 24, marginBottom: 8 }} />
              <div className="skeleton skeleton-text-sm" style={{ width: 220, height: 14 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="skeleton skeleton-text-sm" style={{ width: 78, height: 34 }} />
              <div className="skeleton skeleton-text-sm" style={{ width: 40, height: 34 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-text-sm" style={{ width: '100%', height: 78 }} />
            ))}
          </div>
          <div className="skeleton skeleton-text" style={{ width: 190, marginBottom: 10 }} />
          <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 88, marginBottom: 10 }} />
          <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 88 }} />
        </div>
      </div>
    );
  }

  // Overview skeleton aligned with current Family Overview UI
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 8 }}>
          <div>
            <div className="skeleton skeleton-text" style={{ width: 220, height: 26, marginBottom: 8 }} />
            <div className="skeleton skeleton-text-sm" style={{ width: 260, height: 14 }} />
          </div>
          <div className="skeleton skeleton-text-sm" style={{ width: 120, height: 30, borderRadius: 20 }} />
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div className="skeleton skeleton-text-sm" style={{ width: 140, height: 12, marginBottom: 10 }} />
            <div className="skeleton skeleton-text" style={{ width: 90, height: 30 }} />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
        {/* Members card */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="skeleton skeleton-text" style={{ width: 210, height: 18 }} />
            <div className="skeleton skeleton-text-sm" style={{ width: 120, height: 32, borderRadius: 8 }} />
          </div>
          <div style={{ overflowX: 'hidden' }}>
            <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 36, marginBottom: 10 }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-text-sm" style={{ width: '100%', height: 46, marginBottom: 10 }} />
            ))}
          </div>
        </div>

        {/* Details card */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', padding: 24 }}>
          <div className="skeleton skeleton-text" style={{ width: 170, height: 18, marginBottom: 18 }} />
          <div style={{ display: 'grid', gap: 14 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton skeleton-text-sm" style={{ width: 110, height: 12, marginBottom: 8 }} />
                <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 16 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
