"use client";

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import TemplateUpload from './TemplateUpload';
import { useAuth } from '@/lib/auth-context';
import {
  Search, Filter, Eye, Download, Trash2, Calendar, FileText,
  CheckCircle, XCircle, Clock, Plus, Grid, List, MoreVertical
} from 'lucide-react';

interface Template {
  id: string;
  donor_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface TemplateManagerProps {
  onSelectTemplate?: (templateId: string) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onSelectTemplate }) => {
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    console.log('TemplateManager component mounted');
    console.log('Auth loading:', authLoading);
    console.log('User:', user);
    
    // Wait for auth to load, then check if user is authenticated
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('No user found, setting error');
      setError('Please log in to access templates.');
      setLoading(false);
      return;
    }
    
    console.log('User authenticated, fetching templates');
    fetchTemplates();

    return () => {
      console.log('TemplateManager component unmounting');
      isMountedRef.current = false;
    };
  }, [user, authLoading]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        console.log('Loading timeout reached, forcing error state');
        setError('Loading timeout. Please refresh the page and try again.');
        setLoading(false);
      }, 10000); // 10 second timeout
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown-trigger]') && !target.closest('[data-dropdown-menu]')) {
        setShowDropdown(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fetchTemplates = async (retryCount = 0) => {
    console.log('fetchTemplates called, retry count:', retryCount);
    try {
      console.log('Setting loading to true');
      setLoading(true);
      setError(null);
      
      // Check if token exists in localStorage for debugging
      const token = localStorage.getItem('access_token');
      console.log('Token exists in localStorage:', !!token);
      console.log('Token length:', token?.length || 0);
      
      if (!token && retryCount === 0) {
        console.log('No token found, attempting to refresh auth');
        // Try to trigger auth refresh by waiting a bit and retrying
        setTimeout(() => fetchTemplates(1), 1000);
        return;
      }
      
      console.log('Making API call to /donor-form-templates/');
      const response = await api.get('/donor-form-templates/');
      console.log('API response received:', response.status, response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      console.log('Response data keys:', response.data ? Object.keys(response.data) : 'No data');
      
      // The API returns an array directly (List[DonorFormTemplateSchema])
      const templatesData = Array.isArray(response.data) ? response.data : [];
      console.log('Templates data:', templatesData);
      console.log('First template sample:', templatesData[0]);
      console.log('Setting templates:', templatesData.length, 'items');
      setTemplates(templatesData);
    } catch (err: any) {
      console.log('API call failed:', err);
      console.log('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      if (!isMountedRef.current) return;
      const status = err.response?.status;
      console.log('Error status:', status);
      
      // Retry on network errors or 500 errors
      if (retryCount < 2 && (!status || status >= 500)) {
        console.log('Retrying due to network/server error...');
        setTimeout(() => fetchTemplates(retryCount + 1), 2000 * (retryCount + 1));
        return;
      }
      
      if (status === 401) {
        setError('Authentication required. Please log in again.');
        // Clear invalid tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else if (status === 404) {
        setError('Template API endpoint not found.');
      } else if (status === 403) {
        setError('Access denied. You do not have permission to view templates.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to load templates');
      }
    } finally {
      console.log('Finally block, setting loading to false');
      setLoading(false); // Always set loading to false in finally block
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    onSelectTemplate?.(templateId);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setShowDeleteModal(templateId);
  };

  const confirmDeleteTemplate = async () => {
    const templateId = showDeleteModal;
    if (!templateId) return;

    try {
      await api.delete(`/donor-form-templates/${templateId}`);
      setTemplates(templates.filter(t => t.id !== templateId));
      if (selectedTemplate === templateId) setSelectedTemplate(null);
      if (previewTemplate?.id === templateId) setPreviewTemplate(null);
      setShowDeleteModal(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete template');
    }
  };

  const handleDownloadTemplate = async (templateId: string, templateName: string) => {
    try {
      const response = await api.get(`/donor-form-templates/${templateId}`);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.replace(/\s+/g, '_')}_template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to download template');
    }
  };

  const handleUploadSuccess = (templateId: string) => {
    setShowUploadModal(false);
    fetchTemplates();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && template.is_active) ||
      (filterStatus === 'inactive' && !template.is_active);
    
    console.log('Filtering template:', template.donor_name, {
      searchQuery,
      filterStatus,
      matchesSearch,
      matchesFilter,
      template_is_active: template.is_active
    });
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f6', fontFamily: '"DM Sans", "Helvetica Neue", sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e3', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, backgroundColor: '#1a1a1a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>Form Templates</h1>
              <p style={{ fontSize: 13, color: '#888', margin: 0, marginTop: 2 }}>{filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
          >
            <Plus size={16} />
            New Template
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px' }}>

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 280, maxWidth: 400, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <input
              type="text"
              placeholder="Search templates…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '11px 14px 11px 42px',
                border: '1px solid #e0e0de',
                borderRadius: 10,
                fontSize: 14,
                color: '#1a1a1a',
                backgroundColor: '#fff',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 16px',
              border: `1px solid ${showFilters || filterStatus !== 'all' ? '#1a1a1a' : '#e0e0de'}`,
              borderRadius: 10,
              backgroundColor: showFilters || filterStatus !== 'all' ? '#1a1a1a' : '#fff',
              color: showFilters || filterStatus !== 'all' ? '#fff' : '#555',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Filter size={15} />
            Filter
            {filterStatus !== 'all' && (
              <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, padding: '2px 8px', fontSize: 11 }}>1</span>
            )}
          </button>

          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #e0e0de', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' }}>
            {(['grid', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '11px 14px', border: 'none', cursor: 'pointer',
                  backgroundColor: viewMode === mode ? '#f8f8f7' : 'transparent',
                  color: viewMode === mode ? '#1a1a1a' : '#999',
                  display: 'flex', alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                {mode === 'grid' ? <Grid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '16px 20px', backgroundColor: '#fff', border: '1px solid #e0e0de', borderRadius: 10 }}>
            <span style={{ fontSize: 14, color: '#666', fontWeight: 500, marginRight: 8 }}>Status:</span>
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${filterStatus === s ? '#1a1a1a' : '#e0e0de'}`,
                  backgroundColor: filterStatus === s ? '#1a1a1a' : '#fff',
                  color: filterStatus === s ? '#fff' : '#555',
                  transition: 'all 0.2s ease',
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 20, padding: '14px 16px', backgroundColor: '#fff5f5', border: '1px solid #fcc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 600, color: '#b91c1c', margin: '0 0 2px', fontSize: 14 }}>Error</p>
              <p style={{ color: '#c53030', margin: 0, fontSize: 13 }}>{error}</p>
            </div>
            <button
              onClick={() => fetchTemplates()}
              style={{ padding: '6px 14px', backgroundColor: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: 16 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #e0e0de', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#888', fontSize: 15, fontWeight: 500 }}>Loading templates…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '120px 0' }}>
            <div style={{ width: 64, height: 64, backgroundColor: '#f5f5f5', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FileText size={28} color="#aaa" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }}>
              {templates.length === 0 ? 'No templates yet' : 'No matching templates'}
            </h3>
            <p style={{ fontSize: 15, color: '#888', margin: '0 0 24px', lineHeight: 1.5 }}>
              {templates.length === 0
                ? 'Create your first template to get started with dynamic forms.'
                : 'Try adjusting your search or filters to find what you\'re looking for.'}
            </p>
            {templates.length === 0 && (
              <button
                onClick={() => setShowUploadModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
              >
                <Plus size={16} /> Create Your First Template
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                showDropdown={showDropdown === template.id}
                onSelect={() => handleSelectTemplate(template.id)}
                onPreview={() => setPreviewTemplate(template)}
                onDownload={() => handleDownloadTemplate(template.id, template.donor_name)}
                onDelete={() => handleDeleteTemplate(template.id)}
                onToggleDropdown={e => { e.stopPropagation(); setShowDropdown(showDropdown === template.id ? null : template.id); }}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredTemplates.map(template => (
              <TemplateRow
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                showDropdown={showDropdown === template.id}
                onSelect={() => handleSelectTemplate(template.id)}
                onPreview={() => setPreviewTemplate(template)}
                onDownload={() => handleDownloadTemplate(template.id, template.donor_name)}
                onDelete={() => handleDeleteTemplate(template.id)}
                onToggleDropdown={e => { e.stopPropagation(); setShowDropdown(showDropdown === template.id ? null : template.id); }}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

              </div>

      {/* ── Preview Modal ── */}
      {previewTemplate && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 520, overflow: 'hidden', border: '1px solid #e0e0de' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e3', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>{previewTemplate.donor_name}</h3>
                {previewTemplate.description && (
                  <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{previewTemplate.description}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4, marginLeft: 12 }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <StatusBadge active={previewTemplate.is_active} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                <MetaItem icon={<Calendar size={14} />} label="Created" value={formatDate(previewTemplate.created_at)} />
                <MetaItem icon={<Clock size={14} />} label="Last updated" value={formatDate(previewTemplate.updated_at)} />
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e5e3', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{ padding: '8px 16px', border: '1px solid #e0e0de', borderRadius: 8, backgroundColor: '#fff', color: '#555', fontSize: 14, cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => { handleSelectTemplate(previewTemplate.id); setPreviewTemplate(null); }}
                style={{ padding: '8px 16px', border: 'none', borderRadius: 8, backgroundColor: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', border: '1px solid #e0e0de' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Upload New Template</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}
              >
                <XCircle size={20} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <TemplateUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}
          onClick={() => setShowDeleteModal(null)}
        >
          <div
            style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 420, overflow: 'hidden', border: '1px solid #e0e0de' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, backgroundColor: '#fef2f2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={20} color="#dc2626" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Delete Template</h3>
              </div>
              <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px', lineHeight: 1.5 }}>
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  style={{ padding: '10px 20px', border: '1px solid #e0e0de', borderRadius: 8, backgroundColor: '#fff', color: '#555', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTemplate}
                  style={{ padding: '10px 20px', border: 'none', borderRadius: 8, backgroundColor: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Sub-components ── */

const StatusBadge = ({ active }: { active: boolean }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500,
    backgroundColor: active ? '#f0faf4' : '#f5f5f5',
    color: active ? '#166534' : '#666',
    border: `1px solid ${active ? '#bbf7d0' : '#e0e0de'}`,
  }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: active ? '#16a34a' : '#aaa' }} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

const MetaItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
    <span style={{ color: '#aaa', marginTop: 2 }}>{icon}</span>
    <div>
      <p style={{ fontSize: 11, color: '#999', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 13, color: '#1a1a1a', margin: 0 }}>{value}</p>
    </div>
  </div>
);

interface CardProps {
  template: Template;
  selected: boolean;
  showDropdown: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onToggleDropdown: (e: React.MouseEvent) => void;
  formatDate: (d: string) => string;
}

const TemplateCard: React.FC<CardProps> = ({ template, selected, showDropdown, onSelect, onPreview, onDownload, onDelete, onToggleDropdown, formatDate }) => (
  <div style={{
    backgroundColor: '#fff',
    border: `1px solid ${selected ? '#1a1a1a' : '#e5e5e3'}`,
    borderRadius: 10,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    position: 'relative',
  }}>
    {/* Top row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, paddingRight: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>{template.donor_name}</h3>
        {template.description && (
          <p style={{ fontSize: 13, color: '#777', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {template.description}
          </p>
        )}
      </div>

      {/* Dropdown trigger */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={onToggleDropdown}
          data-dropdown-trigger="true"
          style={{ background: 'none', border: '1px solid transparent', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <MoreVertical size={15} />
        </button>

        {showDropdown && (
          <div
            data-dropdown-menu="true"
            style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, width: 160, backgroundColor: '#fff', border: '1px solid #e0e0de', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            {[
              { icon: <Eye size={13} />, label: 'Preview', action: onPreview },
              { icon: <Download size={13} />, label: 'Download', action: onDownload },
              { icon: <CheckCircle size={13} />, label: 'Use Template', action: onSelect },
            ].map(item => (
              <button key={item.label} onClick={e => { e.stopPropagation(); item.action(); }}
                style={{ width: '100%', padding: '8px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f7f7f6')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <div style={{ height: 1, backgroundColor: '#e5e5e3', margin: '4px 0' }} />
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              style={{ width: '100%', padding: '8px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff5f5')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>

    <StatusBadge active={template.is_active} />

    {/* Dates */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#999' }}>
        <Calendar size={12} /> Created {formatDate(template.created_at)}
      </div>
      {template.updated_at !== template.created_at && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#999' }}>
          <Clock size={12} /> Updated {formatDate(template.updated_at)}
        </div>
      )}
    </div>

    {/* Generate Form button when selected */}
    {selected && (
      <button
        onClick={() => window.location.href = `/dynamic-form?template=${template.id}`}
        style={{
          padding: '8px 0',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          border: `1px solid ${selected ? '#1a1a1a' : '#e0e0de'}`,
          backgroundColor: selected ? '#1a1a1a' : '#fff',
          color: selected ? '#fff' : '#555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 8
        }}
      >
        <FileText size={13} /> Generate Form
      </button>
    )}

    {/* Action */}
    <button
      onClick={onSelect}
      style={{
        padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        border: `1px solid ${selected ? '#1a1a1a' : '#e0e0de'}`,
        backgroundColor: selected ? '#1a1a1a' : '#fff',
        color: selected ? '#fff' : '#555',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}
    >
      {selected ? <><CheckCircle size={13} /> Selected</> : <><FileText size={13} /> Use Template</>}
    </button>
  </div>
);

const TemplateRow: React.FC<CardProps> = ({ template, selected, showDropdown, onSelect, onPreview, onDownload, onDelete, onToggleDropdown, formatDate }) => (
  <div style={{
    backgroundColor: '#fff',
    border: `1px solid ${selected ? '#1a1a1a' : '#e5e5e3'}`,
    borderRadius: 10,
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{template.donor_name}</h3>
      {template.description && (
        <p style={{ fontSize: 12, color: '#888', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{template.description}</p>
      )}
    </div>

    <StatusBadge active={template.is_active} />

    <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
      <Calendar size={11} /> {formatDate(template.created_at)}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button onClick={onPreview} title="Preview"
        style={{ background: 'none', border: '1px solid #e0e0de', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}
      ><Eye size={13} /></button>
      <button onClick={onDownload} title="Download"
        style={{ background: 'none', border: '1px solid #e0e0de', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}
      ><Download size={13} /></button>
      <button onClick={onSelect}
        style={{ padding: '5px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: `1px solid ${selected ? '#1a1a1a' : '#e0e0de'}`, backgroundColor: selected ? '#1a1a1a' : '#fff', color: selected ? '#fff' : '#555' }}
      >{selected ? 'Selected' : 'Use'}</button>

      {/* Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={onToggleDropdown}
          data-dropdown-trigger="true"
          style={{ background: 'none', border: '1px solid #e0e0de', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}
        ><MoreVertical size={13} /></button>

        {showDropdown && (
          <div
            data-dropdown-menu="true"
            style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, width: 140, backgroundColor: '#fff', border: '1px solid #e0e0de', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              style={{ width: '100%', padding: '8px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff5f5')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default TemplateManager;