'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { reportsAPI } from '@/lib/api';
import { FileText, Plus, Calendar, Download, Eye } from 'lucide-react';

export default function FamilyReportsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.list({ family_id: id }).then(r => {
      setReports(Array.isArray(r.data) ? r.data : []);
    }).finally(() => setLoading(false));
  }, [id]);

  const reportTypeColors: Record<string, string> = {
    progress: 'blue',
    financial: 'green',
    incident: 'red',
    general: 'gray',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1>Family Reports</h1>
          <p>View and manage reports for this family</p>
        </div>
        <Link href={`/families/${id}/reports/new`} className="btn btn-primary">
          <Plus size={14} /> Create Report
        </Link>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : reports.length === 0 ? (
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
            <table>
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
                {reports.map(r => (
                  <tr key={r.report_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent)' }}>
                      {r.report_id.slice(0, 8)}…
                    </td>
                    <td>
                      <span className={`badge badge-${reportTypeColors[r.report_type] || 'gray'}`}>
                        {r.report_type || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={12} /> {r.report_date ? new Date(r.report_date).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td>{r.submitted_by || '—'}</td>
                    <td>
                      <span className={`badge badge-${r.status === 'reviewed' ? 'green' : r.status === 'submitted' ? 'blue' : 'gray'}`}>
                        {r.status || '—'}
                      </span>
                    </td>
                    <td>
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
