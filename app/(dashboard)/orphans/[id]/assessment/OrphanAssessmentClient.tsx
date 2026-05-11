'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { assessmentsAPI, orphansAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { AssessmentDetailContent, AssessmentDetailRecord, assessmentStatusColor } from '@/components/families/AssessmentDetailContent';
import { Plus, ClipboardList, Edit, Trash2, AlertCircle, X, Calendar, FileText, Baby } from 'lucide-react';

interface OrphanAssessmentRow {
  assessment_id: string;
  family_id: string;
  assessment_date: string;
  status: string;
  notes?: string;
  orphan_profile_id?: string;
}

export default function OrphanAssessmentClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');

  const [assessments, setAssessments] = useState<OrphanAssessmentRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [orphanProfile, setOrphanProfile] = useState<any>(null);

  const [viewAssessment, setViewAssessment] = useState<AssessmentDetailRecord | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const refreshList = useCallback(async () => {
    try {
      // Get orphan profile to find family_id
      const orphanRes = await orphansAPI.get(id);
      setOrphanProfile(orphanRes.data);
      
      // Get assessments for the orphan's family
      const familyId = orphanRes.data.family_id;
      if (familyId) {
        const r = await assessmentsAPI.list({ family_id: familyId });
        setAssessments(Array.isArray(r.data) ? r.data : []);
      } else {
        setAssessments([]);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setAssessments([]);
    }
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
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Baby size={24} /> Orphan Assessments
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 14 }}>
              Track and manage orphan assessment records
            </p>
            {orphanProfile && (
              <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 13 }}>
                Orphan: {orphanProfile.individual?.full_name || 'Unknown'} | 
                Family: {orphanProfile.family?.registration_number || 'No family assigned'}
              </p>
            )}
          </div>
          <Link href={`/orphans/${id}/assessment/new`} className="btn btn-primary">
            <Plus size={14} /> New Orphan Assessment
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      {assessments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ClipboardList size={18} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Total Assessments</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{assessments.length}</div>
          </div>
          <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <FileText size={18} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Draft</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{assessments.filter((a) => a.status === 'draft').length}</div>
          </div>
          <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Calendar size={18} style={{ color: 'var(--blue)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Submitted</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{assessments.filter((a) => a.status === 'submitted').length}</div>
          </div>
        </div>
      )}

      {/* Assessments Table */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', padding: 24 }}>
        {assessments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16' }}>
              <Baby size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8', color: 'var(--text-primary)' }}>No orphan assessments conducted yet</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 16', fontSize: 14 }}>Conduct an orphan assessment to evaluate the child's needs and eligibility</p>
            <Link href={`/orphans/${id}/assessment/new`} className="btn btn-primary">
              <Plus size={14} /> Conduct First Orphan Assessment
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assessment ID</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr
                    key={a.assessment_id}
                    style={{ 
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 500 }}>{a.assessment_id}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                        {a.assessment_date ? new Date(a.assessment_date).toLocaleDateString('en-PK') : '—'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className={`badge badge-${assessmentStatusColor[a.status] || 'gray'}`} style={{ fontSize: 11 }}>
                        {a.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openViewModal(a.assessment_id)}
                        >
                          View
                        </button>
                        {a.status === 'draft' && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => submitAssessment(a.assessment_id)}
                              disabled={submittingId === a.assessment_id}
                            >
                              {submittingId === a.assessment_id ? 'Submitting...' : 'Submit'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  Orphan Assessment Details
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
                    <Link href={`/orphans/${id}/assessment/${viewParam}/edit`} className="btn btn-secondary btn-sm" onClick={closeViewModal}>
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
                <AlertCircle size={20} style={{ color: 'var(--red)' }} /> Delete orphan assessment
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Are you sure you want to delete this orphan assessment? This action cannot be undone.</p>
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
