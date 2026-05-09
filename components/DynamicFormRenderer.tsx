"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Save, RotateCcw, AlertCircle, CheckCircle, FileText,
  ArrowLeft, Send, Loader2
} from 'lucide-react';

interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'textarea' | 'checkbox' | 'email' | 'phone' | 'section' | 'repeatable_group';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation_rules?: any;
}

interface FormDefinition {
  fields: FieldDefinition[];
  form_title?: string;
  form_description?: string;
  submit_button_text?: string;
}

interface DynamicFormRendererProps {
  templateId: string;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

const inputBase: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1px solid #e0e0de',
  borderRadius: 8,
  fontSize: 14,
  color: '#1a1a1a',
  backgroundColor: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
};

const inputError: React.CSSProperties = {
  ...inputBase,
  borderColor: '#dc2626',
  backgroundColor: '#fff5f5',
};

const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  templateId,
  onSubmit,
  isLoading = false,
  onBack,
}) => {
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { fetchFormStructure(); }, [templateId]);

  useEffect(() => { updateProgress(); }, [formData, formDefinition]);

  const fetchFormStructure = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/donor-form-templates/${templateId}/form-structure`);
      const formDef = response.data.form_definition;
      if (!formDef || !Array.isArray(formDef.fields)) throw new Error('Invalid form definition structure');
      setFormDefinition({
        fields: formDef.fields,
        form_title: formDef.form_title,
        form_description: formDef.form_description,
        submit_button_text: formDef.submit_button_text,
      });
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) setError('Authentication required. Please log in again.');
      else if (status === 404) setError('Template not found.');
      else setError(err.response?.data?.detail || err.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    }
  };

  const updateProgress = () => {
    if (!formDefinition) return;
    const inputFields = formDefinition.fields.filter(f => f.type !== 'section' && f.type !== 'repeatable_group');
    const filled = inputFields.filter(f => formData[f.name] !== undefined && formData[f.name] !== '' && formData[f.name] !== false);
    setProgress(inputFields.length ? Math.round((filled.length / inputFields.length) * 100) : 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    formDefinition?.fields.forEach(field => {
      if (field.type === 'section' || field.type === 'repeatable_group') return;
      if (field.required && !formData[field.name]) newErrors[field.name] = `${field.label} is required`;
      if (formData[field.name] && field.validation_rules?.pattern) {
        if (!new RegExp(field.validation_rules.pattern).test(formData[field.name]))
          newErrors[field.name] = field.validation_rules.message || 'Invalid format';
      }
    });
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      const response = await api.post('/donor-form-templates/submit', {
        template_id: templateId,
        form_data: formData,
        family_id: null,
        individual_id: null,
      });
      onSubmit(response.data);
      setShowSuccess(true);
      setFormData({});
      setProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const hasError = !!fieldErrors[field.name];
    const style = hasError ? inputError : inputBase;

    const commonProps = {
      style,
      value: formData[field.name] ?? '',
      placeholder: field.placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleInputChange(field.name, e.target.value),
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return <input type={field.type} {...commonProps} />;

      case 'number':
        return <input type="number" {...commonProps} />;

      case 'date':
        return <input type="date" {...commonProps} />;

      case 'textarea':
        return <textarea {...commonProps} rows={4} style={{ ...style, resize: 'vertical' }} />;

      case 'dropdown':
        return (
          <select {...commonProps} style={{ ...style, cursor: 'pointer' }}>
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );

      case 'checkbox':
        return (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!formData[field.name]}
              onChange={e => handleInputChange(field.name, e.target.checked)}
              style={{ marginTop: 2, accentColor: '#1a1a1a', width: 16, height: 16, flexShrink: 0 }}
            />
            <span style={{ fontSize: 14, color: '#333', lineHeight: 1.5 }}>{field.label}</span>
          </label>
        );

      case 'section':
        return null; // rendered separately

      case 'repeatable_group':
        return (
          <div style={{ padding: '14px 16px', border: '1px solid #e0e0de', borderRadius: 8, backgroundColor: '#fafafa' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
              Repeatable group — will be available in a future update.
            </p>
          </div>
        );

      default:
        return (
          <div style={{ padding: '10px 14px', border: '1px solid #fde68a', borderRadius: 8, backgroundColor: '#fffbeb' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#92400e' }}>Unsupported field type: {field.type}</p>
          </div>
        );
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
      <div style={{ width: 28, height: 28, border: '2px solid #e0e0de', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 14, color: '#888' }}>Loading form…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Fetch error ── */
  if (error && !formDefinition) return (
    <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 24px' }}>
      <div style={{ padding: '16px 20px', border: '1px solid #fcc', borderRadius: 10, backgroundColor: '#fff5f5' }}>
        <p style={{ fontWeight: 600, color: '#b91c1c', margin: '0 0 4px', fontSize: 14 }}>Failed to load form</p>
        <p style={{ color: '#c53030', margin: '0 0 12px', fontSize: 13 }}>{error}</p>
        <button onClick={fetchFormStructure}
          style={{ padding: '7px 16px', backgroundColor: '#b91c1c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
        >Retry</button>
      </div>
    </div>
  );

  if (!formDefinition) return (
    <div style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: 14 }}>No form definition available.</div>
  );

  /* ── Success ── */
  if (showSuccess) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, backgroundColor: '#f0faf4', border: '1px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={24} color="#16a34a" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }}>Form submitted</h3>
        <p style={{ fontSize: 14, color: '#777', margin: '0 0 28px' }}>Your form has been submitted successfully. Thank you.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setShowSuccess(false); setFormData({}); }}
            style={{ padding: '9px 20px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FileText size={14} /> Submit Another
          </button>
          {onBack && (
            <button onClick={onBack}
              style={{ padding: '9px 20px', backgroundColor: '#fff', color: '#555', border: '1px solid #e0e0de', borderRadius: 8, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ── Main form ── */
  const inputFieldCount = formDefinition.fields.filter(f => f.type !== 'section' && f.type !== 'repeatable_group').length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f6', fontFamily: '"DM Sans", "Helvetica Neue", sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e3', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 14, height: 60 }}>
          {onBack && (
            <button onClick={onBack}
              style={{ background: 'none', border: '1px solid #e0e0de', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={15} />
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formDefinition.form_title || 'Dynamic Form'}
            </h1>
            {formDefinition.form_description && (
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{formDefinition.form_description}</p>
            )}
          </div>

          {/* Progress indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 120, height: 4, backgroundColor: '#e5e5e3', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#1a1a1a', borderRadius: 99, transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontSize: 12, color: '#888', minWidth: 32 }}>{progress}%</span>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px 60px' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, overflow: 'hidden' }}>
          <form onSubmit={onFormSubmit}>
            <div style={{ padding: '28px 32px' }}>

              {formDefinition.fields.map((field, index) => {

                /* Section header */
                if (field.type === 'section') {
                  const sectionNum = formDefinition.fields.slice(0, index).filter(f => f.type === 'section').length + 1;
                  return (
                    <div key={field.name} style={{ marginTop: index === 0 ? 0 : 36, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #e5e5e3' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 24, height: 24, backgroundColor: '#1a1a1a', color: '#fff', borderRadius: '50%', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {sectionNum}
                        </span>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {field.label}
                        </h3>
                      </div>
                    </div>
                  );
                }

                /* Regular field */
                const rendered = renderField(field);
                if (rendered === null) return null;

                return (
                  <div key={field.name} style={{ marginBottom: 18 }}>
                    {field.type !== 'checkbox' && (
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>
                        {field.label}
                        {field.required && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
                      </label>
                    )}

                    {rendered}

                    {fieldErrors[field.name] && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <AlertCircle size={13} color="#dc2626" />
                        <span style={{ fontSize: 12, color: '#dc2626' }}>{fieldErrors[field.name]}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submission error */}
              {error && (
                <div style={{ marginTop: 8, padding: '12px 16px', border: '1px solid #fcc', borderRadius: 8, backgroundColor: '#fff5f5', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <AlertCircle size={15} color="#b91c1c" style={{ marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>{error}</p>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div style={{ padding: '16px 32px', borderTop: '1px solid #e5e5e3', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#999' }}>
                {inputFieldCount} field{inputFieldCount !== 1 ? 's' : ''}
              </span>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setFormData({}); setFieldErrors({}); setProgress(0); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e0e0de', borderRadius: 8, backgroundColor: '#fff', color: '#555', fontSize: 14, cursor: 'pointer' }}
                >
                  <RotateCcw size={13} /> Reset
                </button>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 20px',
                    border: 'none', borderRadius: 8,
                    backgroundColor: submitting || isLoading ? '#999' : '#1a1a1a',
                    color: '#fff', fontSize: 14, fontWeight: 500,
                    cursor: submitting || isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting
                    ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting…</>
                    : <><Send size={13} /> {formDefinition.submit_button_text || 'Submit Form'}</>
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DynamicFormRenderer;