'use client';

import { useEffect, useState } from 'react';
import { donorsAPI } from '@/lib/api';
import { Heart, Plus, Search, Phone, Mail, Building2, User, X, CheckCircle } from 'lucide-react';

interface Donor {
  donor_id: string;
  full_name: string;
  donor_type: 'individual' | 'organization';
  organization_name?: string;
  active: boolean;
  total_sponsorships: number;
  total_donated: number;
  last_donation_date?: string;
  created_at: string;
}

const emptyDonor = { full_name: '', email: '', phone: '', address: '', donor_type: 'individual', organization_name: '', contact_person: '', notes: '' };

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filtered, setFiltered] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyDonor);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = () => {
    donorsAPI.list().then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setDonors(data); setFiltered(data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(donors); return; }
    setFiltered(donors.filter(d =>
      d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.organization_name?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, donors]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await donorsAPI.create(form);
      setShowModal(false); setForm(emptyDonor);
      setSuccessMsg('Donor created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch { /* handled */ } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Donors</h1><p>Manage donor profiles and sponsorship relationships</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Add Donor</button>
        </div>
      </div>

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'var(--green-bg)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--green)', fontSize: 13 }}>
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}

      <div className="card">
        <div className="filter-row">
          <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={15} />
            <input className="form-control" placeholder="Search donors by name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>{filtered.length} donors</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div className="skeleton-row" style={{ marginBottom: 12 }}>
                  <div className="skeleton skeleton-avatar" />
                  <div className="skeleton-col">
                    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                    <div className="skeleton skeleton-text-sm" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="skeleton skeleton-text-sm" style={{ width: '70%' }} />
                <div className="skeleton skeleton-text-sm" style={{ width: '60%' }} />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon"><Heart size={22} /></div>
              <h3>No donors found</h3>
              <p>Add your first donor to start sponsorships</p>
            </div>
          ) : filtered.map(d => (
            <div key={d.donor_id} className="card card-hover">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: d.donor_type === 'organization' ? 'var(--purple-bg)' : 'var(--accent-glow)', border: `1px solid ${d.donor_type === 'organization' ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.donor_type === 'organization' ? 'var(--purple)' : 'var(--accent)' }}>
                  {d.donor_type === 'organization' ? <Building2 size={18} /> : <User size={18} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{d.organization_name || (d.donor_type === 'individual' ? 'Individual Donor' : '')}</div>
                </div>
                <span className={`badge ${d.active ? 'badge-green' : 'badge-gray'}`}>{d.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><Heart size={13} />{d.total_sponsorships} sponsorships</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><Mail size={13} />PKR {d.total_donated?.toLocaleString() || 0} donated</div>
                {d.last_donation_date && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><Phone size={13} />Last donation {new Date(d.last_donation_date).toLocaleDateString()}</div>}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Since {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</span>
                <span className={`badge ${d.donor_type === 'organization' ? 'badge-purple' : 'badge-blue'}`}>{d.donor_type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Donor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Donor</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Donor Type</label>
                <select className="form-control" value={form.donor_type} onChange={e => set('donor_type', e.target.value)}>
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Donor's full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0321-1234567" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="donor@email.com" />
                </div>
                {form.donor_type === 'organization' && (
                  <div className="form-group">
                    <label className="form-label">Organization Name</label>
                    <input className="form-control" value={form.organization_name} onChange={e => set('organization_name', e.target.value)} placeholder="Company / Foundation name" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-control" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes about this donor" rows={2} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.full_name}>
                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Add Donor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
