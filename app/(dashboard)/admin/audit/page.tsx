'use client';

import { useEffect, useState } from 'react';
import { Settings, Search, Filter, Clock, User, Shield, FileText } from 'lucide-react';

interface AuditLog {
  audit_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  ip_address: string;
  details?: string;
}

const actionColors: Record<string, string> = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  override: 'yellow',
  status_change: 'purple',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtered, setFiltered] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    // Mock data for now - replace with API call
    const mockLogs: AuditLog[] = [
      {
        audit_id: '1',
        action: 'create',
        entity_type: 'family',
        entity_id: 'abc-123',
        user_id: 'user-1',
        user_name: 'Admin User',
        timestamp: new Date().toISOString(),
        ip_address: '192.168.1.1',
        details: 'Created new family FA-GUL-2026',
      },
    ];
    setLogs(mockLogs);
    setFiltered(mockLogs);
    setLoading(false);
  }, []);

  useEffect(() => {
    let result = [...logs];
    if (search) result = result.filter(l =>
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase())
    );
    if (actionFilter) result = result.filter(l => l.action === actionFilter);
    setFiltered(result);
  }, [search, actionFilter, logs]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Audit Log</h1>
          <p>Track all system changes and user actions</p>
        </div>
      </div>

      <div className="card">
        <div className="filter-row">
          <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={15} />
            <input className="form-control" placeholder="Search by user, entity, or details…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="override">Override</option>
            <option value="status_change">Status Change</option>
          </select>
          <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '13px' }}>
            <Filter size={14} style={{ display: 'inline', marginRight: 6 }} />
            {filtered.length} of {logs.length}
          </div>
        </div>

        <div className="table-wrap">
          <table className="mobile-stack-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><FileText size={22} /></div>
                    <h3>No audit logs found</h3>
                    <p>System actions will appear here</p>
                  </div>
                </td></tr>
              ) : filtered.map(log => (
                <tr key={log.audit_id}>
                  <td data-label="Timestamp">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                      <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td data-label="User">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <User size={14} /> {log.user_name}
                    </div>
                  </td>
                  <td data-label="Action"><span className={`badge badge-${actionColors[log.action] || 'gray'}`}>{log.action}</span></td>
                  <td data-label="Entity">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Shield size={12} /> {log.entity_type}
                    </div>
                  </td>
                  <td data-label="Details" style={{ color: 'var(--text-secondary)', fontSize: '13px', wordBreak: 'break-word' }}>{log.details || '—'}</td>
                  <td data-label="IP" style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
