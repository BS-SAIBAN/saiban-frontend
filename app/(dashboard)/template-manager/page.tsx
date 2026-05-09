"use client";

import React, { useState } from 'react';
import TemplateManager from '@/components/TemplateManager';

const TemplateManagerPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Dynamic Form Templates
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Manage and upload donor-specific form templates for dynamic form generation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              className="px-6 py-3 rounded-lg text-sm font-medium bg-slate-900 text-white"
            >
              Manage Templates
            </button>
          </div>

        <div className="mb-8">
          <TemplateManager onSelectTemplate={handleTemplateSelect} />
        </div>

        {selectedTemplate && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Template Ready for Use
                </h3>
                <p className="text-blue-700 text-sm">
                  Selected template is ready for dynamic form generation
                </p>
              </div>
              <a
                href={`/dynamic-form?template=${selectedTemplate}`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generate Form
              </a>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManagerPage;
