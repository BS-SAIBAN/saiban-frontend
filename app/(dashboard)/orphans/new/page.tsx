'use client';

import { useState, useEffect } from 'react';
import { familiesAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import OrphanProfileForm from '@/components/orphans/OrphanProfileForm';
import { Baby, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NewOrphanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const familyIdParam = searchParams.get('family_id');
  
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (familyIdParam) {
      setFamilyId(familyIdParam);
      setLoading(false);
    } else {
      // If no family_id provided, redirect to family selection or intake
      setError('Family ID is required. Please use the SB Intake process or select a family first.');
      setLoading(false);
    }
  }, [familyIdParam]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px' }}>
        <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: 16, borderRadius: 8, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={20} />
          {error}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => router.push('/orphans/intake')}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: '1px solid var(--accent)',
              background: 'var(--accent)',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Start SB Intake
          </button>
          <button
            onClick={() => router.back()}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Baby size={24} /> Register Orphan Profile
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 14 }}>
            Complete the orphan profile registration for the selected family
          </p>
        </div>
        <button
          onClick={() => router.back()}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      
      {familyId && <OrphanProfileForm familyId={familyId} />}
    </div>
  );
}
