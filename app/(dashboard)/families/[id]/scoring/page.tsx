'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { scoringAPI, assessmentsAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { Star, Calculator, AlertTriangle } from 'lucide-react';

interface AssessmentSummary {
  assessment_id: string;
  assessment_date?: string;
  status: string;
}

type CriteriaRow = {
  rawKey: string;
  name: string;
  earned: number;
  max: number;
  weight?: number;
  fallback?: boolean;
  details?: Record<string, unknown> | null;
};

function humanizeCriterionKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function humanizeDetailKey(key: string): string {
  return humanizeCriterionKey(key);
}

function isMoneyDetailKey(key: string): boolean {
  return /income|asset|gold|silver|cash|property|expense|fee|amount|rent|ration|bills|aid/i.test(key);
}

function formatDetailScalar(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (isMoneyDetailKey(key)) return `PKR ${value.toLocaleString('en-PK')}`;
    return String(value);
  }
  if (typeof value === 'string') return value || '—';
  return JSON.stringify(value);
}

function ScoringCriterionMatrices({ details }: { details: Record<string, unknown> }) {
  const entries = Object.entries(details).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) {
    return <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>No underlying data returned for this line item.</p>;
  }

  const nodes: ReactNode[] = [];

  for (const [key, value] of entries) {
    if (key === 'members' && Array.isArray(value)) {
      const rows = value as Array<Record<string, unknown>>;
      nodes.push(
        <div key={key} style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            {humanizeDetailKey(key)}
          </div>
          <div className="table-wrap" style={{ borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table className="mobile-stack-table" style={{ fontSize: 12, width: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Relationship</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Orphan</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Child</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m, i) => (
                  <tr key={i}>
                    <td data-label="Name" style={{ padding: '8px 10px' }}>{String(m.name ?? '—')}</td>
                    <td data-label="Relationship" style={{ padding: '8px 10px' }}>{String(m.relationship ?? '—')}</td>
                    <td data-label="Orphan" style={{ padding: '8px 10px' }}>{m.is_orphan ? 'Yes' : 'No'}</td>
                    <td data-label="Child" style={{ padding: '8px 10px' }}>{m.is_child ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>,
      );
      continue;
    }

    if ((key === 'orphans' || key === 'income_sources') && Array.isArray(value)) {
      const rows = value as Array<Record<string, unknown>>;
      nodes.push(
        <div key={key} style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            {humanizeDetailKey(key)}
          </div>
          <div className="table-wrap" style={{ borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table className="mobile-stack-table" style={{ fontSize: 12, width: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)' }}>
                  {rows[0] ? Object.keys(rows[0]).map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px' }}>{humanizeDetailKey(h)}</th>
                  )) : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {Object.entries(row).map(([cellKey, cellVal]) => (
                      <td key={cellKey} data-label={humanizeDetailKey(cellKey)} style={{ padding: '8px 10px' }}>
                        {typeof cellVal === 'number' && isMoneyDetailKey(cellKey)
                          ? `PKR ${cellVal.toLocaleString('en-PK')}`
                          : String(cellVal ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>,
      );
      continue;
    }

    if (Array.isArray(value)) {
      nodes.push(
        <div key={key} style={{ marginTop: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--text-muted)' }}>{humanizeDetailKey(key)}:</span>{' '}
          <span>{value.length === 0 ? '—' : JSON.stringify(value)}</span>
        </div>,
      );
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      nodes.push(
        <div key={key} style={{ marginTop: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--text-muted)' }}>{humanizeDetailKey(key)}:</span>{' '}
          <code style={{ fontSize: 11, wordBreak: 'break-all' }}>{JSON.stringify(value)}</code>
        </div>,
      );
      continue;
    }

    nodes.push(
      <div key={key} className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 6, fontSize: 12, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-muted)' }}>{humanizeDetailKey(key)}</span>
        <span style={{ fontWeight: 500, textAlign: 'right' }}>{formatDetailScalar(key, value)}</span>
      </div>,
    );
  }

  return <div>{nodes}</div>;
}

type InactiveYouthDq = {
  code?: string;
  message?: string;
  violators?: Array<{ full_name: string; age_completed_years: number; studying: boolean; working: boolean }>;
};

export default function FamilyScoringPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [score, setScore] = useState(0);
  const [scoreId, setScoreId] = useState('');
  const [eligibilityStatus, setEligibilityStatus] = useState('need_review');
  const [criteriaRows, setCriteriaRows] = useState<CriteriaRow[]>([]);
  const [disqualifications, setDisqualifications] = useState<Record<string, InactiveYouthDq> | null>(null);
  const [overrideRemarks, setOverrideRemarks] = useState('');
  const [error, setError] = useState('');
  const [scoreMessage, setScoreMessage] = useState('');

  const applyCalculationResult = useCallback((result: {
    success?: boolean;
    auto_score?: number | null;
    eligibility_status?: string | null;
    score_id?: string | null;
    message?: string;
    scoring_details?: Record<string, unknown> | null;
  }) => {
    if (!result?.success) {
      setError(result?.message || 'Scoring failed. Try Recalculate.');
      setCriteriaRows([]);
      setDisqualifications(null);
      return;
    }
    setError('');
    setScore(result.auto_score ?? 0);
    setEligibilityStatus(result.eligibility_status || 'need_review');
    setScoreId(result.score_id || '');
    setScoreMessage(result.message || '');
    const d = result.scoring_details;
    if (d && typeof d === 'object' && Object.keys(d).length > 0) {
      const dq = d.disqualifications;
      setDisqualifications(dq && typeof dq === 'object' ? (dq as Record<string, InactiveYouthDq>) : null);
      const critEntries = Object.entries(d).filter(([k]) => k !== 'disqualifications');
      setCriteriaRows(
        critEntries.map(([name, v]) => {
          const row = v as {
            score?: number;
            max_possible?: number;
            fallback?: boolean;
            weight?: number;
            details?: Record<string, unknown> | null;
          };
          const det = row.details;
          return {
            rawKey: name,
            name: humanizeCriterionKey(name),
            earned: row?.score ?? 0,
            max: row?.max_possible ?? 0,
            weight: typeof row.weight === 'number' ? row.weight : undefined,
            fallback: Boolean(row?.fallback),
            details: det && typeof det === 'object' && Object.keys(det).length > 0 ? det : null,
          };
        }),
      );
    } else {
      setCriteriaRows([]);
      setDisqualifications(null);
    }
  }, []);

  useEffect(() => {
    assessmentsAPI.list({ family_id: id }).then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setAssessments(data);

      const latestAssessment = data[0];
      if (!latestAssessment?.assessment_id) return;
      const loadScoreForStatuses = ['submitted', 'scored', 'approved', 'rejected', 'reassessment_required'];
      if (loadScoreForStatuses.includes(latestAssessment.status)) {
        scoringAPI.calculate(latestAssessment.assessment_id, false).then(({ data: result }) => {
          applyCalculationResult(result);
        }).catch(() => {
          setError('Unable to load scoring result.');
        });
      }
    }).catch(() => {
      setAssessments([]);
    }).finally(() => setFetchLoading(false));
  }, [id, applyCalculationResult]);

  const currentAssessment = assessments[0];

  if (fetchLoading) return <FamilySubPageSkeleton variant="detail" />;

  const calculateScore = async (recalculate = true) => {
    if (!currentAssessment?.assessment_id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await scoringAPI.calculate(currentAssessment.assessment_id, recalculate);
      applyCalculationResult(data);
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
        applyCalculationResult(data);
        if (data?.success && data.score_id) {
          resultId = data.score_id;
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
            {disqualifications?.inactive_youth && (
              <div
                style={{
                  padding: '14px 16px',
                  marginBottom: 16,
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <AlertTriangle size={18} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ color: 'var(--red)' }}>Disqualification: inactive youth</strong>
                    <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.45 }}>
                      {disqualifications.inactive_youth.message}
                    </p>
                    {disqualifications.inactive_youth.violators && disqualifications.inactive_youth.violators.length > 0 && (
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--text-primary)' }}>
                        {disqualifications.inactive_youth.violators.map(v => (
                          <li key={v.full_name + v.age_completed_years}>
                            {v.full_name} — age {v.age_completed_years}, studying: {v.studying ? 'yes' : 'no'}, working: {v.working ? 'yes' : 'no'}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                      Update member profiles under Family → Members (school/class or occupation/income). Exemptions: marked disabled or patient.
                    </p>
                  </div>
                </div>
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
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Scoring breakdown</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.45 }}>
                Each line shows points earned vs cap for that factor. Expand a row to see the figures and member lists used in the calculation.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {criteriaRows.length > 0 ? (
                  criteriaRows.map(row => (
                    <details
                      key={row.rawKey}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        background: 'var(--bg-secondary)',
                        overflow: 'hidden',
                      }}
                    >
                      <summary
                        style={{
                          cursor: 'pointer',
                          listStyle: 'none',
                          padding: '12px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        <span style={{ minWidth: 0, textAlign: 'left' }}>
                          {row.name}
                          {row.fallback ? <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}> (default rubric)</span> : null}
                          {row.weight != null && row.weight > 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}> · weight {row.weight}%</span>
                          ) : null}
                        </span>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>{row.earned} / {row.max}</span>
                      </summary>
                      <div
                        style={{
                          padding: '12px 14px 14px',
                          borderTop: '1px solid var(--border)',
                          background: 'var(--bg-card)',
                        }}
                      >
                        {row.details
                          ? <ScoringCriterionMatrices details={row.details} />
                          : (
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                              Recalculate with a full assessment to refresh underlying metrics, or this criterion did not emit detail fields.
                            </p>
                          )}
                      </div>
                    </details>
                  ))
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                      Use <strong>Recalculate</strong> to load a fresh breakdown, or configure criteria under Scoring.
                    </p>
                    <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                      <span>Income assessment</span>
                      <span style={{ fontWeight: 600 }}>up to 30</span>
                    </div>
                    <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                      <span>Family size</span>
                      <span style={{ fontWeight: 600 }}>up to 20</span>
                    </div>
                    <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                      <span>Housing</span>
                      <span style={{ fontWeight: 600 }}>up to 20</span>
                    </div>
                    <div className="kv-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                      <span>Assets &amp; monthly expense need</span>
                      <span style={{ fontWeight: 600 }}>up to 30</span>
                    </div>
                  </>
                )}
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
