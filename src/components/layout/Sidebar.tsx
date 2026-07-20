import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Users,
  MapPin,
  BarChart3,
  Settings,
  FileText,
  Siren,
  CalendarClock,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ROLE_LABELS } from '@/lib/utils/constants';
import type { NavItem } from '@/types/common';

const supervisorLinks: NavItem[] = [
  { label: 'Dashboard', to: '/supervisor', icon: LayoutDashboard },
  { label: 'Alerts', to: '/supervisor/alerts', icon: AlertTriangle },
  { label: 'Shifts', to: '/supervisor/shifts', icon: CalendarClock },
  { label: 'SOS Events', to: '/supervisor/sos', icon: Siren },
];

const adminLinks: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Kiln Sites', to: '/admin/sites', icon: MapPin },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Alerts', to: '/admin/alerts', icon: AlertTriangle },
  { label: 'Compliance', to: '/admin/compliance', icon: FileText },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

const linksMap: Record<string, NavItem[]> = {
  supervisor: supervisorLinks,
  admin: adminLinks,
};

export default function Sidebar() {
  const { profile, role, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = role ? linksMap[role] ?? [] : [];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', marginBottom: '0.875rem' }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563EB, #1B2E52)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
          }}
        >
          <Shield size={17} color="#fff" strokeWidth={2.25} />
        </div>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.9375rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#F8FAFC',
              lineHeight: 1.1,
            }}
          >
            HEATSHIELD
          </h1>
          <p
            style={{
              fontSize: '0.6rem',
              color: 'rgba(148, 163, 184, 0.85)',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              marginTop: 3,
              fontWeight: 500,
            }}
          >
            Worker Safety OS
          </p>
        </div>
      </div>

      {/* Role badge */}
      {profile && (
        <div
          className="mx-4 mb-4 px-3.5 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: 'rgba(148, 163, 184, 0.06)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(27, 46, 82, 0.6))',
              border: '1px solid rgba(147, 197, 253, 0.25)',
              color: '#BFDBFE',
              fontWeight: 700,
              fontSize: '0.8125rem',
            }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#E2E8F0', lineHeight: 1.3 }}>
              {profile.name}
            </p>
            <p
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#60A5FA',
                marginTop: 1,
              }}
            >
              {ROLE_LABELS[role ?? ''] ?? role}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p
          className="px-3 pb-2"
          style={{
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(100, 116, 139, 0.9)',
          }}
        >
          Menu
        </p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === `/${role}`}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={17} strokeWidth={2} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
        <NavLink
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>
        <button
          onClick={() => signOut()}
          className="sidebar-link w-full"
          style={{ color: '#FCA5A5' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl p-2.5 cursor-pointer"
        style={{
          background: 'var(--navy-900)',
          color: '#E2E8F0',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
        }}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden animate-fade-in"
          style={{ background: 'rgba(6, 13, 31, 0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 glass-sidebar flex flex-col lg:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 cursor-pointer"
          style={{ color: 'rgba(148, 163, 184, 0.8)' }}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:sticky lg:top-0 glass-sidebar">
        <SidebarContent />
      </aside>
    </>
  );
}
