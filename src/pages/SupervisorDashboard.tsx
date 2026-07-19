import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  Trash2, 
  Edit2, 
  Plus, 
  Upload, 
  Droplets,
  Settings
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
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Activity className="w-12 h-12 text-[var(--color-text-muted)] animate-spin mb-4" />
        <p className="text-[var(--color-text-muted)]">Loading supervisor overview...</p>
      </div>
    );
  }

  if (!siteId || error) {
    return (
      <div className="p-8 glass rounded-2xl text-center max-w-lg mx-auto mt-10">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Unassigned Supervisor</h3>
        <p className="text-[var(--color-text-muted)] mb-6">
          Your account is currently not assigned to any kiln site. Please contact the platform administrator to set up your kiln assignment.
        </p>
      </div>
    );
  }

  const currentRisk = weather?.risk_level || 'low';
  const riskDetails = RISK_LEVELS[currentRisk] || RISK_LEVELS.low;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif mb-1">{site?.name} Overview</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Supervisor Portal — Real-time Safety Control</p>
        </div>
        
        {/* Kiosk link helper */}
        <Link 
          to={`/kiosk/${siteId}`} 
          target="_blank"
          className="btn-secondary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
        >
          Open Kiosk Display 🖥️
        </Link>
      </div>

      {/* ── ALERTS & SOS NOTIFICATION ── */}
      {(sosEvents.length > 0 || alerts.length > 0) && (
        <div className="space-y-3">
          {sosEvents.map(sos => (
            <div key={sos.id} className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <div>
                  <h4 className="font-bold text-red-400">🚨 EMERGENCY SOS ACTIVE</h4>
                  <p className="text-sm text-slate-300">
                    Site: <strong>{site?.name}</strong> — Worker: <strong>{sos.worker?.name || 'Unidentified Worker'}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleResolveSOS(sos.id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg text-sm font-bold"
              >
                Mark Resolved
              </button>
            </div>
          ))}

          {alerts.map(alert => (
            <div key={alert.id} className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-amber-400">⚠️ HEAT INDEX WARNING</h4>
                <p className="text-sm text-slate-350">{alert.message}</p>
              </div>
              <button 
                onClick={() => handleResolveAlert(alert.id)}
                className="bg-amber-600 hover:bg-amber-700 px-4 py-1.5 rounded-lg text-sm font-bold"
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── CONFIGURATION & WEATHER SUMMARY ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* HEAT WEATHER STATUS */}
        <div className={`p-6 rounded-2xl border bg-gradient-to-br ${
          currentRisk === 'danger' ? 'from-red-950/20 to-transparent border-red-500/30' :
          currentRisk === 'extreme' ? 'from-amber-950/20 to-transparent border-amber-500/30' :
          'from-slate-900/30 to-transparent border-[var(--color-border)]'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Live weather status</span>
            <span className={`badge uppercase ${riskDetails.bg} ${riskDetails.text}`}>{riskDetails.label}</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-mono font-extrabold">{weather ? Math.round(weather.heat_index) : '--'}</span>
            <span className="text-xl text-[var(--color-text-muted)]">°C Heat Index</span>
          </div>
          <div className="text-sm text-[var(--color-text-muted)] flex gap-4">
            <span>Air Temp: <strong>{weather ? Math.round(weather.temperature_c) : '--'}°C</strong></span>
            <span>Humidity: <strong>{weather ? Math.round(weather.humidity_pct) : '--'}%</strong></span>
          </div>
        </div>

        {/* HYDRATION INTERVAL EDITOR */}
        <div className="p-6 bg-slate-900/30 border border-[var(--color-border)] rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-400">
              <Droplets className="w-5 h-5" />
              <h4 className="font-bold">Hydration Scheduler</h4>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
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
                className="input-field pr-12 w-full text-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] font-semibold">MINS</span>
            </div>
            <button
              onClick={handleUpdateInterval}
              disabled={updatingInterval}
              className="btn-primary py-3.5 px-6 rounded-xl flex items-center gap-1.5 text-sm font-semibold"
            >
              <Settings className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

      </div>

      {/* ── WORKERS ROSTER SECTION ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" /> Workers Roster ({workers.length})
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Manage details of workers assigned to this site</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenForm(null, 'bulk')}
              className="btn-secondary py-2.5 px-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
            >
              <Upload className="w-4 h-4" /> Bulk Import
            </button>
            <button
              onClick={() => handleOpenForm(null)}
              className="btn-primary py-2.5 px-4 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Worker
            </button>
          </div>
        </div>

        {/* Worker roster grid */}
        {workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map(worker => (
              <div key={worker.id} className="p-5 glass rounded-xl border border-[var(--color-border)] relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 leading-snug">{worker.name}</h4>
                        <p className="text-[var(--color-text-muted)] text-xs">{worker.phone || 'No phone number'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-[var(--color-text-muted)] border-t border-slate-900 pt-3">
                    <p>Address: <strong className="text-slate-350">{worker.address || 'N/A'}</strong></p>
                    <p>Family Members: <strong className="text-slate-350">{worker.total_family_members}</strong></p>
                    <p>Blood Group: <strong className="text-slate-350">{worker.blood_group || 'N/A'}</strong></p>
                    <p>Emergency Contact: <strong className="text-slate-350">{worker.emergency_contact_name || 'N/A'} ({worker.emergency_contact_phone || 'N/A'})</strong></p>
                    <p>Medical Conditions: <strong className="text-slate-350">{(worker.medical_conditions || []).join(', ') || 'None'}</strong></p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-900 mt-4 pt-3">
                  <button 
                    onClick={() => handleOpenForm(worker)}
                    className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteWorker(worker.id)}
                    className="p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-[var(--color-border)] rounded-xl">
            <Users className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
            <p className="text-[var(--color-text-muted)] text-sm">No workers registered on this roster yet.</p>
          </div>
        )}
      </div>

      {/* ── WORKER INTAKE MODAL ── */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
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
