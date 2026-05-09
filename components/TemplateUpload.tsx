"use client";

import React, { useState } from 'react';
import api from '@/lib/api';

interface TemplateUploadProps {
  onUploadSuccess?: (templateId: string) => void;
}

const TemplateUpload: React.FC<TemplateUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/donor-form-templates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = response.data;
      setSuccess(`Template uploaded successfully! Template ID: ${result.template_id}`);
      onUploadSuccess?.(result.template_id);
      
      // Reset file input
      event.target.value = '';
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Upload Form Template
      </h2>
      
      <p className="text-gray-600 mb-6">
        Upload a JSON file containing form field definitions for donor-specific forms.
      </p>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Click to upload JSON template file
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                JSON files only
              </p>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-md">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-blue-800">Uploading template...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">Error: {error}</div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-green-800">{success}</div>
          </div>
        )}

        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Template Format Example:
          </h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "donor_name": "Donor Name",
  "description": "Optional description",
  "form_definition": {
    "fields": [
      {
        "name": "field_name",
        "label": "Field Label",
        "type": "text|number|date|dropdown|textarea|checkbox",
        "required": true,
        "options": ["option1", "option2"]
      }
    ]
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TemplateUpload;
