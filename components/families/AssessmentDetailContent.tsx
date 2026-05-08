'use client';

import { Calendar, ClipboardList, FileText, MapPin, User, Home, Wallet, FileCheck, Users } from 'lucide-react';
import type { CSSProperties } from 'react';

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
  total_family_members?: number | null;
  total_children?: number | null;
  total_patients?: number | null;
  total_disabled?: number | null;
  total_loan_amount?: number | null;
  total_monthly_liability?: number | null;
  total_monthly_income?: number | null;
  income_expense_gap?: number | null;
  auto_metrics?: Record<string, unknown> | null;
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
  
  const sectionStyle: CSSProperties = {
    marginBottom: 20,
    padding: 20,
    border: '1px solid var(--border)',
    borderRadius: 12,
    background: 'var(--bg-secondary)',
  };
  
  const sectionHeaderStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };
  
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  };
  
  const fieldStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  };
  
  const labelStyle: CSSProperties = {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: 500,
  };
  
  const valueStyle: CSSProperties = {
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontWeight: 600,
  };
  const full = assessment as AssessmentDetailRecord & {
    case_field_information?: {
      field_worker_name?: string;
      field_worker_remarks?: string;
    };
    head_of_family?: {
      full_name?: string;
      cnic_number?: string;
      contact_number?: string;
      gender?: string;
      age?: number;
      marital_status?: string;
      occupation?: string;
      education_level?: string;
      health_condition?: string;
      disabled?: boolean;
    };
    family_members?: Array<{
      full_name?: string;
      relationship?: string;
      age?: number;
      gender?: string;
      cnic_or_bform?: string;
      education_status?: string;
      occupation?: string;
      monthly_income?: number;
      patient?: boolean;
      disabled?: boolean;
    }>;
    income_expense?: {
      total_monthly_income?: number;
      income_sources?: string[];
      income_source_other?: string | null;
      expenses?: {
        rent?: number;
        utilities?: number;
        food?: number;
        education?: number;
        medical?: number;
        other?: number;
      };
    };
    loan_debt?: {
      has_debt?: boolean;
      loans?: Array<{
        loan_amount?: number;
        source?: string;
        purpose?: string;
        outstanding_amount?: number;
        monthly_installment?: number;
        duration?: string;
      }>;
    };
    living_conditions?: {
      house_type?: string;
      condition?: string;
      number_of_rooms?: number;
      electricity?: boolean;
      water?: boolean;
      gas?: boolean;
      area_type?: string | null;
    };
    support_requirements?: {
      support_types?: string[];
      support_other?: string | null;
    };
    in_kind_support_items?: Array<{
      item_category?: string;
      item_name?: string;
      quantity_required?: number;
      intended_for?: string;
      linked_individual?: string;
      priority_level?: string;
      remarks?: string;
    }>;
    document_checklist?: {
      cnic_head?: string | null;
      b_forms?: string | null;
      income_proof?: string | null;
      medical_documents?: string | null;
    };
    photo_checklist?: {
      house_exterior?: string | null;
      living_conditions?: string | null;
      family_photo?: string | null;
    };
  };

  return (
    <>
      {!isCompact && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8 0' }}>
            <ClipboardList size={20} /> Assessment Details
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13 }}>
            ID: <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{assessment.assessment_id}</span>
          </p>
        </div>
      )}

      {/* Key Metrics Header */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <ClipboardList size={16} /> Overview
        </div>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <span style={labelStyle}>Assessment Date</span>
            <span style={valueStyle}>{formatDate(assessment.assessment_date)}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Status</span>
            <span className={`badge badge-${assessmentStatusColor[assessment.status] || 'gray'}`}>
              {assessment.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Submitted</span>
            <span style={valueStyle}>{formatDateTime(assessment.submitted_at)}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Family Members</span>
            <span style={valueStyle}>{parseNumber(assessment.total_family_members) ?? '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Monthly Income</span>
            <span style={valueStyle}>{formatAmount(assessment.total_monthly_income)}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Monthly Expenses</span>
            <span style={valueStyle}>{formatAmount(assessment.total_monthly_expenses)}</span>
          </div>
        </div>
      </div>

      {/* Case Information */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <MapPin size={16} /> Case Information
        </div>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <span style={labelStyle}>Field Worker</span>
            <span style={valueStyle}>{full.case_field_information?.field_worker_name || '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>GPS Location</span>
            <span style={valueStyle}>
              {parseNumber(assessment.gps_lat) ?? '—'}, {parseNumber(assessment.gps_lng) ?? '—'}
            </span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Deceased Spouse Date</span>
            <span style={valueStyle}>{formatDate(assessment.deceased_spouse_date_of_death)}</span>
          </div>
        </div>
      </div>

      {/* Head of Family */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <User size={16} /> Head of Family
        </div>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <span style={labelStyle}>Full Name</span>
            <span style={valueStyle}>{full.head_of_family?.full_name || '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>CNIC</span>
            <span style={valueStyle}>{full.head_of_family?.cnic_number || '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Gender</span>
            <span style={valueStyle}>{full.head_of_family?.gender || '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Age</span>
            <span style={valueStyle}>{full.head_of_family?.age ?? '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Occupation</span>
            <span style={valueStyle}>{full.head_of_family?.occupation || '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Education</span>
            <span style={valueStyle}>{full.head_of_family?.education_level || '—'}</span>
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Users size={16} /> Family Members ({Array.isArray(full.family_members) ? full.family_members.length : 0})
        </div>
        {!Array.isArray(full.family_members) || full.family_members.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>No family members recorded</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {full.family_members.map((m, idx) => (
              <div key={`${m.full_name || 'member'}-${idx}`} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{m.full_name || '—'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.relationship || '—'}</div>
                  </div>
                  {m.patient && <span className="badge badge-yellow" style={{ fontSize: 11 }}>Patient</span>}
                  {m.disabled && <span className="badge badge-purple" style={{ fontSize: 11 }}>Disabled</span>}
                </div>
                <div style={gridStyle}>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Age</span>
                    <span style={valueStyle}>{parseNumber(m.age) ?? '—'}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Gender</span>
                    <span style={valueStyle}>{m.gender || '—'}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Education</span>
                    <span style={valueStyle}>{m.education_status || '—'}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Occupation</span>
                    <span style={valueStyle}>{m.occupation || '—'}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Monthly Income</span>
                    <span style={valueStyle}>{formatAmount(m.monthly_income)}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>CNIC/B-Form</span>
                    <span style={valueStyle}>{m.cnic_or_bform || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Information */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Wallet size={16} /> Financial Information
        </div>
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Income</h4>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <span style={labelStyle}>Total Monthly Income</span>
              <span style={valueStyle}>{formatAmount(full.income_expense?.total_monthly_income ?? assessment.total_monthly_income)}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Income Sources</span>
              <span style={valueStyle}>{(full.income_expense?.income_sources || []).join(', ') || '—'}</span>
            </div>
            {full.income_expense?.income_source_other && (
              <div style={fieldStyle}>
                <span style={labelStyle}>Other Source</span>
                <span style={valueStyle}>{full.income_expense.income_source_other}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Monthly Expenses</h4>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <span style={labelStyle}>Rent</span>
              <span style={valueStyle}>{formatAmount(full.income_expense?.expenses?.rent ?? assessment.monthly_rent)}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Utilities</span>
              <span style={valueStyle}>{formatAmount(full.income_expense?.expenses?.utilities ?? assessment.monthly_bills)}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Food/Ration</span>
              <span style={valueStyle}>{formatAmount(full.income_expense?.expenses?.food ?? assessment.monthly_ration)}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Education</span>
              <span style={valueStyle}>{formatAmount(full.income_expense?.expenses?.education)}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Medical</span>
              <span style={valueStyle}>{formatAmount(full.income_expense?.expenses?.medical)}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Other</span>
              <span style={valueStyle}>{formatAmount(full.income_expense?.expenses?.other ?? assessment.other_monthly_expenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loans & Debt */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Wallet size={16} /> Loans & Debt
        </div>
        <div style={{ marginBottom: 12, fontSize: 14, color: 'var(--text-primary)' }}>
          Has Debt: <strong style={{ color: full.loan_debt?.has_debt ? 'var(--red)' : 'var(--green)' }}>
            {full.loan_debt?.has_debt ? 'Yes' : 'No'}
          </strong>
        </div>
        {!full.loan_debt?.loans || full.loan_debt.loans.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>No loans recorded</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {full.loan_debt.loans.map((loan, idx) => (
              <div key={`loan-${idx}`} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'var(--text-primary)' }}>Loan #{idx + 1}</div>
                <div style={gridStyle}>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Loan Amount</span>
                    <span style={valueStyle}>{formatAmount(loan.loan_amount)}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Outstanding</span>
                    <span style={valueStyle}>{formatAmount(loan.outstanding_amount)}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Monthly Installment</span>
                    <span style={valueStyle}>{formatAmount(loan.monthly_installment)}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Source</span>
                    <span style={valueStyle}>{loan.source || '—'}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Purpose</span>
                    <span style={valueStyle}>{loan.purpose || '—'}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Duration</span>
                    <span style={valueStyle}>{loan.duration || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Living Conditions */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Home size={16} /> Living Conditions
        </div>
        <div style={gridStyle}>
          <div style={fieldStyle}>
            <span style={labelStyle}>House Type</span>
            <span style={valueStyle}>{full.living_conditions?.house_type || '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Condition</span>
            <span style={valueStyle}>{full.living_conditions?.condition || '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Number of Rooms</span>
            <span style={valueStyle}>{parseNumber(full.living_conditions?.number_of_rooms) ?? '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Area Type</span>
            <span style={valueStyle}>{full.living_conditions?.area_type || '—'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Electricity</span>
            <span style={valueStyle}>{full.living_conditions?.electricity ? 'Available' : 'Not Available'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Water</span>
            <span style={valueStyle}>{full.living_conditions?.water ? 'Available' : 'Not Available'}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Gas</span>
            <span style={valueStyle}>{full.living_conditions?.gas ? 'Available' : 'Not Available'}</span>
          </div>
        </div>
      </div>

      {/* Support Requirements */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <FileCheck size={16} /> Support Requirements
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>Support Types</span>
          <span style={valueStyle}>{(full.support_requirements?.support_types || []).join(', ') || '—'}</span>
        </div>
        {full.support_requirements?.support_other && (
          <div style={fieldStyle}>
            <span style={labelStyle}>Other Support</span>
            <span style={valueStyle}>{full.support_requirements.support_other}</span>
          </div>
        )}
      </div>

      {/* In-Kind Support Items */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <FileCheck size={16} /> In-Kind Support Items ({full.in_kind_support_items?.length || 0})
        </div>
        {!full.in_kind_support_items || full.in_kind_support_items.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>No in-kind support items</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {full.in_kind_support_items.map((item, idx) => (
              <div key={`inkind-${idx}`} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{item.item_name || '—'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.item_category || '—'}</div>
                  </div>
                  {item.priority_level && (
                    <span className={`badge badge-${item.priority_level === 'high' ? 'red' : item.priority_level === 'medium' ? 'yellow' : 'gray'}`} style={{ fontSize: 11 }}>
                      {item.priority_level}
                    </span>
                  )}
                </div>
                <div style={gridStyle}>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Quantity Required</span>
                    <span style={valueStyle}>{parseNumber(item.quantity_required) ?? '—'}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Intended For</span>
                    <span style={valueStyle}>{item.intended_for || '—'}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Linked Individual</span>
                    <span style={valueStyle}>{item.linked_individual || '—'}</span>
                  </div>
                </div>
                {item.remarks && (
                  <div style={{ marginTop: 8 }}>
                    <span style={labelStyle}>Remarks</span>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>{item.remarks}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents & Photos */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <FileCheck size={16} /> Documents & Photos
        </div>
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Documents</h4>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <span style={labelStyle}>CNIC (Head)</span>
              <span style={{ ...valueStyle, color: full.document_checklist?.cnic_head ? 'var(--green)' : 'var(--text-muted)' }}>
                {full.document_checklist?.cnic_head ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>B-Forms</span>
              <span style={{ ...valueStyle, color: full.document_checklist?.b_forms ? 'var(--green)' : 'var(--text-muted)' }}>
                {full.document_checklist?.b_forms ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Income Proof</span>
              <span style={{ ...valueStyle, color: full.document_checklist?.income_proof ? 'var(--green)' : 'var(--text-muted)' }}>
                {full.document_checklist?.income_proof ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Medical Documents</span>
              <span style={{ ...valueStyle, color: full.document_checklist?.medical_documents ? 'var(--green)' : 'var(--text-muted)' }}>
                {full.document_checklist?.medical_documents ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Photos</h4>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <span style={labelStyle}>House Exterior</span>
              <span style={{ ...valueStyle, color: full.photo_checklist?.house_exterior ? 'var(--green)' : 'var(--text-muted)' }}>
                {full.photo_checklist?.house_exterior ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Living Conditions</span>
              <span style={{ ...valueStyle, color: full.photo_checklist?.living_conditions ? 'var(--green)' : 'var(--text-muted)' }}>
                {full.photo_checklist?.living_conditions ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Family Photo</span>
              <span style={{ ...valueStyle, color: full.photo_checklist?.family_photo ? 'var(--green)' : 'var(--text-muted)' }}>
                {full.photo_checklist?.family_photo ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Additional Info */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <FileText size={16} /> Notes & Additional Information
        </div>
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <span style={labelStyle}>Field Worker Companion</span>
            <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, marginTop: 4, fontSize: 14, color: 'var(--text-primary)' }}>
              {assessment.field_worker_companion || '—'}
            </div>
          </div>
          <div>
            <span style={labelStyle}>Field Worker Notes</span>
            <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, marginTop: 4, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {assessment.field_worker_notes || '—'}
            </div>
          </div>
          <div>
            <span style={labelStyle}>Additional Information</span>
            <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, marginTop: 4, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {assessment.additional_info || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12 0', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <span>Created: {formatDateTime(assessment.created_at)}</span>
        <span>Updated: {formatDateTime(assessment.updated_at)}</span>
      </div>
    </>
  );
}
