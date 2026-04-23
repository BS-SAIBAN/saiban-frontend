'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { individualsAPI } from '@/lib/api';
import { User, Plus, Search, Filter, Eye, MapPin, Calendar, Shield } from 'lucide-react';

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
  const [filtered, setFiltered] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orphanFilter, setOrphanFilter] = useState('');
  const [childFilter, setChildFilter] = useState('');

  useEffect(() => {
    individualsAPI.list().then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setIndividuals(data);
      setFiltered(data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...individuals];
    if (search) result = result.filter(i =>
      i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.cnic_or_bform?.toLowerCase().includes(search.toLowerCase()) ||
      i.occupation?.toLowerCase().includes(search.toLowerCase())
    );
    if (orphanFilter === 'orphan') result = result.filter(i => i.is_orphan);
    if (orphanFilter === 'non-orphan') result = result.filter(i => !i.is_orphan);
    if (childFilter === 'child') result = result.filter(i => i.is_child);
    if (childFilter === 'adult') result = result.filter(i => !i.is_child);
    setFiltered(result);
  }, [search, orphanFilter, childFilter, individuals]);

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

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Individuals</h1>
            <p>Manage all registered individuals across beneficiary families</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="filter-row">
          <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={15} />
            <input className="form-control" placeholder="Search by name, CNIC, occupation…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={orphanFilter} onChange={e => setOrphanFilter(e.target.value)}>
            <option value="">All Orphan Status</option>
            <option value="orphan">Orphans Only</option>
            <option value="non-orphan">Non-Orphans</option>
          </select>
          <select className="form-control" value={childFilter} onChange={e => setChildFilter(e.target.value)}>
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
          <table>
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
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
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
                  <td>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{i.full_name}</div>
                      {i.occupation && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{i.occupation}</div>}
                    </div>
                  </td>
                  <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--accent)' }}>{i.cnic_or_bform}</span></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                      <Calendar size={12} /> {calculateAge(i.dob)}y
                    </span>
                  </td>
                  <td><span style={{ textTransform: 'capitalize' }}>{i.gender}</span></td>
                  <td>{relationshipMap[i.relationship_to_head] || i.relationship_to_head}</td>
                  <td>
                    {i.family ? (
                      <Link href={`/families/${i.family.family_id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                          <MapPin size={12} /> {i.family.registration_number}
                        </span>
                      </Link>
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {i.is_orphan && <span className="badge badge-purple" style={{ fontSize: '10px' }}>Orphan</span>}
                      {i.is_child && <span className="badge badge-blue" style={{ fontSize: '10px' }}>Child</span>}
                      {i.is_disabled && <span className="badge badge-yellow" style={{ fontSize: '10px' }}>Disabled</span>}
                      {i.is_patient && <span className="badge badge-red" style={{ fontSize: '10px' }}>Patient</span>}
                    </div>
                  </td>
                  <td>
                    <Link href={`/families/${i.family_id}`} className="btn btn-secondary btn-sm">
                      <Eye size={12} /> View Family
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
