'use client';

import { useEffect, useState } from 'react';
import { scoringAPI } from '@/lib/api';
import { Star, Settings, Plus, X } from 'lucide-react';

interface Criterion {
  criterion_id: string; name: string; weight: number;
  category_applicable: string; active: boolean;
}

export default function ScoringPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({
    name: '',
    weight: 20,
    category_applicable: 'both',
    description: '',
    min_score: 0,
    max_score: 100,
  });

  const fetchCriteria = async () => {
    setLoading(true);
    try {
      const response = await scoringAPI.listCriteria();
      setCriteria(Array.isArray(response.data) ? response.data : []);
    } catch {
      setCriteria([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  const resetCreateForm = () => {
    setForm({
      name: '',
      weight: 20,
      category_applicable: 'both',
      description: '',
      min_score: 0,
      max_score: 100,
    });
    setCreateError('');
  };

  const openCreateModal = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
  };

  const submitCreateCriteria = async () => {
    if (!form.name.trim()) {
      setCreateError('Criterion name is required.');
      return;
    }
    if (form.weight < 1 || form.weight > 100) {
      setCreateError('Weight must be between 1 and 100.');
      return;
    }
    if (form.max_score <= form.min_score) {
      setCreateError('Max score must be greater than min score.');
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      await scoringAPI.createCriteria({
        name: form.name.trim(),
        weight: form.weight,
        category_applicable: form.category_applicable,
        description: form.description.trim() || undefined,
        min_score: form.min_score,
        max_score: form.max_score,
      });
      closeCreateModal();
      fetchCriteria();
    } catch (e: unknown) {
      let message = 'Failed to create scoring criterion.';
      if (e && typeof e === 'object' && 'response' in e) {
        const response = (e as { response?: { data?: unknown } }).response;
        if (response?.data && typeof response.data === 'object' && 'detail' in response.data) {
          const detail = (response.data as { detail: unknown }).detail;
          if (typeof detail === 'string') {
            message = detail;
          }
        }
      }
      setCreateError(message);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Scoring</h1><p>View scoring results and manage scoring criteria</p></div>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={14} /> Add Criteria
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Scoring Criteria</div>
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : criteria.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Star size={22} /></div>
            <h3>No scoring criteria defined</h3>
            <p>Add criteria from the admin panel.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Criterion</th><th>Weight</th><th>Applicable To</th><th>Status</th></tr>
              </thead>
              <tbody>
                {criteria.map(c => (
                  <tr key={c.criterion_id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className="badge badge-blue">{c.weight}</span></td>
                    <td><span className={`badge badge-${c.category_applicable === 'FA' ? 'blue' : c.category_applicable === 'SB' ? 'purple' : 'gray'}`}>{c.category_applicable}</span></td>
                    <td>{c.active ? <span className="badge badge-green">Active</span> : <span className="badge badge-gray">Inactive</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Scoring Criterion</h2>
              <button className="modal-close" onClick={closeCreateModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {createError && (
                <div style={{ padding: '12px 14px', marginBottom: 16, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
                  {createError}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Family Income"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Weight *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="form-control"
                    value={form.weight}
                    onChange={(e) => setForm((prev) => ({ ...prev, weight: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={form.category_applicable}
                    onChange={(e) => setForm((prev) => ({ ...prev, category_applicable: e.target.value }))}
                  >
                    <option value="both">Both (FA + SB)</option>
                    <option value="FA">FA</option>
                    <option value="SB">SB</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Min Score</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.min_score}
                    onChange={(e) => setForm((prev) => ({ ...prev, min_score: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Score</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={form.max_score}
                    onChange={(e) => setForm((prev) => ({ ...prev, max_score: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this criterion"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeCreateModal} disabled={createLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submitCreateCriteria} disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Criterion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
