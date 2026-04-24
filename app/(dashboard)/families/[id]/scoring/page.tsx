'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { scoringAPI, assessmentsAPI } from '@/lib/api';
import { ArrowLeft, Star, Calculator, CheckCircle, AlertTriangle, Users, User, ClipboardList, CheckSquare, Heart, DollarSign, FileText } from 'lucide-react';

export default function FamilyScoringPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [category, setCategory] = useState('');

  useEffect(() => {
    assessmentsAPI.list({ family_id: id }).then(r => {
      setAssessments(Array.isArray(r.data) ? r.data : []);
    });
  }, [id]);

  const calculateScore = () => {
    // Mock scoring calculation
    let calculatedScore = 0;
    assessments.forEach(a => {
      calculatedScore += 50; // Mock calculation
    });
    setScore(calculatedScore);
    setCategory(calculatedScore > 70 ? 'FA' : 'SB');
  };

  const submitScore = async () => {
    setLoading(true);
    try {
      await scoringAPI.override(assessments[0]?.assessment_id, { score, category });
      router.push(`/families/${id}`);
    } catch (e) {
      console.error('Error submitting score:', e);
      alert('Failed to submit score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <Link href={`/families/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Family
        </Link>
        <div style={{ marginTop: 8 }}>
          <h1>Family Scoring</h1>
          <p>Calculate and review eligibility score</p>
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

      <div className="card" style={{ maxWidth: 800 }}>
        {assessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Calculator size={22} /></div>
            <h3>No Assessment Found</h3>
            <p>Complete an assessment first before scoring</p>
            <Link href={`/families/${id}/assessment`} className="btn btn-primary" style={{ marginTop: 16 }}>
              Start Assessment
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 20, background: 'var(--accent-glow)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 8 }}>Calculated Score</div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--accent)' }}>{score}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>out of 100</div>
              </div>
              <div style={{ padding: 20, background: 'var(--purple-bg)', borderRadius: 8, border: '1px solid rgba(168, 85, 247, 0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 8 }}>Recommended Category</div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--purple)' }}>{category}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>Program Type</div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Scoring Criteria</h3>
              <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Income Assessment</span>
                  <span style={{ fontWeight: 600 }}>30 points</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Family Size</span>
                  <span style={{ fontWeight: 600 }}>20 points</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Housing Condition</span>
                  <span style={{ fontWeight: 600 }}>20 points</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Special Circumstances</span>
                  <span style={{ fontWeight: 600 }}>30 points</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Override Score</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Manual Score</label>
                  <input type="number" className="form-control" value={score} onChange={e => setScore(Number(e.target.value))} max={100} min={0} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category Override</label>
                  <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="FA">FA - Financial Aid</option>
                    <option value="SB">SB - Saiban Orphan</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={calculateScore} className="btn btn-secondary" style={{ flex: 1 }}>
                <Calculator size={14} /> Recalculate
              </button>
              <button onClick={submitScore} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                <Star size={14} /> {loading ? 'Submitting...' : 'Submit Score'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
