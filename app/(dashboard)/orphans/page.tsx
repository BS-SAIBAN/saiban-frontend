'use client';

import { useEffect, useMemo, useState } from 'react';
import { familiesAPI, individualsAPI, orphansAPI } from '@/lib/api';
import { Baby, Search, User, Eye, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import PaginationControls from '@/components/PaginationControls';

interface Orphan {
  orphan_profile_id: string; individual_id: string; family_id?: string;
  deceased_father_name: string; mother_name: string; mother_alive: boolean;
  mother_remarried: boolean; priority_flag: boolean; age_at_registration: number;
  zakat_eligibility: string; school_name: string; current_class: string;
  individual?: { full_name: string; gender: string; dob: string };
  family?: { registration_number: string };
}

interface IndividualLite {
  individual_id: string;
  full_name?: string;
  family_id?: string;
}

interface FamilyLite {
  family_id: string;
  registration_number: string;
}

const hasValidFamilyId = (familyId?: string): familyId is string =>
  typeof familyId === 'string' && familyId.trim().length > 0 && familyId !== 'undefined' && familyId !== 'null';

export default function OrphansPage() {
  const [orphans, setOrphans] = useState<Orphan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [limit, setLimit] = useState(50);
  const [individualsById, setIndividualsById] = useState<Record<string, IndividualLite>>({});
  const [familiesById, setFamiliesById] = useState<Record<string, FamilyLite>>({});

  useEffect(() => {
    const loadOrphans = search.trim().length >= 2
      ? orphansAPI.search(search.trim())
      : orphansAPI.list({
          limit,
          skip: (page - 1) * limit,
          ...(priorityFilter === 'priority' ? { priority_flag: true } : {}),
          ...(priorityFilter === 'non_priority' ? { priority_flag: false } : {}),
        });

    Promise.all([
      loadOrphans,
      individualsAPI.list({ limit: 500 }),
      familiesAPI.list({ limit: 500 }),
    ]).then(([orphansRes, individualsRes, familiesRes]) => {
      const orphanData = Array.isArray(orphansRes.data) ? orphansRes.data : [];
      setOrphans(orphanData);
      setHasNext(search.trim().length < 2 && orphanData.length === limit);
      const individuals = Array.isArray(individualsRes.data) ? individualsRes.data : [];
      const individualsMap = individuals.reduce((acc: Record<string, IndividualLite>, individual: IndividualLite) => {
        if (individual?.individual_id) acc[individual.individual_id] = individual;
        return acc;
      }, {});
      setIndividualsById(individualsMap);
      const families = Array.isArray(familiesRes.data?.data) ? familiesRes.data.data : [];
      const familiesMap = families.reduce((acc: Record<string, FamilyLite>, family: FamilyLite) => {
        if (family?.family_id) acc[family.family_id] = family;
        return acc;
      }, {});
      setFamiliesById(familiesMap);
    }).finally(() => setLoading(false));
  }, [page, search, priorityFilter, limit]);

  const filtered = useMemo(() => {
    let result = [...orphans];
    if (search.trim().length < 2 && search) {
      const q = search.toLowerCase();
      result = result.filter(o => {
        const linkedIndividual = individualsById[o.individual_id];
        const linkedFamilyId = o.family_id || linkedIndividual?.family_id;
        const linkedFamily = linkedFamilyId ? familiesById[linkedFamilyId] : null;
        const name = linkedIndividual?.full_name || o.individual?.full_name || '';
        const registration = linkedFamily?.registration_number || o.family?.registration_number || '';
        return name.toLowerCase().includes(q) || registration.toLowerCase().includes(q);
      });
    }
    if (search.trim().length >= 2) {
      if (priorityFilter === 'priority') result = result.filter(o => o.priority_flag);
      if (priorityFilter === 'non_priority') result = result.filter(o => !o.priority_flag);
    }
    return result;
  }, [search, priorityFilter, orphans, individualsById, familiesById]);

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
            <input className="form-control" placeholder="Search by name or registration number…" value={search} onChange={e => { setLoading(true); setPage(1); setSearch(e.target.value); }} />
          </div>
          <select className="form-control" value={priorityFilter} onChange={e => { setLoading(true); setPage(1); setPriorityFilter(e.target.value); }}>
            <option value="">All Orphans</option>
            <option value="priority">Priority Cases Only</option>
            <option value="non_priority">Non-Priority</option>
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} orphans</div>
        </div>

        <div className="table-wrap">
          <table className="mobile-stack-table">
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
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text" style={{ width: '100px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '80px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '50px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '90px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '80px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '50px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '60px' }} /></td>
                    <td><div className="skeleton skeleton-col-sm" style={{ width: '28px', height: '28px' }} /></td>
                  </tr>
                ))
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
                const linkedIndividual = individualsById[o.individual_id];
                const linkedFamilyId = o.family_id || linkedIndividual?.family_id;
                const linkedFamily = linkedFamilyId ? familiesById[linkedFamilyId] : null;
                return (
                  <tr key={o.orphan_profile_id}>
                    <td data-label="Name">
                      <div style={{ fontWeight: 600 }}>{linkedIndividual?.full_name || o.individual?.full_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.deceased_father_name ? `Father: ${o.deceased_father_name}` : ''}</div>
                    </td>
                    <td data-label="Family Reg." style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)' }}>{linkedFamily?.registration_number || o.family?.registration_number || '—'}</td>
                    <td data-label="Age at Reg." style={{ textAlign: 'center' }}>
                      <span style={{ color: (o.age_at_registration || 0) > 12 ? 'var(--red)' : 'var(--text-primary)', fontWeight: 600 }}>
                        {o.age_at_registration || '—'}
                        {(o.age_at_registration || 0) > 12 && <AlertCircle size={12} style={{ display: 'inline', marginLeft: 4, color: 'var(--red)' }} />}
                      </span>
                    </td>
                    <td data-label="School / Class">
                      <div style={{ fontSize: 13 }}>{o.school_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.current_class || ''}</div>
                    </td>
                    <td data-label="Zakat"><span className={`badge badge-${zakat.color}`}>{zakat.label}</span></td>
                    <td data-label="Priority">{o.priority_flag ? <span className="badge badge-yellow">⭐ Priority</span> : <span className="badge badge-gray">Normal</span>}</td>
                    <td data-label="Mother Alive">{o.mother_alive ? <span className="badge badge-green">Yes</span> : <span className="badge badge-red">No</span>}</td>
                    <td data-label="Actions">
                      {hasValidFamilyId(linkedFamilyId) ? (
                        <Link href={`/families/${linkedFamilyId}`} className="btn btn-secondary btn-sm"><Eye size={12} /> Family</Link>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No Family Link</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && search.trim().length < 2 && (
          <PaginationControls
            page={page}
            disablePrev={page === 1}
            disableNext={!hasNext}
            onPrev={() => { setLoading(true); setPage(prev => Math.max(1, prev - 1)); }}
            onNext={() => { setLoading(true); setPage(prev => prev + 1); }}
            pageSize={limit}
            onPageSizeChange={(size) => { setLoading(true); setPage(1); setLimit(size); }}
          />
        )}
      </div>
    </div>
  );
}
