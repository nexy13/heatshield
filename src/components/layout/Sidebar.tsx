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
  Droplets,
  Heart,
  CalendarClock,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ROLE_LABELS } from '@/lib/utils/constants';
import type { NavItem } from '@/types/common';

const workerLinks: NavItem[] = [
  { label: 'Dashboard', to: '/worker', icon: LayoutDashboard },
  { label: 'SOS Emergency', to: '/worker/sos', icon: Siren },
  { label: 'My Shifts', to: '/worker/shifts', icon: CalendarClock },
  { label: 'Health Log', to: '/worker/health', icon: Heart },
  { label: 'Hydration', to: '/worker/hydration', icon: Droplets },
];

const supervisorLinks: NavItem[] = [
  { label: 'Dashboard', to: '/supervisor', icon: LayoutDashboard },
  { label: 'Workers', to: '/supervisor/workers', icon: Users },
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
  worker: workerLinks,
  supervisor: supervisorLinks,
  admin: adminLinks,
  ngo: [
    { label: 'Compliance', to: '/admin/compliance', icon: FileText },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  ],
};

export default function Sidebar() {
  const { profile, role, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = role ? linksMap[role] ?? [] : [];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold gradient-text">HeatShield</h1>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">
            AI Safety
          </p>
        </div>
      </div>

      {/* Role badge */}
      {profile && (
        <div className="mx-4 mb-4 px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)]">Logged in as</p>
          <p className="text-sm font-semibold truncate">{profile.name}</p>
          <span className="badge badge-warning mt-1">{ROLE_LABELS[role ?? ''] ?? role}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === `/${role}`}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <NavLink
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <button
          onClick={() => signOut()}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={18} />
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
        className="fixed top-4 left-4 z-50 lg:hidden glass rounded-lg p-2"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
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
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
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
