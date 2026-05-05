'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { familiesAPI, individualsAPI, normalizeStorageUrl, storageAPI } from '@/lib/api';
import { formatFastApiDetail } from '@/lib/fastApiError';
import { formatCnicOrBForm } from '@/lib/cnicFormat';
import { buildIndividualCreateBody, isValidFamilyIdParam } from '@/lib/individualPayload';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { User, Plus, MapPin, Home, X, Save, Heart, Shield, Upload } from 'lucide-react';

interface Family {
  family_id: string; registration_number: string; category: 'FA' | 'SB';
  status: string; area: string; city: string; full_address: string;
  housing_type: string; created_at: string;
}
interface Individual {
  individual_id: string; full_name: string; gender: string; relationship_to_head: string;
  is_orphan: boolean; is_child: boolean; occupation: string; monthly_income: number;
  dob?: string; cnic_or_bform?: string; is_disabled?: boolean; is_patient?: boolean;
  debt_amount?: number; school_name?: string; current_class?: string; monthly_school_fee?: number;
  religion?: string; caste?: string; photo_url?: string;
}

const statusColor: Record<string, string> = {
  pending_assessment: 'gray', assessed: 'blue', scoring: 'yellow',
  approved: 'green', rejected: 'red', reassessment: 'purple',
};

const relationshipMap: Record<string, string> = {
  head: 'Head',
  spouse: 'Spouse',
  son: 'Son',
  daughter: 'Daughter',
  mother: 'Mother',
  sibling: 'Sibling',
  other: 'Other',
};

const isValidFamilyRouteId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value !== 'undefined' && value !== 'null';

export default function FamilyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hasValidId = isValidFamilyRouteId(id);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Individual | null>(null);
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
    if (!hasValidId) {
      router.replace('/families');
      return;
    }

    Promise.all([
      familiesAPI.get(id),
      individualsAPI.list(id),
    ]).then(([fam, inds]) => {
      setFamily(fam.data);
      setMembers(Array.isArray(inds.data) ? inds.data : []);
    }).catch(() => {
      setFamily(null);
      setMembers([]);
    }).finally(() => setLoading(false));
  }, [hasValidId, id, router]);

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
    if (!isValidFamilyIdParam(id)) {
      setError('Invalid family ID. Open this page from the family list and try again.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const body = buildIndividualCreateBody({ ...form } as Record<string, unknown>, id);
      const res = await individualsAPI.create(body);
      setMembers(prev => [...prev, res.data]);
      closeAddModal();
    } catch (e: unknown) {
      let errorMsg = 'Failed to add member';
      if (e && typeof e === 'object' && 'response' in e) {
        const response = (e as { response: { data?: unknown } }).response;
        if (response?.data && typeof response.data === 'object' && response.data !== null && 'detail' in response.data) {
          const detail = (response.data as { detail: unknown }).detail;
          errorMsg = formatFastApiDetail(detail);
        }
      } else if (e instanceof Error) {
        errorMsg = e.message;
      }
      setError(errorMsg);
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
      const fileKey = res.data?.file_key as string | undefined;
      const url = res.data?.file_url as string | undefined;
      const portableRef = fileKey || url;
      if (!portableRef) {
        throw new Error('Upload succeeded but no file reference returned');
      }
      set('photo_url', portableRef);
    } catch (e) {
      console.error('Photo upload failed:', e);
      let message = 'Failed to upload photo. Please try again.';
      if (e && typeof e === 'object' && 'response' in e) {
        const response = (e as { response?: { data?: { detail?: unknown } } }).response;
        if (typeof response?.data?.detail === 'string') {
          message = response.data.detail;
        }
      }
      setError(message);
    } finally {
      setPhotoUploading(false);
    }
  };

  if (loading) return <FamilySubPageSkeleton variant="overview" />;
  if (!family) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Family not found.</div>;

  return (
    <div className="family-overview-grid">
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
                  className="family-member-row"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <div className="member-avatar-circle">
                    {m.photo_url ? (
                      <img src={normalizeStorageUrl(m.photo_url)} alt={`${m.full_name || 'Member'} photo`} />
                    ) : (
                      m.full_name?.[0] || 'M'
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.full_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.relationship_to_head} • {m.occupation || 'No occupation'}</div>
                  </div>
                  <div className="member-badges" style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap' }}>
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

              <div className="form-grid form-grid-2">
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
                <input className="form-control" value={form.cnic_or_bform} onChange={e => set('cnic_or_bform', formatCnicOrBForm(e.target.value))} placeholder="e.g. 12345-1234567-1" inputMode="numeric" autoComplete="off" style={fieldErrors.cnic_or_bform ? { borderColor: 'var(--red)' } : {}} />
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
                <div className="form-grid form-grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Debt Amount (PKR)</label>
                    <input type="number" className="form-control" value={form.debt_amount} onChange={e => set('debt_amount', Number(e.target.value))} placeholder="0" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Monthly School Fee (PKR)</label>
                    <input type="number" className="form-control" value={form.monthly_school_fee} onChange={e => set('monthly_school_fee', Number(e.target.value))} placeholder="0" />
                  </div>
                </div>

                <div className="form-grid form-grid-2" style={{ marginTop: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">School Name</label>
                    <input className="form-control" value={form.school_name} onChange={e => set('school_name', e.target.value)} placeholder="School or madrasa" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Current Class</label>
                    <input className="form-control" value={form.current_class} onChange={e => set('current_class', e.target.value)} placeholder="e.g. Grade 5" />
                  </div>
                </div>

                <div className="form-grid form-grid-2" style={{ marginTop: 12 }}>
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
                          const input = e.currentTarget;
                          const file = e.target.files?.[0];
                          input.value = '';
                          if (file) await uploadPhotoToR2(file);
                        }}
                      />
                    </label>
                    {form.photo_url && (
                      <span style={{ fontSize: 12, color: 'var(--green)' }}>Photo uploaded</span>
                    )}
                  </div>
                  {form.photo_url && (
                    <img
                      src={normalizeStorageUrl(form.photo_url)}
                      alt="Member preview"
                      style={{ marginTop: 10, width: 84, height: 84, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                    />
                  )}
                </div>
              </div>

              <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Special Flags</label>
                <div className="form-grid form-grid-2" style={{ gap: 12 }}>
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
              <button className="btn btn-primary" onClick={submitAddMember} disabled={submitting || photoUploading}>
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
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <div className="member-avatar-circle member-avatar-lg">
                  {selectedMember.photo_url ? (
                    <img src={normalizeStorageUrl(selectedMember.photo_url)} alt={`${selectedMember.full_name || 'Member'} photo`} />
                  ) : (
                    selectedMember.full_name?.[0] || 'M'
                  )}
                </div>
              </div>
              <div className="info-grid" style={{ marginBottom: 16 }}>
                <div className="info-item"><label>Full Name</label><p>{selectedMember.full_name || '—'}</p></div>
                <div className="info-item"><label>CNIC / B-Form</label><p>{selectedMember.cnic_or_bform || '—'}</p></div>
                <div className="info-item"><label>Age</label><p>{calculateAge(selectedMember.dob)}</p></div>
                <div className="info-item"><label>Date of Birth</label><p>{formatDate(selectedMember.dob)}</p></div>
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
              <button className="btn btn-secondary" onClick={closeMemberModal}>Close</button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}
