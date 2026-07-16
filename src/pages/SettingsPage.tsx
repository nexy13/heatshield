import { Bell, Shield, Moon, Globe, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-1">Account Settings</h2>
        <p className="text-[var(--color-text-muted)] text-sm">Manage your profile, preferences, and notifications</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-orange-500/10 text-orange-400 font-medium flex items-center gap-3">
            <Shield size={18} /> Profile
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium flex items-center gap-3 transition-colors">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium flex items-center gap-3 transition-colors">
            <Moon size={18} /> Appearance
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium flex items-center gap-3 transition-colors">
            <Globe size={18} /> Language
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium flex items-center gap-3 transition-colors">
            <Key size={18} /> Security
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--color-text-muted)] mb-1 block">Full Name</label>
                <input type="text" className="input-field" defaultValue={profile?.name ?? ''} />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-text-muted)] mb-1 block">Email Address</label>
                <input type="email" className="input-field opacity-60" disabled defaultValue="user@heatshield.test" />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-text-muted)] mb-1 block">Phone Number</label>
                <input type="tel" className="input-field" defaultValue="+91 98765 43210" />
              </div>
              
              <div className="pt-4 flex justify-end">
                <button className="btn-primary px-6 py-2 rounded-xl">Save Changes</button>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6 border border-red-500/20">
            <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Permanently delete your account and all associated data.</p>
            <button className="btn-danger px-4 py-2 rounded-xl text-sm">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
