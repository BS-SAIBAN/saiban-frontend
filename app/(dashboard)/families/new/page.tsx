'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { familiesAPI } from '@/lib/api';
import { extractCnicDigits, formatCnicOrBForm } from '@/lib/cnicFormat';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = ['Basic Info', 'Address', 'Applicant', 'Review'];

/** New families register without choosing FA/SB; category defaults to FA. SB (Saiban guardianship) is set later when applicable (e.g. Edit Family). */
const DEFAULT_FAMILY_CATEGORY = 'FA' as const;

export default function NewFamilyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState({
    area: '', city: '', full_address: '', housing_type: 'rented',
    applicant_full_name: '', applicant_dob: '', applicant_cnic_or_bform: '', applicant_contact_number: '', applicant_relationship: 'head',
    applicant_gender: 'male',
    applicant_occupation: '', applicant_monthly_income: '', applicant_religion: '', applicant_caste: '',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const formatContactNumber = (value: string) => {
    // Keep digits (Pakistan mobile is usually 11 digits, but allow 10-15).
    // Store without spaces/hyphens; formatting can be improved later if needed.
    return value.replace(/\D/g, '').slice(0, 15);
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

  const canProceedToNextStep = () => {
    if (step === 2) {
      return Boolean(
        form.applicant_full_name.trim() &&
        form.applicant_dob &&
        form.applicant_cnic_or_bform.trim() &&
        form.applicant_contact_number.trim() &&
        form.applicant_relationship &&
        form.applicant_occupation.trim() &&
        form.applicant_monthly_income.trim() &&
        form.applicant_religion.trim() &&
        form.applicant_caste.trim()
      );
    }
    return true;
  };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      if (!form.applicant_full_name.trim() || !form.applicant_dob || !form.applicant_cnic_or_bform.trim() || !form.applicant_relationship) {
        throw new Error('Applicant details are required. Please add the applicant before registration.');
      }
      if (
        !form.applicant_occupation.trim() || !form.applicant_monthly_income.trim() || !form.applicant_religion.trim() || !form.applicant_caste.trim()
      ) {
        throw new Error('Occupation, monthly income, religion and caste are required.');
      }

      const payload = {
        category: DEFAULT_FAMILY_CATEGORY,
        area: form.area || null,
        city: form.city || null,
        full_address: form.full_address || null,
        housing_type: form.housing_type,
        applicant: {
          full_name: form.applicant_full_name.trim(),
          dob: form.applicant_dob,
          cnic_or_bform: extractCnicDigits(form.applicant_cnic_or_bform),
          contact_number: formatContactNumber(form.applicant_contact_number),
          gender: form.applicant_gender,
          relationship_to_head: form.applicant_relationship,
          is_alive: true,
          occupation: form.applicant_occupation.trim(),
          monthly_income: Number(form.applicant_monthly_income),
          religion: form.applicant_religion.trim(),
          caste: form.applicant_caste.trim(),
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
            <h1 style={{ marginTop: 8 }}>New Family Intake</h1>
            <p>Capture initial household data for intake. Comprehensive needs should be completed in assessment.</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="card wizard-step-card">
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

      <div className="card wizard-shell">
        {error && <div style={{ padding: '12px 14px', marginBottom: 16, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>{error}</div>}

        {/* Step 0 — Basic Info */}
        {step === 0 && (
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

        {/* Step 1 — Address */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Full Address</h2>
            <div className="form-group">
              <label className="form-label">Complete Postal Address</label>
              <textarea className="form-control" value={form.full_address} onChange={e => set('full_address', e.target.value)} placeholder="House #, Street #, Block, Area, City..." rows={4} style={{ resize: 'vertical' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Enter the complete address as it appears on official documents.</p>
            </div>
          </div>
        )}

        {/* Step 2 — Father (Head) */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Applicant</h2>
            <div className="form-group">
              <label className="form-label">Applicant Full Name *</label>
              <input className="form-control" value={form.applicant_full_name} onChange={e => set('applicant_full_name', e.target.value)} placeholder="Enter applicant full name" />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input type="date" className="form-control" value={form.applicant_dob} onChange={e => set('applicant_dob', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select className="form-control" value={form.applicant_gender} onChange={e => set('applicant_gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Relationship to Head *</label>
                <select className="form-control" value={form.applicant_relationship} onChange={e => set('applicant_relationship', e.target.value)}>
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
                <label className="form-label">CNIC / B-Form *</label>
                <input
                  className="form-control"
                  value={form.applicant_cnic_or_bform}
                  onChange={e => set('applicant_cnic_or_bform', formatCnicOrBForm(e.target.value))}
                  placeholder="12345-1234567-1 or 12345-1234567-123"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Contact Number *</label>
                <input
                  className="form-control"
                  value={form.applicant_contact_number}
                  onChange={e => set('applicant_contact_number', formatContactNumber(e.target.value))}
                  placeholder="e.g. 03001234567"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Occupation *</label>
                  <input className="form-control" value={form.applicant_occupation} onChange={e => set('applicant_occupation', e.target.value)} placeholder="e.g. Driver, Laborer" />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Income *</label>
                  <input type="number" min={0} className="form-control" value={form.applicant_monthly_income} onChange={e => set('applicant_monthly_income', e.target.value)} placeholder="e.g. 45000" />
                </div>
              </div>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Religion *</label>
                  <input className="form-control" value={form.applicant_religion} onChange={e => set('applicant_religion', e.target.value)} placeholder="e.g. Islam" />
                </div>
                <div className="form-group">
                  <label className="form-label">Caste *</label>
                  <input className="form-control" value={form.applicant_caste} onChange={e => set('applicant_caste', e.target.value)} placeholder="e.g. Syed" />
                </div>
              </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Review & Submit</h2>
            <div className="info-grid" style={{ marginBottom: 20 }}>
              <div className="info-item"><label>Area</label><p>{form.area || '—'}</p></div>
              <div className="info-item"><label>City</label><p>{form.city || '—'}</p></div>
              <div className="info-item"><label>Housing</label><p style={{ textTransform: 'capitalize' }}>{form.housing_type}</p></div>
              <div className="info-item"><label>Applicant</label><p>{form.applicant_full_name || '—'}</p></div>
              <div className="info-item"><label>Relationship to Head</label><p style={{ textTransform: 'capitalize' }}>{form.applicant_relationship || '—'}</p></div>
              <div className="info-item"><label>Applicant CNIC/B-Form</label><p>{form.applicant_cnic_or_bform || '—'}</p></div>
              <div className="info-item"><label>Applicant Contact Number</label><p>{form.applicant_contact_number || '—'}</p></div>
              <div className="info-item"><label>Applicant Occupation</label><p>{form.applicant_occupation || '—'}</p></div>
              <div className="info-item"><label>Applicant Monthly Income</label><p>{form.applicant_monthly_income || '—'}</p></div>
              <div className="info-item"><label>Applicant Religion</label><p>{form.applicant_religion || '—'}</p></div>
              <div className="info-item"><label>Applicant Caste</label><p>{form.applicant_caste || '—'}</p></div>
            </div>
            <div className="info-item"><label>Full Address</label><p>{form.full_address || '—'}</p></div>
          </div>
        )}

        {/* Navigation */}
        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            <ArrowLeft size={14} /> Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceedToNextStep()}>
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving intake…</> : <><CheckCircle size={14} /> Create Intake</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
