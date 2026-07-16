import { useState } from 'react';
import { Search, Plus, Filter, Edit2, ShieldAlert } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/utils/constants';

const mockUsers = [
  { id: '1', name: 'Alok Singh', email: 'alok.singh@heatshield.test', role: 'admin', site: 'HQ' },
  { id: '2', name: 'Ramesh Patel', email: 'ramesh.p@heatshield.test', role: 'supervisor', site: 'Rajput Brick Works' },
  { id: '3', name: 'Sanjay Kumar', email: 'sanjay.k@heatshield.test', role: 'supervisor', site: 'Sharma Kilns' },
  { id: '4', name: 'NGO Auditor 1', email: 'auditor1@ngo.org', role: 'ngo', site: 'All Sites' },
];

export default function UserManagerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">User Management</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Manage system administrators, supervisors, and NGO auditors</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 w-64"
            />
          </div>
          <button className="btn-secondary p-2.5 rounded-lg"><Filter size={18} /></button>
          <button className="btn-primary py-2.5 px-4 rounded-xl flex items-center gap-2 font-medium">
            <Plus size={16} /> Invite User
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">User</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Role</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Assigned Site</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center font-bold text-orange-400">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`badge ${
                    user.role === 'admin' ? 'badge-danger' : 
                    user.role === 'supervisor' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-[var(--color-text-muted)]">{user.site}</td>
                <td className="p-4 text-right">
                  <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors inline-block mr-1">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-[var(--color-text-muted)] hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors inline-block">
                    <ShieldAlert size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
