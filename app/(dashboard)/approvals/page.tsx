'use client';

import { useEffect, useState } from 'react';
import { approvalsAPI } from '@/lib/api';
import { CheckSquare, X } from 'lucide-react';

interface Approval {
  assessment_id: string;
  family_registration_number: string;
  family_area: string;
  submitted_at?: string;
  score?: number;
  eligibility_status?: string;
  priority?: boolean;
  days_in_queue?: number;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Approval | null>(null);
  const [decision, setDecision] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    approvalsAPI.queue().then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setApprovals(data);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const decide = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await approvalsAPI.decide(selected.assessment_id, { decision, remarks });
      setSelected(null); setDecision(''); setRemarks('');
      load();
    } catch { /* handled */ } finally { setSaving(false); }
  };

  const openReview = async (approval: Approval) => setSelected(approval);

  return (
    <div>
      <div className="page-header">
        <div><h1>Approvals</h1><p>Review scored assessments and make approval decisions</p></div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Assessment ID</th>
                <th>Family Reg. #</th>
                <th>Area</th>
                <th>Score</th>
                <th>Eligibility</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : approvals.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><CheckSquare size={22} /></div>
                    <h3>No approvals pending</h3>
                    <p>All assessments have been reviewed.</p>
                  </div>
                </td></tr>
              ) : approvals.map(a => (
                  <tr key={a.assessment_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)' }}>{a.assessment_id.slice(0, 8)}…</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.family_registration_number || '—'}</td>
                    <td>{a.family_area || '—'}</td>
                    <td>{a.score ?? '—'}</td>
                    <td>{a.eligibility_status ? <span className="badge badge-blue">{a.eligibility_status.replace(/_/g, ' ')}</span> : '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => openReview(a)}>
                        <CheckSquare size={12} /> Review
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Make Approval Decision</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 20, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assessment ID</div>
                <div style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: 14 }}>{selected.assessment_id}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Decision *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { value: 'approved', label: '✅ Approve', color: 'var(--green)' },
                    { value: 'rejected', label: '❌ Reject', color: 'var(--red)' },
                    { value: 'reassessment', label: '🔄 Reassess', color: 'var(--yellow)' },
                  ].map(opt => (
                    <button key={opt.value} className={`btn btn-sm`} onClick={() => setDecision(opt.value)} style={{
                      flex: 1, justifyContent: 'center',
                      background: decision === opt.value ? opt.color + '20' : 'var(--bg-secondary)',
                      border: `1px solid ${decision === opt.value ? opt.color : 'var(--border)'}`,
                      color: decision === opt.value ? opt.color : 'var(--text-secondary)',
                    }}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks *</label>
                <textarea className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Provide justification for your decision (minimum 20 characters)…" rows={4} />
                <div style={{ fontSize: 11, color: remarks.length < 20 ? 'var(--red)' : 'var(--green)', marginTop: 4 }}>
                  {remarks.length}/20 characters minimum
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={decide} disabled={saving || !decision || remarks.length < 20}>
                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Submitting…</> : 'Submit Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
