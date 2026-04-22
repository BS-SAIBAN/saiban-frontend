'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, Users, User, Baby, ClipboardList,
  Star, CheckSquare, Heart, DollarSign, FileText,
  Bell, Settings, LogOut, ShieldCheck, BookOpen,
} from 'lucide-react';

const navItems = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Alerts', href: '/alerts', icon: Bell },
    ],
  },
  {
    section: 'Beneficiaries',
    items: [
      { label: 'Families', href: '/families', icon: Users },
      { label: 'Individuals', href: '/individuals', icon: User },
      { label: 'Orphans', href: '/orphans', icon: Baby },
    ],
  },
  {
    section: 'Workflow',
    items: [
      { label: 'Assessments', href: '/assessments', icon: ClipboardList },
      { label: 'Scoring', href: '/scoring', icon: Star },
      { label: 'Approvals', href: '/approvals', icon: CheckSquare },
    ],
  },
  {
    section: 'Sponsorship',
    items: [
      { label: 'Donors', href: '/donors', icon: Heart },
      { label: 'Sponsorships', href: '/sponsorships', icon: BookOpen },
      { label: 'Payments', href: '/payments', icon: DollarSign },
      { label: 'Progress Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Users', href: '/admin/users', icon: ShieldCheck },
      { label: 'Audit Log', href: '/admin/audit', icon: Settings },
    ],
    adminOnly: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  const initials = user?.full_name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>🏛️ Saiban</h1>
        <p>Beneficiary Management System</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => {
          if (section.adminOnly && !isAdmin) return null;
          return (
            <div key={section.section} className="nav-section">
              <div className="nav-section-label">{section.section}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                    <Icon />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.full_name || 'Unknown'}</div>
            <div className="user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
