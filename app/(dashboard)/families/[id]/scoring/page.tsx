'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { scoringAPI, assessmentsAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { Star, Calculator } from 'lucide-react';

interface AssessmentSummary {
  assessment_id: string;
  assessment_date?: string;
  status: string;
}

export default function FamilyScoringPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [score, setScore] = useState(0);
  const [scoreId, setScoreId] = useState('');
  const [eligibilityStatus, setEligibilityStatus] = useState('need_review');
  const [overrideRemarks, setOverrideRemarks] = useState('');
  const [error, setError] = useState('');
  const [scoreMessage, setScoreMessage] = useState('');

  useEffect(() => {
    assessmentsAPI.list({ family_id: id }).then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setAssessments(data);

      const latestAssessment = data[0];
      if (!latestAssessment?.assessment_id) return;
      if (['scored', 'approved', 'rejected', 'reassessment_required'].includes(latestAssessment.status)) {
        scoringAPI.calculate(latestAssessment.assessment_id).then(({ data: result }) => {
          if (result?.success) {
            setScore(result.auto_score || 0);
            setEligibilityStatus(result.eligibility_status || 'need_review');
            setScoreId(result.score_id || '');
            setScoreMessage(result.message || '');
          }
        }).catch(() => {
          setError('Unable to load saved scoring result.');
        });
      }
    }).catch(() => {
      setAssessments([]);
    }).finally(() => setFetchLoading(false));
  }, [id]);

  const currentAssessment = assessments[0];

  if (fetchLoading) return <FamilySubPageSkeleton variant="detail" />;

  const calculateScore = async (recalculate = true) => {
    if (!currentAssessment?.assessment_id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await scoringAPI.calculate(currentAssessment.assessment_id, recalculate);
      if (data?.success) {
        setScore(data.auto_score || 0);
        setEligibilityStatus(data.eligibility_status || 'need_review');
        setScoreId(data.score_id || '');
        setScoreMessage(data.message || '');
      }
    } catch (e: unknown) {
      let message = 'Failed to calculate score';
      if (e && typeof e === 'object' && 'response' in e) {
        const response = (e as { response?: { data?: { detail?: string } } }).response;
        if (response?.data?.detail) message = response.data.detail;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async () => {
    setLoading(true);
    setError('');
    try {
      let resultId = scoreId;

      if (!resultId && currentAssessment?.assessment_id) {
        const { data } = await scoringAPI.calculate(currentAssessment.assessment_id, false);
        if (data?.success) {
          resultId = data.score_id || '';
          setScoreId(resultId);
          setScore(data.auto_score || score);
          setEligibilityStatus(data.eligibility_status || eligibilityStatus);
          setScoreMessage(data.message || '');
        }
      }

      if (resultId) {
        await scoringAPI.override(resultId, {
          manual_override_score: score,
          eligibility_status: eligibilityStatus,
          override_remarks: overrideRemarks || undefined,
        });
      }
      router.push(`/families/${id}`);
    } catch (e) {
      console.error('Error submitting score:', e);
      setError('Failed to submit score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="family-header-row">
        <div>
          <h1>Family Scoring</h1>
          <p>Calculate and assign scores to this family</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        {assessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Calculator size={22} /></div>
            <h3>No Assessment Found</h3>
            <p>Complete an assessment first before scoring</p>
            <Link href={`/families/${id}/assessment`} className="btn btn-primary" style={{ marginTop: 16 }}>
              Start Assessment
            </Link>
          </div>
        ) : (
          <>
            {currentAssessment && (
              <div style={{ padding: 12, marginBottom: 16, background: 'var(--accent-glow)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    Assessment status: <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{currentAssessment.status.replace(/_/g, ' ')}</strong>
                  </span>
                  {scoreId && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      Score record: {scoreId.slice(0, 8)}...
                    </span>
                  )}
                </div>
                {['approved', 'rejected', 'reassessment_required'].includes(currentAssessment.status) && (
                  <p style={{ marginTop: 8, marginBottom: 0, color: 'var(--text-secondary)', fontSize: 13 }}>
                    Decision has already been recorded. Displayed score is the saved scoring evidence used in workflow.
                  </p>
                )}
                {scoreMessage && (
                  <p style={{ marginTop: 8, marginBottom: 0, color: 'var(--text-muted)', fontSize: 12 }}>{scoreMessage}</p>
                )}
              </div>
            )}
            {error && (
              <div style={{ padding: '12px 14px', marginBottom: 16, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
                {error}
              </div>
            )}
            <div className="family-summary-cards">
              <div style={{ padding: 20, background: 'var(--accent-glow)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 8 }}>Calculated Score</div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--accent)' }}>{score}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>out of 100</div>
              </div>
              <div style={{ padding: 20, background: 'var(--purple-bg)', borderRadius: 8, border: '1px solid rgba(168, 85, 247, 0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 8 }}>Eligibility Status</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--purple)', textTransform: 'capitalize' }}>{eligibilityStatus.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>Current recommendation</div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Scoring Criteria</h3>
              <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8 }}>
                <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                  <span>Income Assessment</span>
                  <span style={{ fontWeight: 600 }}>30 points</span>
                </div>
                <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                  <span>Family Size</span>
                  <span style={{ fontWeight: 600 }}>20 points</span>
                </div>
                <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                  <span>Housing Condition</span>
                  <span style={{ fontWeight: 600 }}>20 points</span>
                </div>
                <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                  <span>Special Circumstances</span>
                  <span style={{ fontWeight: 600 }}>30 points</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Override Score</h3>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Manual Score</label>
                  <input type="number" className="form-control" value={score} onChange={e => setScore(Number(e.target.value))} max={100} min={0} />
                </div>
                <div className="form-group">
                  <label className="form-label">Eligibility Override</label>
                  <select className="form-control" value={eligibilityStatus} onChange={e => setEligibilityStatus(e.target.value)}>
                    <option value="eligible">Eligible</option>
                    <option value="need_review">Need Review</option>
                    <option value="not_eligible">Not Eligible</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Override Remarks</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={overrideRemarks}
                  onChange={e => setOverrideRemarks(e.target.value)}
                  placeholder="Optional notes explaining the manual override"
                />
              </div>
            </div>

            <div className="family-summary-actions">
              <button onClick={() => calculateScore(true)} className="btn btn-secondary" style={{ flex: 1 }} disabled={loading}>
                <Calculator size={14} /> Recalculate
              </button>
              <button onClick={submitScore} disabled={loading || !currentAssessment?.assessment_id} className="btn btn-primary" style={{ flex: 1 }}>
                <Star size={14} /> {loading ? 'Submitting...' : 'Submit Score'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
