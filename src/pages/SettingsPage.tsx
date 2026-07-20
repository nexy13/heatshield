import { useState } from 'react';
import { Bell, Shield, Moon, Globe, Key, Sun, Monitor, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SUPPORTED_LANGUAGES } from '@/lib/utils/constants';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Moon },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'security', label: 'Security', icon: Key },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

const THEME_OPTIONS = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { profile } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [notifyHeat, setNotifyHeat] = useState(true);
  const [notifySOS, setNotifySOS] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);
  const [theme, setTheme] = useState('light');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [language, setLanguage] = useState('en');
  const [twoFA, setTwoFA] = useState(false);

  const goToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <div className="text-left">
        <p className="eyebrow mb-1.5">Preferences</p>
        <h2 className="page-title">Account Settings</h2>
        <p className="page-subtitle">Manage your profile, preferences, and notifications</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ── Section nav ── */}
        <div className="space-y-1.5 md:sticky md:top-9 self-start">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => goToSection(id)}
              className="w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all duration-200 cursor-pointer text-sm"
              style={
                activeSection === id
                  ? {
                      background: 'var(--accent-light)',
                      color: 'var(--info)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      boxShadow: 'var(--shadow-xs)',
                    }
                  : {
                      color: id === 'danger' ? 'var(--emergency)' : 'var(--text-muted)',
                      border: '1px solid transparent',
                    }
              }
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-5">
          {/* ── Personal information ── */}
          <div id="settings-profile" className="card p-6 text-left">
            <h3 className="font-serif text-base font-bold mb-1">Personal Information</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">Your identity across the platform</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5 block">
                  Full Name
                </label>
                <input type="text" className="input-field" defaultValue={profile?.name ?? ''} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5 block">
                  Email Address
                </label>
                <input type="email" className="input-field" disabled defaultValue={profile?.email ?? 'admin@heatshield.com'} />
                <p className="text-xs text-[var(--text-muted)] mt-1.5">Email cannot be changed.</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5 block">
                  Phone Number
                </label>
                <input type="tel" className="input-field" defaultValue={profile?.phone ?? '+91 98450 10001'} />
              </div>

              <div className="pt-3 flex justify-end">
                <button className="btn-primary px-6 py-2.5">Save Changes</button>
              </div>
            </div>
          </div>

          {/* ── Notification preferences ── */}
          <div id="settings-notifications" className="card p-6 text-left">
            <h3 className="font-serif text-base font-bold mb-1">Notifications</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">Choose what reaches you, and how fast</p>
            <div className="divide-y divide-[var(--border)]">
              {[
                {
                  label: 'Heat index warnings',
                  desc: 'Immediate alert when any site crosses the high-risk threshold',
                  value: notifyHeat,
                  toggle: () => setNotifyHeat(v => !v),
                },
                {
                  label: 'SOS emergencies',
                  desc: 'Push + SMS the moment a worker triggers SOS',
                  value: notifySOS,
                  toggle: () => setNotifySOS(v => !v),
                },
                {
                  label: 'Daily digest',
                  desc: 'A morning summary of compliance and site health',
                  value: notifyDigest,
                  toggle: () => setNotifyDigest(v => !v),
                },
              ].map(({ label, desc, value, toggle }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{label}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={value}
                    aria-label={label}
                    onClick={toggle}
                    className="switch"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Appearance ── */}
          <div id="settings-appearance" className="card p-6 text-left">
            <h3 className="font-serif text-base font-bold mb-1">Appearance</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">How the console looks on this device</p>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
                  Interface Theme
                </p>
                <div className="segment">
                  {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setTheme(id)}
                      className={`segment-item flex items-center gap-1.5 ${theme === id ? 'active' : ''}`}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
                {theme !== 'light' && (
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    Dark mode for the console is coming soon — kiosk displays already run dark.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">Reduce motion</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Minimise animations and transitions</p>
                </div>
                <button
                  role="switch"
                  aria-checked={reduceMotion}
                  aria-label="Reduce motion"
                  onClick={() => setReduceMotion(v => !v)}
                  className="switch"
                />
              </div>
            </div>
          </div>

          {/* ── Language ── */}
          <div id="settings-language" className="card p-6 text-left">
            <h3 className="font-serif text-base font-bold mb-1">Language</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">Console and kiosk display language</p>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5 block">
                Display Language
              </label>
              <select
                className="input-field"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map(({ code, label }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                Kiosk safety instructions are shown in the worker's preferred language.
              </p>
            </div>
          </div>

          {/* ── Security ── */}
          <div id="settings-security" className="card p-6 text-left">
            <h3 className="font-serif text-base font-bold mb-1">Security</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">Keep your account protected</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5 block">
                  Current Password
                </label>
                <input type="password" className="input-field" placeholder="••••••••" autoComplete="current-password" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1.5 block">
                  New Password
                </label>
                <input type="password" className="input-field" placeholder="Minimum 8 characters" autoComplete="new-password" />
              </div>
              <div className="pt-1 flex justify-end">
                <button className="btn-secondary px-5 py-2.5">Update Password</button>
              </div>
              <div className="flex items-center justify-between gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">Two-factor authentication</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">OTP via SMS on every sign-in</p>
                </div>
                <button
                  role="switch"
                  aria-checked={twoFA}
                  aria-label="Two-factor authentication"
                  onClick={() => setTwoFA(v => !v)}
                  className="switch"
                />
              </div>
            </div>
          </div>

          {/* ── Danger zone ── */}
          <div
            id="settings-danger"
            className="card p-6 text-left"
            style={{ borderColor: 'rgba(220, 38, 38, 0.25)' }}
          >
            <h3 className="font-serif text-base font-bold mb-1" style={{ color: 'var(--emergency)' }}>
              Danger Zone
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Permanently delete your account and all associated data.
            </p>
            <button className="btn-danger px-4 py-2 text-sm">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
