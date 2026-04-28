'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { assessmentsAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { ArrowLeft, Save, Calendar, FileText, AlertCircle, MapPin, DollarSign, Home, User } from 'lucide-react';

export default function EditAssessmentPage() {
  const { id, assessment_id } = useParams<{ id: string; assessment_id: string }>();
  const router = useRouter();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    assessment_date: '',
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
    field_worker_companion: '',
    field_worker_notes: '',
    prev_registered: false,
    prev_aid_amount: 0,
    additional_info: '',
  });

  useEffect(() => {
    assessmentsAPI.get(assessment_id).then((r) => {
      const data = r.data || {};
      setForm({
        assessment_date: data.assessment_date ? String(data.assessment_date).split('T')[0] : '',
        gps_lat: data.gps_lat !== null && data.gps_lat !== undefined ? String(data.gps_lat) : '',
        gps_lng: data.gps_lng !== null && data.gps_lng !== undefined ? String(data.gps_lng) : '',
        deceased_spouse_date_of_death: data.deceased_spouse_date_of_death ? String(data.deceased_spouse_date_of_death).split('T')[0] : '',
        assets_gold_silver: Number(data.assets_gold_silver || 0),
        assets_cash: Number(data.assets_cash || 0),
        assets_property: Number(data.assets_property || 0),
        aid_from_other_org: Boolean(data.aid_from_other_org),
        other_org_aid_amount: Number(data.other_org_aid_amount || 0),
        monthly_ration: Number(data.monthly_ration || 0),
        monthly_bills: Number(data.monthly_bills || 0),
        monthly_rent: Number(data.monthly_rent || 0),
        other_monthly_expenses: Number(data.other_monthly_expenses || 0),
        field_worker_companion: data.field_worker_companion || '',
        field_worker_notes: data.field_worker_notes || '',
        prev_registered: Boolean(data.prev_registered),
        prev_aid_amount: Number(data.prev_aid_amount || 0),
        additional_info: data.additional_info || '',
      });
    }).catch(() => {
      setError('Failed to load assessment');
    }).finally(() => setFetchLoading(false));
  }, [assessment_id]);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await assessmentsAPI.update(assessment_id, {
        assessment_date: form.assessment_date || undefined,
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
        field_worker_companion: form.field_worker_companion || null,
        field_worker_notes: form.field_worker_notes || null,
        prev_registered: form.prev_registered,
        prev_aid_amount: form.prev_aid_amount || 0,
        additional_info: form.additional_info || null,
      });
      router.push(`/families/${id}/assessment/${assessment_id}`);
    } catch (e) {
      console.error('Failed to update assessment:', e);
      setError('Failed to update assessment');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <FamilySubPageSkeleton variant="form" />;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href={`/families/${id}/assessment/${assessment_id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Assessment
        </Link>
      </div>

      <div className="card" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>Edit Assessment</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 18 }}>Update all draft assessment details.</p>

        {error && (
          <div style={{ padding: '12px 14px', marginBottom: 16, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
            {error}
          </div>
        )}

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
                onChange={(e) => setForm(prev => ({ ...prev, assessment_date: e.target.value }))}
                required
                className="form-control"
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
                onChange={(e) => setForm(prev => ({ ...prev, gps_lat: e.target.value }))}
                placeholder="-90 to 90"
                className="form-control"
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
                onChange={(e) => setForm(prev => ({ ...prev, gps_lng: e.target.value }))}
                placeholder="-180 to 180"
                className="form-control"
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
              <input type="number" min="0" value={form.assets_gold_silver} onChange={(e) => setForm(prev => ({ ...prev, assets_gold_silver: parseInt(e.target.value) || 0 }))} className="form-control" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Cash</label>
              <input type="number" min="0" value={form.assets_cash} onChange={(e) => setForm(prev => ({ ...prev, assets_cash: parseInt(e.target.value) || 0 }))} className="form-control" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Property Value</label>
              <input type="number" min="0" value={form.assets_property} onChange={(e) => setForm(prev => ({ ...prev, assets_property: parseInt(e.target.value) || 0 }))} className="form-control" />
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
              <input type="number" min="0" value={form.monthly_ration} onChange={(e) => setForm(prev => ({ ...prev, monthly_ration: parseInt(e.target.value) || 0 }))} className="form-control" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Bills (Utilities)</label>
              <input type="number" min="0" value={form.monthly_bills} onChange={(e) => setForm(prev => ({ ...prev, monthly_bills: parseInt(e.target.value) || 0 }))} className="form-control" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                <Home size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Rent
              </label>
              <input type="number" min="0" value={form.monthly_rent} onChange={(e) => setForm(prev => ({ ...prev, monthly_rent: parseInt(e.target.value) || 0 }))} className="form-control" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Other Expenses</label>
              <input type="number" min="0" value={form.other_monthly_expenses} onChange={(e) => setForm(prev => ({ ...prev, other_monthly_expenses: parseInt(e.target.value) || 0 }))} className="form-control" />
            </div>
          </div>
        </div>

        {/* Other Organization Aid */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '14px', marginBottom: 16, fontWeight: 600 }}>Other Organization Aid</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.aid_from_other_org} onChange={(e) => setForm(prev => ({ ...prev, aid_from_other_org: e.target.checked }))} style={{ width: 16, height: 16 }} />
              <span style={{ fontWeight: 500, fontSize: '13px' }}>Receiving aid from other organizations</span>
            </label>
          </div>
          {form.aid_from_other_org && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Monthly Aid Amount (PKR)</label>
              <input type="number" min="0" value={form.other_org_aid_amount} onChange={(e) => setForm(prev => ({ ...prev, other_org_aid_amount: parseInt(e.target.value) || 0 }))} className="form-control" />
            </div>
          )}
        </div>

        {/* Previous Registration */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '14px', marginBottom: 16, fontWeight: 600 }}>Previous Registration</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.prev_registered} onChange={(e) => setForm(prev => ({ ...prev, prev_registered: e.target.checked }))} style={{ width: 16, height: 16 }} />
              <span style={{ fontWeight: 500, fontSize: '13px' }}>Previously registered with Saiban</span>
            </label>
          </div>
          {form.prev_registered && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Previous Aid Amount (PKR)</label>
              <input type="number" min="0" value={form.prev_aid_amount} onChange={(e) => setForm(prev => ({ ...prev, prev_aid_amount: parseInt(e.target.value) || 0 }))} className="form-control" />
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
              <input type="text" value={form.field_worker_companion} onChange={(e) => setForm(prev => ({ ...prev, field_worker_companion: e.target.value }))} placeholder="Name of field worker companion" className="form-control" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Deceased Spouse Date of Death</label>
              <input type="date" value={form.deceased_spouse_date_of_death} onChange={(e) => setForm(prev => ({ ...prev, deceased_spouse_date_of_death: e.target.value }))} className="form-control" />
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
            <textarea value={form.field_worker_notes} onChange={(e) => setForm(prev => ({ ...prev, field_worker_notes: e.target.value }))} rows={4} placeholder="Enter field worker notes, observations, and findings..." className="form-control" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Additional Information</label>
            <textarea value={form.additional_info} onChange={(e) => setForm(prev => ({ ...prev, additional_info: e.target.value }))} rows={4} placeholder="Any additional information..." className="form-control" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={submit} disabled={loading} className="btn btn-primary">
            <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href={`/families/${id}/assessment/${assessment_id}`} className="btn btn-secondary">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
