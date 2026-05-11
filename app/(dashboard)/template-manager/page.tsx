"use client";

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import TemplateManager from '@/components/TemplateManager';

const TemplateManagerPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f6', fontFamily: '"DM Sans", "Helvetica Neue", sans-serif' }}>
      {selectedTemplate && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
          <div style={{ padding: '16px 20px', backgroundColor: '#fff', border: '1px solid #1a1a1a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, backgroundColor: '#f0faf4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} color="#16a34a" />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#1a1a1a', margin: 0, fontSize: 14 }}>Template selected</p>
                <p style={{ color: '#888', margin: 0, fontSize: 13 }}>Ready to generate your dynamic form</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <TemplateManager onSelectTemplate={handleTemplateSelect} />
    </div>
  );
};

export default TemplateManagerPage;
