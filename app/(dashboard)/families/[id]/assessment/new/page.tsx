'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { assessmentsAPI, familiesAPI, storageAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, Plus, Save, Trash2, Upload } from 'lucide-react';

type Member = {
  full_name: string;
  relationship: string;
  age: number;
  gender: string;
  cnic_or_bform: string;
  education_status: string;
  occupation: string;
  monthly_income: number;
  patient: boolean;
  disabled: boolean;
  medical: {
    disease_condition: string;
    medical_type: string;
    treatment_status: string;
    treatment_facility: string;
    monthly_medical_expense: number;
    medication_required: boolean;
    severity_level: string;
  };
};

type Loan = {
  loan_amount: number;
  source: string;
  purpose: string;
  outstanding_amount: number;
  monthly_installment: number;
  duration: string;
};

type InKindItem = {
  item_category: string;
  item_name: string;
  quantity_required: number;
  intended_for: 'family' | 'specific_individual';
  linked_individual: string;
  priority_level: string;
  remarks: string;
};

type FamilyIndividual = {
  full_name?: string;
  relationship_to_head?: string;
  dob?: string;
  cnic_or_bform?: string;
  gender?: string;
  occupation?: string;
  monthly_income?: number;
  is_patient?: boolean;
  is_disabled?: boolean;
};

type FamilyWithIndividuals = {
  housing_type?: string;
  individuals?: FamilyIndividual[];
};

const relationshipOptions: Array<{ value: string; label: string }> = [
  { value: 'head', label: 'Head' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'mother', label: 'Mother' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

const blankMember = (): Member => ({
  full_name: '',
  relationship: '',
  age: 0,
  gender: '',
  cnic_or_bform: '',
  education_status: '',
  occupation: '',
  monthly_income: 0,
  patient: false,
  disabled: false,
  medical: {
    disease_condition: '',
    medical_type: '',
    treatment_status: '',
    treatment_facility: '',
    monthly_medical_expense: 0,
    medication_required: false,
    severity_level: '',
  },
});

const blankLoan = (): Loan => ({
  loan_amount: 0,
  source: '',
  purpose: '',
  outstanding_amount: 0,
  monthly_installment: 0,
  duration: '',
});

const blankInKindItem = (): InKindItem => ({
  item_category: '',
  item_name: '',
  quantity_required: 1,
  intended_for: 'family',
  linked_individual: '',
  priority_level: '',
  remarks: '',
});

const sections = [
  'Case & Field',
  'Head of Family',
  'Family Members',
  'Income & Expense',
  'Loan & Debt',
  'Living Conditions',
  'Support Types',
  'In-Kind Support',
  'Docs & Photos',
];

export default function NewAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [headPrefilledFromIntake, setHeadPrefilledFromIntake] = useState(false);

  const [form, setForm] = useState({
    assessment_date: new Date().toISOString().split('T')[0],
    field_worker_name: user?.full_name || '',
    gps_lat: '',
    gps_lng: '',
    field_worker_remarks: '',
    head_full_name: '',
    head_cnic_number: '',
    head_contact_number: '',
    head_gender: '',
    head_age: 0,
    head_marital_status: '',
    head_occupation: '',
    head_education_level: '',
    head_health_condition: '',
    head_disabled: false,
    income_total: 0,
    income_sources: [] as string[],
    income_source_other: '',
    expense_rent: 0,
    expense_utilities: 0,
    expense_food: 0,
    expense_education: 0,
    expense_medical: 0,
    expense_other: 0,
    has_debt: false,
    house_type: '',
    house_condition: '',
    number_of_rooms: 0,
    electricity: true,
    water: true,
    gas: false,
    area_type: '',
    support_types: [] as string[],
    support_other: '',
    documents_head_cnic: '',
    documents_b_forms: '',
    documents_income_proof: '',
    documents_medical: '',
    photos_house_exterior: '',
    photos_living_conditions: '',
    photos_family: '',
    additional_info: '',
  });

  const [members, setMembers] = useState<Member[]>([blankMember()]);
  useEffect(() => {
    if (user?.full_name) {
      setForm((prev) => ({ ...prev, field_worker_name: user.full_name }));
    }
  }, [user?.full_name]);

  useEffect(() => {
    if (!id) return;
    familiesAPI.get(id).then((res) => {
      const family = (res.data || {}) as FamilyWithIndividuals;
      const people = Array.isArray(family.individuals) ? family.individuals : [];
      const head = people.find((p) => p.relationship_to_head === 'head') || people[0];

      if (head) {
        const dob = head.dob ? new Date(head.dob) : null;
        const now = new Date();
        const age = dob && !Number.isNaN(dob.getTime())
          ? now.getFullYear() - dob.getFullYear() - ((now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) ? 1 : 0)
          : 0;

        setForm((prev) => ({
          ...prev,
          head_full_name: head.full_name || prev.head_full_name,
          head_cnic_number: head.cnic_or_bform || prev.head_cnic_number,
          head_gender: head.gender || prev.head_gender,
          head_age: age > 0 ? age : prev.head_age,
          head_occupation: head.occupation || prev.head_occupation,
          house_type: family.housing_type || prev.house_type,
        }));
        setHeadPrefilledFromIntake(true);
      }

      if (people.length > 0) {
        setMembers(people.map((p) => ({
          ...blankMember(),
          full_name: p.full_name || '',
          relationship: p.relationship_to_head || '',
          gender: p.gender || '',
          cnic_or_bform: p.cnic_or_bform || '',
          occupation: p.occupation || '',
          monthly_income: p.monthly_income || 0,
          patient: Boolean(p.is_patient),
          disabled: Boolean(p.is_disabled),
        })));
      }
    }).catch(() => {
      // keep default blank state if intake fetch fails
    });
  }, [id]);

  const [loans, setLoans] = useState<Loan[]>([]);
  const [inKindItems, setInKindItems] = useState<InKindItem[]>([]);

  const metrics = useMemo(() => {
    const total_family_members = members.length;
    const total_children = members.filter((m) => m.age > 0 && m.age < 18).length;
    const total_patients = members.filter((m) => m.patient).length;
    const total_disabled = members.filter((m) => m.disabled).length;
    const total_expenses =
      form.expense_rent +
      form.expense_utilities +
      form.expense_food +
      form.expense_education +
      form.expense_medical +
      form.expense_other;
    const income_expense_gap = form.income_total - total_expenses;
    const total_loan_amount = loans.reduce((s, l) => s + l.loan_amount, 0);
    const total_monthly_liability = loans.reduce((s, l) => s + l.monthly_installment, 0);
    return {
      total_family_members,
      total_children,
      total_patients,
      total_disabled,
      total_expenses,
      income_expense_gap,
      total_loan_amount,
      total_monthly_liability,
    };
  }, [form, members, loans]);

  const toggleMulti = (key: 'income_sources' | 'support_types', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((x) => x !== value) : [...prev[key], value],
    }));
  };

  const handleFileUpload = async (file: File, field: string) => {
    try {
      const response = await storageAPI.uploadFile(file, 'assessments');
      setForm((prev) => ({ ...prev, [field]: response.data.url }));
    } catch (err) {
      console.error('File upload failed:', err);
      setError('Failed to upload file. Please try again.');
    }
  };

  const buildSmartTags = () => {
    const tags: string[] = [];
    if (metrics.income_expense_gap < 0) tags.push('High Financial Need');
    if (metrics.total_loan_amount > 0) tags.push('Debt Burdened');
    if (metrics.total_patients > 0) tags.push('Medical Need Case');
    if (form.support_types.includes('in_kind_support')) tags.push('In-Kind Support Required');
    return tags;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.field_worker_remarks.trim()) {
      setError('Field worker remarks are required.');
      return;
    }

    setLoading(true);
    try {
      await assessmentsAPI.create({
        family_id: id,
        assessment_date: form.assessment_date,
        gps_lat: form.gps_lat ? parseFloat(form.gps_lat) : null,
        gps_lng: form.gps_lng ? parseFloat(form.gps_lng) : null,
        field_worker_notes: form.field_worker_remarks,
        additional_info: form.additional_info,
        monthly_ration: form.expense_food,
        monthly_bills: form.expense_utilities,
        monthly_rent: form.expense_rent,
        other_monthly_expenses: form.expense_education + form.expense_medical + form.expense_other,
        case_field_information: {
          case_id: 'auto',
          category: 'FA',
          assessment_date: form.assessment_date,
          field_worker_name: form.field_worker_name,
          gps_location: form.gps_lat && form.gps_lng ? { lat: form.gps_lat, lng: form.gps_lng } : null,
          field_worker_remarks: form.field_worker_remarks,
          prefill_source: 'intake',
          master_sync_choice: 'snapshot_only',
        },
        head_of_family: {
          full_name: form.head_full_name,
          cnic_number: form.head_cnic_number,
          contact_number: form.head_contact_number,
          gender: form.head_gender,
          age: form.head_age,
          marital_status: form.head_marital_status,
          occupation: form.head_occupation,
          education_level: form.head_education_level || null,
          health_condition: form.head_health_condition || null,
          disabled: form.head_disabled,
        },
        family_members: members,
        income_expense: {
          total_monthly_income: form.income_total,
          income_sources: form.income_sources,
          income_source_other: form.income_source_other || null,
          expenses: {
            rent: form.expense_rent,
            utilities: form.expense_utilities,
            food: form.expense_food,
            education: form.expense_education,
            medical: form.expense_medical,
            other: form.expense_other,
          },
        },
        loan_debt: { has_debt: form.has_debt, loans: form.has_debt ? loans : [] },
        living_conditions: {
          house_type: form.house_type,
          condition: form.house_condition,
          number_of_rooms: form.number_of_rooms,
          electricity: form.electricity,
          water: form.water,
          gas: form.gas,
          area_type: form.area_type || null,
        },
        support_requirements: {
          support_types: form.support_types,
          support_other: form.support_other || null,
        },
        in_kind_support_items: form.support_types.includes('in_kind_support') ? inKindItems : [],
        document_checklist: {
          cnic_head: form.documents_head_cnic || null,
          b_forms: form.documents_b_forms || null,
          income_proof: form.documents_income_proof || null,
          medical_documents: form.documents_medical || null,
        },
        photo_checklist: {
          house_exterior: form.photos_house_exterior || null,
          living_conditions: form.photos_living_conditions || null,
          family_photo: form.photos_family || null,
        },
        smart_tags: buildSmartTags(),
      });
      router.push(`/families/${id}/assessment`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response as { data?: { detail?: string } };
        setError(response.data?.detail || 'Failed to create assessment');
      } else {
        setError('Failed to create assessment');
      }
    } finally {
      setLoading(false);
    }
  };

  const stepProgress = ((activeStep + 1) / sections.length) * 100;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <Link href={`/families/${id}/assessment`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <ArrowLeft size={14} /> Back to Assessment
        </Link>
        <h1>New Assessment</h1>
        <p>Complete all sections with accurate field assessment data</p>
      </div>

      <div className="card">
        <div style={{ marginBottom: 18 }}>
          <div className="progress" style={{ marginBottom: 10 }}>
            <div className="progress-fill" style={{ width: `${stepProgress}%` }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Step {activeStep + 1} of {sections.length}: <strong>{sections[activeStep]}</strong>
          </div>
        </div>

        <div className="steps" style={{ marginBottom: 18 }}>
          {sections.map((s, idx) => (
            <div key={s} className={`step ${idx === activeStep ? 'active' : idx < activeStep ? 'done' : ''}`} onClick={() => setActiveStep(idx)} style={{ cursor: 'pointer' }}>
              <div className="step-num">{idx + 1}</div>
              <div className="step-label">{s}</div>
              {idx < sections.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', padding: 12, borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeStep === 0 && (
            <div className="wizard-step-card">
              <div className="section-title">Case & Field Information</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Assessment Date</label>
                  <input className="form-control" type="date" required value={form.assessment_date} onChange={(e) => setForm({ ...form, assessment_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Field Worker Name</label>
                  <input className="form-control" type="text" required value={form.field_worker_name} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">GPS Latitude</label>
                  <input className="form-control" type="number" step="any" min="-90" max="90" value={form.gps_lat} onChange={(e) => setForm({ ...form, gps_lat: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">GPS Longitude</label>
                  <input className="form-control" type="number" step="any" min="-180" max="180" value={form.gps_lng} onChange={(e) => setForm({ ...form, gps_lng: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Field Worker Remarks</label>
                <textarea className="form-control" rows={4} required value={form.field_worker_remarks} onChange={(e) => setForm({ ...form, field_worker_remarks: e.target.value })} />
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="wizard-step-card">
              <div className="section-title">Head of Family</div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.head_full_name} onChange={(e) => setForm({ ...form, head_full_name: e.target.value })} readOnly={headPrefilledFromIntake} /></div>
                <div className="form-group"><label className="form-label">CNIC Number</label><input className="form-control" value={form.head_cnic_number} onChange={(e) => setForm({ ...form, head_cnic_number: e.target.value })} readOnly={headPrefilledFromIntake} /></div>
                <div className="form-group"><label className="form-label">Contact Number</label><input className="form-control" value={form.head_contact_number} onChange={(e) => setForm({ ...form, head_contact_number: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Gender</label><select className="form-control" value={form.head_gender} onChange={(e) => setForm({ ...form, head_gender: e.target.value })} disabled={headPrefilledFromIntake}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                <div className="form-group"><label className="form-label">Age</label><input className="form-control" type="number" min={0} value={form.head_age} onChange={(e) => setForm({ ...form, head_age: parseInt(e.target.value) || 0 })} readOnly={headPrefilledFromIntake} /></div>
                <div className="form-group"><label className="form-label">Marital Status</label><input className="form-control" value={form.head_marital_status} onChange={(e) => setForm({ ...form, head_marital_status: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Occupation</label><input className="form-control" value={form.head_occupation} onChange={(e) => setForm({ ...form, head_occupation: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Education Level</label><input className="form-control" value={form.head_education_level} onChange={(e) => setForm({ ...form, head_education_level: e.target.value })} /></div>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.head_disabled} onChange={(e) => setForm({ ...form, head_disabled: e.target.checked })} />
                Disabled
              </label>
            </div>
          )}

          {activeStep === 2 && (
            <div className="wizard-step-card">
              <div className="section-title">Family Members</div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMembers((prev) => [...prev, blankMember()])}>
                <Plus size={14} /> Add Member
              </button>
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                {members.map((m, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong>Member #{idx + 1}</strong>
                      {members.length > 1 && (
                        <button type="button" className="btn btn-secondary btn-sm btn-icon" onClick={() => setMembers((prev) => prev.filter((_, i) => i !== idx))}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <input className="form-control" placeholder="Full Name" value={m.full_name} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, full_name: e.target.value } : x)))} />
                      <select className="form-control" value={m.relationship} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, relationship: e.target.value } : x)))}>
                        <option value="">Select relationship</option>
                        {relationshipOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <input
                        className="form-control"
                        type="number"
                        min={0}
                        step={1}
                        placeholder="Age (years)"
                        value={m.age ? m.age : ''}
                        onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, age: parseInt(e.target.value) || 0 } : x)))} />
                      <select className="form-control" value={m.gender} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, gender: e.target.value } : x)))}>
                        <option value="">Gender</option><option value="male">Male</option><option value="female">Female</option>
                      </select>
                      <input className="form-control" placeholder="CNIC / B-Form" value={m.cnic_or_bform} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, cnic_or_bform: e.target.value } : x)))} />
                      <input className="form-control" placeholder="Education Status" value={m.education_status} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, education_status: e.target.value } : x)))} />
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                      <label><input type="checkbox" checked={m.patient} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, patient: e.target.checked } : x)))} /> Patient</label>
                      <label><input type="checkbox" checked={m.disabled} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, disabled: e.target.checked } : x)))} /> Disabled</label>
                    </div>
                    {m.patient && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
                        <div className="form-grid">
                          <input className="form-control" placeholder="Disease / Condition" value={m.medical.disease_condition} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, medical: { ...x.medical, disease_condition: e.target.value } } : x)))} />
                          <input className="form-control" placeholder="Type (chronic/temporary/other)" value={m.medical.medical_type} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, medical: { ...x.medical, medical_type: e.target.value } } : x)))} />
                          <input className="form-control" placeholder="Treatment Status" value={m.medical.treatment_status} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, medical: { ...x.medical, treatment_status: e.target.value } } : x)))} />
                          <input className="form-control" type="number" placeholder="Monthly Medical Expense" value={m.medical.monthly_medical_expense} onChange={(e) => setMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, medical: { ...x.medical, monthly_medical_expense: parseInt(e.target.value) || 0 } } : x)))} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="wizard-step-card">
              <div className="section-title">Income & Expense</div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Total Monthly Income</label><input className="form-control" type="number" min={0} value={form.income_total} onChange={(e) => setForm({ ...form, income_total: parseInt(e.target.value) || 0 })} /></div>
                <div className="form-group"><label className="form-label">Rent</label><input className="form-control" type="number" min={0} value={form.expense_rent} onChange={(e) => setForm({ ...form, expense_rent: parseInt(e.target.value) || 0 })} /></div>
                <div className="form-group"><label className="form-label">Utilities</label><input className="form-control" type="number" min={0} value={form.expense_utilities} onChange={(e) => setForm({ ...form, expense_utilities: parseInt(e.target.value) || 0 })} /></div>
                <div className="form-group"><label className="form-label">Food</label><input className="form-control" type="number" min={0} value={form.expense_food} onChange={(e) => setForm({ ...form, expense_food: parseInt(e.target.value) || 0 })} /></div>
                <div className="form-group"><label className="form-label">Education</label><input className="form-control" type="number" min={0} value={form.expense_education} onChange={(e) => setForm({ ...form, expense_education: parseInt(e.target.value) || 0 })} /></div>
                <div className="form-group"><label className="form-label">Medical</label><input className="form-control" type="number" min={0} value={form.expense_medical} onChange={(e) => setForm({ ...form, expense_medical: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {['job', 'business', 'labor', 'donations', 'pension', 'other'].map((src) => (
                  <label key={src}><input type="checkbox" checked={form.income_sources.includes(src)} onChange={() => toggleMulti('income_sources', src)} /> {src}</label>
                ))}
              </div>
              <div style={{ marginTop: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, fontSize: 13 }}>
                Total Expenses: <strong>{metrics.total_expenses.toLocaleString()}</strong> |{' '}
                {metrics.income_expense_gap < 0 ? 'Deficit' : 'Surplus'}:{' '}
                <strong>{Math.abs(metrics.income_expense_gap).toLocaleString()}</strong>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="wizard-step-card">
              <div className="section-title">Loan & Debt</div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <input type="checkbox" checked={form.has_debt} onChange={(e) => setForm({ ...form, has_debt: e.target.checked })} /> Any Loan/Debt?
              </label>
              {form.has_debt && (
                <>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLoans((prev) => [...prev, blankLoan()])}>
                    <Plus size={14} /> Add Loan Entry
                  </button>
                  <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                    {loans.map((loan, idx) => (
                      <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <strong>Loan #{idx + 1}</strong>
                          <button type="button" className="btn btn-secondary btn-sm btn-icon" onClick={() => setLoans((prev) => prev.filter((_, i) => i !== idx))}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="form-grid">
                          <input className="form-control" type="number" placeholder="Loan Amount" value={loan.loan_amount} onChange={(e) => setLoans((prev) => prev.map((x, i) => (i === idx ? { ...x, loan_amount: parseInt(e.target.value) || 0 } : x)))} />
                          <input className="form-control" placeholder="Source" value={loan.source} onChange={(e) => setLoans((prev) => prev.map((x, i) => (i === idx ? { ...x, source: e.target.value } : x)))} />
                          <input className="form-control" placeholder="Purpose" value={loan.purpose} onChange={(e) => setLoans((prev) => prev.map((x, i) => (i === idx ? { ...x, purpose: e.target.value } : x)))} />
                          <input className="form-control" type="number" placeholder="Outstanding Amount" value={loan.outstanding_amount} onChange={(e) => setLoans((prev) => prev.map((x, i) => (i === idx ? { ...x, outstanding_amount: parseInt(e.target.value) || 0 } : x)))} />
                          <input className="form-control" type="number" placeholder="Monthly Installment" value={loan.monthly_installment} onChange={(e) => setLoans((prev) => prev.map((x, i) => (i === idx ? { ...x, monthly_installment: parseInt(e.target.value) || 0 } : x)))} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                    Total Loan: {metrics.total_loan_amount.toLocaleString()} | Monthly Liability: {metrics.total_monthly_liability.toLocaleString()}
                  </div>
                </>
              )}
            </div>
          )}

          {activeStep === 5 && (
            <div className="wizard-step-card">
              <div className="section-title">Living Conditions</div>
              <div className="form-grid">
                <input className="form-control" placeholder="House Type" value={form.house_type} onChange={(e) => setForm({ ...form, house_type: e.target.value })} />
                <input className="form-control" placeholder="Condition" value={form.house_condition} onChange={(e) => setForm({ ...form, house_condition: e.target.value })} />
                <input className="form-control" type="number" placeholder="Number of Rooms" value={form.number_of_rooms} onChange={(e) => setForm({ ...form, number_of_rooms: parseInt(e.target.value) || 0 })} />
                <input className="form-control" placeholder="Area Type" value={form.area_type} onChange={(e) => setForm({ ...form, area_type: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <label><input type="checkbox" checked={form.electricity} onChange={(e) => setForm({ ...form, electricity: e.target.checked })} /> Electricity</label>
                <label><input type="checkbox" checked={form.water} onChange={(e) => setForm({ ...form, water: e.target.checked })} /> Water</label>
                <label><input type="checkbox" checked={form.gas} onChange={(e) => setForm({ ...form, gas: e.target.checked })} /> Gas</label>
              </div>
            </div>
          )}

          {activeStep === 6 && (
            <div className="wizard-step-card">
              <div className="section-title">Support Requirements</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {['financial_aid', 'ration_support', 'medical_assistance', 'education_support', 'in_kind_support', 'other'].map((support) => (
                  <label key={support}><input type="checkbox" checked={form.support_types.includes(support)} onChange={() => toggleMulti('support_types', support)} /> {support}</label>
                ))}
              </div>
              {form.support_types.includes('other') && (
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label className="form-label">Other Support</label>
                  <input className="form-control" value={form.support_other} onChange={(e) => setForm({ ...form, support_other: e.target.value })} />
                </div>
              )}
            </div>
          )}

          {activeStep === 7 && (
            <div className="wizard-step-card">
              <div className="section-title">In-Kind Support Items</div>
              {!form.support_types.includes('in_kind_support') ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Enable &quot;in_kind_support&quot; in previous step to add items.</div>
              ) : (
                <>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setInKindItems((prev) => [...prev, blankInKindItem()])}>
                    <Plus size={14} /> Add In-Kind Item
                  </button>
                  <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                    {inKindItems.map((item, idx) => (
                      <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <strong>Item #{idx + 1}</strong>
                          <button type="button" className="btn btn-secondary btn-sm btn-icon" onClick={() => setInKindItems((prev) => prev.filter((_, i) => i !== idx))}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="form-grid">
                          <input className="form-control" placeholder="Item Category" value={item.item_category} onChange={(e) => setInKindItems((prev) => prev.map((x, i) => (i === idx ? { ...x, item_category: e.target.value } : x)))} />
                          <input className="form-control" placeholder="Item Name" value={item.item_name} onChange={(e) => setInKindItems((prev) => prev.map((x, i) => (i === idx ? { ...x, item_name: e.target.value } : x)))} />
                          <input className="form-control" type="number" min={1} placeholder="Quantity" value={item.quantity_required} onChange={(e) => setInKindItems((prev) => prev.map((x, i) => (i === idx ? { ...x, quantity_required: parseInt(e.target.value) || 1 } : x)))} />
                          <select className="form-control" value={item.intended_for} onChange={(e) => setInKindItems((prev) => prev.map((x, i) => (i === idx ? { ...x, intended_for: e.target.value as InKindItem['intended_for'] } : x)))}>
                            <option value="family">Family</option>
                            <option value="specific_individual">Specific Individual</option>
                          </select>
                          <input className="form-control" placeholder="Linked Individual (if any)" value={item.linked_individual} onChange={(e) => setInKindItems((prev) => prev.map((x, i) => (i === idx ? { ...x, linked_individual: e.target.value } : x)))} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeStep === 8 && (
            <div className="wizard-step-card">
              <div className="section-title">Documents & Photos</div>
              <div className="form-grid">
                <div>
                  <div className="form-label">Documents</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">CNIC (Head)</label>
                      <input className="form-control" type="file" accept="image/*,.pdf" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'documents_head_cnic');
                      }} />
                      {form.documents_head_cnic && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Uploaded</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">B-Forms</label>
                      <input className="form-control" type="file" accept="image/*,.pdf" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'documents_b_forms');
                      }} />
                      {form.documents_b_forms && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Uploaded</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Income Proof</label>
                      <input className="form-control" type="file" accept="image/*,.pdf" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'documents_income_proof');
                      }} />
                      {form.documents_income_proof && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Uploaded</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Medical Documents</label>
                      <input className="form-control" type="file" accept="image/*,.pdf" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'documents_medical');
                      }} />
                      {form.documents_medical && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Uploaded</div>}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="form-label">Photos</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">House Exterior</label>
                      <input className="form-control" type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'photos_house_exterior');
                      }} />
                      {form.photos_house_exterior && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Uploaded</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Living Conditions</label>
                      <input className="form-control" type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'photos_living_conditions');
                      }} />
                      {form.photos_living_conditions && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Uploaded</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Family Photo</label>
                      <input className="form-control" type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'photos_family');
                      }} />
                      {form.photos_family && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Uploaded</div>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Additional Information</label>
                <textarea className="form-control" rows={4} value={form.additional_info} onChange={(e) => setForm({ ...form, additional_info: e.target.value })} />
              </div>
            </div>
          )}

          <div className="wizard-actions">
            <button type="button" className="btn btn-secondary" disabled={activeStep === 0} onClick={() => setActiveStep((s) => Math.max(0, s - 1))}>
              <ChevronLeft size={14} /> Previous
            </button>
            {activeStep < sections.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={() => setActiveStep((s) => Math.min(sections.length - 1, s + 1))}>
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <div className="family-summary-actions" style={{ width: '100%' }}>
                <Link href={`/families/${id}/assessment`} className="btn btn-secondary">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save size={14} /> {loading ? 'Creating...' : 'Create Assessment'}
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
            Members: {metrics.total_family_members} | Children: {metrics.total_children} | Patients: {metrics.total_patients} | Disabled: {metrics.total_disabled}
          </div>
        </form>
      </div>
    </div>
  );
}
