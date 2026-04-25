'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { individualsAPI } from '@/lib/api';
import { User, Plus, Edit, Trash2, Calendar, MapPin, Shield, Briefcase, DollarSign, X, Save, Heart } from 'lucide-react';

interface Individual {
  individual_id: string;
  full_name: string;
  gender: string;
  dob: string;
  cnic_or_bform: string;
  relationship_to_head: string;
  is_orphan: boolean;
  is_child: boolean;
  is_disabled: boolean;
  is_patient: boolean;
  occupation: string;
  monthly_income: number;
  family_id: string;
}

const relationshipMap: Record<string, string> = {
  head: 'Head',
  spouse: 'Spouse',
  son: 'Son',
  daughter: 'Daughter',
  mother: 'Mother',
  sibling: 'Sibling',
  other: 'Other',
};

export default function FamilyMembersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [members, setMembers] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
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
    individualsAPI.list(id).then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setMembers(data);
    }).finally(() => setLoading(false));
  }, [id]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDelete = async (individualId: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;
    try {
      await individualsAPI.delete(individualId);
      setMembers(members.filter(m => m.individual_id !== individualId));
    } catch (e) {
      console.error('Failed to delete member:', e);
      alert('Failed to delete member');
    }
  };

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
    // Clear field error when user starts typing
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
      setMembers([...members, res.data]);
      closeAddModal();
    } catch (e: unknown) {
      console.error('Error creating member:', e);
      let errorMsg = 'Failed to add member';
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
                } else {
                  errorMsg = JSON.stringify(detail);
                }
              } else if (typeof detail === 'object' && detail !== null && 'msg' in detail) {
                errorMsg = String((detail as { msg: string }).msg);
              }
            }
          }
        }
      } else if (e instanceof Error) {
        errorMsg = e.message;
      }
      safeSetError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1>Family Members</h1>
          <p>Manage all members of this family</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={14} /> Add Member
        </button>
      </div>

      <div className="card">
        {members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><User size={22} /></div>
            <h3>No members added yet</h3>
            <p>Add family members to complete the registration</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}>
              <Plus size={14} /> Add First Member
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>CNIC/B-Form</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Relationship</th>
                  <th>Occupation</th>
                  <th>Income</th>
                  <th>Flags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.individual_id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.full_name}</div>
                    </td>
                    <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--accent)' }}>{m.cnic_or_bform}</span></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                        <Calendar size={12} /> {calculateAge(m.dob)}y
                      </span>
                    </td>
                    <td><span style={{ textTransform: 'capitalize' }}>{m.gender}</span></td>
                    <td>{relationshipMap[m.relationship_to_head] || m.relationship_to_head}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Briefcase size={12} /> {m.occupation || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <DollarSign size={12} /> {m.monthly_income || 0}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {m.is_orphan && <span className="badge badge-purple" style={{ fontSize: '10px' }}>Orphan</span>}
                        {m.is_child && <span className="badge badge-blue" style={{ fontSize: '10px' }}>Child</span>}
                        {m.is_disabled && <span className="badge badge-yellow" style={{ fontSize: '10px' }}>Disabled</span>}
                        {m.is_patient && <span className="badge badge-red" style={{ fontSize: '10px' }}>Patient</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/families/${id}/members/${m.individual_id}/edit`} className="btn btn-secondary btn-sm">
                          <Edit size={12} />
                        </Link>
                        <button onClick={() => handleDelete(m.individual_id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--red)' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}
