import { useState, useEffect } from 'react';
import { useAlerts } from '@/context/AlertContext';
import AlertFeed from '@/components/dashboard/AlertFeed';
import { useAuth } from '@/context/AuthContext';
import { getAllAlerts, getSiteAlerts, acknowledgeAlert } from '@/lib/api/alerts';
import type { AlertWithDetails } from '@/types/database';
import { Card } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

export default function SystemAlertsPage() {
  const { profile, role } = useAuth();
  const { addToast } = useAlerts();
  const [alerts, setAlerts] = useState<AlertWithDetails[]>([]);
  const [filter, setFilter] = useState<'all' | 'active'>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      if (role === 'admin') {
        setAlerts(await getAllAlerts(100));
      } else if (profile?.site_id) {
        setAlerts(await getSiteAlerts(profile.site_id));
      } else {
        setAlerts([]);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      const msg = 'Failed to load alerts';
      setError(msg);
      addToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, profile?.site_id]);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      loadAlerts();
      addToast({ title: 'Success', message: 'Alert acknowledged', type: 'success' });
    } catch (err) {
      console.error(err);
      addToast({ title: 'Error', message: 'Failed to acknowledge alert', type: 'error' });
    }
  };

  const displayedAlerts = filter === 'active'
    ? alerts.filter((a) => a.status === 'active')
    : alerts;

  if (loading && alerts.length === 0) {
    return <Spinner label="Loading alerts..." />;
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-left">Alerts Manager</h2>
          <p className="text-[var(--color-text-muted)] text-sm text-left">
            {role === 'admin' ? 'System-wide alerts across all mills' : 'Alerts for your mill'}
          </p>
        </div>
        <div className="flex p-1 bg-[var(--color-bg-secondary)] rounded-lg">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              filter === 'active'
                ? 'bg-[var(--bg-white)] text-[var(--text)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[var(--bg-white)] text-[var(--text)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--text)]'
            }`}
          >
            All Alerts
          </button>
        </div>
      </div>

      {error ? (
        <Card className="p-8 text-center max-w-lg mx-auto border-red-500/20 bg-red-500/5">
          <p className="text-red-500 font-semibold">{error}</p>
        </Card>
      ) : (
        <AlertFeed
          alerts={displayedAlerts}
          maxItems={50}
          onAcknowledge={handleAcknowledge}
        />
      )}
    </div>
  );
}
