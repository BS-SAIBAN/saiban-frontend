'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { familiesAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { Save, MapPin, Home, Tag } from 'lucide-react';

export default function EditFamilyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    category: 'FA',
    area: '',
    city: '',
    full_address: '',
    housing_type: 'rented',
  });

  useEffect(() => {
    familiesAPI.get(id).then(r => {
      const data = r.data;
      setForm({
        category: data.category || 'FA',
        area: data.area || '',
        city: data.city || '',
        full_address: data.full_address || '',
        housing_type: data.housing_type || 'rented',
      });
    }).catch(e => {
      console.error('Failed to fetch family:', e);
      setError('Failed to load family data');
    }).finally(() => setFetchLoading(false));
  }, [id]);

  const submit = async () => {
    if (!form.area || !form.city) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await familiesAPI.update(id, form);
      router.push(`/families/${id}`);
    } catch (e: unknown) {
      console.error('Error updating family:', e);
      let errorMsg = 'Failed to update family';
      if (e && typeof e === 'object' && 'response' in e) {
        const response = (e as { response: { data?: unknown } }).response;
        if (response?.data && typeof response.data === 'object' && 'detail' in response.data) {
          const detail = (response.data as { detail: unknown }).detail;
          if (typeof detail === 'string') {
            errorMsg = detail;
          }
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <FamilySubPageSkeleton variant="form" />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1>Edit Family</h1>
          <p>Update family information</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {error && <div style={{ padding: '12px 14px', marginBottom: 16, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Program Category *</label>
          <select className="form-control" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}>
            <option value="FA">FA – Financial Aid</option>
            <option value="SB">SB – Saiban (Orphan)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Area *</label>
            <input className="form-control" value={form.area} onChange={e => setForm(prev => ({ ...prev, area: e.target.value }))} placeholder="e.g. Gulshan, Model Town" />
          </div>
          <div className="form-group">
            <label className="form-label">City *</label>
            <input className="form-control" value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} placeholder="e.g. Lahore, Karachi" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Full Address</label>
          <input className="form-control" value={form.full_address} onChange={e => setForm(prev => ({ ...prev, full_address: e.target.value }))} placeholder="Street address, house number..." />
        </div>

        <div className="form-group">
          <label className="form-label">Housing Type</label>
          <select className="form-control" value={form.housing_type} onChange={e => setForm(prev => ({ ...prev, housing_type: e.target.value }))}>
            <option value="rented">Rented</option>
            <option value="owned">Owned</option>
            <option value="shared">Shared</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={submit} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
            <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href={`/families/${id}`} className="btn btn-secondary">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
