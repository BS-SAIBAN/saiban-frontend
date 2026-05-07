'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { familiesAPI, individualsAPI } from '@/lib/api';
import { User, Search, Filter, Eye, MapPin, Calendar, X } from 'lucide-react';
import PaginationControls from '@/components/PaginationControls';

interface Individual {
  individual_id: string;
  full_name: string;
  gender: string;
  dob: string;
  cnic_or_bform: string;
  relationship_to_head: string;
  is_orphan: boolean;
  is_child: boolean;
  is_disabled: boolean;
  is_patient: boolean;
  occupation: string;
  monthly_income: number;
  family_id: string;
  family?: {
    family_id: string;
    registration_number: string;
    area: string;
    city: string;
  };
}

interface FamilyLite {
  family_id: string;
  registration_number: string;
  area?: string;
  city?: string;
}

const hasValidFamilyId = (familyId?: string): familyId is string =>
  typeof familyId === 'string' && familyId.trim().length > 0 && familyId !== 'undefined' && familyId !== 'null';

const relationshipMap: Record<string, string> = {
  head: 'Head',
  spouse: 'Spouse',
  son: 'Son',
  daughter: 'Daughter',
  mother: 'Mother',
  sibling: 'Sibling',
  other: 'Other',
};

export default function IndividualsPage() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orphanFilter, setOrphanFilter] = useState('');
  const [childFilter, setChildFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [limit, setLimit] = useState(50);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Individual | null>(null);
  const [familiesById, setFamiliesById] = useState<Record<string, FamilyLite>>({});

  useEffect(() => {
    const loadIndividuals = search.trim().length >= 2
      ? individualsAPI.search(search.trim())
      : individualsAPI.list({
          limit,
          skip: (page - 1) * limit,
          ...(orphanFilter === 'orphan' ? { is_orphan: true } : {}),
          ...(orphanFilter === 'non-orphan' ? { is_orphan: false } : {}),
          ...(childFilter === 'child' ? { is_child: true } : {}),
          ...(childFilter === 'adult' ? { is_child: false } : {}),
        });

    Promise.all([loadIndividuals, familiesAPI.list({ limit: 500 })]).then(([individualRes, familyRes]) => {
      const data = Array.isArray(individualRes.data) ? individualRes.data : [];
      setIndividuals(data);
      setHasNext(search.trim().length < 2 && data.length === limit);
      const families = Array.isArray(familyRes.data?.data) ? familyRes.data.data : [];
      const map = families.reduce((acc: Record<string, FamilyLite>, family: FamilyLite) => {
        if (family?.family_id) acc[family.family_id] = family;
        return acc;
      }, {});
      setFamiliesById(map);
    }).finally(() => setLoading(false));
  }, [page, search, orphanFilter, childFilter, limit]);

  const filtered = useMemo(() => {
    return individuals;
  }, [individuals]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const openMemberModal = (member: Individual) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('en-PK');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Individuals</h1>
            <p>Manage all individuals across intake and registered families</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="filter-row">
          <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={15} />
            <input className="form-control" placeholder="Search by name, CNIC, occupation…" value={search} onChange={e => { setLoading(true); setPage(1); setSearch(e.target.value); }} />
          </div>
          <select className="form-control" value={orphanFilter} onChange={e => { setLoading(true); setPage(1); setOrphanFilter(e.target.value); }}>
            <option value="">All Orphan Status</option>
            <option value="orphan">Orphans Only</option>
            <option value="non-orphan">Non-Orphans</option>
          </select>
          <select className="form-control" value={childFilter} onChange={e => { setLoading(true); setPage(1); setChildFilter(e.target.value); }}>
            <option value="">All Ages</option>
            <option value="child">Children</option>
            <option value="adult">Adults</option>
          </select>
          <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '13px' }}>
            <Filter size={14} style={{ display: 'inline', marginRight: 6 }} />
            {filtered.length} of {individuals.length}
          </div>
        </div>

        <div className="table-wrap">
          <table className="mobile-stack-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>CNIC/B-Form</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Relationship</th>
                <th>Family</th>
                <th>Flags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton skeleton-text" style={{ width: '100px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '80px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '40px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '50px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '60px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '70px' }} /></td>
                    <td><div className="skeleton skeleton-text-sm" style={{ width: '80px' }} /></td>
                    <td><div className="skeleton skeleton-col-sm" style={{ width: '28px', height: '28px' }} /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><User size={22} /></div>
                    <h3>No individuals found</h3>
                    <p>Try adjusting filters or register a new family with members</p>
                  </div>
                </td></tr>
              ) : filtered.map(i => (
                <tr key={i.individual_id}>
                  <td data-label="Name">
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{i.full_name}</div>
                      {i.occupation && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{i.occupation}</div>}
                    </div>
                  </td>
                  <td data-label="CNIC/B-Form"><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--accent)' }}>{i.cnic_or_bform}</span></td>
                  <td data-label="Age">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                      <Calendar size={12} /> {calculateAge(i.dob)}y
                    </span>
                  </td>
                  <td data-label="Gender"><span style={{ textTransform: 'capitalize' }}>{i.gender}</span></td>
                  <td data-label="Relationship">{relationshipMap[i.relationship_to_head] || i.relationship_to_head}</td>
                  <td data-label="Family">
                    {hasValidFamilyId(i.family_id) ? (
                      <Link href={`/families/${i.family_id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                          <MapPin size={12} /> {familiesById[i.family_id]?.registration_number || i.family?.registration_number || '—'}
                        </span>
                      </Link>
                    ) : '—'}
                  </td>
                  <td data-label="Flags">
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {i.is_orphan && <span className="badge badge-purple" style={{ fontSize: '10px' }}>Orphan</span>}
                      {i.is_child && <span className="badge badge-blue" style={{ fontSize: '10px' }}>Child</span>}
                      {i.is_disabled && <span className="badge badge-yellow" style={{ fontSize: '10px' }}>Disabled</span>}
                      {i.is_patient && <span className="badge badge-red" style={{ fontSize: '10px' }}>Patient</span>}
                    </div>
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openMemberModal(i)} className="btn btn-secondary btn-sm">
                        <Eye size={12} /> View Member
                      </button>
                      {hasValidFamilyId(i.family_id) ? (
                        <Link href={`/families/${i.family_id}`} className="btn btn-secondary btn-sm">
                          View Family
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No Family Link</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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

      {showMemberModal && selectedMember && (
        <div className="modal-overlay" onClick={closeMemberModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Member Details</h2>
              <button className="modal-close" onClick={closeMemberModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item"><label>Name</label><p>{selectedMember.full_name || '—'}</p></div>
                <div className="info-item"><label>Gender</label><p style={{ textTransform: 'capitalize' }}>{selectedMember.gender || '—'}</p></div>
                <div className="info-item"><label>Date of Birth</label><p>{formatDate(selectedMember.dob)}</p></div>
                <div className="info-item"><label>Age</label><p>{selectedMember.dob ? `${calculateAge(selectedMember.dob)} years` : '—'}</p></div>
                <div className="info-item"><label>CNIC / B-Form</label><p>{selectedMember.cnic_or_bform || '—'}</p></div>
                <div className="info-item"><label>Relationship</label><p>{relationshipMap[selectedMember.relationship_to_head] || selectedMember.relationship_to_head}</p></div>
                <div className="info-item"><label>Occupation</label><p>{selectedMember.occupation || '—'}</p></div>
                <div className="info-item"><label>Monthly Income</label><p>PKR {selectedMember.monthly_income || 0}</p></div>
                <div className="info-item"><label>Family</label><p>{selectedMember.family_id ? (familiesById[selectedMember.family_id]?.registration_number || selectedMember.family?.registration_number || '—') : '—'}</p></div>
                <div className="info-item"><label>Area / City</label><p>{selectedMember.family_id ? `${familiesById[selectedMember.family_id]?.area || selectedMember.family?.area || '—'} / ${familiesById[selectedMember.family_id]?.city || selectedMember.family?.city || '—'}` : '—'}</p></div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedMember.is_orphan && <span className="badge badge-purple">Orphan</span>}
                {selectedMember.is_child && <span className="badge badge-blue">Child</span>}
                {selectedMember.is_disabled && <span className="badge badge-yellow">Disabled</span>}
                {selectedMember.is_patient && <span className="badge badge-red">Patient</span>}
                {!selectedMember.is_orphan && !selectedMember.is_child && !selectedMember.is_disabled && !selectedMember.is_patient && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No special flags</span>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeMemberModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
