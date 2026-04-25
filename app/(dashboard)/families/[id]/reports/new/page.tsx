'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { reportsAPI } from '@/lib/api';
import { ArrowLeft, Save, FileText, Calendar, User, AlertCircle } from 'lucide-react';

export default function NewReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    report_type: 'progress',
    report_period_start: '',
    report_period_end: '',
    educational_progress: '',
    health_status: '',
    financial_assistance_usage: '',
    challenges_faced: '',
    achievements: '',
    recommendations: '',
    next_steps: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      await reportsAPI.create({
        family_id: id,
        submitted_by: userId,
        report_type: form.report_type,
        report_period_start: form.report_period_start,
        report_period_end: form.report_period_end,
        educational_progress: form.educational_progress || null,
        health_status: form.health_status || null,
        financial_assistance_usage: form.financial_assistance_usage || null,
        challenges_faced: form.challenges_faced || null,
        achievements: form.achievements || null,
        recommendations: form.recommendations || null,
        next_steps: form.next_steps || null,
      });

      router.push(`/families/${id}/reports`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href={`/families/${id}/reports`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Reports
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={24} /> Create New Report
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Submit a progress report for this family
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: 12, borderRadius: 6, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Report Type */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                Report Type *
              </label>
              <select
                value={form.report_type}
                onChange={(e) => setForm({ ...form, report_type: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px' }}
                required
              >
                <option value="progress">Progress Report</option>
                <option value="financial">Financial Report</option>
                <option value="incident">Incident Report</option>
                <option value="general">General Report</option>
              </select>
            </div>

            {/* Report Period */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                  Period Start *
                </label>
                <input
                  type="date"
                  value={form.report_period_start}
                  onChange={(e) => setForm({ ...form, report_period_start: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                  Period End *
                </label>
                <input
                  type="date"
                  value={form.report_period_end}
                  onChange={(e) => setForm({ ...form, report_period_end: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px' }}
                  required
                />
              </div>
            </div>

            {/* Educational Progress */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                Educational Progress
              </label>
              <textarea
                value={form.educational_progress}
                onChange={(e) => setForm({ ...form, educational_progress: e.target.value })}
                rows={3}
                placeholder="Describe educational progress..."
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            {/* Health Status */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                Health Status
              </label>
              <textarea
                value={form.health_status}
                onChange={(e) => setForm({ ...form, health_status: e.target.value })}
                rows={3}
                placeholder="Describe health status..."
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            {/* Financial Assistance Usage */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                Financial Assistance Usage
              </label>
              <textarea
                value={form.financial_assistance_usage}
                onChange={(e) => setForm({ ...form, financial_assistance_usage: e.target.value })}
                rows={3}
                placeholder="Describe how financial assistance was used..."
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            {/* Challenges Faced */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                Challenges Faced
              </label>
              <textarea
                value={form.challenges_faced}
                onChange={(e) => setForm({ ...form, challenges_faced: e.target.value })}
                rows={3}
                placeholder="Describe any challenges faced..."
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            {/* Achievements */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                Achievements
              </label>
              <textarea
                value={form.achievements}
                onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                rows={3}
                placeholder="Describe achievements..."
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            {/* Recommendations */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                Recommendations
              </label>
              <textarea
                value={form.recommendations}
                onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                rows={3}
                placeholder="Provide recommendations..."
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            {/* Next Steps */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
                Next Steps
              </label>
              <textarea
                value={form.next_steps}
                onChange={(e) => setForm({ ...form, next_steps: e.target.value })}
                rows={3}
                placeholder="Describe next steps..."
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <Link href={`/families/${id}/reports`} className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={14} /> {loading ? 'Creating...' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
