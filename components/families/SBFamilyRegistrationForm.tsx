'use client';

import { useState } from 'react';
import { familiesAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Baby, Home, MapPin, AlertCircle, CheckCircle2, User } from 'lucide-react';

interface SBFamilyFormData {
  area: string;
  city: string;
  district: string;
  tehsil: string;
  full_address: string;
  housing_type: 'owned' | 'rented';
  monthly_rent: number;
  house_condition: 'good' | 'average' | 'poor';
  applicant: {
    full_name: string;
    dob: string;
    cnic_or_bform: string;
    is_alive: boolean;
    relationship_to_head: string;
    gender: 'male' | 'female';
    contact_number?: string;
    occupation?: string;
    religion?: string;
    caste?: string;
    monthly_income?: number;
  };
}

export default function SBFamilyRegistrationForm({ onFamilyCreated }: { onFamilyCreated?: (id: string) => void } = {}) {
  const router = useRouter();
  const [formData, setFormData] = useState<SBFamilyFormData>({
    area: '',
    city: '',
    district: '',
    tehsil: '',
    full_address: '',
    housing_type: 'rented',
    monthly_rent: 0,
    house_condition: 'average',
    applicant: {
      full_name: '',
      dob: '',
      cnic_or_bform: '',
      is_alive: true,
      relationship_to_head: 'head',
      gender: 'female',
      contact_number: '',
      occupation: '',
      religion: 'Islam',
      caste: '',
      monthly_income: 0,
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await familiesAPI.create({
        category: 'SB',
        registration_number: `SB-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        area: formData.area,
        city: formData.city,
        full_address: formData.full_address,
        housing_type: formData.housing_type,
        status: 'pending_assessment',
        applicant: formData.applicant,
      });

      setSuccess(true);
      if (onFamilyCreated) {
        onFamilyCreated(response.data.family_id);
      }
      setTimeout(() => {
        router.push(`/families/${response.data.family_id}`);
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail 
        ? (typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Failed to create SB family')
        : 'Failed to create SB family';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof SBFamilyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <CheckCircle2 size={48} style={{ color: 'var(--green)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>SB Family Created Successfully</h2>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to family details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Baby size={24} /> Register SB Family
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: 14 }}>
          Create a new Saiban (Orphan) family registration
        </p>
      </div>

      {error && (
        <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: 12, borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Applicant Information */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={16} /> Applicant (Head of Family) Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Full Name <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.applicant.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: { ...prev.applicant, full_name: e.target.value } }))}
                  placeholder="Mother/Guardian Name"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  CNIC/B-Form <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.applicant.cnic_or_bform}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: { ...prev.applicant, cnic_or_bform: e.target.value } }))}
                  placeholder="1234567890123"
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
                  value={formData.applicant.dob}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: { ...prev.applicant, dob: e.target.value } }))}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Contact Number <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.applicant.contact_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: { ...prev.applicant, contact_number: e.target.value } }))}
                  placeholder="03001234567"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Gender <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <select
                  value={formData.applicant.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: { ...prev.applicant, gender: e.target.value as 'male' | 'female' } }))}
                  required
                  style={inputStyle}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Religion <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.applicant.religion}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: { ...prev.applicant, religion: e.target.value } }))}
                  placeholder="Islam"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Caste <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.applicant.caste}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: { ...prev.applicant, caste: e.target.value } }))}
                  placeholder="Non-Syed"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Occupation <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.applicant.occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: { ...prev.applicant, occupation: e.target.value } }))}
                  placeholder="Housewife"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Monthly Income <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.applicant.monthly_income}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: { ...prev.applicant, monthly_income: parseInt(e.target.value) || 0 } }))}
                  min={0}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Home size={16} /> Basic Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Area <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  placeholder="Gulshan"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} /> Location Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  City <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Karachi"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
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
                  placeholder="Karachi"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Tehsil <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.tehsil}
                  onChange={(e) => handleChange('tehsil', e.target.value)}
                  placeholder="Gulshan"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Full Address <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <textarea
                value={formData.full_address}
                onChange={(e) => handleChange('full_address', e.target.value)}
                placeholder="House #123, Block 10, Gulshan, Karachi"
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Housing Information */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Housing Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Housing Type <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <select
                  value={formData.housing_type}
                  onChange={(e) => handleChange('housing_type', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                >
                  <option value="owned">Owned</option>
                  <option value="rented">Rented</option>
                </select>
              </div>

              {formData.housing_type === 'rented' && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Monthly Rent (PKR)
                  </label>
                  <input
                    type="number"
                    value={formData.monthly_rent || ''}
                    onChange={(e) => handleChange('monthly_rent', parseInt(e.target.value) || undefined)}
                    placeholder="5000"
                    min={0}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  House Condition <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <select
                  value={formData.house_condition}
                  onChange={(e) => handleChange('house_condition', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                >
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor / In need of repair</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
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
              {submitting ? 'Creating...' : 'Create SB Family'}
            </button>
          </div>
        </div>
      </form>
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
