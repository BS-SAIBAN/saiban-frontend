'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { reportsAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { FileText, Plus, Calendar, Download, Eye } from 'lucide-react';

interface FamilyReport {
  report_id: string;
  report_type?: string;
  submitted_at?: string;
  submitted_by_name?: string;
  status?: string;
  file_url?: string;
}

export default function FamilyReportsPage() {
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<FamilyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      reportsAPI
        .listByFamily(id)
        .then((r) => {
          setReports(Array.isArray(r.data) ? r.data : []);
        })
        .catch(() => {
          setReports([]);
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [id]);

  if (loading) return <FamilySubPageSkeleton variant="table" />;

  const reportTypeColors: Record<string, string> = {
    progress: 'blue',
    financial: 'green',
    incident: 'red',
    general: 'gray',
  };

  return (
    <div>
      <div className="family-header-row">
        <div>
          <h1>Family Reports</h1>
          <p>View and manage reports for this family</p>
        </div>
        <Link href={`/families/${id}/reports/new`} className="btn btn-primary">
          <Plus size={14} /> Create Report
        </Link>
      </div>

      <div className="card">
        {reports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={22} /></div>
            <h3>No Reports Found</h3>
            <p>No reports have been submitted for this family</p>
            <Link href={`/families/${id}/reports/new`} className="btn btn-primary" style={{ marginTop: 16 }}>
              <Plus size={14} /> Create First Report
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="mobile-stack-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.report_id}>
                    <td data-label="Report ID" style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent)' }}>
                      {r.report_id.slice(0, 8)}...
                    </td>
                    <td data-label="Type">
                      <span className={`badge badge-${reportTypeColors[r.report_type || ''] || 'gray'}`}>
                        {r.report_type || '-'}
                      </span>
                    </td>
                    <td data-label="Date">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={12} /> {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td data-label="Submitted By">{r.submitted_by_name || '-'}</td>
                    <td data-label="Status">
                      <span className={`badge badge-${r.status === 'reviewed' ? 'green' : r.status === 'submitted' ? 'blue' : r.status === 'pending' ? 'yellow' : 'gray'}`}>
                        {r.status || '-'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/families/${id}/reports/${r.report_id}`} className="btn btn-secondary btn-sm">
                          <Eye size={12} /> View
                        </Link>
                        {r.file_url && (
                          <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                            <Download size={12} /> Download
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
