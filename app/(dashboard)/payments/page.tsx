'use client';

import { useEffect, useState } from 'react';
import { paymentsAPI, sponsorshipsAPI } from '@/lib/api';
import { DollarSign, Plus, Receipt, CheckCircle, X } from 'lucide-react';

interface Payment {
  payment_id: string;
  donor_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  target_name: string;
  transaction_reference?: string;
  notes?: string;
  receipt_url?: string;
}
interface Sponsorship {
  sponsorship_id: string;
  donor_id?: string;
  donor_name: string;
  sponsorship_type: string;
  amount: number;
  target_name: string;
}

const methodColor: Record<string, string> = { cash: 'green', bank_transfer: 'blue', cheque: 'yellow', online: 'purple' };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [form, setForm] = useState({
    sponsorship_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash', transaction_reference: '', notes: '',
  });

  const load = () => {
    Promise.all([
      paymentsAPI.list(),
      sponsorshipsAPI.list(),
      paymentsAPI.analytics(),
    ]).then(([p, s, a]) => {
      setPayments(Array.isArray(p.data) ? p.data : []);
      setSponsorships(Array.isArray(s.data) ? s.data.map((item: Sponsorship) => ({ ...item, donor_id: item.donor_name })) : []);
      setAnalytics(a.data || {});
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await paymentsAPI.create({ ...form, amount: parseInt(form.amount) });
      setShowModal(false); setForm({ sponsorship_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash', transaction_reference: '', notes: '' });
      load();
    } catch { /* handled */ } finally { setSaving(false); }
  };

  const generateReceipt = async (id: string) => {
    try { await paymentsAPI.receipt(id); alert('Receipt generated!'); } catch { /* handled */ }
  };

  const donorName = (donorId: string) => donors.find(d => d.donor_id === donorId)?.full_name || '—';

  const donors = sponsorships.map(s => ({ donor_id: s.donor_id || '', full_name: s.donor_name }));
  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Payments</h1><p>Track and manage all sponsorship payment transactions in PKR</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Record Payment</button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Payments', value: analytics.total_payments || 0, color: 'var(--accent)', bg: 'var(--accent-glow)', icon: <DollarSign size={18} /> },
          { label: 'Total Amount (PKR)', value: `${((analytics.total_amount || 0) / 1000).toFixed(0)}k`, color: 'var(--green)', bg: 'var(--green-bg)', icon: <CheckCircle size={18} /> },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ color: s.color }}>{s.icon}</span></div>
            <div><div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount (PKR)</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '80px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '70px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '60px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '90px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '120px' }} /></td>
                    <td><div className="skeleton skeleton-col-sm" style={{ width: '60px', height: '28px' }} /></td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><DollarSign size={22} /></div>
                    <h3>No payments recorded</h3>
                    <p>Record your first payment to get started</p>
                  </div>
                </td></tr>
              ) : payments.map(p => (
                <tr key={p.payment_id}>
                  <td>{p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-PK') : '—'}</td>
                  <td><strong style={{ color: 'var(--green)' }}>PKR {p.amount?.toLocaleString()}</strong></td>
                  <td><span className={`badge badge-${methodColor[p.payment_method] || 'gray'}`}>{p.payment_method?.replace('_', ' ')}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{p.transaction_reference || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notes || '—'}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => generateReceipt(p.payment_id)}><Receipt size={12} /> Receipt</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Sponsorship *</label>
                <select className="form-control" value={form.sponsorship_id} onChange={e => set('sponsorship_id', e.target.value)}>
                  <option value="">Select sponsorship…</option>
                  {sponsorships.map(s => {
                    const sp = s as Sponsorship & { donor_id: string };
                    return <option key={s.sponsorship_id} value={s.sponsorship_id}>{donorName(sp.donor_id)} — {s.sponsorship_type} (PKR {s.amount?.toLocaleString()})</option>;
                  })}
                </select>
              </div>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Amount (PKR) *</label>
                  <input className="form-control" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Date *</label>
                  <input className="form-control" type="date" value={form.payment_date} onChange={e => set('payment_date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction Reference</label>
                  <input className="form-control" value={form.transaction_reference} onChange={e => set('transaction_reference', e.target.value)} placeholder="TRX-XXXXXX" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Optional notes" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.sponsorship_id || !form.amount}>
                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
