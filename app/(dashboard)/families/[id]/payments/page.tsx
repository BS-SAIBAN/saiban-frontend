'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { paymentsAPI, familiesAPI } from '@/lib/api';
import FamilySubPageSkeleton from '@/components/families/FamilySubPageSkeleton';
import { DollarSign, Plus, Calendar, Receipt } from 'lucide-react';

interface PaymentSummary {
  payment_id: string;
  payment_date?: string;
  amount?: number;
  payment_method?: string;
  status?: string;
  receipt_url?: string;
  target_type?: string;
  target_name?: string;
}

export default function FamilyPaymentsPage() {
  const { id } = useParams<{ id: string }>();
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([familiesAPI.get(id), paymentsAPI.list()]).then(([familyRes, paymentRes]) => {
      const registrationNumber = familyRes.data?.registration_number;
      const items = Array.isArray(paymentRes.data) ? paymentRes.data : [];
      setPayments(items.filter(p => p.target_type === 'family' && p.target_name === registrationNumber));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FamilySubPageSkeleton variant="table" />;

  const statusColors: Record<string, string> = {
    pending: 'yellow',
    completed: 'green',
    failed: 'red',
    refunded: 'gray',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1>Family Payments</h1>
          <p>View payment history for this family</p>
        </div>
        <Link href={`/families/${id}/payments/new`} className="btn btn-primary">
          <Plus size={14} /> Record Payment
        </Link>
      </div>

      <div className="card">
        {payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><DollarSign size={22} /></div>
            <h3>No Payments Found</h3>
            <p>No payment records for this family</p>
            <Link href={`/families/${id}/payments/new`} className="btn btn-primary" style={{ marginTop: 16 }}>
              <Plus size={14} /> Record First Payment
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.payment_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent)' }}>
                      {p.payment_id.slice(0, 8)}…
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={12} /> {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                        <DollarSign size={12} /> {p.amount || 0}
                      </span>
                    </td>
                    <td><span className="badge badge-gray">{p.payment_method || '—'}</span></td>
                    <td>
                      <span className={`badge badge-${statusColors[p.status || 'pending'] || 'gray'}`}>
                        {p.status || '—'}
                      </span>
                    </td>
                    <td>
                      {p.receipt_url ? (
                        <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                          <Receipt size={12} /> View
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <Link href={`/families/${id}/payments/${p.payment_id}`} className="btn btn-secondary btn-sm">
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
