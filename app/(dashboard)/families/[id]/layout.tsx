'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { familiesAPI } from '@/lib/api';
import { Users, User, ClipboardList, Star, CheckSquare, Heart, DollarSign, FileText, ArrowLeft } from 'lucide-react';

interface Family {
  family_id: string; registration_number: string; category: 'FA' | 'SB';
  status: string; area: string; city: string;
}

const statusColor: Record<string, string> = {
  pending_assessment: 'gray', assessed: 'blue', scoring: 'yellow',
  approved: 'green', rejected: 'red', reassessment: 'purple',
};

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    familiesAPI.get(id).then(r => {
      setFamily(r.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <Link href="/families" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Families
        </Link>
        {family && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontFamily: 'JetBrains Mono, monospace' }}>{family.registration_number}</h1>
                <span className={`badge badge-${family.category === 'FA' ? 'blue' : 'purple'}`}>{family.category}</span>
                <span className={`badge badge-${statusColor[family.status] || 'gray'}`}>{family.status?.replace(/_/g, ' ')}</span>
              </div>
              <p style={{ marginTop: 4 }}>{family.area}, {family.city}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href={`/families/${id}/assessment`} className="btn btn-secondary btn-sm"><ClipboardList size={12} /> Assessment</Link>
              <Link href={`/families/${id}/scoring`} className="btn btn-secondary btn-sm"><Star size={12} /> Scoring</Link>
              <Link href={`/families/${id}/approval`} className="btn btn-secondary btn-sm"><CheckSquare size={12} /> Approval</Link>
            </div>
          </div>
        )}
      </div>

      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { href: `/families/${id}`, label: 'Overview', icon: <Users size={13} /> },
          { href: `/families/${id}/members`, label: 'Members', icon: <User size={13} /> },
          { href: `/families/${id}/sponsors`, label: 'Sponsors', icon: <Heart size={13} /> },
          { href: `/families/${id}/payments`, label: 'Payments', icon: <DollarSign size={13} /> },
          { href: `/families/${id}/reports`, label: 'Reports', icon: <FileText size={13} /> },
        ].map(link => (
          <Link key={link.href} href={link.href} className="btn btn-secondary btn-sm">
            {link.icon} {link.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
