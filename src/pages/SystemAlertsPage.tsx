import { useState } from 'react';
import AlertFeed from '@/components/dashboard/AlertFeed';
import type { Alert } from '@/types/database';

const mockAlerts: Alert[] = [
  {
    id: 'a1', site_id: 's1', shift_id: null, worker_id: null,
    alert_type: 'sos', severity: 'emergency',
    message: '🚨 SOS from Vikram Sharma — Location: Kiln Section B.',
    status: 'active', action_taken: null, resolved_by: null,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), resolved_at: null,
  },
  {
    id: 'a2', site_id: 's1', shift_id: null, worker_id: null,
    alert_type: 'heat_warning', severity: 'critical',
    message: '🔴 Heat index at 52.8°C — DANGER zone. Consider halting operations.',
    status: 'active', action_taken: null, resolved_by: null,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), resolved_at: null,
  },
  {
    id: 'a3', site_id: 's1', shift_id: null, worker_id: null,
    alert_type: 'hydration', severity: 'warning',
    message: '💧 Suresh Yadav has not taken a water break in 45 minutes.',
    status: 'acknowledged', action_taken: null, resolved_by: null,
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), resolved_at: null,
  },
];

export default function SystemAlertsPage() {
  const [filter, setFilter] = useState<'all' | 'active'>('active');

  const displayedAlerts = filter === 'active' 
    ? mockAlerts.filter(a => a.status === 'active')
    : mockAlerts;

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Alerts Manager</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Monitor and respond to system alerts</p>
        </div>
        <div className="flex p-1 bg-[var(--color-bg-secondary)] rounded-lg">
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'active' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
          >
            Active Only
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
          >
            All Alerts
          </button>
        </div>
      </div>

      <AlertFeed 
        alerts={displayedAlerts} 
        maxItems={50} 
        onAcknowledge={(id) => console.log('Acknowledge', id)}
      />
    </div>
  );
}
