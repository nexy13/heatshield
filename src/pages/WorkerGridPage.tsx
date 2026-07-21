import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Phone, Droplet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlerts } from '@/context/AlertContext';
import { getAllWorkers, getSiteWorkers, type WorkerWithSiteName } from '@/lib/api/workers';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

const STATUS_BADGE: Record<string, BadgeVariant> = {
  active: 'success',
  on_leave: 'info',
};

export default function WorkerGridPage() {
  const { profile, role } = useAuth();
  const { addToast } = useAlerts();
  const [workers, setWorkers] = useState<WorkerWithSiteName[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (role === 'admin') {
          setWorkers(await getAllWorkers());
        } else if (profile?.site_id) {
          const siteWorkers = await getSiteWorkers(profile.site_id);
          setWorkers(siteWorkers.map((w) => ({ ...w, site: null })));
        } else {
          setWorkers([]);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        const errMsg = 'Failed to load workers';
        setError(errMsg);
        addToast({ title: 'Error', message: errMsg, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role, profile?.site_id, addToast]);

  const filtered = workers.filter((w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return <Spinner label="Loading workers..." />;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="text-left">
          <p className="eyebrow mb-1.5">Workforce</p>
          <h2 className="page-title flex items-center gap-2.5">
            Worker Roster <Badge variant="info">{workers.length}</Badge>
          </h2>
          <p className="page-subtitle">
            {role === 'admin' ? 'All workers across every site' : 'Workers registered at your site'}
            {' — add or edit records from the '}
            <Link to="/supervisor" className="underline font-medium" style={{ color: 'var(--info)' }}>Supervisor Dashboard</Link>
          </p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-light)] z-10" />
          <Input
            type="text"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {error && (
        <Card className="p-8 text-center max-w-lg mx-auto" hoverable={false} style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'var(--emergency-bg)' }}>
          <p className="font-semibold" style={{ color: 'var(--emergency)' }}>{error}</p>
        </Card>
      )}

      {!error && filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={24} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">No workers found</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Try a different search, or add workers from the dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((worker, i) => (
            <Card
              key={worker.id}
              className="p-5 animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--navy-600), var(--navy-800))' }}
                  >
                    {worker.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-[var(--text)]">{worker.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                      <Phone size={11} /> {worker.phone || 'No phone'}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_BADGE[worker.status] ?? 'neutral'}>
                  {worker.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2.5 rounded-xl text-left" style={{ background: 'var(--bg-muted)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 flex items-center gap-1">
                    <Droplet size={10} style={{ color: 'var(--emergency)' }} /> Blood Group
                  </p>
                  <p className="font-bold text-[var(--text)]">{worker.blood_group || 'N/A'}</p>
                </div>
                <div className="p-2.5 rounded-xl text-left" style={{ background: 'var(--bg-muted)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                    {role === 'admin' ? 'Site' : 'Emergency Contact'}
                  </p>
                  <p className="font-semibold text-xs leading-relaxed text-[var(--text)]">
                    {role === 'admin'
                      ? worker.site?.name ?? 'Unassigned'
                      : worker.emergency_contact_phone || 'N/A'}
                  </p>
                </div>
              </div>

              {(worker.medical_conditions ?? []).length > 0 && (
                <p
                  className="mt-3 text-xs rounded-xl px-3 py-2 text-left font-medium"
                  style={{ color: 'var(--caution)', background: 'var(--caution-bg)', border: '1px solid rgba(202,138,4,0.2)' }}
                >
                  {(worker.medical_conditions ?? []).join(', ')}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
