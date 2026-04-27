'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { familiesAPI, individualsAPI } from '@/lib/api';
import { User, Plus, MapPin, Home, X, Save, Heart, Shield } from 'lucide-react';

interface Family {
  family_id: string; registration_number: string; category: 'FA' | 'SB';
  status: string; area: string; city: string; full_address: string;
  housing_type: string; created_at: string;
}
interface Individual {
  individual_id: string; full_name: string; gender: string; relationship_to_head: string;
  is_orphan: boolean; is_child: boolean; occupation: string; monthly_income: number;
  dob?: string; cnic_or_bform?: string; is_disabled?: boolean; is_patient?: boolean;
}

const statusColor: Record<string, string> = {
  pending_assessment: 'gray', assessed: 'blue', scoring: 'yellow',
  approved: 'green', rejected: 'red', reassessment: 'purple',
};

export default function FamilyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Individual | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
    Promise.all([
      familiesAPI.get(id),
      individualsAPI.list(id),
    ]).then(([fam, inds]) => {
      setFamily(fam.data);
      setMembers(Array.isArray(inds.data) ? inds.data : []);
    }).finally(() => setLoading(false));
  }, [id]);

  const resetForm = () => {
    setForm({
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
    setFieldErrors({});
    setError('');
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const openMemberModal = (member: Individual) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('en-PK');
  };

  const calculateAge = (date?: string) => {
    if (!date) return '—';
    const birthDate = new Date(date);
    if (Number.isNaN(birthDate.getTime())) return '—';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} years` : '—';
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

  const submitAddMember = async () => {
    if (!validateField('all')) {
      setError('Please fix the validation errors');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await individualsAPI.create({ ...form, family_id: id });
      setMembers(prev => [...prev, res.data]);
      closeAddModal();
    } catch (e: unknown) {
      let errorMsg = 'Failed to add member';
      if (e && typeof e === 'object' && 'response' in e) {
        const response = (e as { response: { data?: unknown } }).response;
        if (response?.data && typeof response.data === 'object' && response.data !== null && 'detail' in response.data) {
          const detail = (response.data as { detail: unknown }).detail;
          errorMsg = typeof detail === 'string' ? detail : errorMsg;
        }
      } else if (e instanceof Error) {
        errorMsg = e.message;
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: 760 }}>
          <div className="skeleton skeleton-text" style={{ width: '220px', marginBottom: 16 }} />
          <div className="info-grid" style={{ marginBottom: 18 }}>
            <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 34 }} />
            <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 34 }} />
            <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 34 }} />
            <div className="skeleton skeleton-text-sm" style={{ width: '100%', height: 34 }} />
          </div>
          <div className="skeleton skeleton-text" style={{ width: '180px', marginBottom: 14 }} />
          {[...Array(3)].map((_, i) => (
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
  if (!family) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Family not found.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Family Info */}
        <div className="card">
          <div className="section-title">Family Details</div>
          <div className="info-grid">
            <div className="info-item"><label>Registration #</label><p style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{family.registration_number}</p></div>
            <div className="info-item"><label>Program</label><p>{family.category === 'FA' ? 'Financial Aid' : 'Saiban Orphan'}</p></div>
            <div className="info-item"><label>Status</label><p><span className={`badge badge-${statusColor[family.status] || 'gray'}`}>{family.status?.replace(/_/g, ' ')}</span></p></div>
            <div className="info-item"><label>Housing</label><p style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Home size={13} />{family.housing_type}</p></div>
            <div className="info-item"><label>Area</label><p style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} />{family.area}</p></div>
            <div className="info-item"><label>City</label><p>{family.city}</p></div>
            <div className="info-item" style={{ gridColumn: '1/-1' }}><label>Full Address</label><p style={{ color: 'var(--text-secondary)' }}>{family.full_address || '—'}</p></div>
            <div className="info-item"><label>Registered On</label><p>{family.created_at ? new Date(family.created_at).toLocaleDateString('en-PK') : '—'}</p></div>
          </div>
        </div>

        {/* Members summary */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Family Members ({members.length})</div>
            <button onClick={() => setShowAddModal(true)} className="btn btn-secondary btn-sm"><Plus size={12} /> Add</button>
          </div>
          {members.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-state-icon"><User size={20} /></div>
              <p>No members added yet.</p>
            </div>
          ) : (
            <div>
              {members.slice(0, 5).map(m => (
                <div
                  key={m.individual_id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openMemberModal(m)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openMemberModal(m);
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                    {m.full_name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.full_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.relationship_to_head} • {m.occupation || 'No occupation'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {m.is_orphan && <span className="badge badge-purple">Orphan</span>}
                    {m.is_child && <span className="badge badge-blue">Child</span>}
                  </div>
                </div>
              ))}
              {members.length > 5 && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>+{members.length - 5} more members</p>}
            </div>
          )}
        </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Family Member</h2>
              <button className="modal-close" onClick={closeAddModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
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
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeAddModal} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={submitAddMember} disabled={submitting}>
                <Save size={14} /> {submitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && selectedMember && (
        <div className="modal-overlay" onClick={closeMemberModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Member Details</h2>
              <button className="modal-close" onClick={closeMemberModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item"><label>Name</label><p>{selectedMember.full_name || '—'}</p></div>
                <div className="info-item"><label>Gender</label><p style={{ textTransform: 'capitalize' }}>{selectedMember.gender || '—'}</p></div>
                <div className="info-item"><label>Relationship</label><p>{selectedMember.relationship_to_head || '—'}</p></div>
                <div className="info-item"><label>Date of Birth</label><p>{formatDate(selectedMember.dob)}</p></div>
                <div className="info-item"><label>Age</label><p>{calculateAge(selectedMember.dob)}</p></div>
                <div className="info-item"><label>CNIC/B-Form</label><p>{selectedMember.cnic_or_bform || '—'}</p></div>
                <div className="info-item"><label>Occupation</label><p>{selectedMember.occupation || '—'}</p></div>
                <div className="info-item"><label>Monthly Income</label><p>PKR {selectedMember.monthly_income || 0}</p></div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedMember.is_orphan && <span className="badge badge-purple">Orphan</span>}
                {selectedMember.is_child && <span className="badge badge-blue">Child</span>}
                {selectedMember.is_disabled && <span className="badge badge-yellow">Disabled</span>}
                {selectedMember.is_patient && <span className="badge badge-red">Patient</span>}
                {!selectedMember.is_orphan && !selectedMember.is_child && !selectedMember.is_disabled && !selectedMember.is_patient && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No special flags</span>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeMemberModal}>Close</button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}
