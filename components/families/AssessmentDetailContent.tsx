'use client';

import { Calendar, ClipboardList, FileText, MapPin } from 'lucide-react';

export interface AssessmentDetailRecord {
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
  updated_at: string;
  assessed_by?: string;
}

export const assessmentStatusColor: Record<string, string> = {
  draft: 'gray',
  submitted: 'blue',
  scored: 'yellow',
  approved: 'green',
  rejected: 'red',
  reassessment_required: 'purple',
};

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

interface AssessmentDetailContentProps {
  assessment: AssessmentDetailRecord;
  heading?: 'default' | 'compact';
}

export function AssessmentDetailContent({ assessment, heading = 'default' }: AssessmentDetailContentProps) {
  const isCompact = heading === 'compact';

  return (
    <>
      {!isCompact && (
        <div className="family-subpage-header" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <ClipboardList size={22} /> Assessment details
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, marginBottom: 0, fontSize: 13 }}>
              ID:{' '}
              <span style={{ fontFamily: 'monospace', color: 'var(--accent)', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                {assessment.assessment_id}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="family-stat-grid" style={{ marginBottom: 24, gap: 16 }}>
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={12} /> Assessment date
          </div>
          <div style={{ fontWeight: 600 }}>{formatDate(assessment.assessment_date)}</div>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
          <span className={`badge badge-${assessmentStatusColor[assessment.status] || 'gray'}`}>
            {assessment.status?.replace(/_/g, ' ')}
          </span>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>Submitted at</div>
          <div style={{ fontWeight: 600 }}>{formatDateTime(assessment.submitted_at)}</div>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 4 }}>Total monthly expenses</div>
          <div style={{ fontWeight: 600 }}>{formatAmount(assessment.total_monthly_expenses)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={16} /> Visit &amp; location
        </h3>
        <div className="family-stat-grid family-stat-grid-tight">
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>GPS latitude</div>
            <div style={{ fontWeight: 600 }}>{parseNumber(assessment.gps_lat) ?? '—'}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>GPS longitude</div>
            <div style={{ fontWeight: 600 }}>{parseNumber(assessment.gps_lng) ?? '—'}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Deceased spouse date of death</div>
            <div style={{ fontWeight: 600 }}>{formatDate(assessment.deceased_spouse_date_of_death)}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} /> Financial snapshot
        </h3>
        <div className="family-stat-grid family-stat-grid-tight">
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Gold &amp; silver</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.assets_gold_silver)}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Cash</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.assets_cash)}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Property value</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.assets_property)}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly ration</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.monthly_ration)}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly bills</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.monthly_bills)}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly rent</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.monthly_rent)}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Other monthly expenses</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.other_monthly_expenses)}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} /> Aid &amp; registration history
        </h3>
        <div className="family-stat-grid family-stat-grid-tight">
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Aid from other organizations</div>
            <div style={{ fontWeight: 600 }}>{assessment.aid_from_other_org ? 'Yes' : 'No'}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Other org aid amount</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.other_org_aid_amount)}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Previously registered</div>
            <div style={{ fontWeight: 600 }}>{assessment.prev_registered ? 'Yes' : 'No'}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Previous aid amount</div>
            <div style={{ fontWeight: 600 }}>{formatAmount(assessment.prev_aid_amount)}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} /> Assessment notes
        </h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <span style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Field worker companion</span>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              {assessment.field_worker_companion || '—'}
            </div>
          </div>
          <div>
            <span style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Field worker notes</span>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
              {assessment.field_worker_notes || '—'}
            </div>
          </div>
          <div>
            <span style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>Additional information</span>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
              {assessment.additional_info || '—'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Created: {formatDateTime(assessment.created_at)} | Updated: {formatDateTime(assessment.updated_at)}
      </div>
    </>
  );
}
