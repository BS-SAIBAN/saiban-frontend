'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { individualsAPI } from '@/lib/api';
import { ArrowLeft, User, Plus, Edit, Trash2, Calendar, MapPin, Shield, Briefcase, DollarSign, Users, ClipboardList, Star, CheckSquare, Heart, FileText } from 'lucide-react';

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

export default function FamilyMembersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [members, setMembers] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    individualsAPI.list(id).then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setMembers(data);
    }).finally(() => setLoading(false));
  }, [id]);

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

  const handleDelete = async (individualId: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;
    try {
      await individualsAPI.delete(individualId);
      setMembers(members.filter(m => m.individual_id !== individualId));
    } catch (e) {
      console.error('Failed to delete member:', e);
      alert('Failed to delete member');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <Link href={`/families/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Family
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div>
            <h1>Family Members</h1>
            <p>Manage all members of this family</p>
          </div>
          <Link href={`/families/${id}/members/new`} className="btn btn-primary">
            <Plus size={14} /> Add Member
          </Link>
        </div>
      </div>

      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { href: `/families/${id}`, label: 'Overview', icon: <Users size={13} /> },
          { href: `/families/${id}/members`, label: 'Members', icon: <User size={13} /> },
          { href: `/families/${id}/assessment`, label: 'Assessment', icon: <ClipboardList size={13} /> },
          { href: `/families/${id}/scoring`, label: 'Scoring', icon: <Star size={13} /> },
          { href: `/families/${id}/approval`, label: 'Approval', icon: <CheckSquare size={13} /> },
          { href: `/families/${id}/sponsors`, label: 'Sponsors', icon: <Heart size={13} /> },
          { href: `/families/${id}/payments`, label: 'Payments', icon: <DollarSign size={13} /> },
          { href: `/families/${id}/reports`, label: 'Reports', icon: <FileText size={13} /> },
        ].map(link => (
          <Link key={link.href} href={link.href} className="btn btn-secondary btn-sm">
            {link.icon} {link.label}
          </Link>
        ))}
      </div>

      <div className="card">
        {members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><User size={22} /></div>
            <h3>No members added yet</h3>
            <p>Add family members to complete the registration</p>
            <Link href={`/families/${id}/members/new`} className="btn btn-primary" style={{ marginTop: 16 }}>
              <Plus size={14} /> Add First Member
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>CNIC/B-Form</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Relationship</th>
                  <th>Occupation</th>
                  <th>Income</th>
                  <th>Flags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.individual_id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.full_name}</div>
                    </td>
                    <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--accent)' }}>{m.cnic_or_bform}</span></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                        <Calendar size={12} /> {calculateAge(m.dob)}y
                      </span>
                    </td>
                    <td><span style={{ textTransform: 'capitalize' }}>{m.gender}</span></td>
                    <td>{relationshipMap[m.relationship_to_head] || m.relationship_to_head}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Briefcase size={12} /> {m.occupation || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <DollarSign size={12} /> {m.monthly_income || 0}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {m.is_orphan && <span className="badge badge-purple" style={{ fontSize: '10px' }}>Orphan</span>}
                        {m.is_child && <span className="badge badge-blue" style={{ fontSize: '10px' }}>Child</span>}
                        {m.is_disabled && <span className="badge badge-yellow" style={{ fontSize: '10px' }}>Disabled</span>}
                        {m.is_patient && <span className="badge badge-red" style={{ fontSize: '10px' }}>Patient</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/families/${id}/members/${m.individual_id}/edit`} className="btn btn-secondary btn-sm">
                          <Edit size={12} />
                        </Link>
                        <button onClick={() => handleDelete(m.individual_id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--red)' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
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
