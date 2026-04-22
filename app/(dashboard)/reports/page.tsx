'use client';

import { useEffect, useState } from 'react';
import { reportsAPI } from '@/lib/api';
import { FileText, Plus, Search, X } from 'lucide-react';

interface Report {
  report_id: string; family_id: string; individual_id?: string;
  report_type: string; report_period_start: string; report_period_end: string;
  status: string; educational_progress?: string; health_status?: string; submitted_by?: string;
}

const emptyForm = {
  family_id: '', individual_id: '', report_type: 'monthly',
  report_period_start: '', report_period_end: '',
  educational_progress: '', health_status: '', financial_assistance_usage: '',
  challenges_faced: '', achievements: '', recommendations: '', next_steps: '',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    reportsAPI.list().then(r => setReports(Array.isArray(r.data) ? r.data : [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await reportsAPI.create(form); setShowModal(false); setForm(emptyForm); load(); }
    catch { /* handled */ } finally { setSaving(false); }
  };

  const statusColor: Record<string, string> = { pending: 'yellow', submitted: 'blue', reviewed: 'green' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Progress Reports</h1><p>SB orphan progress reports — mandatory every 6 months</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Submit Report</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Type</th>
                <th>Period</th>
                <th>Status</th>
                <th>Educational Progress</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><FileText size={22} /></div>
                    <h3>No reports submitted</h3>
                    <p>Progress reports are mandatory for SB orphans every 6 months.</p>
                  </div>
                </td></tr>
              ) : reports.map(r => (
                <tr key={r.report_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)' }}>{r.report_id?.slice(0, 8)}…</td>
                  <td><span className="badge badge-blue">{r.report_type}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {r.report_period_start ? new Date(r.report_period_start).toLocaleDateString() : '—'} →{' '}
                    {r.report_period_end ? new Date(r.report_period_end).toLocaleDateString() : '—'}
                  </td>
                  <td><span className={`badge badge-${statusColor[r.status] || 'gray'}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.educational_progress || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.health_status || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Progress Report</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Family ID *</label>
                  <input className="form-control" value={form.family_id} onChange={e => set('family_id', e.target.value)} placeholder="UUID of family" />
                </div>
                <div className="form-group">
                  <label className="form-label">Individual ID (Orphan)</label>
                  <input className="form-control" value={form.individual_id} onChange={e => set('individual_id', e.target.value)} placeholder="UUID of orphan (SB only)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Report Type</label>
                  <select className="form-control" value={form.report_type} onChange={e => set('report_type', e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannual">Biannual</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Period Start</label>
                  <input className="form-control" type="date" value={form.report_period_start} onChange={e => set('report_period_start', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Period End</label>
                  <input className="form-control" type="date" value={form.report_period_end} onChange={e => set('report_period_end', e.target.value)} />
                </div>
              </div>
              {[
                { key: 'educational_progress', label: 'Educational Progress' },
                { key: 'health_status', label: 'Health Status' },
                { key: 'financial_assistance_usage', label: 'Financial Assistance Usage' },
                { key: 'challenges_faced', label: 'Challenges Faced' },
                { key: 'achievements', label: 'Achievements' },
                { key: 'recommendations', label: 'Recommendations' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <textarea className="form-control" value={(form as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)} rows={2} placeholder={f.label} />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.family_id}>
                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Submitting…</> : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
