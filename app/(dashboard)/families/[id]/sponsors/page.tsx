'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { sponsorshipsAPI, donorsAPI } from '@/lib/api';
import { ArrowLeft, Heart, Plus, User, Calendar, DollarSign, AlertCircle, Users, ClipboardList, Star, CheckSquare, FileText } from 'lucide-react';

export default function FamilySponsorsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sponsorshipsAPI.list({ family_id: id }).then(r => {
      setSponsors(Array.isArray(r.data) ? r.data : []);
    }).finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <div className="page-header">
        <Link href={`/families/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Family
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div>
            <h1>Family Sponsors</h1>
            <p>Manage sponsorships for this family</p>
          </div>
          <Link href={`/families/${id}/sponsors/new`} className="btn btn-primary">
            <Plus size={14} /> Add Sponsor
          </Link>
        </div>
      </div>

      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { href: `/families/${id}`, label: 'Overview', icon: <Users size={13} /> },
          { href: `/families/${id}/members`, label: 'Members', icon: <User size={13} /> },
          { href: `/families/${id}/assessment`, label: 'Assessment', icon: <ClipboardList size={13} /> },
          { href: `/families/${id}/scoring`, label: 'Scoring', icon: <Star size={13} /> },
          { href: `/families/${id}/approval`, label: 'Approval', icon: <CheckSquare size={13} /> },
          { href: `/families/${id}/sponsors`, label: 'Sponsors', icon: <Heart size={13} /> },
          { href: `/families/${id}/payments`, label: 'Payments', icon: <DollarSign size={13} /> },
          { href: `/families/${id}/reports`, label: 'Reports', icon: <FileText size={13} /> },
        ].map(link => (
          <Link key={link.href} href={link.href} className="btn btn-secondary btn-sm">
            {link.icon} {link.label}
          </Link>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : sponsors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Heart size={22} /></div>
            <h3>No Sponsors Found</h3>
            <p>This family does not have any active sponsorships</p>
            <Link href={`/families/${id}/sponsors/new`} className="btn btn-primary" style={{ marginTop: 16 }}>
              <Plus size={14} /> Add First Sponsor
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map(s => (
                  <tr key={s.sponsorship_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={14} /> {s.donor_name || '—'}
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{s.sponsorship_type || '—'}</span></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={12} /> {s.start_date ? new Date(s.start_date).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={12} /> {s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <DollarSign size={12} /> {s.amount || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${s.status === 'active' ? 'green' : s.status === 'expired' ? 'red' : 'gray'}`}>
                        {s.status || '—'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/families/${id}/sponsors/${s.sponsorship_id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
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
