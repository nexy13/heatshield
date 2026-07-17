import { useEffect, useState } from 'react';
import { MapPin, Users, AlertTriangle, Siren, Activity, Trash2, UserPlus, RefreshCw, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  name: string;
  role: 'worker' | 'admin';
  site_id: string | null;
  age: number | null;
  phone: string | null;
  health_flags: string[] | null;
  created_at: string;
}

interface Reading {
  id: string;
  worker_id: string;
  timestamp: string;
  temp: number;
  humidity: number;
  wbgt: number;
  risk_level: 'safe' | 'caution' | 'danger';
}

interface Alert {
  id: string;
  worker_id: string;
  reading_id: string | null;
  alert_type: 'danger' | 'sos';
  status: 'open' | 'resolved';
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  worker?: { name: string; site_id: string | null } | null;
  resolver?: { name: string } | null;
}

export default function AdminDashboard() {
  const { profile } = useAuth();

  const [siteName, setSiteName] = useState<string>('Unassigned Site');
  const [workers, setWorkers] = useState<Profile[]>([]);
  const [unassignedWorkers, setUnassignedWorkers] = useState<Profile[]>([]);
  const [latestReadings, setLatestReadings] = useState<Record<string, Reading>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected worker details modal state
  const [selectedWorker, setSelectedWorker] = useState<Profile | null>(null);
  const [workerReadings, setWorkerReadings] = useState<Reading[]>([]);
  const [workerAlerts, setWorkerAlerts] = useState<Alert[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Roster add state
  const [workerToAssign, setWorkerToAssign] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchData = async () => {
    if (!profile?.site_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch site name
      const { data: site, error: sErr } = await supabase
        .from('sites')
        .select('name')
        .eq('id', profile.site_id)
        .single();
      if (!sErr && site) {
        setSiteName(site.name);
      }

      // 2. Fetch site workers
      const { data: siteWorkers, error: wErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker')
        .eq('site_id', profile.site_id)
        .order('name', { ascending: true });
      if (wErr) throw wErr;
      const workerList = siteWorkers || [];
      setWorkers(workerList);

      // 3. Fetch unassigned workers
      const { data: unassigned, error: uErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker')
        .is('site_id', null)
        .order('name', { ascending: true });
      if (uErr) throw uErr;
      setUnassignedWorkers(unassigned || []);

      // 4. Fetch latest readings for these workers
      if (workerList.length > 0) {
        const workerIds = workerList.map((w) => w.id);
        const { data: readings, error: rErr } = await supabase
          .from('readings')
          .select('*')
          .in('worker_id', workerIds)
          .order('timestamp', { ascending: false });

        if (rErr) throw rErr;

        // Group by worker and take the latest reading
        const readingMap: Record<string, Reading> = {};
        (readings || []).forEach((r) => {
          if (!readingMap[r.worker_id]) {
            readingMap[r.worker_id] = r;
          }
        });
        setLatestReadings(readingMap);
      } else {
        setLatestReadings({});
      }

      // 5. Fetch alerts for this site's workers
      const { data: siteAlerts, error: alErr } = await supabase
        .from('alerts')
        .select('*, worker:profiles!worker_id(name, site_id), resolver:profiles!resolved_by(name)')
        .order('created_at', { ascending: false });

      if (alErr) throw alErr;

      // Filter alerts where worker belongs to this site
      const filteredAlerts = (siteAlerts || []).filter(
        (a) => a.worker && a.worker.site_id === profile.site_id
      ) as unknown as Alert[];
      setAlerts(filteredAlerts);

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch site safety logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.site_id]);

  // Realtime alerts subscription
  useEffect(() => {
    if (!profile?.site_id) return;

    const alertsChannel = supabase
      .channel('public:alerts:admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        async () => {
          // Re-fetch all alerts on insert/update to easily resolve foreign key joins
          const { data: siteAlerts, error: alErr } = await supabase
            .from('alerts')
            .select('*, worker:profiles!worker_id(name, site_id), resolver:profiles!resolved_by(name)')
            .order('created_at', { ascending: false });

          if (!alErr && siteAlerts) {
            const filteredAlerts = (siteAlerts || []).filter(
              (a) => a.worker && a.worker.site_id === profile.site_id
            ) as unknown as Alert[];
            setAlerts(filteredAlerts);
          }
        }
      )
      .subscribe();

    // Listen to readings to update status colors live
    const readingsChannel = supabase
      .channel('public:readings:admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'readings' },
        (payload) => {
          const newReading = payload.new as Reading;
          // Check if this reading is for a worker at our site
          setWorkers((prev) => {
            const isOurWorker = prev.some((w) => w.id === newReading.worker_id);
            if (isOurWorker) {
              setLatestReadings((prevReadings) => ({
                ...prevReadings,
                [newReading.worker_id]: newReading,
              }));
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(readingsChannel);
    };
  }, [profile?.site_id]);

  // Fetch specific worker history details for modal
  const viewWorkerDetails = async (worker: Profile) => {
    setSelectedWorker(worker);
    setLoadingDetails(true);
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - 7);

      // Fetch readings history
      const { data: rdData } = await supabase
        .from('readings')
        .select('*')
        .eq('worker_id', worker.id)
        .gte('timestamp', dateLimit.toISOString())
        .order('timestamp', { ascending: false });

      // Fetch alerts history
      const { data: alData } = await supabase
        .from('alerts')
        .select('*, resolver:profiles!resolved_by(name)')
        .eq('worker_id', worker.id)
        .gte('created_at', dateLimit.toISOString())
        .order('created_at', { ascending: false });

      setWorkerReadings(rdData || []);
      setWorkerAlerts((alData || []) as unknown as Alert[]);
    } catch (err) {
      console.error('Error fetching worker logs:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Mark Alert as Resolved
  const handleResolveAlert = async (alertId: string) => {
    if (!profile?.id) return;
    try {
      const { error: err } = await supabase
        .from('alerts')
        .update({
          status: 'resolved',
          resolved_by: profile.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (err) throw err;
      fetchData(); // Sync logs
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  // Add Worker to Roster
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerToAssign || !profile?.site_id) return;
    setAssignLoading(true);
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ site_id: profile.site_id })
        .eq('id', workerToAssign);

      if (err) throw err;
      setWorkerToAssign('');
      fetchData(); // Sync lists
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add worker to roster');
    } finally {
      setAssignLoading(false);
    }
  };

  // Remove Worker from Roster
  const handleRemoveWorker = async (workerId: string) => {
    if (!window.confirm('Are you sure you want to remove this worker from your site?')) return;
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ site_id: null })
        .eq('id', workerId);

      if (err) throw err;
      fetchData(); // Sync lists
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove worker');
    }
  };

  if (!profile?.site_id) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>No Site Assigned</h3>
        <p style={{ color: 'var(--text-muted)' }}>You must be assigned to a Kiln Site by a system administrator to view logs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <RefreshCw className="animate-spin text-[var(--accent-teal)]" size={32} />
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-muted)' }}>Loading site safety feeds...</p>
      </div>
    );
  }

  const activeAlertsCount = alerts.filter((a) => a.status === 'open').length;
  const sosAlertsCount = alerts.filter((a) => a.status === 'open' && a.alert_type === 'sos').length;

  return (
    <div className="space-y-6 animate-fade-up" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Site Console 🛡️
          </h2>
          <p className="text-[var(--color-text-muted)] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
            <MapPin size={14} className="text-[var(--accent-teal)]" />
            Monitoring: <strong>{siteName}</strong>
          </p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '4px' }}
        >
          <RefreshCw size={12} /> Sync Console
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.8rem 1rem',
          borderRadius: '4px',
          background: 'rgba(185, 28, 28, 0.06)',
          border: '1px solid rgba(185, 28, 28, 0.15)',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.85rem',
          color: '#B91C1C',
        }}>
          {error}
        </div>
      )}

      {/* System Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
      }}>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.7)' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Active Roster</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} className="text-blue-500" />
            {workers.length} Workers
          </p>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.7)' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Active Alerts</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} className="text-amber-500" />
            {activeAlertsCount} Open
          </p>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.7)' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Active SOS Incidents</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Siren size={20} className="text-red-500" />
            {sosAlertsCount} Triggered
          </p>
        </div>
      </div>

      {/* Main Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker roster grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.7)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} className="text-indigo-400" /> Worker Roster & Safety Status
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {workers.length === 0 ? (
                <p style={{ gridColumn: 'span 2', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No workers assigned to this site yet. Use the roster manager below to assign workers.
                </p>
              ) : (
                workers.map((w) => {
                  const wr = latestReadings[w.id];
                  const riskLevel = wr?.risk_level || 'safe';
                  const riskColor = riskLevel === 'danger' ? '#B91C1C' : riskLevel === 'caution' ? '#D97706' : '#2D7A65';
                  return (
                    <div
                      key={w.id}
                      onClick={() => viewWorkerDetails(w)}
                      className="glass card-hover"
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: '#fff',
                        borderLeft: `4px solid ${riskColor}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{w.name}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWorker(w.id);
                          }}
                          style={{ border: 'none', background: 'none', color: '#B91C1C', cursor: 'pointer', padding: '0.1rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Age: {w.age || '--'} | Tel: {w.phone || '--'}</p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '999px',
                          background: riskLevel === 'danger' ? 'rgba(185,28,28,0.08)' : riskLevel === 'caution' ? 'rgba(217,119,6,0.08)' : 'rgba(45,122,101,0.08)',
                          color: riskColor,
                        }}>
                          {riskLevel.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                          {wr ? new Date(wr.timestamp).toLocaleTimeString() : 'No readings'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Roster Assignment manager */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.7)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} className="text-emerald-500" /> Roster Management
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Assign unallocated field workers to {siteName} safety roster.
            </p>

            <form onSubmit={handleAddWorker} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                value={workerToAssign}
                onChange={(e) => setWorkerToAssign(e.target.value)}
                required
                className="input-field"
                style={{ borderRadius: '4px', background: '#fff', fontSize: '0.8rem', height: '36px', flex: 1 }}
              >
                <option value="">Choose unassigned worker...</option>
                {unassignedWorkers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} (Age: {u.age || '--'})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={assignLoading || !workerToAssign}
                className="btn-primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.8rem',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  height: '36px',
                }}
              >
                {assignLoading ? <RefreshCw className="animate-spin" size={12} /> : 'Assign to Site'}
              </button>
            </form>
          </div>
        </div>

        {/* Live Alerts feed */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.7)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} className="text-red-500" /> Active Alert Monitor
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '480px', overflowY: 'auto' }}>
            {alerts.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No alerts triggered for this site</p>
            ) : (
              alerts.map((a) => {
                const isOpen = a.status === 'open';
                return (
                  <div
                    key={a.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      background: isOpen ? (a.alert_type === 'sos' ? 'rgba(185, 28, 28, 0.05)' : 'rgba(217, 119, 6, 0.05)') : 'rgba(0,0,0,0.02)',
                      borderLeft: `4px solid ${a.alert_type === 'sos' ? '#B91C1C' : '#D97706'}`,
                      border: '1px solid var(--border)',
                      borderLeftWidth: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: a.alert_type === 'sos' ? '#B91C1C' : '#D97706',
                      }}>
                        {a.alert_type === 'sos' ? 'EMERGENCY SOS' : 'HEAT CRITICAL'}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                        {new Date(a.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: isOpen ? 500 : 400 }}>
                      {a.alert_type === 'sos'
                        ? `🚨 SOS Incident: Worker ${a.worker?.name || 'Unknown'} triggered location alarm!`
                        : `🔴 High Heat Warning: Worker ${a.worker?.name || 'Unknown'} is exposed to high WBGT levels.`}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <div>
                        <span style={{ color: isOpen ? '#B91C1C' : '#16A34A', fontWeight: 600 }}>
                          {a.status.toUpperCase()}
                        </span>
                        {!isOpen && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                            by {a.resolver?.name || 'Admin'}
                          </span>
                        )}
                      </div>

                      {isOpen && (
                        <button
                          onClick={() => handleResolveAlert(a.id)}
                          style={{
                            background: 'var(--accent-teal-light)',
                            border: '1px solid rgba(45, 122, 101, 0.2)',
                            color: 'var(--accent)',
                            padding: '0.2rem 0.6rem',
                            fontSize: '0.65rem',
                            borderRadius: '4px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Selected Worker Details Modal */}
      {selectedWorker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div className="glass animate-fade-up" style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
          }}>
            <button
              onClick={() => setSelectedWorker(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--text)' }}>
                {selectedWorker.name} — Logs History
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Worker telemetry and active alerts log (last 7 days)</p>
            </div>

            {loadingDetails ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <RefreshCw className="animate-spin text-[var(--accent-teal)]" size={24} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Readings */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Activity size={14} className="text-teal-500" /> Sensor Readings
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(0,0,0,0.01)' }}>
                    {workerReadings.length === 0 ? (
                      <p style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No readings recorded</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                        <tbody>
                          {workerReadings.map((r) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '0.4rem' }}>{new Date(r.timestamp).toLocaleTimeString()}</td>
                              <td style={{ padding: '0.4rem' }}>{r.temp.toFixed(1)}°C</td>
                              <td style={{ padding: '0.4rem' }}>{r.wbgt.toFixed(1)}°C</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Alerts */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={14} className="text-red-500" /> Alert Incidents
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column' }}>
                    {workerAlerts.length === 0 ? (
                      <p style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No alert events</p>
                    ) : (
                      workerAlerts.map((a) => (
                        <div key={a.id} style={{ padding: '0.4rem', borderBottom: '1px solid var(--border)', fontSize: '0.72rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: a.alert_type === 'sos' ? '#B91C1C' : '#D97706' }}>{a.alert_type.toUpperCase()}</strong>
                            <span>{new Date(a.created_at).toLocaleDateString()}</span>
                          </div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Status: {a.status}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedWorker(null)}
                className="btn-primary"
                style={{ padding: '0.5rem 1.5rem', borderRadius: '4px', fontSize: '0.8rem' }}
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
