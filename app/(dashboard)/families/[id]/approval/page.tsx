'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { approvalsAPI, assessmentsAPI } from '@/lib/api';
import { CheckSquare, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

export default function FamilyApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    assessmentsAPI.list({ family_id: id }).then(r => {
      setAssessments(Array.isArray(r.data) ? r.data : []);
    });
  }, [id]);

  const submitDecision = async () => {
    if (!decision) {
      alert('Please select a decision');
      return;
    }
    setLoading(true);
    try {
      await approvalsAPI.decide(assessments[0]?.assessment_id, { decision, notes });
      router.push(`/families/${id}`);
    } catch (e) {
      console.error('Error submitting decision:', e);
      alert('Failed to submit decision');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1>Family Approval</h1>
          <p>Review and approve or reject this family</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        {assessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={22} /></div>
            <h3>No Assessment Found</h3>
            <p>Complete an assessment and scoring first before approval</p>
            <Link href={`/families/${id}/assessment`} className="btn btn-primary" style={{ marginTop: 16 }}>
              Start Assessment
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Assessment Summary</h3>
              {assessments.map(a => (
                <div key={a.assessment_id} style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Assessment ID</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{a.assessment_id.slice(0, 8)}…</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                    <span>{a.assessment_date ? new Date(a.assessment_date).toLocaleDateString() : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                    <span className={`badge badge-${a.status === 'approved' ? 'green' : a.status === 'rejected' ? 'red' : 'gray'}`}>
                      {a.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Approval Decision</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <button
                  onClick={() => setDecision('approved')}
                  className={`btn ${decision === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}
                >
                  <CheckCircle size={24} style={{ color: decision === 'approved' ? 'white' : 'var(--green)' }} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => setDecision('rejected')}
                  className={`btn ${decision === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}
                >
                  <XCircle size={24} style={{ color: decision === 'rejected' ? 'white' : 'var(--red)' }} />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => setDecision('reassessment')}
                  className={`btn ${decision === 'reassessment' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}
                >
                  <AlertCircle size={24} style={{ color: decision === 'reassessment' ? 'white' : 'var(--yellow)' }} />
                  <span>Reassessment</span>
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Decision Notes</h3>
              <div className="form-group">
                <label className="form-label">Comments</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Enter justification for this decision..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={submitDecision} disabled={loading || !decision} className="btn btn-primary" style={{ flex: 1 }}>
                <CheckSquare size={14} /> {loading ? 'Submitting...' : 'Submit Decision'}
              </button>
              <Link href={`/families/${id}`} className="btn btn-secondary">Cancel</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
