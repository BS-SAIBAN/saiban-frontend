'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { assessmentsAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { AssessmentDetailContent, AssessmentDetailRecord, assessmentStatusColor } from '@/components/families/AssessmentDetailContent';
import { Plus, ClipboardList, Edit, Trash2, AlertCircle, X, Calendar, FileText } from 'lucide-react';

interface AssessmentRow {
  assessment_id: string;
  family_id: string;
  assessment_date: string;
  status: string;
  notes?: string;
}

export default function FamilyAssessmentClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');

  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const [viewAssessment, setViewAssessment] = useState<AssessmentDetailRecord | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const refreshList = useCallback(async () => {
    const r = await assessmentsAPI.list({ family_id: id });
    setAssessments(Array.isArray(r.data) ? r.data : []);
  }, [id]);

  useEffect(() => {
    refreshList().finally(() => setListLoading(false));
  }, [refreshList]);

  useEffect(() => {
    if (!viewParam) {
      setViewAssessment(null);
      setViewError('');
      setViewLoading(false);
      return;
    }

    let cancelled = false;
    setViewLoading(true);
    setViewError('');
    setViewAssessment(null);

    assessmentsAPI
      .get(viewParam)
      .then(r => {
        if (!cancelled) setViewAssessment(r.data as AssessmentDetailRecord);
      })
      .catch(() => {
        if (!cancelled) setViewError('Failed to load assessment');
      })
      .finally(() => {
        if (!cancelled) setViewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewParam]);

  const openViewModal = (assessmentId: string) => {
    setDeleteError('');
    router.replace(`${pathname}?view=${assessmentId}`, { scroll: false });
  };

  const closeViewModal = () => {
    setShowDeleteConfirm(false);
    setDeleteError('');
    router.replace(pathname, { scroll: false });
  };

  const submitAssessment = async (assessmentId: string) => {
    setSubmittingId(assessmentId);
    try {
      await assessmentsAPI.submit(assessmentId);
      await refreshList();
    } catch (e) {
      console.error('Failed to submit assessment:', e);
      alert('Failed to submit assessment');
    } finally {
      setSubmittingId(null);
    }
  };

  const submitFromModal = async () => {
    if (!viewParam) return;
    setModalSubmitting(true);
    setDeleteError('');
    try {
      await assessmentsAPI.submit(viewParam);
      await refreshList();
      const r = await assessmentsAPI.get(viewParam);
      setViewAssessment(r.data as AssessmentDetailRecord);
    } catch {
      setDeleteError('Failed to submit assessment');
    } finally {
      setModalSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!viewParam) return;
    setShowDeleteConfirm(false);
    try {
      await assessmentsAPI.delete(viewParam);
      await refreshList();
      closeViewModal();
    } catch {
      setDeleteError('Failed to delete assessment');
    }
  };

  if (listLoading) return <FamilySubPageSkeleton variant="table" />;

  return (
    <div>
      <div className="family-header-row">
        <div>
          <h1>Assessment</h1>
          <p>Family assessment records</p>
        </div>
        <Link href={`/families/${id}/assessment/new`} className="btn btn-primary">
          <Plus size={14} /> New Assessment
        </Link>
      </div>

      <div className="card">
        {assessments.length > 0 && (
          <div className="family-stat-grid family-stat-grid-tight" style={{ marginBottom: 16 }}>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Assessments</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{assessments.length}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Draft</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{assessments.filter((a) => a.status === 'draft').length}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Submitted</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{assessments.filter((a) => a.status === 'submitted').length}</div>
            </div>
          </div>
        )}

        {assessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={22} />
            </div>
            <h3>No assessments conducted yet</h3>
            <p>Conduct an assessment to evaluate the family&apos;s needs</p>
            <Link href={`/families/${id}/assessment/new`} className="btn btn-primary" style={{ marginTop: 16 }}>
              <Plus size={14} /> Conduct First Assessment
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {assessments.map((a) => (
              <div key={a.assessment_id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <FileText size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {a.assessment_id}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {a.assessment_date ? new Date(a.assessment_date).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  <span className={`badge badge-${assessmentStatusColor[a.status] || 'gray'}`}>{a.status?.replace(/_/g, ' ')}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => openViewModal(a.assessment_id)}>
                    View Details
                  </button>
                  {a.status === 'draft' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => submitAssessment(a.assessment_id)}
                      disabled={submittingId === a.assessment_id}
                    >
                      {submittingId === a.assessment_id ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewParam && (
        <div className="modal-overlay" onClick={closeViewModal} role="presentation">
          <div
            className="modal"
            style={{ maxWidth: 900, maxHeight: '90dvh', display: 'flex', flexDirection: 'column', width: '95vw' }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assessment-view-title"
          >
            <div className="modal-header" style={{ alignItems: 'flex-start', gap: 12, paddingBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 id="assessment-view-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Assessment Details
                </h2>
                {viewAssessment && (
                  <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 13 }}>
                    {viewAssessment.assessment_id}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {viewAssessment?.status === 'draft' && viewParam && (
                  <>
                    <Link href={`/families/${id}/assessment/${viewParam}/edit`} className="btn btn-secondary btn-sm" onClick={closeViewModal}>
                      <Edit size={14} /> Edit
                    </Link>
                    <button type="button" onClick={submitFromModal} className="btn btn-primary btn-sm" disabled={modalSubmitting}>
                      {modalSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn btn-secondary btn-sm btn-icon"
                      style={{ color: 'var(--red)' }}
                      aria-label="Delete assessment"
                      title="Delete assessment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button type="button" className="modal-close" onClick={closeViewModal} aria-label="Close">
                  <X />
                </button>
              </div>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', minHeight: 0, padding: '0 24px 24px 24px' }}>
              {viewLoading && (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              )}
              {viewError && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <AlertCircle size={32} style={{ color: 'var(--red)', marginBottom: 16 }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{viewError}</p>
                </div>
              )}
              {deleteError && !showDeleteConfirm && (
                <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{deleteError}</div>
              )}
              {!viewLoading && !viewError && viewAssessment && <AssessmentDetailContent assessment={viewAssessment} heading="compact" />}
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)} role="presentation" style={{ zIndex: 110 }}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="delete-assessment-title">
            <div className="modal-body">
              <h3 id="delete-assessment-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 16 }}>
                <AlertCircle size={20} style={{ color: 'var(--red)' }} /> Delete assessment
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Are you sure you want to delete this assessment? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="btn btn-primary" style={{ background: 'var(--red)', border: '1px solid var(--red)' }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
