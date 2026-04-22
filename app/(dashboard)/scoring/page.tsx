'use client';

import { useEffect, useState } from 'react';
import { scoringAPI } from '@/lib/api';
import { Star, Settings, Plus, X } from 'lucide-react';

interface Criterion {
  criterion_id: string; name: string; weight: number;
  category_applicable: string; active: boolean;
}

export default function ScoringPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scoringAPI.listCriteria().then(r => setCriteria(Array.isArray(r.data) ? r.data : [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Scoring</h1><p>View scoring results and manage scoring criteria</p></div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Scoring Criteria</div>
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : criteria.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Star size={22} /></div>
            <h3>No scoring criteria defined</h3>
            <p>Add criteria from the admin panel.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Criterion</th><th>Weight</th><th>Applicable To</th><th>Status</th></tr>
              </thead>
              <tbody>
                {criteria.map(c => (
                  <tr key={c.criterion_id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className="badge badge-blue">{c.weight}</span></td>
                    <td><span className={`badge badge-${c.category_applicable === 'FA' ? 'blue' : c.category_applicable === 'SB' ? 'purple' : 'gray'}`}>{c.category_applicable}</span></td>
                    <td>{c.active ? <span className="badge badge-green">Active</span> : <span className="badge badge-gray">Inactive</span>}</td>
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
