'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { familiesAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { Users, User, ClipboardList, Star, CheckSquare, Heart, DollarSign, FileText, ArrowLeft } from 'lucide-react';

interface Family {
  family_id: string; registration_number: string; category: 'FA' | 'SB';
  status: string; area: string; city: string;
}

const statusColor: Record<string, string> = {
  pending_assessment: 'gray', assessed: 'blue', scoring: 'yellow',
  approved: 'green', rejected: 'red', reassessment: 'purple',
};

const isValidFamilyRouteId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value !== 'undefined' && value !== 'null';

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const hasValidId = isValidFamilyRouteId(id);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasValidId) {
      router.replace('/families');
      return;
    }

    familiesAPI.get(id).then(r => {
      setFamily(r.data);
    }).catch(() => {
      setFamily(null);
    }).finally(() => setLoading(false));
  }, [hasValidId, id, router]);

  if (loading || !hasValidId) return <FamilySubPageSkeleton />;

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
          </div>
        )}
      </div>

      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { href: `/families/${id}`, label: 'Overview', icon: <Users size={13} /> },
          { href: `/families/${id}/members`, label: 'Members', icon: <User size={13} /> },
          { href: `/families/${id}/assessment`, label: 'Assessment', icon: <ClipboardList size={13} />, prefix: true },
          { href: `/families/${id}/scoring`, label: 'Scoring', icon: <Star size={13} />, prefix: true },
          { href: `/families/${id}/approval`, label: 'Approval', icon: <CheckSquare size={13} />, prefix: true },
          { href: `/families/${id}/reports`, label: 'Reports', icon: <FileText size={13} />, prefix: true },
          { href: `/families/${id}/sponsors`, label: 'Sponsors', icon: <Heart size={13} />, disabled: true },
          { href: `/families/${id}/payments`, label: 'Payments', icon: <DollarSign size={13} />, disabled: true },
        ].map(link => (
          link.disabled ? (
            <span
              key={link.href}
              className="btn btn-sm btn-secondary"
              style={{ opacity: 0.4, cursor: 'not-allowed' }}
            >
              {link.icon} {link.label}
            </span>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={`btn btn-sm ${(
                link.prefix 
                  ? pathname.startsWith(link.href) 
                  : pathname === link.href
              ) ? 'btn-primary' : 'btn-secondary'}`}
            >
              {link.icon} {link.label}
            </Link>
          )
        ))}
      </div>

      {children}
    </div>
  );
}
