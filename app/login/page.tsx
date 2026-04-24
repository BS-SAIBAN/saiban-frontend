'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@saiban.com');
  const [password, setPassword] = useState('admin');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: '340px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/assets/logo.png" alt="Saiban BMS Logo" style={{ width: '90px', height: '90px', display: 'block', margin: '0 auto' }} />
        </div>

        {/* Card */}
        <div className="card" style={{ paddingTop: '20px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Sign in
          </h2>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              paddingTop: '8px', paddingBottom: '8px', paddingLeft: '10px', paddingRight: '10px',
              borderRadius: '6px', marginBottom: '14px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
              color: '#ef4444', fontSize: '11px',
            }}>
              <AlertCircle size={12} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@saiban.com"
                  required
                  style={{ paddingLeft: '38px', paddingTop: '8px', paddingBottom: '8px', paddingRight: '10px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-control"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  style={{ paddingLeft: '38px', paddingRight: '36px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  paddingTop: '2px', paddingBottom: '2px', paddingLeft: '2px', paddingRight: '2px',
                }}>
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', paddingTop: '9px', paddingBottom: '9px', paddingLeft: '9px', paddingRight: '9px', fontSize: '13px', fontWeight: '500' }} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: '12px', height: '12px' }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '14px', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '10px', paddingRight: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: '500', letterSpacing: '0.5px' }}>DEMO</p>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '1px' }}>admin@saiban.com</p>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>admin</p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '10px', color: 'var(--text-muted)', opacity: 0.7 }}>
          Saiban BMS v1.0
        </p>
      </div>
    </div>
  );
}
