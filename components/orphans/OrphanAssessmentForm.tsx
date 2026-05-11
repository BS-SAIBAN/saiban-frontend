'use client';

import { useState } from 'react';
import { assessmentsAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { FileText, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Baby } from 'lucide-react';

interface OrphanAssessmentFormData {
  case_field_information: {
    field_worker_name: string;
    field_worker_remarks: string;
    gps_location?: { lat: number; lng: number };
  };
  orphan_father_verification: {
    father_name: string;
    father_cnic: string;
    father_date_of_birth: string;
    father_age: number;
    father_education: string;
    father_occupation: string;
    father_date_of_death: string;
    father_cause_of_death: string;
  };
  orphan_guardian_assessment: {
    mother_name: string;
    mother_cnic: string;
    mother_date_of_birth: string;
    mother_age: number;
    mother_education: string;
    mother_tongue: string;
    mother_native_area: string;
    mother_mobile: string;
    mother_occupation: string;
    mother_monthly_income: number;
    mother_alive: boolean;
    mother_remarried: boolean;
    mother_date_of_death?: string;
    mother_cause_of_death?: string;
    guardian_name?: string;
    guardian_relationship?: string;
    guardian_cnic?: string;
    guardian_education?: string;
    guardian_occupation?: string;
    guardian_monthly_income?: number;
    total_monthly_household_income: number;
    household_earnings: number;
    city: string;
    district: string;
    tehsil: string;
    residential_area: string;
    full_home_address: string;
    house_status: 'own' | 'rented';
    monthly_rent: number;
    house_condition: 'good' | 'average' | 'poor';
    furnishings_condition: 'good' | 'average' | 'poor';
    refrigerator?: number;
    washing_machine?: number;
    air_conditioner?: number;
    television?: number;
    vehicle_motorcycle?: number;
    silver_grams?: number;
    furniture_value?: number;
    gold_grams?: number;
    cash_savings?: number;
    agricultural_land?: number;
    business_property?: number;
    other_property?: number;
  };
  orphan_educational_verification: {
    currently_educated: boolean;
    education_reason?: string;
    education_support_conditions?: string;
    school_name?: string;
    school_address?: string;
    current_class?: string;
    enrolled_in_madrasa: boolean;
    madrasa_name?: string;
    studies_subject?: string;
    fee_status?: 'free' | 'with_fees';
    monthly_school_fee?: number;
    attendance_percentage?: number;
    life_aim?: string;
    technical_interest?: boolean;
    skills_hobbies?: string;
    child_has_income?: boolean;
    child_monthly_income?: number;
  };
  orphan_zakat_assessment: {
    zakat_eligibility_mother?: string;
    zakat_eligibility_guardian?: string;
    zakat_eligibility_based_on: 'mother' | 'guardian';
    priority_flag: boolean;
  };
  orphan_age_compliance: {
    orphan_age: number;
    orphan_age_at_registration: number;
  };
  document_checklist: {
    applicant_cnic_copy: boolean;
    orphan_b_form: boolean;
    father_death_certificate: boolean;
    mother_cnic_copy: boolean;
    guardian_cnic_copy?: boolean;
    school_verification_letter?: boolean;
    other_documents?: boolean;
  };
  photo_checklist: {
    orphan_photo: boolean;
    house_exterior_photo: boolean;
    living_conditions_photo: boolean;
    family_photo?: boolean;
  };
}

export default function OrphanAssessmentForm({ familyId }: { familyId: string }) {
  const router = useRouter();
  const params = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  
  const [formData, setFormData] = useState<OrphanAssessmentFormData>({
    case_field_information: {
      field_worker_name: '',
      field_worker_remarks: '',
    },
    orphan_father_verification: {
      father_name: '',
      father_cnic: '',
      father_date_of_birth: '',
      father_age: 0,
      father_education: '',
      father_occupation: '',
      father_date_of_death: '',
      father_cause_of_death: '',
    },
    orphan_guardian_assessment: {
      mother_name: '',
      mother_cnic: '',
      mother_date_of_birth: '',
      mother_age: 0,
      mother_education: '',
      mother_tongue: '',
      mother_native_area: '',
      mother_mobile: '',
      mother_occupation: '',
      mother_monthly_income: 0,
      mother_alive: true,
      mother_remarried: false,
      total_monthly_household_income: 0,
      household_earnings: 0,
      city: '',
      district: '',
      tehsil: '',
      residential_area: '',
      full_home_address: '',
      house_status: 'rented',
      monthly_rent: 0,
      house_condition: 'average',
      furnishings_condition: 'average',
    },
    orphan_educational_verification: {
      currently_educated: true,
      enrolled_in_madrasa: false,
    },
    orphan_zakat_assessment: {
      zakat_eligibility_mother: 'not_sahib_e_nisab',
      zakat_eligibility_based_on: 'mother',
      priority_flag: false,
    },
    orphan_age_compliance: {
      orphan_age: 0,
      orphan_age_at_registration: 0,
    },
    document_checklist: {
      applicant_cnic_copy: false,
      orphan_b_form: false,
      father_death_certificate: false,
      mother_cnic_copy: false,
    },
    photo_checklist: {
      orphan_photo: false,
      house_exterior_photo: false,
      living_conditions_photo: false,
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (section: keyof OrphanAssessmentFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await assessmentsAPI.create({
        family_id: familyId,
        assessment_date: new Date().toISOString().split('T')[0],
        case_field_information: formData.case_field_information,
        orphan_father_verification: formData.orphan_father_verification,
        orphan_guardian_assessment: formData.orphan_guardian_assessment,
        orphan_educational_verification: formData.orphan_educational_verification,
        orphan_zakat_assessment: formData.orphan_zakat_assessment,
        orphan_age_compliance: formData.orphan_age_compliance,
        document_checklist: formData.document_checklist,
        photo_checklist: formData.photo_checklist,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/families/${familyId}/assessment`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create orphan assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <CheckCircle2 size={48} style={{ color: 'var(--green)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Orphan Assessment Created Successfully</h2>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to assessment details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Baby size={24} /> Orphan Assessment
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 14 }}>
          Complete the comprehensive orphan assessment for this family
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: 12, borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Progress Steps */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: 4,
              background: step <= currentStep ? 'var(--accent)' : 'var(--border)',
              borderRadius: 2,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          {currentStep === 1 && (
            <AssessmentStep1 formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 2 && (
            <AssessmentStep2 formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 3 && (
            <AssessmentStep3 formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 4 && (
            <AssessmentStep4 formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 5 && (
            <AssessmentStep5 formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 6 && (
            <AssessmentStep6 formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 7 && (
            <AssessmentStep7 formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 8 && (
            <AssessmentStep8 formData={formData} handleChange={handleChange} />
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 500,
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 1 ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: '1px solid var(--accent)',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: '1px solid var(--accent)',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Creating...' : 'Create Assessment'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// Assessment Step Components
function AssessmentStep1({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 1: Case & Field Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Field Worker Name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.case_field_information.field_worker_name}
            onChange={(e) => handleChange('case_field_information', 'field_worker_name', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Field Worker Remarks <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <textarea
            value={formData.case_field_information.field_worker_remarks}
            onChange={(e) => handleChange('case_field_information', 'field_worker_remarks', e.target.value)}
            required
            rows={3}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

function AssessmentStep2({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 2: Father Verification</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Father's Name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.orphan_father_verification.father_name}
            onChange={(e) => handleChange('orphan_father_verification', 'father_name', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Father's CNIC <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.orphan_father_verification.father_cnic}
            onChange={(e) => handleChange('orphan_father_verification', 'father_cnic', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Date of Death <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="date"
            value={formData.orphan_father_verification.father_date_of_death}
            onChange={(e) => handleChange('orphan_father_verification', 'father_date_of_death', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Cause of Death <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.orphan_father_verification.father_cause_of_death}
            onChange={(e) => handleChange('orphan_father_verification', 'father_cause_of_death', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

function AssessmentStep3({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 3: Guardian Assessment</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Mother's Name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.orphan_guardian_assessment.mother_name}
            onChange={(e) => handleChange('orphan_guardian_assessment', 'mother_name', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Mother's Mobile <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.orphan_guardian_assessment.mother_mobile}
            onChange={(e) => handleChange('orphan_guardian_assessment', 'mother_mobile', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Mother Alive? <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.orphan_guardian_assessment.mother_alive}
            onChange={(e) => handleChange('orphan_guardian_assessment', 'mother_alive', e.target.value === 'true')}
            required
            style={inputStyle}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Total Monthly Household Income <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="number"
            value={formData.orphan_guardian_assessment.total_monthly_household_income}
            onChange={(e) => handleChange('orphan_guardian_assessment', 'total_monthly_household_income', parseInt(e.target.value) || 0)}
            required
            min={0}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

function AssessmentStep4({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 4: Educational Verification</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Currently Educated? <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.orphan_educational_verification.currently_educated}
            onChange={(e) => handleChange('orphan_educational_verification', 'currently_educated', e.target.value === 'true')}
            required
            style={inputStyle}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        {formData.orphan_educational_verification.currently_educated && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                School Name
              </label>
              <input
                type="text"
                value={formData.orphan_educational_verification.school_name}
                onChange={(e) => handleChange('orphan_educational_verification', 'school_name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Current Class
              </label>
              <input
                type="text"
                value={formData.orphan_educational_verification.current_class}
                onChange={(e) => handleChange('orphan_educational_verification', 'current_class', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Attendance Percentage
              </label>
              <input
                type="number"
                value={formData.orphan_educational_verification.attendance_percentage}
                onChange={(e) => handleChange('orphan_educational_verification', 'attendance_percentage', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
                style={inputStyle}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AssessmentStep5({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 5: Household & Assets</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            City <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.orphan_guardian_assessment.city}
            onChange={(e) => handleChange('orphan_guardian_assessment', 'city', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            District <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.orphan_guardian_assessment.district}
            onChange={(e) => handleChange('orphan_guardian_assessment', 'district', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            House Status <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.orphan_guardian_assessment.house_status}
            onChange={(e) => handleChange('orphan_guardian_assessment', 'house_status', e.target.value)}
            required
            style={inputStyle}
          >
            <option value="own">Own</option>
            <option value="rented">Rented</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Gold (grams)
          </label>
          <input
            type="number"
            value={formData.orphan_guardian_assessment.gold_grams}
            onChange={(e) => handleChange('orphan_guardian_assessment', 'gold_grams', parseInt(e.target.value) || 0)}
            min={0}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Cash/Savings
          </label>
          <input
            type="number"
            value={formData.orphan_guardian_assessment.cash_savings}
            onChange={(e) => handleChange('orphan_guardian_assessment', 'cash_savings', parseInt(e.target.value) || 0)}
            min={0}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

function AssessmentStep6({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 6: Zakat Eligibility</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Zakat Eligibility (Mother) <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.orphan_zakat_assessment.zakat_eligibility_mother}
            onChange={(e) => handleChange('orphan_zakat_assessment', 'zakat_eligibility_mother', e.target.value)}
            required
            style={inputStyle}
          >
            <option value="not_sahib_e_nisab">Not Sahib-e-Nisab (can receive Zakat)</option>
            <option value="sahib_e_nisab_needy">Sahib-e-Nisab but in need</option>
            <option value="sahib_e_nisab_not_needy">Sahib-e-Nisab and not in need</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Eligibility Based On <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.orphan_zakat_assessment.zakat_eligibility_based_on}
            onChange={(e) => handleChange('orphan_zakat_assessment', 'zakat_eligibility_based_on', e.target.value)}
            required
            style={inputStyle}
          >
            <option value="mother">Mother</option>
            <option value="guardian">Guardian</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Priority Flag
          </label>
          <select
            value={formData.orphan_zakat_assessment.priority_flag}
            onChange={(e) => handleChange('orphan_zakat_assessment', 'priority_flag', e.target.value === 'true')}
            style={inputStyle}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function AssessmentStep7({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 7: Document Checklist</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.document_checklist.applicant_cnic_copy}
              onChange={(e) => handleChange('document_checklist', 'applicant_cnic_copy', e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Applicant CNIC Copy <span style={{ color: 'var(--red)' }}>*</span>
          </label>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.document_checklist.orphan_b_form}
              onChange={(e) => handleChange('document_checklist', 'orphan_b_form', e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Orphan B-Form <span style={{ color: 'var(--red)' }}>*</span>
          </label>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.document_checklist.father_death_certificate}
              onChange={(e) => handleChange('document_checklist', 'father_death_certificate', e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Father's Death Certificate <span style={{ color: 'var(--red)' }}>*</span>
          </label>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.document_checklist.mother_cnic_copy}
              onChange={(e) => handleChange('document_checklist', 'mother_cnic_copy', e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Mother's CNIC Copy <span style={{ color: 'var(--red)' }}>*</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function AssessmentStep8({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 8: Photo Checklist</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.photo_checklist.orphan_photo}
              onChange={(e) => handleChange('photo_checklist', 'orphan_photo', e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Orphan Child Photo <span style={{ color: 'var(--red)' }}>*</span>
          </label>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.photo_checklist.house_exterior_photo}
              onChange={(e) => handleChange('photo_checklist', 'house_exterior_photo', e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            House Exterior Photo <span style={{ color: 'var(--red)' }}>*</span>
          </label>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.photo_checklist.living_conditions_photo}
              onChange={(e) => handleChange('photo_checklist', 'living_conditions_photo', e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Living Conditions Photo <span style={{ color: 'var(--red)' }}>*</span>
          </label>
        </div>
      </div>
      
      <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Assessment Summary</h4>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <p><strong>Family:</strong> SB Category</p>
          <p><strong>Assessment Type:</strong> Orphan Assessment</p>
          <p><strong>Priority:</strong> {formData.orphan_zakat_assessment.priority_flag ? 'Yes' : 'No'}</p>
          <p><strong>Zakat Eligibility:</strong> {formData.orphan_zakat_assessment.zakat_eligibility_mother}</p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: 14,
};
