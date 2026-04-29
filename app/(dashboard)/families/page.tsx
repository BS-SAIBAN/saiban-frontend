'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { familiesAPI } from '@/lib/api';
import { Users, Plus, Search, Filter, Eye, Edit, Trash2, MapPin, Tag } from 'lucide-react';

interface Family {
  family_id: string;
  registration_number: string;
  category: 'FA' | 'SB';
  status: string;
  area: string;
  city: string;
  housing_type: string;
  created_at: string;
}

const hasValidFamilyId = (familyId?: string): familyId is string =>
  typeof familyId === 'string' && familyId.trim().length > 0 && familyId !== 'undefined' && familyId !== 'null';

const statusColor: Record<string, string> = {
  pending_assessment: 'gray', assessed: 'blue', scoring: 'yellow',
  approved: 'green', rejected: 'red', reassessment: 'purple',
};

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [familyToDelete, setFamilyToDelete] = useState<string | null>(null);

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      const params: Record<string, string | number> = { skip, limit };
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.area = search;

      const response = await familiesAPI.list(params);
      const data = response.data?.data || [];
      const totalCount = response.data?.total || 0;
      setFamilies(data);
      setTotal(totalCount);
    } catch (error) {
      console.error('Failed to fetch families:', error);
      setFamilies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [page, categoryFilter, statusFilter]);

  const handleDelete = async (familyId: string) => {
    setFamilyToDelete(familyId);
    setShowDeleteConfirm(true);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!familyToDelete) return;
    try {
      await familiesAPI.delete(familyToDelete);
      setShowDeleteConfirm(false);
      setFamilyToDelete(null);
      fetchFamilies();
    } catch (e) {
      console.error('Failed to delete family:', e);
      setDeleteError('Failed to delete family. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setFamilyToDelete(null);
    setDeleteError('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFamilies();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Families</h1>
            <p>Manage all registered FA and SB beneficiary families</p>
          </div>
          <Link href="/families/new" className="btn btn-primary">
            <Plus size={14} /> Register Beneficiary
          </Link>
        </div>
      </div>

      <div className="card">
        <form className="filter-row" onSubmit={handleSearch}>
          <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={15} />
            <input className="form-control" placeholder="Search by reg. number, area, city…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            <option value="FA">FA – Financial Aid</option>
            <option value="SB">SB – Saiban (Orphan)</option>
          </select>
          <select className="form-control" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="pending_assessment">Pending Assessment</option>
            <option value="assessed">Assessed</option>
            <option value="scoring">Scoring</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="reassessment">Reassessment</option>
          </select>
          <button type="submit" className="btn btn-secondary">Search</button>
          <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '13px' }}>
            <Filter size={14} style={{ display: 'inline', marginRight: 6 }} />
            {total} total
          </div>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Registration #</th>
                <th>Category</th>
                <th>Status</th>
                <th>Location</th>
                <th>Housing</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '100px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '60px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '80px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '120px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '70px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '80px' }} /></td>
                    <td><div className="skeleton-row" style={{ marginBottom: 0, gap: 6 }}>
                      <div className="skeleton skeleton-col-sm" style={{ width: '40px', height: '28px' }} />
                      <div className="skeleton skeleton-col-sm" style={{ width: '28px', height: '28px' }} />
                      <div className="skeleton skeleton-col-sm" style={{ width: '28px', height: '28px' }} />
                    </div></td>
                  </tr>
                ))
              ) : families.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Users size={22} /></div>
                    <h3>No families found</h3>
                    <p>Try adjusting filters or register a new family</p>
                  </div>
                </td></tr>
              ) : families.map(f => (
                <tr key={f.family_id}>
                  <td>
                    {hasValidFamilyId(f.family_id) ? (
                      <Link href={`/families/${f.family_id}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer' }}>
                        {f.registration_number}
                      </Link>
                    ) : (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--text-muted)' }} title="This family record has an invalid ID">
                        {f.registration_number || '—'}
                      </span>
                    )}
                  </td>
                  <td><span className={`badge ${f.category === 'FA' ? 'badge-blue' : 'badge-purple'}`}><Tag size={10} /> {f.category}</span></td>
                  <td><span className={`badge badge-${statusColor[f.status] || 'gray'}`}>{f.status?.replace(/_/g, ' ')}</span></td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}><MapPin size={12} />{f.area}, {f.city}</span></td>
                  <td><span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{f.housing_type}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{f.created_at ? new Date(f.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {hasValidFamilyId(f.family_id) ? (
                        <>
                          <Link href={`/families/${f.family_id}/edit`} className="btn btn-secondary btn-sm">
                            <Edit size={12} />
                          </Link>
                          <button onClick={() => handleDelete(f.family_id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--red)' }}>
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Invalid ID</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, maxWidth: 400, width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Delete Family</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Are you sure you want to delete this family? This action cannot be undone.
            </p>
            {deleteError && (
              <div style={{ padding: 12, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 6, marginBottom: 16, fontSize: '13px', color: '#dc2626' }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={cancelDelete} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-primary" style={{ background: 'var(--red)', borderColor: 'var(--red)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
