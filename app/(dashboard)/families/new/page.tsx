'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { familiesAPI } from '@/lib/api';
import { Users, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = ['Category', 'Basic Info', 'Address', 'Father (Head)', 'Review'];

const extractDigits = (value: string) => value.replace(/\D/g, '').slice(0, 15);

const formatCnicOrBForm = (value: string) => {
  const digits = extractDigits(value);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  if (digits.length <= 13) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 15)}`;
};

export default function NewFamilyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState({
    category: '', area: '', city: '', full_address: '', housing_type: 'rented',
    father_full_name: '', father_dob: '', father_cnic_or_bform: '', father_status: 'alive',
    father_occupation: '', father_monthly_income: '', father_religion: '', father_caste: '',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const safeSetError = (err: unknown) => {
    if (typeof err === 'string') {
      setError(err);
    } else if (err && typeof err === 'object') {
      setError(JSON.stringify(err));
    } else {
      setError(String(err));
    }
  };

  const canProceedToNextStep = () => {
    if (step === 0) return Boolean(form.category);
    if (step === 3) {
      const fatherBaseValid = Boolean(
        form.father_full_name.trim() &&
        form.father_dob &&
        form.father_cnic_or_bform.trim() &&
        form.father_status
      );
      if (form.father_status !== 'alive') return fatherBaseValid;
      return fatherBaseValid && Boolean(
        form.father_occupation.trim() &&
        form.father_monthly_income.trim() &&
        form.father_religion.trim() &&
        form.father_caste.trim()
      );
    }
    return true;
  };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      if (!form.father_full_name.trim() || !form.father_dob || !form.father_cnic_or_bform.trim() || !form.father_status) {
        throw new Error('Father details are required. Please add the family head before registration.');
      }
      if (
        form.father_status === 'alive'
        && (!form.father_occupation.trim() || !form.father_monthly_income.trim() || !form.father_religion.trim() || !form.father_caste.trim())
      ) {
        throw new Error('When father status is alive, occupation, monthly income, religion and caste are required.');
      }

      const payload = {
        category: form.category,
        area: form.area || null,
        city: form.city || null,
        full_address: form.full_address || null,
        housing_type: form.housing_type,
        father: {
          full_name: form.father_full_name.trim(),
          dob: form.father_dob,
          cnic_or_bform: extractDigits(form.father_cnic_or_bform),
          gender: 'male',
          is_alive: form.father_status === 'alive',
          occupation: form.father_status === 'alive' ? form.father_occupation.trim() : null,
          monthly_income: form.father_status === 'alive' ? Number(form.father_monthly_income) : null,
          religion: form.father_status === 'alive' ? form.father_religion.trim() : null,
          caste: form.father_status === 'alive' ? form.father_caste.trim() : null,
        },
      };

      console.log('Submitting form data:', payload);
      const res = await familiesAPI.create(payload);
      console.log('Registration response:', res.data);
      router.push(`/families/${res.data.family_id}`);
    } catch (e: unknown) {
      console.error('Registration error:', e);
      let errorMsg = 'Failed to register beneficiary.';
      if (e && typeof e === 'object' && 'response' in e) {
        const response = (e as { response: { data?: unknown; status?: number } }).response;
        console.error('Response data:', response?.data);
        console.error('Response status:', response?.status);
        if (response?.data) {
          const data = response.data;
          if (typeof data === 'string') {
            errorMsg = data;
          } else if (typeof data === 'object' && data !== null) {
            if ('detail' in data) {
              const detail = (data as { detail: unknown }).detail;
              if (typeof detail === 'string') {
                errorMsg = detail;
              } else if (typeof detail === 'object' && detail !== null && 'msg' in detail) {
                errorMsg = String((detail as { msg: string }).msg);
              } else if (typeof detail === 'object' && detail !== null && 'type' in detail) {
                errorMsg = String((detail as { msg?: string }).msg || 'Validation error');
              }
            } else if ('message' in data) {
              errorMsg = String((data as { message: string }).message);
            }
          }
        }
      } else if (e instanceof Error) {
        errorMsg = e.message;
      }
      safeSetError(errorMsg);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <Link href="/families" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <ArrowLeft size={14} /> Back to Families
            </Link>
            <h1 style={{ marginTop: 8 }}>Register New Beneficiary</h1>
            <p>Enter family details to begin the beneficiary process</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s} className="step" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className={`step-num ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <div className={`step-label ${i === step ? 'active' : ''}`}>{s}</div>
              {i < STEPS.length - 1 && <div className="step-line" style={{ flex: 1, height: 2, background: i < step ? 'var(--green)' : 'var(--border)', margin: '0 8px' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
        {error && <div style={{ padding: '12px 14px', marginBottom: 16, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>{error}</div>}

        {/* Step 0 — Category */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Select Program Category</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Choose the appropriate program for this family. This cannot be changed after approval.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { value: 'FA', label: 'FA — Financial Aid', desc: 'For general needy families. Donor supports the entire family unit.', color: 'var(--accent)', bg: 'var(--accent-glow)' },
                { value: 'SB', label: 'SB — Saiban Orphan', desc: 'For families with orphaned children. Each orphan tracked individually.', color: 'var(--purple)', bg: 'var(--purple-bg)' },
              ].map(opt => (
                <div key={opt.value} onClick={() => set('category', opt.value)} style={{
                  padding: 20, borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${form.category === opt.value ? opt.color : 'var(--border)'}`,
                  background: form.category === opt.value ? opt.bg : 'var(--bg-secondary)',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{opt.value === 'FA' ? '👨‍👩‍👧‍👦' : '👶'}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: form.category === opt.value ? opt.color : 'var(--text-primary)' }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Basic Info */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Basic Information</h2>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Area / District</label>
                <input className="form-control" value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. Gulshan, Model Town" />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Lahore, Karachi" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Housing Type</label>
              <select className="form-control" value={form.housing_type} onChange={e => set('housing_type', e.target.value)}>
                <option value="rented">Rented</option>
                <option value="owned">Owned</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2 — Address */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Full Address</h2>
            <div className="form-group">
              <label className="form-label">Complete Postal Address</label>
              <textarea className="form-control" value={form.full_address} onChange={e => set('full_address', e.target.value)} placeholder="House #, Street #, Block, Area, City..." rows={4} style={{ resize: 'vertical' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Enter the complete address as it appears on official documents.</p>
            </div>
          </div>
        )}

        {/* Step 3 — Father (Head) */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Father (Family Head)</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
              Family registration requires father to be added as head first. Other members can be added later.
            </p>
            <div className="form-group">
              <label className="form-label">Father Full Name *</label>
              <input className="form-control" value={form.father_full_name} onChange={e => set('father_full_name', e.target.value)} placeholder="Enter father full name" />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input type="date" className="form-control" value={form.father_dob} onChange={e => set('father_dob', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Father Status *</label>
                <select className="form-control" value={form.father_status} onChange={e => set('father_status', e.target.value)}>
                  <option value="alive">Alive</option>
                  <option value="dead">Dead</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">CNIC / B-Form *</label>
              <input
                className="form-control"
                value={form.father_cnic_or_bform}
                onChange={e => set('father_cnic_or_bform', formatCnicOrBForm(e.target.value))}
                placeholder="12345-1234567-1 or 12345-1234567-123"
              />
            </div>
            {form.father_status === 'alive' && (
              <>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Occupation *</label>
                    <input className="form-control" value={form.father_occupation} onChange={e => set('father_occupation', e.target.value)} placeholder="e.g. Driver, Laborer" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly Income *</label>
                    <input type="number" min={0} className="form-control" value={form.father_monthly_income} onChange={e => set('father_monthly_income', e.target.value)} placeholder="e.g. 45000" />
                  </div>
                </div>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Religion *</label>
                    <input className="form-control" value={form.father_religion} onChange={e => set('father_religion', e.target.value)} placeholder="e.g. Islam" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Caste *</label>
                    <input className="form-control" value={form.father_caste} onChange={e => set('father_caste', e.target.value)} placeholder="e.g. Syed" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Review & Submit</h2>
            <div className="info-grid" style={{ marginBottom: 20 }}>
              <div className="info-item"><label>Program</label><p>{form.category === 'FA' ? 'FA — Financial Aid' : 'SB — Saiban Orphan'}</p></div>
              <div className="info-item"><label>Area</label><p>{form.area || '—'}</p></div>
              <div className="info-item"><label>City</label><p>{form.city || '—'}</p></div>
              <div className="info-item"><label>Housing</label><p style={{ textTransform: 'capitalize' }}>{form.housing_type}</p></div>
              <div className="info-item"><label>Father (Head)</label><p>{form.father_full_name || '—'}</p></div>
              <div className="info-item"><label>Father Status</label><p style={{ textTransform: 'capitalize' }}>{form.father_status || '—'}</p></div>
              <div className="info-item"><label>Father CNIC/B-Form</label><p>{form.father_cnic_or_bform || '—'}</p></div>
              {form.father_status === 'alive' && <div className="info-item"><label>Father Occupation</label><p>{form.father_occupation || '—'}</p></div>}
              {form.father_status === 'alive' && <div className="info-item"><label>Father Monthly Income</label><p>{form.father_monthly_income || '—'}</p></div>}
              {form.father_status === 'alive' && <div className="info-item"><label>Father Religion</label><p>{form.father_religion || '—'}</p></div>}
              {form.father_status === 'alive' && <div className="info-item"><label>Father Caste</label><p>{form.father_caste || '—'}</p></div>}
            </div>
            <div className="info-item"><label>Full Address</label><p>{form.full_address || '—'}</p></div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            <ArrowLeft size={14} /> Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceedToNextStep()}>
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Registering…</> : <><CheckCircle size={14} /> Register Beneficiary</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
