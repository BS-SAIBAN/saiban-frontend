'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { assessmentsAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { Plus, ClipboardList } from 'lucide-react';

interface Assessment {
  assessment_id: string;
  family_id: string;
  assessment_date: string;
  status: string;
  notes?: string;
}

const statusColor: Record<string, string> = {
  pending_assessment: 'gray', assessed: 'blue', scoring: 'yellow',
  approved: 'green', rejected: 'red', reassessment: 'purple',
};

export default function FamilyAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assessmentsAPI.list({ family_id: id }).then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setAssessments(data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FamilySubPageSkeleton />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1>Assessment</h1>
          <p>Family assessment records</p>
        </div>
        <Link href={`/families/${id}/assessment/new`} className="btn btn-primary">
          <Plus size={14} /> New Assessment
        </Link>
      </div>

      <div className="card">
        {assessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ClipboardList size={22} /></div>
            <h3>No assessments conducted yet</h3>
            <p>Conduct an assessment to evaluate the family's needs</p>
            <Link href={`/families/${id}/assessment/new`} className="btn btn-primary" style={{ marginTop: 16 }}>
              <Plus size={14} /> Conduct First Assessment
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Assessment ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map(a => (
                  <tr key={a.assessment_id}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', fontSize: 12 }}>{a.assessment_id.slice(0, 8)}…</td>
                    <td>{a.assessment_date ? new Date(a.assessment_date).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge badge-${statusColor[a.status] || 'gray'}`}>{a.status?.replace(/_/g, ' ')}</span></td>
                    <td><Link href={`/families/${id}/assessment/${a.assessment_id}`} className="btn btn-secondary btn-sm">View</Link></td>
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
