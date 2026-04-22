'use client';

import { useEffect, useState } from 'react';
import { assessmentsAPI } from '@/lib/api';
import { ClipboardList, Search, Eye, Filter } from 'lucide-react';
import Link from 'next/link';

interface Assessment {
  assessment_id: string; family_id: string; status: string;
  assessment_date: string; submitted_at?: string;
  family?: { registration_number: string; category: string; area: string; city: string };
}

const statusColor: Record<string, string> = {
  draft: 'gray', submitted: 'blue', scored: 'yellow',
  approved: 'green', rejected: 'red', reassessment_required: 'purple',
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filtered, setFiltered] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    assessmentsAPI.list().then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setAssessments(data); setFiltered(data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...assessments];
    if (search) result = result.filter(a =>
      a.family?.registration_number?.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter) result = result.filter(a => a.status === statusFilter);
    setFiltered(result);
  }, [search, statusFilter, assessments]);

  return (
    <div>
      <div className="page-header">
        <div><h1>Assessments</h1><p>All family assessments across FA and SB programs</p></div>
      </div>

      <div className="card">
        <div className="filter-row">
          <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={15} />
            <input className="form-control" placeholder="Search by registration number…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="scored">Scored</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="reassessment_required">Reassessment Required</option>
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
            <Filter size={13} style={{ display: 'inline', marginRight: 5 }} />{filtered.length} assessments
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Assessment ID</th>
                <th>Family Reg. #</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Assessment Date</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><ClipboardList size={22} /></div>
                    <h3>No assessments found</h3>
                    <p>Start by registering a family and conducting an assessment.</p>
                  </div>
                </td></tr>
              ) : filtered.map(a => (
                <tr key={a.assessment_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)' }}>{a.assessment_id?.slice(0, 8)}…</td>
                  <td style={{ fontFamily: 'monospace' }}>{a.family?.registration_number || '—'}</td>
                  <td>{a.family?.category ? <span className={`badge badge-${a.family.category === 'FA' ? 'blue' : 'purple'}`}>{a.family.category}</span> : '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{a.family?.area}, {a.family?.city}</td>
                  <td><span className={`badge badge-${statusColor[a.status] || 'gray'}`}>{a.status?.replace(/_/g, ' ')}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.assessment_date ? new Date(a.assessment_date).toLocaleDateString() : '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <Link href={`/families/${a.family_id}/assessment`} className="btn btn-secondary btn-sm"><Eye size={12} /> View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
