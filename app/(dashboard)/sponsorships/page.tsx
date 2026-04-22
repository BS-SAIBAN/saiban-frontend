'use client';

import { useEffect, useState } from 'react';
import { sponsorshipsAPI, donorsAPI } from '@/lib/api';
import { BookOpen, Plus, X, Calendar } from 'lucide-react';

interface Sponsorship {
  sponsorship_id: string; donor_id: string; sponsorship_type: string;
  family_id?: string; individual_id?: string; amount: number;
  start_date: string; end_date?: string; active: boolean; payment_frequency: string;
}
interface Donor { donor_id: string; full_name: string; }

export default function SponsorshipsPage() {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    donor_id: '', sponsorship_type: 'family_assistance', family_id: '', individual_id: '',
    amount: '', start_date: new Date().toISOString().split('T')[0], end_date: '',
    payment_method: 'bank_transfer', payment_frequency: 'monthly', auto_renew: 'true', notes: '',
  });

  const load = () => {
    Promise.all([sponsorshipsAPI.list(), donorsAPI.list()])
      .then(([s, d]) => {
        setSponsorships(Array.isArray(s.data) ? s.data : []);
        setDonors(Array.isArray(d.data) ? d.data : []);
      }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const donorName = (id: string) => donors.find(d => d.donor_id === id)?.full_name || id?.slice(0, 8) + '…';

  const save = async () => {
    setSaving(true);
    try {
      await sponsorshipsAPI.create({ ...form, amount: parseInt(form.amount), auto_renew: form.auto_renew === 'true' });
      setShowModal(false); load();
    } catch { /* handled */ } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Sponsorships</h1><p>Family and orphan-level sponsorship relationships</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> New Sponsorship</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Donor</th><th>Type</th><th>Amount (PKR/mo)</th><th>Frequency</th><th>Start Date</th><th>End Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : sponsorships.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><BookOpen size={22} /></div>
                    <h3>No sponsorships yet</h3>
                    <p>Create the first sponsorship to link a donor to a family or orphan.</p>
                  </div>
                </td></tr>
              ) : sponsorships.map(s => (
                <tr key={s.sponsorship_id}>
                  <td style={{ fontWeight: 600 }}>{donorName(s.donor_id)}</td>
                  <td><span className={`badge badge-${s.sponsorship_type?.includes('orphan') ? 'purple' : 'blue'}`}>{s.sponsorship_type?.replace(/_/g, ' ')}</span></td>
                  <td><strong style={{ color: 'var(--green)' }}>PKR {s.amount?.toLocaleString()}</strong></td>
                  <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{s.payment_frequency}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.start_date ? new Date(s.start_date).toLocaleDateString() : '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.end_date ? new Date(s.end_date).toLocaleDateString() : 'Ongoing'}</td>
                  <td>{s.active ? <span className="badge badge-green">Active</span> : <span className="badge badge-gray">Inactive</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Sponsorship</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Donor *</label>
                <select className="form-control" value={form.donor_id} onChange={e => set('donor_id', e.target.value)}>
                  <option value="">Select donor…</option>
                  {donors.map(d => <option key={d.donor_id} value={d.donor_id}>{d.full_name}</option>)}
                </select>
              </div>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Sponsorship Type</label>
                  <select className="form-control" value={form.sponsorship_type} onChange={e => set('sponsorship_type', e.target.value)}>
                    <option value="family_assistance">Family Assistance</option>
                    <option value="orphan_sponsorship">Orphan Sponsorship</option>
                    <option value="education">Education Support</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (PKR) *</label>
                  <input className="form-control" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="Monthly amount in PKR" />
                </div>
                <div className="form-group">
                  <label className="form-label">Family ID *</label>
                  <input className="form-control" value={form.family_id} onChange={e => set('family_id', e.target.value)} placeholder="Family UUID" />
                </div>
                <div className="form-group">
                  <label className="form-label">Individual ID (Orphan)</label>
                  <input className="form-control" value={form.individual_id} onChange={e => set('individual_id', e.target.value)} placeholder="Leave blank for family sponsorship" />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-control" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-control" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-control" value={form.payment_frequency} onChange={e => set('payment_frequency', e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Optional notes" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.donor_id || !form.amount || !form.family_id}>
                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating…</> : 'Create Sponsorship'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
