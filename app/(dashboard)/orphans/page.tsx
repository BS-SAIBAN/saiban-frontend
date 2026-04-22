'use client';

import { useEffect, useState } from 'react';
import { orphansAPI } from '@/lib/api';
import { Baby, Search, User, Eye, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Orphan {
  orphan_profile_id: string; individual_id: string; family_id: string;
  deceased_father_name: string; mother_name: string; mother_alive: boolean;
  mother_remarried: boolean; priority_flag: boolean; age_at_registration: number;
  zakat_eligibility: string; school_name: string; current_class: string;
  individual?: { full_name: string; gender: string; dob: string };
  family?: { registration_number: string };
}

export default function OrphansPage() {
  const [orphans, setOrphans] = useState<Orphan[]>([]);
  const [filtered, setFiltered] = useState<Orphan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    orphansAPI.list().then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setOrphans(data); setFiltered(data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...orphans];
    if (search) result = result.filter(o =>
      o.individual?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.family?.registration_number?.toLowerCase().includes(search.toLowerCase())
    );
    if (priorityFilter === 'priority') result = result.filter(o => o.priority_flag);
    if (priorityFilter === 'non_priority') result = result.filter(o => !o.priority_flag);
    setFiltered(result);
  }, [search, priorityFilter, orphans]);

  const zakatLabel: Record<string, { label: string; color: string }> = {
    not_sahib_e_nisab: { label: 'Zakat Eligible', color: 'green' },
    sahib_e_nisab_needy: { label: 'Sadaqat Only', color: 'yellow' },
    sahib_e_nisab_not_needy: { label: 'Not Eligible', color: 'red' },
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Orphans</h1><p>SB Program — orphan profiles and eligibility tracking</p></div>
      </div>

      {/* Priority count */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-glow)' }}><Baby size={20} style={{ color: 'var(--accent)' }} /></div>
          <div><div className="stat-value" style={{ color: 'var(--accent)' }}>{orphans.length}</div><div className="stat-label">Total Orphans</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--yellow-bg)' }}><AlertCircle size={20} style={{ color: 'var(--yellow)' }} /></div>
          <div><div className="stat-value" style={{ color: 'var(--yellow)' }}>{orphans.filter(o => o.priority_flag).length}</div><div className="stat-label">Priority Cases</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-bg)' }}><User size={20} style={{ color: 'var(--green)' }} /></div>
          <div><div className="stat-value" style={{ color: 'var(--green)' }}>{orphans.filter(o => o.zakat_eligibility === 'not_sahib_e_nisab').length}</div><div className="stat-label">Zakat Eligible</div></div>
        </div>
      </div>

      <div className="card">
        <div className="filter-row">
          <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={15} />
            <input className="form-control" placeholder="Search by name or registration number…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All Orphans</option>
            <option value="priority">Priority Cases Only</option>
            <option value="non_priority">Non-Priority</option>
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} orphans</div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Family Reg.</th>
                <th>Age at Reg.</th>
                <th>School / Class</th>
                <th>Zakat Eligibility</th>
                <th>Priority</th>
                <th>Mother Alive</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Baby size={22} /></div>
                    <h3>No orphan profiles found</h3>
                    <p>Orphan profiles are created during SB family assessment.</p>
                  </div>
                </td></tr>
              ) : filtered.map(o => {
                const zakat = zakatLabel[o.zakat_eligibility] || { label: '—', color: 'gray' };
                return (
                  <tr key={o.orphan_profile_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.individual?.full_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.deceased_father_name ? `Father: ${o.deceased_father_name}` : ''}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)' }}>{o.family?.registration_number || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: (o.age_at_registration || 0) > 12 ? 'var(--red)' : 'var(--text-primary)', fontWeight: 600 }}>
                        {o.age_at_registration || '—'}
                        {(o.age_at_registration || 0) > 12 && <AlertCircle size={12} style={{ display: 'inline', marginLeft: 4, color: 'var(--red)' }} />}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{o.school_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.current_class || ''}</div>
                    </td>
                    <td><span className={`badge badge-${zakat.color}`}>{zakat.label}</span></td>
                    <td>{o.priority_flag ? <span className="badge badge-yellow">⭐ Priority</span> : <span className="badge badge-gray">Normal</span>}</td>
                    <td>{o.mother_alive ? <span className="badge badge-green">Yes</span> : <span className="badge badge-red">No</span>}</td>
                    <td>
                      <Link href={`/families/${o.family_id}`} className="btn btn-secondary btn-sm"><Eye size={12} /> Family</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
