'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { approvalsAPI, assessmentsAPI, scoringAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { CheckSquare, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

interface AssessmentSummary {
  assessment_id: string;
  assessment_date?: string;
  status: string;
}

type ScoreSnapshot = {
  score: number;
  eligibility: string;
  scoreId: string;
};
type ScoreSnapshotEntry = readonly [string, ScoreSnapshot];

const SCORING_COMPLETED_STATUSES = ['scored', 'approved', 'rejected', 'reassessment_required'];
const FINAL_DECISION_STATUSES = ['approved', 'rejected', 'reassessment_required'];

function formatWorkflowErrorDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object' && 'message' in detail) {
    const o = detail as {
      message: string;
      violators?: Array<{ full_name: string; age_completed_years: number }>;
    };
    let s = o.message;
    if (o.violators?.length) {
      s += ` (${o.violators.map(v => `${v.full_name}, ${v.age_completed_years}y`).join('; ')})`;
    }
    return s;
  }
  return 'Failed to submit decision';
}

export default function FamilyApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [scoreSnapshots, setScoreSnapshots] = useState<Record<string, ScoreSnapshot>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    assessmentsAPI.list({ family_id: id }).then(async (r) => {
      const list = Array.isArray(r.data) ? r.data : [];
      setAssessments(list);

      const scoringRelevant = list.filter((assessment) =>
        SCORING_COMPLETED_STATUSES.includes(assessment.status)
      );
      const snapshotEntries = await Promise.all(
        scoringRelevant.map(async (assessment) => {
          try {
            const { data } = await scoringAPI.calculate(assessment.assessment_id, false);
            if (!data?.success || !data?.score_id) return null;
            return [
              assessment.assessment_id,
              {
                score: data.auto_score ?? 0,
                eligibility: data.eligibility_status ?? 'need_review',
                scoreId: data.score_id,
              } as ScoreSnapshot,
            ] as const;
          } catch {
            return null;
          }
        })
      );

      const validSnapshotEntries = snapshotEntries.filter(
        (entry): entry is ScoreSnapshotEntry => entry !== null
      );
      setScoreSnapshots(Object.fromEntries(validSnapshotEntries));
    }).catch(() => {
      setAssessments([]);
      setScoreSnapshots({});
    }).finally(() => setFetchLoading(false));
  }, [id]);

  const latestAssessment = assessments[0];
  const hasScoringEvidence = assessments.some((a) => SCORING_COMPLETED_STATUSES.includes(a.status));
  const alreadyFinalized = !!latestAssessment && FINAL_DECISION_STATUSES.includes(latestAssessment.status);
  const targetAssessment = assessments.find((a) => a.status === 'scored');

  const submitDecision = async () => {
    if (!decision) {
      alert('Please select a decision');
      return;
    }
    if (!targetAssessment?.assessment_id) {
      setError('No scored assessment available for approval decision.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await approvalsAPI.decide(targetAssessment.assessment_id, { decision, remarks: notes || undefined });
      router.push(`/families/${id}`);
    } catch (e: unknown) {
      console.error('Error submitting decision:', e);
      let msg = 'Failed to submit decision';
      if (e && typeof e === 'object' && 'response' in e) {
        const d = (e as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
        msg = formatWorkflowErrorDetail(d);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <FamilySubPageSkeleton variant="detail" />;

  return (
    <div>
      <div className="family-header-row">
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
            {!hasScoringEvidence && (
              <div style={{ padding: 12, marginBottom: 16, background: 'var(--yellow-bg)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: 'var(--yellow)' }}>
                Latest assessment is not scored yet. Complete scoring before approval.
              </div>
            )}
            {alreadyFinalized && (
              <div style={{ padding: 12, marginBottom: 16, background: 'var(--accent-glow)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, color: 'var(--text-secondary)' }}>
                Latest assessment is already <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{latestAssessment.status.replace(/_/g, ' ')}</strong>.
                It was scored first; decision form is now read-only.
              </div>
            )}
            {error && (
              <div style={{ padding: 12, marginBottom: 16, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Assessment Summary</h3>
              {assessments.map(a => (
                <div key={a.assessment_id} style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 12 }}>
                  <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Assessment ID</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>{a.assessment_id.slice(0, 8)}…</span>
                  </div>
                  <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                    <span>{a.assessment_date ? new Date(a.assessment_date).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                    <span className={`badge badge-${a.status === 'approved' ? 'green' : a.status === 'rejected' ? 'red' : 'gray'}`}>
                      {a.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {scoreSnapshots[a.assessment_id] && (
                    <>
                      <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Saved score</span>
                        <span>{scoreSnapshots[a.assessment_id].score} / 100</span>
                      </div>
                      <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Eligibility</span>
                        <span style={{ textTransform: 'capitalize' }}>{scoreSnapshots[a.assessment_id].eligibility.replace(/_/g, ' ')}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Approval Decision</h3>
              <div className="form-grid form-grid-3">
                <button
                  onClick={() => setDecision('approved')}
                  className={`btn ${decision === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={alreadyFinalized}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}
                >
                  <CheckCircle size={24} style={{ color: decision === 'approved' ? 'white' : 'var(--green)' }} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => setDecision('rejected')}
                  className={`btn ${decision === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={alreadyFinalized}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}
                >
                  <XCircle size={24} style={{ color: decision === 'rejected' ? 'white' : 'var(--red)' }} />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => setDecision('reassessment')}
                  className={`btn ${decision === 'reassessment' ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={alreadyFinalized}
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
                  disabled={alreadyFinalized}
                  placeholder="Enter justification for this decision..."
                />
              </div>
            </div>

            <div className="family-summary-actions">
              <button onClick={submitDecision} disabled={loading || !decision || !targetAssessment || alreadyFinalized} className="btn btn-primary" style={{ flex: 1 }}>
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
