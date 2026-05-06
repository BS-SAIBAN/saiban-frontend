'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { familiesAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { Users, User, ClipboardList, Star, CheckSquare, Heart, Wallet, FileText, ArrowLeft } from 'lucide-react';

interface Family {
  family_id: string; registration_number: string; category: 'FA' | 'SB';
  status: string; area: string; city: string;
}

const statusColor: Record<string, string> = {
  pending_assessment: 'gray', assessed: 'blue', scoring: 'yellow',
  approved: 'green', rejected: 'red', reassessment: 'purple',
};
const finalDecisionStatuses = ['approved', 'rejected', 'reassessment'];

const isValidFamilyRouteId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value !== 'undefined' && value !== 'null';

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { isFieldWorker } = useAuth();
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

  useEffect(() => {
    if (!hasValidId || !isFieldWorker) return;
    const restricted = [`/families/${id}/scoring`, `/families/${id}/approval`, `/families/${id}/sponsors`, `/families/${id}/payments`];
    if (restricted.some((prefix) => pathname.startsWith(prefix))) {
      router.replace(`/families/${id}/assessment`);
    }
  }, [hasValidId, id, isFieldWorker, pathname, router]);

  if (loading || !hasValidId) return <FamilySubPageSkeleton variant="layout" />;

  return (
    <div>
      <div className="page-header">
        <Link href="/families" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
          <ArrowLeft size={14} /> Back to Families
        </Link>
        {family && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', rowGap: 6 }}>
              <h1 style={{ fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', overflowWrap: 'anywhere', minWidth: 0 }}>{family.registration_number}</h1>
              <span className={`badge badge-${family.category === 'FA' ? 'blue' : 'purple'}`}>{family.category}</span>
              <span className={`badge badge-${statusColor[family.status] || 'gray'}`}>{family.status?.replace(/_/g, ' ')}</span>
            </div>
            {finalDecisionStatuses.includes(family.status) && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                Scoring completed before this final decision.
              </div>
            )}
            <p style={{ marginTop: 4 }}>{family.area}, {family.city}</p>
          </div>
        )}
      </div>

      {/* Sub-nav */}
      <div className="family-subnav-wrapper">
        <div className="family-subnav">
          {[
            { href: `/families/${id}`, label: 'Overview', icon: <Users size={13} /> },
            { href: `/families/${id}/members`, label: 'Members', icon: <User size={13} /> },
            { href: `/families/${id}/assessment`, label: 'Assessment', icon: <ClipboardList size={13} />, prefix: true },
            { href: `/families/${id}/scoring`, label: 'Scoring', icon: <Star size={13} />, prefix: true },
            { href: `/families/${id}/approval`, label: 'Approval', icon: <CheckSquare size={13} />, prefix: true },
            { href: `/families/${id}/reports`, label: 'Reports', icon: <FileText size={13} />, prefix: true },
            { href: `/families/${id}/sponsors`, label: 'Sponsors', icon: <Heart size={13} />, disabled: true },
            { href: `/families/${id}/payments`, label: 'Payments', icon: <Wallet size={13} />, disabled: true },
          ]
            .filter((link) => !(isFieldWorker && ['Scoring', 'Approval', 'Sponsors', 'Payments'].includes(link.label)))
            .map(link => (
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
      </div>

      <div className="family-route-root">{children}</div>
    </div>
  );
}
