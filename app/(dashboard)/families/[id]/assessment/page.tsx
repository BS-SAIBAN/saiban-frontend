'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { assessmentsAPI, individualsAPI } from '@/lib/api';
import { ArrowLeft, Save, ClipboardList, User, Home, DollarSign, FileText, AlertCircle } from 'lucide-react';

export default function FamilyAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState({
    assessment_date: new Date().toISOString().split('T')[0],
    gps_lat: '',
    gps_lng: '',
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

  useEffect(() => {
    individualsAPI.list(id).then(r => {
      setMembers(Array.isArray(r.data) ? r.data : []);
    });
  }, [id]);

  const submit = async () => {
    setLoading(true);
    try {
      await assessmentsAPI.create({ ...form, family_id: id });
      router.push(`/families/${id}`);
    } catch (e) {
      console.error('Error creating assessment:', e);
      alert('Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <Link href={`/families/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Family
        </Link>
        <div style={{ marginTop: 8 }}>
          <h1>Family Assessment</h1>
          <p>Conduct needs assessment for this family</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 24, padding: 16, background: 'var(--accent-glow)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={20} style={{ color: 'var(--accent)' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--accent)' }}>Assessment Guidelines</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Complete all sections accurately. This data will be used for scoring and approval decisions.</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} /> Assessment Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Assessment Date</label>
              <input type="date" className="form-control" value={form.assessment_date} onChange={e => setForm(prev => ({ ...prev, assessment_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Field Worker Companion</label>
              <input className="form-control" value={form.field_worker_companion} onChange={e => setForm(prev => ({ ...prev, field_worker_companion: e.target.value }))} placeholder="Name of companion" />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={16} /> Assets Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Gold/Silver Assets (PKR)</label>
              <input type="number" className="form-control" value={form.assets_gold_silver} onChange={e => setForm(prev => ({ ...prev, assets_gold_silver: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Cash Assets (PKR)</label>
              <input type="number" className="form-control" value={form.assets_cash} onChange={e => setForm(prev => ({ ...prev, assets_cash: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Property Assets (PKR)</label>
              <input type="number" className="form-control" value={form.assets_property} onChange={e => setForm(prev => ({ ...prev, assets_property: Number(e.target.value) }))} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Home size={16} /> Monthly Expenses
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Ration (PKR)</label>
              <input type="number" className="form-control" value={form.monthly_ration} onChange={e => setForm(prev => ({ ...prev, monthly_ration: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Bills (PKR)</label>
              <input type="number" className="form-control" value={form.monthly_bills} onChange={e => setForm(prev => ({ ...prev, monthly_bills: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Rent (PKR)</label>
              <input type="number" className="form-control" value={form.monthly_rent} onChange={e => setForm(prev => ({ ...prev, monthly_rent: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Other (PKR)</label>
              <input type="number" className="form-control" value={form.other_monthly_expenses} onChange={e => setForm(prev => ({ ...prev, other_monthly_expenses: Number(e.target.value) }))} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} /> Other Aid Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Aid from Other Organizations</label>
              <select className="form-control" value={form.aid_from_other_org ? 'true' : 'false'} onChange={e => setForm(prev => ({ ...prev, aid_from_other_org: e.target.value === 'true' }))}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Other Org Aid Amount (PKR)</label>
              <input type="number" className="form-control" value={form.other_org_aid_amount} onChange={e => setForm(prev => ({ ...prev, other_org_aid_amount: Number(e.target.value) }))} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={16} /> Previous Registration
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Previously Registered</label>
              <select className="form-control" value={form.prev_registered ? 'true' : 'false'} onChange={e => setForm(prev => ({ ...prev, prev_registered: e.target.value === 'true' }))}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Previous Aid Amount (PKR)</label>
              <input type="number" className="form-control" value={form.prev_aid_amount} onChange={e => setForm(prev => ({ ...prev, prev_aid_amount: Number(e.target.value) }))} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} /> Notes
          </h3>
          <div className="form-group">
            <label className="form-label">Field Worker Notes</label>
            <textarea className="form-control" rows={3} value={form.field_worker_notes} onChange={e => setForm(prev => ({ ...prev, field_worker_notes: e.target.value }))} placeholder="Enter field worker observations..." />
          </div>
          <div className="form-group">
            <label className="form-label">Additional Information</label>
            <textarea className="form-control" rows={3} value={form.additional_info} onChange={e => setForm(prev => ({ ...prev, additional_info: e.target.value }))} placeholder="Enter any additional information..." />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={submit} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
            <Save size={14} /> {loading ? 'Saving...' : 'Submit Assessment'}
          </button>
          <Link href={`/families/${id}`} className="btn btn-secondary">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
