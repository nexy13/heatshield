import { useState } from 'react';
import { MapPin, Search, Plus, Edit2, Trash2 } from 'lucide-react';

const mockSites = [
  { id: '1', name: 'Rajput Brick Works', region: 'Uttar Pradesh', status: 'active', workers: 24, lastAudit: '2026-07-15' },
  { id: '2', name: 'Sharma Kilns Pvt Ltd', region: 'Haryana', status: 'active', workers: 18, lastAudit: '2026-07-14' },
  { id: '3', name: 'Bihar Brick Industries', region: 'Bihar', status: 'active', workers: 32, lastAudit: '2026-07-15' },
  { id: '4', name: 'Eastern Kilns Co.', region: 'West Bengal', status: 'inactive', workers: 0, lastAudit: '2026-06-30' },
];

export default function KilnSiteManagerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockSites.filter(site => site.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Kiln Site Manager</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Manage all brick kiln locations and active statuses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 w-64"
            />
          </div>
          <button className="btn-primary py-2.5 px-4 rounded-xl flex items-center gap-2 font-medium">
            <Plus size={16} /> Add Site
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Site Name</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Region</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Workers</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Status</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)]">Last Audit</th>
              <th className="p-4 text-sm font-semibold text-[var(--color-text-muted)] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filtered.map((site) => (
              <tr key={site.id} className="hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center">
                      <MapPin size={18} className="text-indigo-400" />
                    </div>
                    <span className="font-semibold">{site.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-[var(--color-text-muted)]">{site.region}</td>
                <td className="p-4 font-medium">{site.workers}</td>
                <td className="p-4">
                  <span className={`badge ${site.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                    {site.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-sm">{site.lastAudit}</td>
                <td className="p-4 text-right">
                  <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors inline-block mr-1">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-block">
                    <Trash2 size={16} />
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
