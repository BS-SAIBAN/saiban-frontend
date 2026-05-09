"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            No Template Selected
          </h2>
          <p className="text-yellow-700 mb-4">
            Please select a template to generate the dynamic form.
          </p>
          <a
            href="/template-manager"
            className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
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
