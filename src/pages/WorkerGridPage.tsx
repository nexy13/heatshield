import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const mockWorkers = [
  { id: '1', name: 'Raju Kumar', role: 'Worker', shift: 'Morning', status: 'active', heatRisk: 'High', hydration: '2.5L' },
  { id: '2', name: 'Suresh Yadav', role: 'Worker', shift: 'Morning', status: 'break', heatRisk: 'Moderate', hydration: '1.8L' },
  { id: '3', name: 'Amit Patel', role: 'Worker', shift: 'Evening', status: 'active', heatRisk: 'Extreme', hydration: '3.1L' },
  { id: '4', name: 'Vikram Sharma', role: 'Worker', shift: 'Morning', status: 'sos', heatRisk: 'Danger', hydration: '0.5L' },
  { id: '5', name: 'Deepak Verma', role: 'Worker', shift: 'Night', status: 'inactive', heatRisk: 'Low', hydration: '0L' },
];

export default function WorkerGridPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockWorkers.filter((w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Worker Management</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Monitor all workers on site</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 w-64"
            />
          </div>
          <button className="btn-secondary p-2.5 rounded-lg"><Filter size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((worker) => (
          <div
            key={worker.id}
            className={`glass rounded-xl p-5 card-hover ${
              worker.status === 'sos' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-lg font-bold">
                  {worker.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{worker.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{worker.shift} Shift</p>
                </div>
              </div>
              <span className={`badge ${
                worker.status === 'active' ? 'badge-success' :
                worker.status === 'break' ? 'badge-info' :
                worker.status === 'sos' ? 'badge-danger' : 'badge-neutral'
              }`}>
                {worker.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[var(--color-bg-secondary)] p-2.5 rounded-lg">
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Heat Risk</p>
                <p className={`font-semibold ${
                  worker.heatRisk === 'Danger' ? 'text-red-500' :
                  worker.heatRisk === 'Extreme' ? 'text-amber-500' : 'text-emerald-400'
                }`}>{worker.heatRisk}</p>
              </div>
              <div className="bg-[var(--color-bg-secondary)] p-2.5 rounded-lg">
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Hydration</p>
                <p className="font-semibold">{worker.hydration}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
