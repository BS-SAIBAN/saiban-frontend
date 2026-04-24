'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { familiesAPI, alertsAPI, donorsAPI, paymentsAPI, orphansAPI, individualsAPI } from '@/lib/api';
import {
  Users, Bell, Heart, DollarSign, CheckCircle,
  Clock, AlertTriangle, TrendingUp, ArrowRight,
  Baby, FileText,
} from 'lucide-react';

interface Stats {
  totalFamilies: number;
  pendingApprovals: number;
  totalDonors: number;
  activeAlerts: number;
  totalPayments: number;
  monthlyAmount: number;
  totalOrphans: number;
  totalIndividuals: number;
}

interface AlertItem {
  alert_id: string;
  alert_type: string;
  title: string;
  message: string;
  priority: string;
  due_date?: string;
  is_resolved: boolean;
}

const alertTypeColor: Record<string, string> = {
  payment_due: 'yellow',
  progress_report_due: 'blue',
  pending_approval: 'purple',
  reassessment_required: 'red',
  orphan_age_limit: 'red',
};

const alertTypeIcon: Record<string, React.ReactNode> = {
  payment_due: <DollarSign size={14} />,
  progress_report_due: <FileText size={14} />,
  pending_approval: <Clock size={14} />,
  reassessment_required: <AlertTriangle size={14} />,
  orphan_age_limit: <Baby size={14} />,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalFamilies: 0, pendingApprovals: 0, totalDonors: 0,
    activeAlerts: 0, totalPayments: 0, monthlyAmount: 0,
    totalOrphans: 0, totalIndividuals: 0,
  });
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      familiesAPI.list(),
      alertsAPI.list({ is_resolved: 'false' }),
      donorsAPI.analytics(),
      paymentsAPI.analytics(),
      orphansAPI.list(),
      individualsAPI.list(),
    ]).then(([fams, alts, donors, payments, orphans, individuals]) => {
      const famData = fams.status === 'fulfilled' ? fams.value.data : [];
      const altData = alts.status === 'fulfilled' ? alts.value.data : [];
      const donorsData = donors.status === 'fulfilled' ? donors.value.data : {};
      const paymentsData = payments.status === 'fulfilled' ? payments.value.data : {};
      const orphansData = orphans.status === 'fulfilled' ? orphans.value.data : [];
      const individualsData = individuals.status === 'fulfilled' ? individuals.value.data : [];

      setStats({
        totalFamilies: Array.isArray(famData) ? famData.length : 0,
        pendingApprovals: Array.isArray(famData) ? famData.filter((f: {status: string}) => f.status === 'scoring').length : 0,
        totalDonors: donorsData.total_donors || 0,
        activeAlerts: Array.isArray(altData) ? altData.length : 0,
        totalPayments: paymentsData.total_payments || 0,
        monthlyAmount: paymentsData.total_amount || 0,
        totalOrphans: Array.isArray(orphansData) ? orphansData.length : 0,
        totalIndividuals: Array.isArray(individualsData) ? individualsData.length : 0,
      });
      setAlerts(Array.isArray(altData) ? altData.slice(0, 8) : []);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Families', value: stats.totalFamilies, icon: <Users size={20} />, color: 'var(--accent)', bg: 'var(--accent-glow)', change: 'Registered cases' },
    { label: 'Total Individuals', value: stats.totalIndividuals, icon: <Users size={20} />, color: 'var(--purple)', bg: 'var(--purple-bg)', change: 'All individuals' },
    { label: 'Total Orphans', value: stats.totalOrphans, icon: <Baby size={20} />, color: 'var(--accent)', bg: 'var(--accent-glow)', change: 'Registered orphans' },
    { label: 'Active Donors', value: stats.totalDonors, icon: <Heart size={20} />, color: 'var(--red)', bg: 'var(--red-bg)', change: 'Supporting cases' },
    { label: 'Total Payments', value: stats.totalPayments, icon: <DollarSign size={20} />, color: 'var(--green)', bg: 'var(--green-bg)', change: 'Recorded payments' },
    { label: 'Monthly Amount (PKR)', value: `${(stats.monthlyAmount / 1000).toFixed(0)}k`, icon: <TrendingUp size={20} />, color: 'var(--accent)', bg: 'var(--accent-glow)', change: 'Total disbursed' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: <Clock size={20} />, color: 'var(--yellow)', bg: 'var(--yellow-bg)', change: 'Awaiting review' },
    { label: 'Active Alerts', value: stats.activeAlerts, icon: <Bell size={20} />, color: 'var(--purple)', bg: 'var(--purple-bg)', change: 'Require attention' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back — here is the Saiban system overview</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/families/new" className="btn btn-primary">
              <Users size={14} /> Register Beneficiary
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="stats-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="stat-card" style={{ opacity: 0.5 }}>
              <div className="stat-icon" style={{ background: 'var(--border)', width: 44, height: 44, borderRadius: 10 }} />
              <div><div style={{ height: 28, width: 60, background: 'var(--border)', borderRadius: 4, marginBottom: 6 }} /><div style={{ height: 14, width: 100, background: 'var(--border)', borderRadius: 4 }} /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map((card) => (
            <div key={card.label} className="stat-card card-hover">
              <div className="stat-icon" style={{ background: card.bg }}>
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
              <div>
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-change" style={{ color: 'var(--text-muted)' }}>{card.change}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Alerts queue */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700' }}>🔔 Active Alerts</h2>
            <Link href="/alerts" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="alert-item" style={{ opacity: 0.5 }}>
                <div className="skeleton skeleton-avatar" style={{ width: 8, height: 8 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                  <div className="skeleton skeleton-text-sm" style={{ width: '40%' }} />
                </div>
              </div>
            ))
          ) : alerts.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon"><CheckCircle size={22} style={{ color: 'var(--green)' }} /></div>
              <h3>All Clear!</h3>
              <p>No active alerts at this time.</p>
            </div>
          ) : (
            alerts.map(alert => {
              const color = alertTypeColor[alert.alert_type] || 'gray';
              return (
                <div key={alert.alert_id} className="alert-item">
                  <div className={`alert-dot`} style={{
                    background: color === 'yellow' ? 'var(--yellow)' : color === 'red' ? 'var(--red)' : color === 'purple' ? 'var(--purple)' : color === 'blue' ? 'var(--accent)' : 'var(--text-muted)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{alert.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.message}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px', flexShrink: 0 }}>
                    {alertTypeIcon[alert.alert_type]}
                    <span className={`badge badge-${color}`}>{alert.priority}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick links */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Register Beneficiary', href: '/families/new', icon: <Users size={18} />, color: 'var(--accent)', bg: 'var(--accent-glow)' },
              { label: 'Add Donor', href: '/donors', icon: <Heart size={18} />, color: 'var(--red)', bg: 'var(--red-bg)' },
              { label: 'Record Payment', href: '/payments', icon: <DollarSign size={18} />, color: 'var(--green)', bg: 'var(--green-bg)' },
              { label: 'Submit Report', href: '/reports', icon: <FileText size={18} />, color: 'var(--purple)', bg: 'var(--purple-bg)' },
              { label: 'View Approvals', href: '/approvals', icon: <CheckCircle size={18} />, color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
              { label: 'Orphan List', href: '/orphans', icon: <Baby size={18} />, color: 'var(--accent)', bg: 'var(--accent-glow)' },
            ].map((action) => (
              <Link key={action.href} href={action.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px', borderRadius: '10px', textDecoration: 'none',
                background: action.bg, border: `1px solid ${action.bg}`,
                transition: 'all 0.15s',
              }}
              className="card-hover"
              >
                <span style={{ color: action.color }}>{action.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{action.label}</span>
                <ArrowRight size={12} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
