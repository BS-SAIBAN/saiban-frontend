'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { familiesAPI, individualsAPI, assessmentsAPI } from '@/lib/api';
import { User, Plus, MapPin, Home, ClipboardList } from 'lucide-react';

interface Family {
  family_id: string; registration_number: string; category: 'FA' | 'SB';
  status: string; area: string; city: string; full_address: string;
  housing_type: string; created_at: string;
}
interface Individual {
  individual_id: string; full_name: string; gender: string; relationship_to_head: string;
  is_orphan: boolean; is_child: boolean; occupation: string; monthly_income: number;
}
interface Assessment { assessment_id: string; status: string; assessment_date: string; }

const statusColor: Record<string, string> = {
  pending_assessment: 'gray', assessed: 'blue', scoring: 'yellow',
  approved: 'green', rejected: 'red', reassessment: 'purple',
};

export default function FamilyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Individual[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      familiesAPI.get(id),
      individualsAPI.list(id),
      assessmentsAPI.list({ family_id: id }),
    ]).then(([fam, inds, assmts]) => {
      setFamily(fam.data);
      setMembers(Array.isArray(inds.data) ? inds.data : []);
      setAssessments(Array.isArray(assmts.data) ? assmts.data : []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!family) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Family not found.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Family Info */}
        <div className="card">
          <div className="section-title">Family Details</div>
          <div className="info-grid">
            <div className="info-item"><label>Registration #</label><p style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{family.registration_number}</p></div>
            <div className="info-item"><label>Program</label><p>{family.category === 'FA' ? 'Financial Aid' : 'Saiban Orphan'}</p></div>
            <div className="info-item"><label>Status</label><p><span className={`badge badge-${statusColor[family.status] || 'gray'}`}>{family.status?.replace(/_/g, ' ')}</span></p></div>
            <div className="info-item"><label>Housing</label><p style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Home size={13} />{family.housing_type}</p></div>
            <div className="info-item"><label>Area</label><p style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} />{family.area}</p></div>
            <div className="info-item"><label>City</label><p>{family.city}</p></div>
            <div className="info-item" style={{ gridColumn: '1/-1' }}><label>Full Address</label><p style={{ color: 'var(--text-secondary)' }}>{family.full_address || '—'}</p></div>
            <div className="info-item"><label>Registered On</label><p>{family.created_at ? new Date(family.created_at).toLocaleDateString('en-PK') : '—'}</p></div>
          </div>
        </div>

        {/* Members summary */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Family Members ({members.length})</div>
            <Link href={`/families/${id}/members`} className="btn btn-secondary btn-sm"><Plus size={12} /> Manage</Link>
          </div>
          {members.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-state-icon"><User size={20} /></div>
              <p>No members added yet.</p>
            </div>
          ) : (
            <div>
              {members.slice(0, 5).map(m => (
                <div key={m.individual_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                    {m.full_name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.full_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.relationship_to_head} • {m.occupation || 'No occupation'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {m.is_orphan && <span className="badge badge-purple">Orphan</span>}
                    {m.is_child && <span className="badge badge-blue">Child</span>}
                  </div>
                </div>
              ))}
              {members.length > 5 && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>+{members.length - 5} more members</p>}
            </div>
          )}
        </div>

        {/* Assessments */}
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Assessment History</div>
            <Link href={`/families/${id}/assessment`} className="btn btn-primary btn-sm"><Plus size={12} /> New Assessment</Link>
          </div>
          {assessments.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-state-icon"><ClipboardList size={20} /></div>
              <p>No assessments conducted yet.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Assessment ID</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {assessments.map(a => (
                    <tr key={a.assessment_id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: 12 }}>{a.assessment_id.slice(0, 8)}…</td>
                      <td>{a.assessment_date ? new Date(a.assessment_date).toLocaleDateString() : '—'}</td>
                      <td><span className={`badge badge-${statusColor[a.status] || 'gray'}`}>{a.status?.replace(/_/g, ' ')}</span></td>
                      <td><Link href={`/families/${id}/assessment`} className="btn btn-secondary btn-sm">View</Link></td>
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
