'use client';

import { useEffect, useState } from 'react';
import { alertsAPI } from '@/lib/api';
import { Bell, CheckCircle, Filter, RefreshCw, AlertTriangle, Clock, DollarSign, FileText, Baby, X } from 'lucide-react';

interface Alert {
  alert_id: string; alert_type: string; title: string; message: string;
  priority: string; due_date?: string; is_resolved: boolean; created_at: string;
  family_id?: string;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  payment_due: { icon: <DollarSign size={14} />, color: 'yellow', label: 'Payment Due' },
  progress_report_due: { icon: <FileText size={14} />, color: 'blue', label: 'Report Due' },
  pending_approval: { icon: <Clock size={14} />, color: 'purple', label: 'Pending Approval' },
  reassessment_required: { icon: <AlertTriangle size={14} />, color: 'red', label: 'Reassessment' },
  orphan_age_limit: { icon: <Baby size={14} />, color: 'red', label: 'Age Limit' },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [typeFilter, setTypeFilter] = useState('');
  const [generating, setGenerating] = useState(false);

  const load = () => {
    const params: Record<string, string> = {};
    if (filter === 'active') params.is_resolved = 'false';
    if (filter === 'resolved') params.is_resolved = 'true';
    if (typeFilter) params.alert_type = typeFilter;
    alertsAPI.list(params).then(r => setAlerts(Array.isArray(r.data) ? r.data : [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, typeFilter]);

  const resolve = async (id: string) => {
    await alertsAPI.resolve(id);
    setAlerts(prev => prev.map(a => a.alert_id === id ? { ...a, is_resolved: true } : a));
  };

  const autoGenerate = async () => {
    setGenerating(true);
    try { await alertsAPI.autoGenerate(); load(); } finally { setGenerating(false); }
  };

  const active = alerts.filter(a => !a.is_resolved);
  const resolved = alerts.filter(a => a.is_resolved);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Alerts</h1><p>System notifications and action items requiring attention</p></div>
          <button className="btn btn-secondary" onClick={autoGenerate} disabled={generating}>
            <RefreshCw size={14} className={generating ? 'spin' : ''} /> Auto-Generate
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Active Alerts', value: active.length, color: 'var(--red)', bg: 'var(--red-bg)', icon: <Bell size={18} /> },
          { label: 'Payment Due', value: alerts.filter(a => a.alert_type === 'payment_due' && !a.is_resolved).length, color: 'var(--yellow)', bg: 'var(--yellow-bg)', icon: <DollarSign size={18} /> },
          { label: 'Reports Due', value: alerts.filter(a => a.alert_type === 'progress_report_due' && !a.is_resolved).length, color: 'var(--accent)', bg: 'var(--accent-glow)', icon: <FileText size={18} /> },
          { label: 'Resolved', value: resolved.length, color: 'var(--green)', bg: 'var(--green-bg)', icon: <CheckCircle size={18} /> },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ color: s.color }}>{s.icon}</span></div>
            <div><div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="filter-row" style={{ marginBottom: 20 }}>
          {['active', 'resolved', 'all'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
          <select className="form-control" style={{ maxWidth: 200 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="payment_due">Payment Due</option>
            <option value="progress_report_due">Report Due</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="reassessment_required">Reassessment</option>
            <option value="orphan_age_limit">Age Limit</option>
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
            <Filter size={13} style={{ display: 'inline', marginRight: 5 }} />{alerts.length} alerts
          </div>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><CheckCircle size={22} style={{ color: 'var(--green)' }} /></div>
            <h3>All Clear!</h3>
            <p>No alerts matching current filters.</p>
          </div>
        ) : (
          <div>
            {alerts.map(alert => {
              const config = typeConfig[alert.alert_type] || { icon: <Bell size={14} />, color: 'gray', label: alert.alert_type };
              const isOverdue = alert.due_date && new Date(alert.due_date) < new Date() && !alert.is_resolved;
              return (
                <div key={alert.alert_id} className="alert-item" style={{ opacity: alert.is_resolved ? 0.5 : 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `var(--${config.color === 'yellow' ? 'yellow' : config.color === 'red' ? 'red' : config.color === 'purple' ? 'purple' : 'accent'}-${config.color === 'gray' ? 'bg' : 'bg'})`, color: `var(--${config.color === 'gray' ? 'text-muted' : config.color})` }}>
                    {config.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{alert.title}</span>
                      <span className={`badge badge-${config.color === 'yellow' ? 'yellow' : config.color === 'red' ? 'red' : config.color === 'purple' ? 'purple' : 'blue'}`}>{config.label}</span>
                      {isOverdue && <span className="badge badge-red">Overdue</span>}
                      {alert.is_resolved && <span className="badge badge-green">Resolved</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{alert.message}</div>
                    {alert.due_date && <div style={{ fontSize: 11, color: isOverdue ? 'var(--red)' : 'var(--text-muted)', marginTop: 3 }}>Due: {new Date(alert.due_date).toLocaleDateString()}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <span className={`badge badge-${alert.priority === 'high' ? 'red' : alert.priority === 'medium' ? 'yellow' : 'gray'}`}>{alert.priority}</span>
                    {!alert.is_resolved && (
                      <button className="btn btn-success btn-sm" onClick={() => resolve(alert.alert_id)}><CheckCircle size={12} /> Resolve</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
