'use client';

import { useEffect, useState } from 'react';
import { usersAPI } from '@/lib/api';
import { ShieldCheck, Plus, User, X, CheckCircle } from 'lucide-react';

interface UserRecord {
  user_id: string; full_name: string; email: string; role: string; active: boolean; created_at: string;
}

const roleConfig: Record<string, { color: string; label: string }> = {
  admin: { color: 'red', label: 'Admin' },
  field_worker: { color: 'blue', label: 'Field Worker' },
  viewer: { color: 'gray', label: 'Viewer' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'field_worker' });

  const load = () => { usersAPI.list().then(r => setUsers(Array.isArray(r.data) ? r.data : [])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    setSaving(true);
    try { await usersAPI.create(form); setShowModal(false); setForm({ full_name: '', email: '', password: '', role: 'field_worker' }); load(); }
    catch { /* handled */ } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>User Management</h1><p>Manage system users and role-based access control</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Add User</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="mobile-stack-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><User size={22} /></div>
                    <h3>No users found</h3>
                  </div>
                </td></tr>
              ) : users.map(u => {
                const role = roleConfig[u.role] || { color: 'gray', label: u.role };
                return (
                  <tr key={u.user_id}>
                    <td data-label="Name">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
                          {u.full_name?.[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td data-label="Email" style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{u.email}</td>
                    <td data-label="Role"><span className={`badge badge-${role.color}`}><ShieldCheck size={10} /> {role.label}</span></td>
                    <td data-label="Status">{u.active ? <span className="badge badge-green"><CheckCircle size={10} /> Active</span> : <span className="badge badge-gray">Inactive</span>}</td>
                    <td data-label="Joined" style={{ color: 'var(--text-muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="User's full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@saiban.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-control" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 8 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="admin">Admin — Full access</option>
                  <option value="field_worker">Field Worker — Assessment access</option>
                  <option value="viewer">Viewer — Read-only access</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.full_name || !form.email || !form.password}>
                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating…</> : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
