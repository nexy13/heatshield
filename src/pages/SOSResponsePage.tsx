import { useState, useEffect } from 'react';
import { MapPin, Siren, CheckCircle2, Phone, AlertTriangle, Loader2, Droplet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getActiveSOS,
  getAllActiveSOS,
  getSOSHistory,
  getAllSOSHistory,
  respondToSOS,
  resolveSOS,
} from '@/lib/api/sos';
import type { SOSEventWithDetails } from '@/types/database';

function timeAgo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(iso).toLocaleString();
}

export default function SOSResponsePage() {
  const { profile, role } = useAuth();
  const [active, setActive] = useState<SOSEventWithDetails[]>([]);
  const [history, setHistory] = useState<SOSEventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      if (role === 'admin') {
        const [act, hist] = await Promise.all([getAllActiveSOS(), getAllSOSHistory(30)]);
        setActive(act);
        setHistory(hist.filter((h) => !['triggered', 'responding'].includes(h.status)));
      } else if (profile?.site_id) {
        const [act, hist] = await Promise.all([
          getActiveSOS(profile.site_id),
          getSOSHistory(profile.site_id, 30),
        ]);
        setActive(act);
        setHistory(hist.filter((h) => !['triggered', 'responding'].includes(h.status)));
      } else {
        setActive([]);
        setHistory([]);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load SOS events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadEvents();
    // SOS demands fast awareness — poll every 15s
    const interval = setInterval(loadEvents, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, profile?.site_id]);

  const handleRespond = async (id: string) => {
    try {
      await respondToSOS(id, profile?.id ?? '');
      loadEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to update SOS status.');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveSOS(id);
      loadEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to resolve SOS.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[var(--color-text-muted)] animate-spin mb-4" />
        <p className="text-[var(--color-text-muted)]">Loading SOS events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 glass rounded-2xl text-center max-w-lg mx-auto mt-10">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-[var(--color-text-muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2 text-red-400">
          <Siren size={24} className={active.length > 0 ? 'animate-pulse' : ''} />
          Active SOS Emergencies
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm">Immediate response required</p>
      </div>

      {active.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center flex flex-col items-center justify-center">
          <CheckCircle2 size={48} className="text-emerald-400 mb-4 opacity-50" />
          <p className="text-lg font-semibold">No Active Emergencies</p>
          <p className="text-sm text-[var(--color-text-muted)]">All workers are currently safe.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {active.map((sos) => (
            <div key={sos.id} className="glass rounded-xl p-6 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="badge badge-danger animate-pulse">
                      {sos.status === 'responding' ? 'RESPONDING' : 'URGENT SOS'}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">{timeAgo(sos.triggered_at)}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{sos.worker?.name ?? 'Unidentified Worker'}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-1 mb-3">
                    <MapPin size={14} /> {sos.site?.name ?? 'Unknown site'}
                    {sos.latitude != null && sos.longitude != null && (
                      <span className="font-mono"> ({sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)})</span>
                    )}
                  </p>

                  {sos.description && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-red-300 mb-3 inline-flex items-center gap-2">
                      <AlertTriangle size={16} /> {sos.description}
                    </div>
                  )}

                  {sos.worker && (
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1 bg-[var(--color-bg-secondary)] px-2.5 py-1.5 rounded-lg">
                        <Droplet size={12} /> Blood: <strong>{sos.worker.blood_group || 'N/A'}</strong>
                      </span>
                      <span className="flex items-center gap-1 bg-[var(--color-bg-secondary)] px-2.5 py-1.5 rounded-lg">
                        Medical: <strong>{(sos.worker.medical_conditions ?? []).join(', ') || 'None listed'}</strong>
                      </span>
                      <span className="flex items-center gap-1 bg-[var(--color-bg-secondary)] px-2.5 py-1.5 rounded-lg">
                        <Phone size={12} /> Emergency: <strong>{sos.worker.emergency_contact_name || 'N/A'} ({sos.worker.emergency_contact_phone || 'N/A'})</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2 md:justify-center shrink-0">
                  {sos.status === 'triggered' && (
                    <button
                      onClick={() => handleRespond(sos.id)}
                      className="bg-amber-600 hover:bg-amber-700 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                    >
                      I'm Responding
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(sos.id)}
                    className="bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HISTORY ── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--color-text-muted)]">Past Events</h3>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No past SOS events.</p>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
                  <th className="p-3 font-semibold">Worker</th>
                  <th className="p-3 font-semibold">Site</th>
                  <th className="p-3 font-semibold">Triggered</th>
                  <th className="p-3 font-semibold text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {history.map((sos) => (
                  <tr key={sos.id}>
                    <td className="p-3 font-medium">{sos.worker?.name ?? 'Unidentified Worker'}</td>
                    <td className="p-3 text-[var(--color-text-muted)]">{sos.site?.name ?? '—'}</td>
                    <td className="p-3 text-[var(--color-text-muted)]">{new Date(sos.triggered_at).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <span className={`badge ${sos.status === 'resolved' ? 'badge-success' : 'badge-neutral'}`}>
                        {sos.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
