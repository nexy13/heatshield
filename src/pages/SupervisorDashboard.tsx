import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Trash2,
  Edit2,
  Plus,
  Upload,
  Droplets,
  Settings,
  MonitorPlay,
  Thermometer,
  Waves,
  Phone,
  Siren,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSiteById, updateSite, getAllSites } from '@/lib/api/sites';
import { getLatestWeather } from '@/lib/api/weather';
import { getSiteAlerts, resolveAlert } from '@/lib/api/alerts';
import { getActiveSOS, resolveSOS } from '@/lib/api/sos';
import { getSiteWorkers, deleteWorker } from '@/lib/api/workers';
import type { KilnSite, WeatherReading, AlertWithDetails, SOSEventWithDetails, Worker } from '@/types/database';
import { RISK_LEVELS } from '@/lib/utils/constants';
import WorkerIntakeForm from '@/components/worker/WorkerIntakeForm';
import Spinner from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

export default function SupervisorDashboard() {
  const { profile } = useAuth();
  const siteId = profile?.site_id;

  const [site, setSite] = useState<KilnSite | null>(null);
  const [weather, setWeather] = useState<WeatherReading | null>(null);
  const [alerts, setAlerts] = useState<AlertWithDetails[]>([]);
  const [sosEvents, setSosEvents] = useState<SOSEventWithDetails[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sites, setSites] = useState<KilnSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydration interval editing
  const [hydrationInterval, setHydrationInterval] = useState<number>(30);
  const [updatingInterval, setUpdatingInterval] = useState(false);

  // Roster manual add/edit state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [intakeTab, setIntakeTab] = useState<'manual' | 'bulk'>('manual');

  const loadDashboardData = async () => {
    if (!siteId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [siteData, weatherData, activeAlerts, activeSOS, workersList, sitesList] = await Promise.all([
        getSiteById(siteId),
        getLatestWeather(siteId),
        getSiteAlerts(siteId, 'active'),
        getActiveSOS(siteId),
        getSiteWorkers(siteId),
        getAllSites()
      ]);

      if (siteData) {
        setSite(siteData);
        setHydrationInterval(siteData.hydration_interval_min);
      }
      setWeather(weatherData);
      setAlerts(activeAlerts);
      setSosEvents(activeSOS);
      setWorkers(workersList);
      setSites(sitesList);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [siteId]);

  // Update hydration interval
  const handleUpdateInterval = async () => {
    if (!siteId || !site) return;
    try {
      setUpdatingInterval(true);
      await updateSite(siteId, { hydration_interval_min: hydrationInterval });
      setSite(prev => prev ? { ...prev, hydration_interval_min: hydrationInterval } : null);
      alert('Hydration interval updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update hydration interval.');
    } finally {
      setUpdatingInterval(false);
    }
  };

  // Open worker create/edit form
  const handleOpenForm = (worker: Worker | null = null, tab: 'manual' | 'bulk' = 'manual') => {
    setEditingWorker(worker);
    setIntakeTab(tab);
    setShowFormModal(true);
  };

  // Delete worker
  const handleDeleteWorker = async (id: string) => {
    if (!confirm('Are you sure you want to remove this worker from the roster?')) return;
    try {
      await deleteWorker(id);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete worker.');
    }
  };

  // Resolve Alert / SOS
  const handleResolveAlert = async (id: string) => {
    try {
      await resolveAlert(id, profile?.id || '');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveSOS = async (id: string) => {
    try {
      await resolveSOS(id);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Spinner label="Loading supervisor overview..." />;
  }

  if (!siteId || error) {
    return (
      <div className="card p-10 text-center max-w-lg mx-auto mt-10 animate-fade-up">
        <div className="empty-state-icon mx-auto" style={{ background: 'var(--caution-bg)', color: 'var(--caution)' }}>
          <AlertTriangle size={26} />
        </div>
        <h3 className="font-serif text-xl font-bold mb-2 mt-2">Unassigned Supervisor</h3>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Your account is currently not assigned to any kiln site. Please contact the platform administrator to set up your kiln assignment.
        </p>
      </div>
    );
  }

  const currentRisk = weather?.risk_level || 'low';
  const riskDetails = RISK_LEVELS[currentRisk] || RISK_LEVELS.low;
  const riskAccent =
    currentRisk === 'danger' || currentRisk === 'extreme' ? 'var(--emergency)' :
    currentRisk === 'high' ? 'var(--high)' :
    currentRisk === 'moderate' ? 'var(--caution)' : 'var(--safe)';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── HERO HEADER (control-room) ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{ background: 'linear-gradient(135deg, var(--navy-900), var(--navy-850))', boxShadow: 'var(--shadow-lg)' }}
      >
        <div aria-hidden="true" className="absolute rounded-full" style={{ width: 360, height: 360, top: '-40%', right: '-8%', background: 'radial-gradient(circle, rgba(37,99,235,0.28), transparent 68%)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-left">
            <p className="mb-2 flex items-center gap-2 font-semibold uppercase" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.14em', color: '#93C5FD' }}>
              <span className="pulse-dot" style={{ background: riskAccent, width: 7, height: 7 }} />
              Live · Supervisor Portal
            </p>
            <h2 className="font-serif font-bold text-white leading-tight" style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', letterSpacing: '-0.02em' }}>
              {site?.name}
            </h2>
            <p className="mt-1.5" style={{ fontSize: 'var(--text-sm)', color: 'rgba(226,232,240,0.72)' }}>
              Real-time safety control for your site.
            </p>
          </div>

          <Link
            to={`/kiosk/${siteId}`}
            target="_blank"
            className="btn-primary px-4 py-2.5 text-sm shrink-0"
          >
            <MonitorPlay size={16} /> Open Kiosk Display
          </Link>
        </div>
      </div>

      {/* ── ALERTS & SOS NOTIFICATION ── */}
      {(sosEvents.length > 0 || alerts.length > 0) && (
        <div className="space-y-3">
          {sosEvents.map(sos => (
            <div
              key={sos.id}
              className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 badge-live"
              style={{ borderColor: 'rgba(220, 38, 38, 0.35)', background: 'var(--emergency-bg)' }}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className="icon-chip"
                  style={{ background: 'rgba(220, 38, 38, 0.15)', color: 'var(--emergency)' }}
                >
                  <Siren size={18} />
                </span>
                <div className="text-left">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--emergency)' }}>
                    Emergency SOS Active
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                    Site: <strong>{site?.name}</strong> — Worker: <strong>{sos.worker?.name || 'Unidentified Worker'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleResolveSOS(sos.id)}
                className="btn-danger px-4 py-2 text-xs shrink-0"
              >
                Mark Resolved
              </button>
            </div>
          ))}

          {alerts.map(alert => (
            <div
              key={alert.id}
              className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ borderColor: 'rgba(202, 138, 4, 0.3)', background: 'var(--caution-bg)' }}
            >
              <div className="flex items-center gap-3.5">
                <span className="icon-chip" style={{ background: 'rgba(202, 138, 4, 0.15)', color: 'var(--caution)' }}>
                  <AlertTriangle size={18} />
                </span>
                <div className="text-left">
                  <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--caution)' }}>
                    Heat Index Warning
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{alert.message}</p>
                </div>
              </div>
              <button
                onClick={() => handleResolveAlert(alert.id)}
                className="btn-secondary px-4 py-2 text-xs shrink-0"
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── WEATHER & HYDRATION CONFIG ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* LIVE WEATHER STATUS */}
        <div
          className="card card-hover p-6 relative overflow-hidden"
          style={{ borderColor: `color-mix(in srgb, ${riskAccent} 28%, var(--border))` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: `linear-gradient(90deg, ${riskAccent}, transparent)` }}
          />
          <div className="flex justify-between items-center mb-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Live weather status
            </span>
            <span className={`badge uppercase ${riskDetails.bg} ${riskDetails.text}`}>{riskDetails.label}</span>
          </div>
          <div className="flex items-baseline gap-2 mb-5">
            <span className="font-serif text-6xl font-bold leading-none" style={{ color: riskAccent, letterSpacing: '-0.04em' }}>
              {weather ? Math.round(weather.heat_index) : '--'}°
            </span>
            <span className="text-sm font-medium text-[var(--text-muted)]">C Heat Index</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl px-3.5 py-3 flex items-center gap-2.5" style={{ background: 'var(--bg-muted)' }}>
              <Thermometer size={16} style={{ color: 'var(--high)' }} />
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Air Temp</p>
                <p className="font-mono font-bold text-[var(--text)]">{weather ? Math.round(weather.temperature_c) : '--'}°C</p>
              </div>
            </div>
            <div className="rounded-xl px-3.5 py-3 flex items-center gap-2.5" style={{ background: 'var(--bg-muted)' }}>
              <Waves size={16} style={{ color: 'var(--info)' }} />
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Humidity</p>
                <p className="font-mono font-bold text-[var(--text)]">{weather ? Math.round(weather.humidity_pct) : '--'}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* HYDRATION INTERVAL EDITOR */}
        <div className="card card-hover p-6 flex flex-col justify-between">
          <div className="text-left">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="icon-chip" style={{ width: 34, height: 34, background: 'var(--info-bg)', color: 'var(--info)' }}>
                <Droplets size={17} />
              </span>
              <h4 className="font-serif font-bold text-[var(--text)]">Hydration Scheduler</h4>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed">
              Set the duration (in minutes) for the automated drinking water breaks displayed on the kiln kiosk.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                min="10"
                max="120"
                value={hydrationInterval}
                onChange={(e) => setHydrationInterval(Number(e.target.value))}
                className="input-field pr-14 w-full text-lg font-mono font-bold"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] font-bold tracking-wider">
                MINS
              </span>
            </div>
            <button
              onClick={handleUpdateInterval}
              disabled={updatingInterval}
              className="btn-primary py-3 px-5 text-sm"
            >
              <Settings size={15} /> Save
            </button>
          </div>
        </div>

      </div>

      {/* ── WORKERS ROSTER SECTION ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h3 className="font-serif text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Users size={18} style={{ color: 'var(--info)' }} /> Workers Roster
              <Badge variant="info">{workers.length}</Badge>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage details of workers assigned to this site</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleOpenForm(null, 'bulk')}
              className="btn-secondary py-2.5 px-4 text-sm"
            >
              <Upload size={15} /> Bulk Import
            </button>
            <button
              onClick={() => handleOpenForm(null)}
              className="btn-primary py-2.5 px-4 text-sm"
            >
              <Plus size={15} /> Add Worker
            </button>
          </div>
        </div>

        {/* Worker roster grid */}
        {workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map((worker, i) => (
              <div
                key={worker.id}
                className="card card-hover p-5 relative flex flex-col justify-between animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--navy-600), var(--navy-800))' }}
                      >
                        {worker.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-[var(--text)] leading-snug">{worker.name}</h4>
                        <p className="text-[var(--text-muted)] text-xs flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {worker.phone || 'No phone number'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-3 text-left">
                    <p>Address: <strong className="text-[var(--text-secondary)] font-medium">{worker.address || 'N/A'}</strong></p>
                    <p>Family Members: <strong className="text-[var(--text-secondary)] font-medium">{worker.total_family_members}</strong></p>
                    <p>Blood Group: <strong className="text-[var(--text-secondary)] font-medium">{worker.blood_group || 'N/A'}</strong></p>
                    <p>Emergency Contact: <strong className="text-[var(--text-secondary)] font-medium">{worker.emergency_contact_name || 'N/A'} ({worker.emergency_contact_phone || 'N/A'})</strong></p>
                    <p>Medical Conditions: <strong className="text-[var(--text-secondary)] font-medium">{(worker.medical_conditions || []).join(', ') || 'None'}</strong></p>
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 border-t border-[var(--border)] mt-4 pt-3">
                  <button
                    onClick={() => handleOpenForm(worker)}
                    className="btn-icon"
                    aria-label={`Edit ${worker.name}`}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteWorker(worker.id)}
                    className="btn-icon btn-icon-danger"
                    aria-label={`Remove ${worker.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={24} />
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">No workers yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">Register your first worker to start monitoring safety.</p>
            <button onClick={() => handleOpenForm(null)} className="btn-primary py-2 px-4 text-xs">
              <Plus size={14} /> Add Worker
            </button>
          </div>
        )}
      </div>

      {/* ── WORKER INTAKE MODAL ── */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto modal-card">
            <WorkerIntakeForm
              worker={editingWorker}
              supervisorSiteId={siteId}
              sites={sites}
              initialTab={intakeTab}
              onSuccess={() => {
                setShowFormModal(false);
                loadDashboardData();
              }}
              onCancel={() => setShowFormModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
