'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { individualsAPI, storageAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { User, Plus, Edit, Trash2, Calendar, Shield, Briefcase, DollarSign, X, Save, Heart, Eye, Upload } from 'lucide-react';

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
  debt_amount?: number;
  school_name?: string;
  current_class?: string;
  monthly_school_fee?: number;
  religion?: string;
  caste?: string;
  photo_url?: string;
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
  const [members, setMembers] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Individual | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
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
    debt_amount: 0,
    school_name: '',
    current_class: '',
    monthly_school_fee: 0,
    religion: '',
    caste: '',
    photo_url: '',
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
      debt_amount: 0,
      school_name: '',
      current_class: '',
      monthly_school_fee: 0,
      religion: '',
      caste: '',
      photo_url: '',
    });
    setFieldErrors({});
    setError('');
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingMemberId(null);
    resetForm();
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedMember(null);
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

  const uploadPhotoToR2 = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file for member photo');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size must be 5MB or less');
      return;
    }

    setPhotoUploading(true);
    setError('');
    try {
      const res = await storageAPI.uploadMemberPhoto(id, file);
      const url = res.data?.file_url as string | undefined;
      if (!url) {
        throw new Error('Upload succeeded but no photo URL returned');
      }
      set('photo_url', url);
    } catch (e) {
      console.error('Photo upload failed:', e);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const openViewModal = (member: Individual) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const openEditModal = (member: Individual) => {
    const dobForInput = member.dob?.includes('T') ? member.dob.split('T')[0] : member.dob;
    setForm({
      full_name: member.full_name || '',
      gender: member.gender || 'male',
      dob: dobForInput || '',
      cnic_or_bform: member.cnic_or_bform || '',
      relationship_to_head: member.relationship_to_head || 'head',
      is_orphan: Boolean(member.is_orphan),
      is_child: Boolean(member.is_child),
      is_disabled: Boolean(member.is_disabled),
      is_patient: Boolean(member.is_patient),
      occupation: member.occupation || '',
      monthly_income: Number(member.monthly_income || 0),
      debt_amount: Number(member.debt_amount || 0),
      school_name: member.school_name || '',
      current_class: member.current_class || '',
      monthly_school_fee: Number(member.monthly_school_fee || 0),
      religion: member.religion || '',
      caste: member.caste || '',
      photo_url: member.photo_url || '',
    });
    setEditingMemberId(member.individual_id);
    setShowEditModal(true);
    setError('');
    setFieldErrors({});
  };

  const submitEditMember = async () => {
    if (!editingMemberId) return;
    if (!validateField('all')) {
      setError('Please fix the validation errors');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await individualsAPI.update(editingMemberId, form);
      setMembers(prev => prev.map(m => (
        m.individual_id === editingMemberId ? res.data : m
      )));
      closeEditModal();
    } catch (e: unknown) {
      console.error('Error updating member:', e);
      let errorMsg = 'Failed to update member';
      if (e && typeof e === 'object' && 'response' in e) {
        const response = (e as { response: { data?: unknown } }).response;
        if (response?.data) {
          const data = response.data;
          if (typeof data === 'string') {
            errorMsg = data;
          } else if (typeof data === 'object' && data !== null && 'detail' in data) {
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
      } else if (e instanceof Error) {
        errorMsg = e.message;
      }
      safeSetError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FamilySubPageSkeleton />;

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
                        <button onClick={() => openViewModal(m)} className="btn btn-secondary btn-sm" title="View member">
                          <Eye size={12} />
                        </button>
                        <button onClick={() => openEditModal(m)} className="btn btn-secondary btn-sm" title="Edit member">
                          <Edit size={12} />
                        </button>
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

      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={showAddModal ? closeAddModal : closeEditModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showEditModal ? 'Edit Family Member' : 'Add Family Member'}</h2>
              <button className="modal-close" onClick={showAddModal ? closeAddModal : closeEditModal}><X size={18} /></button>
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
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Additional Details</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Debt Amount (PKR)</label>
                    <input type="number" className="form-control" value={form.debt_amount} onChange={e => set('debt_amount', Number(e.target.value))} placeholder="0" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Monthly School Fee (PKR)</label>
                    <input type="number" className="form-control" value={form.monthly_school_fee} onChange={e => set('monthly_school_fee', Number(e.target.value))} placeholder="0" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">School Name</label>
                    <input className="form-control" value={form.school_name} onChange={e => set('school_name', e.target.value)} placeholder="School or madrasa" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Current Class</label>
                    <input className="form-control" value={form.current_class} onChange={e => set('current_class', e.target.value)} placeholder="e.g. Grade 5" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Religion</label>
                    <input className="form-control" value={form.religion} onChange={e => set('religion', e.target.value)} placeholder="Religion" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Caste</label>
                    <input className="form-control" value={form.caste} onChange={e => set('caste', e.target.value)} placeholder="Caste" />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                  <label className="form-label">Photo Upload</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: photoUploading ? 'not-allowed' : 'pointer', opacity: photoUploading ? 0.7 : 1 }}>
                      <Upload size={12} /> {photoUploading ? 'Uploading...' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={photoUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) await uploadPhotoToR2(file);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                    {form.photo_url && (
                      <span style={{ fontSize: 12, color: 'var(--green)' }}>Photo uploaded</span>
                    )}
                  </div>
                  {form.photo_url && (
                    <img
                      src={form.photo_url}
                      alt="Member preview"
                      style={{ marginTop: 10, width: 84, height: 84, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                    />
                  )}
                </div>
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
              <button className="btn btn-secondary" onClick={showAddModal ? closeAddModal : closeEditModal} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={showEditModal ? submitEditMember : submitAddMember} disabled={submitting || photoUploading}>
                <Save size={14} /> {submitting ? (showEditModal ? 'Updating...' : 'Adding...') : (showEditModal ? 'Update Member' : 'Add Member')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedMember && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Member Details</h2>
              <button className="modal-close" onClick={closeViewModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="info-grid" style={{ marginBottom: 16 }}>
                <div className="info-item"><label>Full Name</label><p>{selectedMember.full_name || '—'}</p></div>
                <div className="info-item"><label>CNIC / B-Form</label><p>{selectedMember.cnic_or_bform || '—'}</p></div>
                <div className="info-item"><label>Age</label><p>{selectedMember.dob ? `${calculateAge(selectedMember.dob)} years` : '—'}</p></div>
                <div className="info-item"><label>Date of Birth</label><p>{selectedMember.dob ? (selectedMember.dob.includes('T') ? selectedMember.dob.split('T')[0] : selectedMember.dob) : '—'}</p></div>
                <div className="info-item"><label>Gender</label><p style={{ textTransform: 'capitalize' }}>{selectedMember.gender || '—'}</p></div>
                <div className="info-item"><label>Relationship</label><p>{relationshipMap[selectedMember.relationship_to_head] || selectedMember.relationship_to_head || '—'}</p></div>
                <div className="info-item"><label>Occupation</label><p>{selectedMember.occupation || '—'}</p></div>
                <div className="info-item"><label>Monthly Income</label><p>PKR {selectedMember.monthly_income || 0}</p></div>
                <div className="info-item"><label>Debt Amount</label><p>PKR {selectedMember.debt_amount || 0}</p></div>
                <div className="info-item"><label>School Name</label><p>{selectedMember.school_name || '—'}</p></div>
                <div className="info-item"><label>Current Class</label><p>{selectedMember.current_class || '—'}</p></div>
                <div className="info-item"><label>Monthly School Fee</label><p>PKR {selectedMember.monthly_school_fee || 0}</p></div>
                <div className="info-item"><label>Religion</label><p>{selectedMember.religion || '—'}</p></div>
                <div className="info-item"><label>Caste</label><p>{selectedMember.caste || '—'}</p></div>
                <div className="info-item" style={{ gridColumn: '1/-1' }}><label>Photo URL</label><p>{selectedMember.photo_url || '—'}</p></div>
              </div>

              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 10, fontSize: 13 }}>Special Flags</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedMember.is_orphan && <span className="badge badge-purple">Orphan</span>}
                  {selectedMember.is_child && <span className="badge badge-blue">Child</span>}
                  {selectedMember.is_disabled && <span className="badge badge-yellow">Disabled</span>}
                  {selectedMember.is_patient && <span className="badge badge-red">Patient</span>}
                  {!selectedMember.is_orphan && !selectedMember.is_child && !selectedMember.is_disabled && !selectedMember.is_patient && (
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No special flags</span>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeViewModal}>Close</button>
              <button className="btn btn-primary" onClick={() => { closeViewModal(); openEditModal(selectedMember); }}>
                <Edit size={14} /> Edit Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
