'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { assessmentsAPI } from '@/lib/api';
import { ArrowLeft, Save, ClipboardList, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function NewAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    assessment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await assessmentsAPI.create({
        family_id: id,
        assessment_date: form.assessment_date,
        notes: form.notes,
      });
      router.push(`/families/${id}/assessment`);
    } catch (err: unknown) {
      if (typeof err === 'string') {
        setError(err);
      } else if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response as { data?: { detail?: string } };
        setError(response.data?.detail || 'Failed to create assessment');
      } else {
        setError('Failed to create assessment');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href={`/families/${id}/assessment`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ArrowLeft size={14} /> Back to Assessment
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClipboardList size={24} /> New Assessment
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Conduct a new assessment for this family
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: 12, borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
              <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Assessment Date
            </label>
            <input
              type="date"
              value={form.assessment_date}
              onChange={(e) => setForm({ ...form, assessment_date: e.target.value })}
              required
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg-secondary)',
                color: 'var(--text)',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '13px' }}>
              <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={6}
              placeholder="Enter assessment notes, observations, and findings..."
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg-secondary)',
                color: 'var(--text)',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Link
              href={`/families/${id}/assessment`}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} /> {loading ? 'Creating...' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
