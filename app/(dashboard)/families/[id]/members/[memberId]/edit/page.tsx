'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { individualsAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { ArrowLeft, Save, User, Calendar, Briefcase, DollarSign, Shield, Heart } from 'lucide-react';

export default function EditMemberPage() {
  const { id, memberId } = useParams<{ id: string; memberId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    full_name: '',
    gender: 'male',
    dob: '',
    cnic_or_bform: '',
    relationship_to_head: 'head',
    is_orphan: false,
    is_child: false,
    is_disabled: false,
    is_patient: false,
    occupation: '',
    monthly_income: 0,
  });

  useEffect(() => {
    individualsAPI.list(id).then(r => {
      const members = Array.isArray(r.data) ? r.data : [];
      const member = members.find(m => m.individual_id === memberId);
      if (member) {
        setForm({
          full_name: member.full_name || '',
          gender: member.gender || 'male',
          dob: member.dob ? member.dob.split('T')[0] : '',
          cnic_or_bform: member.cnic_or_bform || '',
          relationship_to_head: member.relationship_to_head || 'head',
          is_orphan: member.is_orphan || false,
          is_child: member.is_child || false,
          is_disabled: member.is_disabled || false,
          is_patient: member.is_patient || false,
          occupation: member.occupation || '',
          monthly_income: member.monthly_income || 0,
        });
      }
    }).finally(() => setFetchLoading(false));
  }, [id, memberId]);

  const safeSetError = (err: unknown) => {
    if (typeof err === 'string') {
      setError(err);
    } else if (err && typeof err === 'object') {
      setError(JSON.stringify(err));
    } else {
      setError(String(err));
    }
  };

  const validateField = (field: string) => {
    const errors: Record<string, string> = {};
    
    if (field === 'full_name' || field === 'all') {
      if (!form.full_name || form.full_name.length < 2) {
        errors.full_name = 'Full name must be at least 2 characters';
      }
    }
    
    if (field === 'cnic_or_bform' || field === 'all') {
      const cnic = form.cnic_or_bform.replace(/[-_]/g, '');
      if (!form.cnic_or_bform) {
        errors.cnic_or_bform = 'CNIC/B-Form is required';
      } else if (cnic.length !== 13 && cnic.length !== 15) {
        errors.cnic_or_bform = 'CNIC must be 13 digits or B-Form must be 15 digits';
      } else if (!/^\d+$/.test(cnic)) {
        errors.cnic_or_bform = 'CNIC/B-Form must contain only digits';
      }
    }
    
    if (field === 'dob' || field === 'all') {
      if (!form.dob) {
        errors.dob = 'Date of birth is required';
      } else {
        const birthDate = new Date(form.dob);
        const today = new Date();
        if (birthDate > today) {
          errors.dob = 'Date of birth cannot be in the future';
        }
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age > 120) {
          errors.dob = 'Invalid date of birth';
        }
      }
    }
    
    setFieldErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const set = (k: string, v: string | number | boolean) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (fieldErrors[k]) {
      setFieldErrors(prev => ({ ...prev, [k]: '' }));
    }
  };

  const submit = async () => {
    if (!validateField('all')) {
      setError('Please fix the validation errors');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await individualsAPI.update(memberId, form);
      router.push(`/families/${id}/members`);
    } catch (e: unknown) {
      console.error('Error updating member:', e);
      let errorMsg = 'Failed to update member';
      if (e && typeof e === 'object' && 'response' in e) {
        const response = (e as { response: { data?: unknown; status?: number } }).response;
        if (response?.data) {
          const data = response.data;
          if (typeof data === 'string') {
            errorMsg = data;
          } else if (typeof data === 'object' && data !== null) {
            if ('detail' in data) {
              const detail = (data as { detail: unknown }).detail;
              if (typeof detail === 'string') {
                errorMsg = detail;
              } else if (Array.isArray(detail) && detail.length > 0) {
                const firstError = detail[0];
                if (typeof firstError === 'object' && firstError !== null && 'msg' in firstError) {
                  errorMsg = String((firstError as { msg: string }).msg);
                }
              }
            }
          }
        }
      }
      safeSetError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <FamilySubPageSkeleton />;

  return (
    <div>
      <div className="page-header">
        <Link href={`/families/${id}/members`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Members
        </Link>
        <div style={{ marginTop: 8 }}>
          <h1>Edit Family Member</h1>
          <p>Update member information</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {error && <div style={{ padding: '12px 14px', marginBottom: 16, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-control" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Enter full name" style={fieldErrors.full_name ? { borderColor: 'var(--red)' } : {}} />
          {fieldErrors.full_name && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: 4 }}>{fieldErrors.full_name}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth *</label>
            <input type="date" className="form-control" value={form.dob} onChange={e => set('dob', e.target.value)} style={fieldErrors.dob ? { borderColor: 'var(--red)' } : {}} />
            {fieldErrors.dob && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: 4 }}>{fieldErrors.dob}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">CNIC / B-Form Number *</label>
          <input className="form-control" value={form.cnic_or_bform} onChange={e => set('cnic_or_bform', e.target.value)} placeholder="e.g. 12345-1234567-1" style={fieldErrors.cnic_or_bform ? { borderColor: 'var(--red)' } : {}} />
          {fieldErrors.cnic_or_bform && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: 4 }}>{fieldErrors.cnic_or_bform}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Relationship to Family Head *</label>
          <select className="form-control" value={form.relationship_to_head} onChange={e => set('relationship_to_head', e.target.value)}>
            <option value="head">Head</option>
            <option value="spouse">Spouse</option>
            <option value="son">Son</option>
            <option value="daughter">Daughter</option>
            <option value="mother">Mother</option>
            <option value="sibling">Sibling</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Occupation</label>
          <input className="form-control" value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Teacher, Driver, Unemployed" />
        </div>

        <div className="form-group">
          <label className="form-label">Monthly Income (PKR)</label>
          <input type="number" className="form-control" value={form.monthly_income} onChange={e => set('monthly_income', Number(e.target.value))} placeholder="0" />
        </div>

        <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Special Flags</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_orphan} onChange={e => set('is_orphan', e.target.checked)} />
              <Shield size={14} /> Orphan
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_child} onChange={e => set('is_child', e.target.checked)} />
              <User size={14} /> Child (under 18)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_disabled} onChange={e => set('is_disabled', e.target.checked)} />
              Disabled
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_patient} onChange={e => set('is_patient', e.target.checked)} />
              <Heart size={14} /> Chronic Patient
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={submit} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
            <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href={`/families/${id}/members`} className="btn btn-secondary">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
