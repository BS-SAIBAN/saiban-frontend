"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import DynamicFormRenderer from '@/components/DynamicFormRenderer';

const DynamicFormPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get('template');
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const handleFormSubmit = (result: any) => {
    setSubmissionResult(result);
  };

  const handleBack = () => {
    router.push('/template-manager');
  };

  if (!templateId) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f6', fontFamily: '"DM Sans", "Helvetica Neue", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e5e3', borderRadius: 12, padding: '48px 40px', maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FileText size={24} color="#d97706" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }}>No Template Selected</h3>
          <p style={{ fontSize: 14, color: '#777', margin: '0 0 28px' }}>Please select a template to generate the dynamic form.</p>
          <a
            href="/template-manager"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
          >
            Go to Template Manager
          </a>
        </div>
      </div>
    );
  }

  return (
    <DynamicFormRenderer
      templateId={templateId}
      onSubmit={handleFormSubmit}
      onBack={handleBack}
    />
  );
};

export default DynamicFormPage;
