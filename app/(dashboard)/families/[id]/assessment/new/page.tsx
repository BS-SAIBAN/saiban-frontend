'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { assessmentsAPI } from '@/lib/api';
import { ArrowLeft, Save, ClipboardList, Calendar, FileText, AlertCircle, MapPin, DollarSign, Home, User } from 'lucide-react';

export default function NewAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    assessment_date: new Date().toISOString().split('T')[0],
    gps_lat: '',
    gps_lng: '',
    deceased_spouse_date_of_death: '',
    assets_gold_silver: 0,
    assets_cash: 0,
    assets_property: 0,
    aid_from_other_org: false,
    other_org_aid_amount: 0,
    monthly_ration: 0,
    monthly_bills: 0,
    monthly_rent: 0,
    other_monthly_expenses: 0,
    field_worker_notes: '',
    field_worker_companion: '',
    prev_registered: false,
    prev_aid_amount: 0,
    additional_info: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await assessmentsAPI.create({
        family_id: id,
        assessment_date: form.assessment_date,
        gps_lat: form.gps_lat ? parseFloat(form.gps_lat) : null,
        gps_lng: form.gps_lng ? parseFloat(form.gps_lng) : null,
        deceased_spouse_date_of_death: form.deceased_spouse_date_of_death || null,
        assets_gold_silver: form.assets_gold_silver || 0,
        assets_cash: form.assets_cash || 0,
        assets_property: form.assets_property || 0,
        aid_from_other_org: form.aid_from_other_org,
        other_org_aid_amount: form.other_org_aid_amount || 0,
        monthly_ration: form.monthly_ration || 0,
        monthly_bills: form.monthly_bills || 0,
        monthly_rent: form.monthly_rent || 0,
        other_monthly_expenses: form.other_monthly_expenses || 0,
        field_worker_notes: form.field_worker_notes,
        field_worker_companion: form.field_worker_companion,
        prev_registered: form.prev_registered,
        prev_aid_amount: form.prev_aid_amount || 0,
        additional_info: form.additional_info,
      });
      router.push(`/families/${id}/assessment`);
    } catch (err: unknown) {
      if (typeof err === 'string') {
        setError(err);
      } else if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response as { data?: { detail?: string } };
        setError(response.data?.detail || 'Failed to create assessment');
      } else {
        setError('Failed to create assessment');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href={`/families/${id}/assessment`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Assessment
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClipboardList size={24} /> New Assessment
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Conduct a new assessment for this family
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: 12, borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', marginBottom: 16, fontWeight: 600 }}>Basic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                  <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Assessment Date
                </label>
                <input
                  type="date"
                  value={form.assessment_date}
                  onChange={(e) => setForm({ ...form, assessment_date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                  <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  GPS Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={form.gps_lat}
                  onChange={(e) => setForm({ ...form, gps_lat: e.target.value })}
                  placeholder="-90 to 90"
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                  <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  GPS Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={form.gps_lng}
                  onChange={(e) => setForm({ ...form, gps_lng: e.target.value })}
                  placeholder="-180 to 180"
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Assets */}
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', marginBottom: 16, fontWeight: 600 }}>
              <DollarSign size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Assets (PKR)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Gold & Silver</label>
                <input
                  type="number"
                  min="0"
                  value={form.assets_gold_silver}
                  onChange={(e) => setForm({ ...form, assets_gold_silver: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Cash</label>
                <input
                  type="number"
                  min="0"
                  value={form.assets_cash}
                  onChange={(e) => setForm({ ...form, assets_cash: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Property Value</label>
                <input
                  type="number"
                  min="0"
                  value={form.assets_property}
                  onChange={(e) => setForm({ ...form, assets_property: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', marginBottom: 16, fontWeight: 600 }}>
              <DollarSign size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Monthly Expenses (PKR)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Ration</label>
                <input
                  type="number"
                  min="0"
                  value={form.monthly_ration}
                  onChange={(e) => setForm({ ...form, monthly_ration: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Bills (Utilities)</label>
                <input
                  type="number"
                  min="0"
                  value={form.monthly_bills}
                  onChange={(e) => setForm({ ...form, monthly_bills: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                  <Home size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Rent
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.monthly_rent}
                  onChange={(e) => setForm({ ...form, monthly_rent: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Other Expenses</label>
                <input
                  type="number"
                  min="0"
                  value={form.other_monthly_expenses}
                  onChange={(e) => setForm({ ...form, other_monthly_expenses: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Other Organization Aid */}
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', marginBottom: 16, fontWeight: 600 }}>Other Organization Aid</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.aid_from_other_org}
                  onChange={(e) => setForm({ ...form, aid_from_other_org: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontWeight: 500, fontSize: '13px' }}>Receiving aid from other organizations</span>
              </label>
            </div>
            {form.aid_from_other_org && (
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Monthly Aid Amount (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={form.other_org_aid_amount}
                  onChange={(e) => setForm({ ...form, other_org_aid_amount: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}
          </div>

          {/* Previous Registration */}
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', marginBottom: 16, fontWeight: 600 }}>Previous Registration</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.prev_registered}
                  onChange={(e) => setForm({ ...form, prev_registered: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontWeight: 500, fontSize: '13px' }}>Previously registered with Saiban</span>
              </label>
            </div>
            {form.prev_registered && (
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Previous Aid Amount (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={form.prev_aid_amount}
                  onChange={(e) => setForm({ ...form, prev_aid_amount: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}
          </div>

          {/* Field Worker Information */}
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', marginBottom: 16, fontWeight: 600 }}>
              <User size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Field Worker Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Companion Name</label>
                <input
                  type="text"
                  value={form.field_worker_companion}
                  onChange={(e) => setForm({ ...form, field_worker_companion: e.target.value })}
                  placeholder="Name of field worker companion"
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Deceased Spouse Date of Death</label>
                <input
                  type="date"
                  value={form.deceased_spouse_date_of_death}
                  onChange={(e) => setForm({ ...form, deceased_spouse_date_of_death: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '14px', marginBottom: 16, fontWeight: 600 }}>
              <FileText size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Notes & Observations
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Field Worker Notes</label>
              <textarea
                value={form.field_worker_notes}
                onChange={(e) => setForm({ ...form, field_worker_notes: e.target.value })}
                rows={4}
                placeholder="Enter field worker notes, observations, and findings..."
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Additional Information</label>
              <textarea
                value={form.additional_info}
                onChange={(e) => setForm({ ...form, additional_info: e.target.value })}
                rows={4}
                placeholder="Any additional information..."
                style={{
                  width: '100%',
                  padding: 10,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Link
              href={`/families/${id}/assessment`}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} /> {loading ? 'Creating...' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
