'use client';

import { useState } from 'react';
import { orphansAPI, individualsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Baby, User, AlertCircle, CheckCircle2, Calendar, Phone, MapPin } from 'lucide-react';

interface OrphanProfileFormData {
  // Father Details
  deceased_father_name: string;
  father_cnic: string;
  father_date_of_death: string;
  father_cause_of_death: string;
  father_occupation: string;
  father_education: string;
  
  // Mother Details
  mother_name: string;
  mother_cnic: string;
  mother_mobile: string;
  mother_alive: boolean;
  mother_remarried: boolean;
  mother_occupation: string;
  mother_monthly_income: number;
  mother_date_of_death: string;
  mother_cause_of_death: string;
  
  // Guardian Details
  guardian_name: string;
  guardian_cnic: string;
  guardian_relationship: string;
  guardian_occupation: string;
  guardian_monthly_income: number;
  
  // Orphan Details
  orphan_name: string;
  orphan_gender: 'male' | 'female';
  orphan_caste: 'syed' | 'non_syed';
  orphan_sect: 'sunni' | 'other';
  orphan_b_form: string;
  orphan_date_of_birth: string;
  orphan_age: number;
  orphan_age_at_registration: number;
  num_brothers: number;
  num_sisters: number;
  num_registered_brothers: number;
  num_registered_sisters: number;
  num_siblings_under_12: number;
  mother_child_live_together: boolean;
  orphan_health_status: 'healthy' | 'sick' | 'disabled';
  disability_details: string;
  illness_details: string;
  
  // Educational Details
  currently_educated: boolean;
  school_name: string;
  school_address: string;
  current_class: string;
  enrolled_in_madrasa: boolean;
  madrasa_name: string;
  fee_status: 'free' | 'with_fees';
  monthly_school_fee: number;
  attendance_percentage: number;
  life_aim: string;
  skills_hobbies: string;
  child_has_income: boolean;
  child_monthly_income: number;
  
  // Zakat Eligibility
  zakat_eligibility_mother: string;
  zakat_eligibility_guardian: string;
  zakat_eligibility_based_on: 'mother' | 'guardian';
  priority_flag: boolean;
  
  // Household
  city: string;
  district: string;
  tehsil: string;
  residential_area: string;
  full_home_address: string;
  house_status: 'own' | 'rented';
  monthly_rent: number;
  house_condition: 'good' | 'average' | 'poor';
  furnishings_condition: 'good' | 'average' | 'poor';
  household_earnings: number;
  total_monthly_household_income: number;
  
  // Assets
  refrigerator: number;
  washing_machine: number;
  air_conditioner: number;
  television: number;
  vehicle_motorcycle: number;
  gold_grams: number;
  silver_grams: number;
  cash_savings: number;
  furniture_value: number;
  agricultural_land: number;
  business_property: number;
  other_property: number;
  
  // Other Assistance
  other_aid_source: boolean;
  other_aid_organization: string;
  other_aid_amount: number;
  
  // Applicant Details
  applicant_name: string;
  applicant_cnic: string;
  applicant_mobile: string;
  applicant_occupation: string;
  applicant_area: string;
  applicant_organization: string;
  applicant_relation_to_child: string;
}

export default function OrphanProfileForm({ familyId }: { familyId: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState<OrphanProfileFormData>({
    // Father Details
    deceased_father_name: '',
    father_cnic: '',
    father_date_of_death: '',
    father_cause_of_death: '',
    father_occupation: '',
    father_education: '',
    
    // Mother Details
    mother_name: '',
    mother_cnic: '',
    mother_mobile: '',
    mother_alive: true,
    mother_remarried: false,
    mother_occupation: '',
    mother_monthly_income: 0,
    mother_date_of_death: '',
    mother_cause_of_death: '',
    
    // Guardian Details
    guardian_name: '',
    guardian_cnic: '',
    guardian_relationship: '',
    guardian_occupation: '',
    guardian_monthly_income: 0,
    
    // Orphan Details
    orphan_name: '',
    orphan_gender: 'male',
    orphan_caste: 'non_syed',
    orphan_sect: 'sunni',
    orphan_b_form: '',
    orphan_date_of_birth: '',
    orphan_age: 0,
    orphan_age_at_registration: 0,
    num_brothers: 0,
    num_sisters: 0,
    num_registered_brothers: 0,
    num_registered_sisters: 0,
    num_siblings_under_12: 0,
    mother_child_live_together: true,
    orphan_health_status: 'healthy',
    disability_details: '',
    illness_details: '',
    
    // Educational Details
    currently_educated: true,
    school_name: '',
    school_address: '',
    current_class: '',
    enrolled_in_madrasa: false,
    madrasa_name: '',
    fee_status: 'free',
    monthly_school_fee: 0,
    attendance_percentage: 0,
    life_aim: '',
    skills_hobbies: '',
    child_has_income: false,
    child_monthly_income: 0,
    
    // Zakat Eligibility
    zakat_eligibility_mother: 'not_sahib_e_nisab',
    zakat_eligibility_guardian: 'not_sahib_e_nisab',
    zakat_eligibility_based_on: 'mother',
    priority_flag: false,
    
    // Household
    city: '',
    district: '',
    tehsil: '',
    residential_area: '',
    full_home_address: '',
    house_status: 'rented',
    monthly_rent: 0,
    house_condition: 'average',
    furnishings_condition: 'average',
    household_earnings: 0,
    total_monthly_household_income: 0,
    
    // Assets
    refrigerator: 0,
    washing_machine: 0,
    air_conditioner: 0,
    television: 0,
    vehicle_motorcycle: 0,
    gold_grams: 0,
    silver_grams: 0,
    cash_savings: 0,
    furniture_value: 0,
    agricultural_land: 0,
    business_property: 0,
    other_property: 0,
    
    // Other Assistance
    other_aid_source: false,
    other_aid_organization: '',
    other_aid_amount: 0,
    
    // Applicant Details
    applicant_name: '',
    applicant_cnic: '',
    applicant_mobile: '',
    applicant_occupation: '',
    applicant_area: '',
    applicant_organization: '',
    applicant_relation_to_child: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const handleChange = (field: keyof OrphanProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // First, create the individual record
      const individualResponse = await individualsAPI.create({
        family_id: familyId,
        full_name: formData.orphan_name,
        gender: formData.orphan_gender,
        dob: formData.orphan_date_of_birth,
        cnic_or_bform: formData.orphan_b_form,
        relationship_to_head: 'son',
        is_orphan: true,
        is_child: true,
      });

      // Then create the orphan profile
      await orphansAPI.create({
        individual_id: individualResponse.data.individual_id,
        deceased_father_name: formData.deceased_father_name,
        father_cnic: formData.father_cnic,
        father_date_of_death: formData.father_date_of_death,
        father_cause_of_death: formData.father_cause_of_death,
        mother_name: formData.mother_name,
        mother_cnic: formData.mother_cnic,
        mother_mobile: formData.mother_mobile,
        mother_alive: formData.mother_alive,
        mother_remarried: formData.mother_remarried,
        mother_monthly_income: formData.mother_monthly_income,
        guardian_name: formData.guardian_name,
        guardian_cnic: formData.guardian_cnic,
        guardian_relationship: formData.guardian_relationship,
        mother_child_live_together: formData.mother_child_live_together,
        house_status: formData.house_status,
        num_siblings: formData.num_brothers + formData.num_sisters,
        disability_details: formData.disability_details,
        school_name: formData.school_name,
        school_address: formData.school_address,
        current_class: formData.current_class,
        fee_status: formData.fee_status,
        monthly_school_fee: formData.monthly_school_fee,
        attendance_percentage: formData.attendance_percentage,
        skills_hobbies: formData.skills_hobbies,
        life_aim: formData.life_aim,
        child_has_income: formData.child_has_income,
        child_monthly_income: formData.child_monthly_income,
        other_aid_source: formData.other_aid_source,
        other_aid_amount: formData.other_aid_amount,
        zakat_eligibility: formData.zakat_eligibility_based_on === 'mother' 
          ? formData.zakat_eligibility_mother 
          : formData.zakat_eligibility_guardian,
        eligibility_based_on: formData.zakat_eligibility_based_on,
        priority_flag: formData.priority_flag,
        age_at_registration: formData.orphan_age_at_registration,
        applicant_name: formData.applicant_name,
        applicant_cnic: formData.applicant_cnic,
        applicant_mobile: formData.applicant_mobile,
        applicant_occupation: formData.applicant_occupation,
        applicant_area: formData.applicant_area,
        applicant_relation_to_child: formData.applicant_relation_to_child,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/orphans/${individualResponse.data.individual_id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create orphan profile');
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
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Orphan Profile Created Successfully</h2>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to orphan details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Baby size={24} /> Orphan Profile Registration
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 14 }}>
          Register a new orphan child for Saiban program
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
        {[1, 2, 3, 4, 5, 6].map((step) => (
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
            <Step1FatherDetails formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 2 && (
            <Step2MotherGuardian formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 3 && (
            <Step3OrphanDetails formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 4 && (
            <Step4Education formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 5 && (
            <Step5HouseholdAssets formData={formData} handleChange={handleChange} />
          )}
          {currentStep === 6 && (
            <Step6Applicant formData={formData} handleChange={handleChange} />
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
              }}
            >
              Previous
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
                }}
              >
                Next
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
                {submitting ? 'Creating...' : 'Create Orphan Profile'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// Step Components
function Step1FatherDetails({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 1: Deceased Father Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Father's Name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.deceased_father_name}
            onChange={(e) => handleChange('deceased_father_name', e.target.value)}
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
            value={formData.father_cnic}
            onChange={(e) => handleChange('father_cnic', e.target.value)}
            placeholder="1234567890123"
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
            value={formData.father_date_of_death}
            onChange={(e) => handleChange('father_date_of_death', e.target.value)}
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
            value={formData.father_cause_of_death}
            onChange={(e) => handleChange('father_cause_of_death', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Father's Occupation
          </label>
          <input
            type="text"
            value={formData.father_occupation}
            onChange={(e) => handleChange('father_occupation', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Father's Education
          </label>
          <input
            type="text"
            value={formData.father_education}
            onChange={(e) => handleChange('father_education', e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

function Step2MotherGuardian({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 2: Mother/Guardian Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Mother's Name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.mother_name}
            onChange={(e) => handleChange('mother_name', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Mother's CNIC <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.mother_cnic}
            onChange={(e) => handleChange('mother_cnic', e.target.value)}
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
            value={formData.mother_mobile}
            onChange={(e) => handleChange('mother_mobile', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Mother Alive? <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.mother_alive}
            onChange={(e) => handleChange('mother_alive', e.target.value === 'true')}
            required
            style={inputStyle}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        {formData.mother_alive && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Mother Remarried?
              </label>
              <select
                value={formData.mother_remarried}
                onChange={(e) => handleChange('mother_remarried', e.target.value === 'true')}
                style={inputStyle}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Mother's Occupation
              </label>
              <input
                type="text"
                value={formData.mother_occupation}
                onChange={(e) => handleChange('mother_occupation', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Mother's Monthly Income
              </label>
              <input
                type="number"
                value={formData.mother_monthly_income}
                onChange={(e) => handleChange('mother_monthly_income', parseInt(e.target.value) || 0)}
                min={0}
                style={inputStyle}
              />
            </div>
          </>
        )}
        {!formData.mother_alive && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Guardian Name
              </label>
              <input
                type="text"
                value={formData.guardian_name}
                onChange={(e) => handleChange('guardian_name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Guardian Relationship
              </label>
              <input
                type="text"
                value={formData.guardian_relationship}
                onChange={(e) => handleChange('guardian_relationship', e.target.value)}
                placeholder="Grandfather, Uncle, etc."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Guardian CNIC
              </label>
              <input
                type="text"
                value={formData.guardian_cnic}
                onChange={(e) => handleChange('guardian_cnic', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Guardian Monthly Income
              </label>
              <input
                type="number"
                value={formData.guardian_monthly_income}
                onChange={(e) => handleChange('guardian_monthly_income', parseInt(e.target.value) || 0)}
                min={0}
                style={inputStyle}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Step3OrphanDetails({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 3: Orphan Child Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Orphan's Name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.orphan_name}
            onChange={(e) => handleChange('orphan_name', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Gender <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.orphan_gender}
            onChange={(e) => handleChange('orphan_gender', e.target.value)}
            required
            style={inputStyle}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            B-Form Number <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.orphan_b_form}
            onChange={(e) => handleChange('orphan_b_form', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Date of Birth <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="date"
            value={formData.orphan_date_of_birth}
            onChange={(e) => handleChange('orphan_date_of_birth', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Current Age <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="number"
            value={formData.orphan_age}
            onChange={(e) => handleChange('orphan_age', parseInt(e.target.value) || 0)}
            required
            min={0}
            max={18}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Age at Registration <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="number"
            value={formData.orphan_age_at_registration}
            onChange={(e) => handleChange('orphan_age_at_registration', parseInt(e.target.value) || 0)}
            required
            min={0}
            max={12}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Number of Brothers
          </label>
          <input
            type="number"
            value={formData.num_brothers}
            onChange={(e) => handleChange('num_brothers', parseInt(e.target.value) || 0)}
            min={0}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Number of Sisters
          </label>
          <input
            type="number"
            value={formData.num_sisters}
            onChange={(e) => handleChange('num_sisters', parseInt(e.target.value) || 0)}
            min={0}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Health Status <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.orphan_health_status}
            onChange={(e) => handleChange('orphan_health_status', e.target.value)}
            required
            style={inputStyle}
          >
            <option value="healthy">Healthy</option>
            <option value="sick">Sick</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Step4Education({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 4: Educational Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Currently Educated? <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.currently_educated}
            onChange={(e) => handleChange('currently_educated', e.target.value === 'true')}
            required
            style={inputStyle}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        {formData.currently_educated && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                School Name
              </label>
              <input
                type="text"
                value={formData.school_name}
                onChange={(e) => handleChange('school_name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Current Class
              </label>
              <input
                type="text"
                value={formData.current_class}
                onChange={(e) => handleChange('current_class', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Fee Status
              </label>
              <select
                value={formData.fee_status}
                onChange={(e) => handleChange('fee_status', e.target.value)}
                style={inputStyle}
              >
                <option value="free">Free</option>
                <option value="with_fees">With Fees</option>
              </select>
            </div>
            {formData.fee_status === 'with_fees' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Monthly School Fee
                </label>
                <input
                  type="number"
                  value={formData.monthly_school_fee}
                  onChange={(e) => handleChange('monthly_school_fee', parseInt(e.target.value) || 0)}
                  min={0}
                  style={inputStyle}
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Attendance Percentage
              </label>
              <input
                type="number"
                value={formData.attendance_percentage}
                onChange={(e) => handleChange('attendance_percentage', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Enrolled in Madrasa?
              </label>
              <select
                value={formData.enrolled_in_madrasa}
                onChange={(e) => handleChange('enrolled_in_madrasa', e.target.value === 'true')}
                style={inputStyle}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            {formData.enrolled_in_madrasa && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Madrasa Name
                </label>
                <input
                  type="text"
                  value={formData.madrasa_name}
                  onChange={(e) => handleChange('madrasa_name', e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Life Aim
              </label>
              <input
                type="text"
                value={formData.life_aim}
                onChange={(e) => handleChange('life_aim', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Skills/Hobbies
              </label>
              <input
                type="text"
                value={formData.skills_hobbies}
                onChange={(e) => handleChange('skills_hobbies', e.target.value)}
                style={inputStyle}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Step5HouseholdAssets({ formData, handleChange }: { formData: any, handleChange: any }) {
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
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
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
            value={formData.district}
            onChange={(e) => handleChange('district', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            House Status <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.house_status}
            onChange={(e) => handleChange('house_status', e.target.value)}
            required
            style={inputStyle}
          >
            <option value="own">Own</option>
            <option value="rented">Rented</option>
          </select>
        </div>
        {formData.house_status === 'rented' && (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              Monthly Rent
            </label>
            <input
              type="number"
              value={formData.monthly_rent}
              onChange={(e) => handleChange('monthly_rent', parseInt(e.target.value) || 0)}
              min={0}
              style={inputStyle}
            />
          </div>
        )}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Household Earners
          </label>
          <input
            type="number"
            value={formData.household_earnings}
            onChange={(e) => handleChange('household_earnings', parseInt(e.target.value) || 0)}
            min={0}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Total Monthly Household Income
          </label>
          <input
            type="number"
            value={formData.total_monthly_household_income}
            onChange={(e) => handleChange('total_monthly_household_income', parseInt(e.target.value) || 0)}
            min={0}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Gold (grams)
          </label>
          <input
            type="number"
            value={formData.gold_grams}
            onChange={(e) => handleChange('gold_grams', parseInt(e.target.value) || 0)}
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
            value={formData.cash_savings}
            onChange={(e) => handleChange('cash_savings', parseInt(e.target.value) || 0)}
            min={0}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Furniture Value
          </label>
          <input
            type="number"
            value={formData.furniture_value}
            onChange={(e) => handleChange('furniture_value', parseInt(e.target.value) || 0)}
            min={0}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

function Step6Applicant({ formData, handleChange }: { formData: any, handleChange: any }) {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Step 6: Applicant Details & Zakat Eligibility</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Applicant Name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_name}
            onChange={(e) => handleChange('applicant_name', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Applicant CNIC <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_cnic}
            onChange={(e) => handleChange('applicant_cnic', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Applicant Mobile <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_mobile}
            onChange={(e) => handleChange('applicant_mobile', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Applicant Occupation <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.applicant_occupation}
            onChange={(e) => handleChange('applicant_occupation', e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Zakat Eligibility (Mother) <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={formData.zakat_eligibility_mother}
            onChange={(e) => handleChange('zakat_eligibility_mother', e.target.value)}
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
            Priority Flag
          </label>
          <select
            value={formData.priority_flag}
            onChange={(e) => handleChange('priority_flag', e.target.value === 'true')}
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

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: 14,
};
