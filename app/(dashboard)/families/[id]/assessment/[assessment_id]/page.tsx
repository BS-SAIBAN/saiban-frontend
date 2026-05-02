'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { assessmentsAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { ArrowLeft, ClipboardList, Calendar, FileText, Edit, Trash2, AlertCircle, MapPin } from 'lucide-react';

interface Assessment {
  assessment_id: string;
  family_id: string;
  assessment_date: string;
  status: string;
  gps_lat?: number | string | null;
  gps_lng?: number | string | null;
  deceased_spouse_date_of_death?: string | null;
  assets_gold_silver?: number | null;
  assets_cash?: number | null;
  assets_property?: number | null;
  aid_from_other_org?: boolean | null;
  other_org_aid_amount?: number | null;
  monthly_ration?: number | null;
  monthly_bills?: number | null;
  monthly_rent?: number | null;
  other_monthly_expenses?: number | null;
  total_monthly_expenses?: number | null;
  field_worker_notes?: string;
  field_worker_companion?: string;
  prev_registered?: boolean | null;
  prev_aid_amount?: number | null;
  additional_info?: string;
  submitted_at?: string;
  created_at: string;
  updated_at?: string;
  assessed_by?: string;
}

const statusColor: Record<string, string> = {
  draft: 'gray',
  submitted: 'blue',
  scored: 'yellow',
  approved: 'green',
  rejected: 'red',
  reassessment_required: 'purple',
};

export default function AssessmentDetailPage() {
  const { id, assessment_id } = useParams<{ id: string; assessment_id: string }>();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('en-PK');
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleString('en-PK');
  };

  const parseNumber = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatAmount = (value?: number | string | null) => {
    const num = parseNumber(value);
    if (num === null) return '—';
    return `PKR ${num.toLocaleString('en-PK')}`;
  };

  useEffect(() => {
    assessmentsAPI.get(assessment_id).then(r => {
      setAssessment(r.data);
    }).catch(err => {
      setError('Failed to load assessment');
      console.error(err);
    }).finally(() => setLoading(false));
  }, [assessment_id]);

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await assessmentsAPI.delete(assessment_id);
      router.push(`/families/${id}/assessment`);
    } catch {
      setDeleteError('Failed to delete assessment');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const submitAssessment = async () => {
    setSubmitting(true);
    try {
      await assessmentsAPI.submit(assessment_id);
      router.push(`/families/${id}/assessment`);
    } catch {
      setDeleteError('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FamilySubPageSkeleton variant="detail" />;

  if (error || !assessment) {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <Link href={`/families/${id}/assessment`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ArrowLeft size={14} /> Back to Assessment
          </Link>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center', padding: 40 }}>
            <AlertCircle size={32} style={{ color: 'var(--error)', marginBottom: 16 }} />
            <h3>Error</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{error || 'Assessment not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href={`/families/${id}/assessment`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Assessment
        </Link>
      </div>

      <div className="card">
        <div className="family-subpage-header">
          <div>
            <h1>
              <ClipboardList size={24} /> Assessment Details
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Assessment ID:{' '}
              <span style={{ fontFamily: 'monospace', color: 'var(--accent)', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                {assessment.assessment_id}
              </span>
            </p>
          </div>
          <div className="family-subpage-actions">
            {assessment.status === 'draft' && (
              <>
                <Link href={`/families/${id}/assessment/${assessment_id}/edit`} className="btn btn-secondary btn-sm">
                  <Edit size={14} /> Edit
                </Link>
                <button type="button" onClick={submitAssessment} className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <button type="button" onClick={handleDelete} className="btn btn-secondary btn-sm" style={{ color: 'var(--red)' }} aria-label="Delete assessment">
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="family-stat-grid" style={{ marginBottom: 24, gap: 16 }}>
          <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={12} /> Assessment Date
            </div>
            <div style={{ fontWeight: 600 }}>{formatDate(assessment.assessment_date)}</div>
          </div>
          <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
            <span className={`badge badge-${statusColor[assessment.status] || 'gray'}`}>
              {assessment.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>Submitted At</div>
            <div style={{ fontWeight: 600 }}>{formatDateTime(assessment.submitted_at)}</div>
          </div>
          <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>Total Monthly Expenses</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.total_monthly_expenses)}</div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} /> Visit & Location
          </h3>
          <div className="family-stat-grid family-stat-grid-tight">
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>GPS Latitude</div>
              <div style={{ fontWeight: 600 }}>{parseNumber(assessment.gps_lat) ?? '—'}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>GPS Longitude</div>
              <div style={{ fontWeight: 600 }}>{parseNumber(assessment.gps_lng) ?? '—'}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Deceased Spouse Date of Death</div>
              <div style={{ fontWeight: 600 }}>{formatDate(assessment.deceased_spouse_date_of_death)}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} /> Financial Snapshot
          </h3>
          <div className="family-stat-grid family-stat-grid-tight">
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Gold & Silver</div>
              <div style={{ fontWeight: 600 }}>{formatAmount(assessment.assets_gold_silver)}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Cash</div>
              <div style={{ fontWeight: 600 }}>{formatAmount(assessment.assets_cash)}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Property Value</div>
              <div style={{ fontWeight: 600 }}>{formatAmount(assessment.assets_property)}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly Ration</div>
              <div style={{ fontWeight: 600 }}>{formatAmount(assessment.monthly_ration)}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly Bills</div>
              <div style={{ fontWeight: 600 }}>{formatAmount(assessment.monthly_bills)}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly Rent</div>
              <div style={{ fontWeight: 600 }}>{formatAmount(assessment.monthly_rent)}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Other Monthly Expenses</div>
              <div style={{ fontWeight: 600 }}>{formatAmount(assessment.other_monthly_expenses)}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} /> Aid & Registration History
          </h3>
          <div className="family-stat-grid family-stat-grid-tight">
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Aid From Other Organizations</div>
              <div style={{ fontWeight: 600 }}>{assessment.aid_from_other_org ? 'Yes' : 'No'}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Other Org Aid Amount</div>
              <div style={{ fontWeight: 600 }}>{formatAmount(assessment.other_org_aid_amount)}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Previously Registered</div>
              <div style={{ fontWeight: 600 }}>{assessment.prev_registered ? 'Yes' : 'No'}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Previous Aid Amount</div>
              <div style={{ fontWeight: 600 }}>{formatAmount(assessment.prev_aid_amount)}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} /> Assessment Notes
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Field Worker Companion</label>
              <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                {assessment.field_worker_companion || '—'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Field Worker Notes</label>
              <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                {assessment.field_worker_notes || '—'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Additional Information</label>
              <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                {assessment.additional_info || '—'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Created: {formatDateTime(assessment.created_at)} | Updated: {formatDateTime(assessment.updated_at)}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete} role="presentation">
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="delete-assessment-title">
            <div className="modal-body">
              <h3 id="delete-assessment-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 16 }}>
                <AlertCircle size={20} style={{ color: 'var(--red)' }} /> Delete Assessment
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Are you sure you want to delete this assessment? This action cannot be undone.
              </p>
              {deleteError && (
                <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: 10, borderRadius: 6, marginTop: 16, fontSize: '13px' }}>
                  {deleteError}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={cancelDelete} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn btn-primary"
                style={{ background: 'var(--red)', border: '1px solid var(--red)' }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
