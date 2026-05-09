"use client";

import React, { useState, useEffect } from 'react';
import TemplateManager from '@/components/TemplateManager';
import TemplateUpload from '@/components/TemplateUpload';
import { useSearchParams } from 'next/navigation';

const TemplateManagerPage = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'manage' | 'upload'>('manage');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'upload') {
      setActiveTab('upload');
    }
  }, [searchParams]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleUploadSuccess = (templateId: string) => {
    setActiveTab('manage'); // Switch to manage tab after successful upload
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dynamic Form Templates
          </h1>
          <p className="text-gray-600">
            Manage and upload donor-specific form templates for dynamic form generation.
          </p>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Templates
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upload Template
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'manage' && (
          <TemplateManager onSelectTemplate={handleTemplateSelect} />
        )}

        {activeTab === 'upload' && (
          <TemplateUpload onUploadSuccess={handleUploadSuccess} />
        )}

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
  );
};

export default TemplateManagerPage;
