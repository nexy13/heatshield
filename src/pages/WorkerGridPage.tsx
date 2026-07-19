import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Phone, Droplet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlerts } from '@/context/AlertContext';
import { getAllWorkers, getSiteWorkers, type WorkerWithSiteName } from '@/lib/api/workers';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Worker Roster ({workers.length})</h2>
          <p className="text-[var(--color-text-muted)] text-sm">
            {role === 'admin' ? 'All workers across every mill' : 'Workers registered at your mill'}
            {' — add or edit records from the '}
            <Link to="/supervisor" className="underline hover:text-[var(--color-text)]">Supervisor Dashboard</Link>
          </p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] z-10" />
          <Input
            type="text"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      {error && (
        <Card className="p-8 text-center max-w-lg mx-auto border-red-500/20 bg-red-500/5">
          <p className="text-red-500 font-semibold">{error}</p>
        </Card>
      )}

      {!error && filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-[var(--color-border)] rounded-xl" hoverable={false}>
          <Users className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)] text-sm">No workers found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((worker) => (
            <Card key={worker.id} className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-lg font-bold">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-left">{worker.name}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                      <Phone size={11} /> {worker.phone || 'No phone'}
                    </p>
                  </div>
                </div>
                <span className={`badge ${
                  worker.status === 'active' ? 'badge-success' :
                  worker.status === 'on_leave' ? 'badge-info' : 'badge-neutral'
                }`}>
                  {worker.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[var(--color-bg-secondary)] p-2.5 rounded-lg text-left">
                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5 flex items-center gap-1">
                    <Droplet size={11} /> Blood Group
                  </p>
                  <p className="font-semibold">{worker.blood_group || 'N/A'}</p>
                </div>
                <div className="bg-[var(--color-bg-secondary)] p-2.5 rounded-lg text-left">
                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5">
                    {role === 'admin' ? 'Mill' : 'Emergency Contact'}
                  </p>
                  <p className="font-semibold text-xs leading-relaxed">
                    {role === 'admin'
                      ? worker.site?.name ?? 'Unassigned'
                      : worker.emergency_contact_phone || 'N/A'}
                  </p>
                </div>
              </div>

              {(worker.medical_conditions ?? []).length > 0 && (
                <p className="mt-3 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 text-left">
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
