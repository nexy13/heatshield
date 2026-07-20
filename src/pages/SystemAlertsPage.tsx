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

  const activeCount = alerts.filter((a) => a.status === 'active').length;

  if (loading && alerts.length === 0) {
    return <Spinner label="Loading alerts..." />;
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="text-left">
          <p className="eyebrow mb-1.5 flex items-center gap-2">
            {activeCount > 0 && <span className="pulse-dot" style={{ background: 'var(--emergency)' }} />}
            Incident Response
          </p>
          <h2 className="page-title">Alerts Manager</h2>
          <p className="page-subtitle">
            {role === 'admin' ? 'System-wide alerts across all sites' : 'Alerts for your site'}
            {activeCount > 0 && (
              <span className="ml-2 badge badge-danger">{activeCount} active</span>
            )}
          </p>
        </div>
        <div className="segment">
          <button
            onClick={() => setFilter('active')}
            className={`segment-item ${filter === 'active' ? 'active' : ''}`}
          >
            Active Only
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`segment-item ${filter === 'all' ? 'active' : ''}`}
          >
            All Alerts
          </button>
        </div>
      </div>

      {error ? (
        <Card className="p-8 text-center max-w-lg mx-auto" hoverable={false} style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'var(--emergency-bg)' }}>
          <p className="font-semibold" style={{ color: 'var(--emergency)' }}>{error}</p>
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
