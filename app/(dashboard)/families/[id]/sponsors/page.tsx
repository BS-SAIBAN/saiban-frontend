'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sponsorshipsAPI, familiesAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { Heart, Plus, User, Calendar, Wallet } from 'lucide-react';

interface SponsorshipSummary {
  sponsorship_id: string;
  donor_name?: string;
  sponsorship_type: string;
  start_date?: string;
  end_date?: string;
  amount?: number;
  active: boolean;
  target_name?: string;
}

export default function FamilySponsorsPage() {
  const { id } = useParams<{ id: string }>();
  const [sponsors, setSponsors] = useState<SponsorshipSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([familiesAPI.get(id), sponsorshipsAPI.list({ target_type: 'family' })]).then(([familyRes, sponsorRes]) => {
      const registrationNumber = familyRes.data?.registration_number;
      const items = Array.isArray(sponsorRes.data) ? sponsorRes.data : [];
      setSponsors(items.filter(s => s.target_name === registrationNumber));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FamilySubPageSkeleton variant="table" />;

  return (
    <div>
      <div className="family-header-row">
        <div>
          <h1>Family Sponsors</h1>
          <p>Manage sponsorships for this family</p>
        </div>
        <Link href={`/families/${id}/sponsors/new`} className="btn btn-primary">
          <Plus size={14} /> Add Sponsor
        </Link>
      </div>

      <div className="card">
        {sponsors.length === 0 ? (
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
            <table className="mobile-stack-table">
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
                    <td data-label="Donor">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={14} /> {s.donor_name || '—'}
                      </div>
                    </td>
                    <td data-label="Type"><span className="badge badge-blue">{s.sponsorship_type || '—'}</span></td>
                    <td data-label="Start Date">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={12} /> {s.start_date ? new Date(s.start_date).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td data-label="End Date">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={12} /> {s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td data-label="Amount">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Wallet size={12} /> {s.amount || 0} PKR
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className={`badge badge-${s.active ? 'green' : 'red'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Actions">
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
