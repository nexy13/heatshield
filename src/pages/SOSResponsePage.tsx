import { useState, useEffect } from 'react';
import { MapPin, Siren, Phone, AlertTriangle, Droplet, ShieldCheck } from 'lucide-react';
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
import { Badge } from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

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
    return <Spinner label="Loading SOS events..." />;
  }

  if (error) {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto mt-10">
        <AlertTriangle className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--emergency)' }} />
        <p className="text-[var(--text-muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="text-left">
        <p className="eyebrow mb-1.5 flex items-center gap-2" style={{ color: 'var(--emergency)' }}>
          {active.length > 0 && <span className="pulse-dot" style={{ background: 'var(--emergency)' }} />}
          Emergency Response
        </p>
        <h2 className="page-title flex items-center gap-2.5">
          <Siren size={24} style={{ color: 'var(--emergency)' }} className={active.length > 0 ? 'animate-pulse' : ''} />
          Active SOS Emergencies
        </h2>
        <p className="page-subtitle">Immediate response required</p>
      </div>

      {active.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ background: 'var(--safe-bg)', color: 'var(--safe)' }}>
            <ShieldCheck size={26} />
          </div>
          <p className="text-base font-semibold text-[var(--text)]">No Active Emergencies</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">All workers are currently safe.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {active.map((sos) => (
            <div
              key={sos.id}
              className="card p-6 relative overflow-hidden badge-live"
              style={{
                borderColor: 'rgba(220, 38, 38, 0.4)',
                boxShadow: '0 0 32px rgba(220, 38, 38, 0.12), var(--shadow-sm)',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: 'linear-gradient(90deg, var(--emergency), rgba(220,38,38,0.15))' }}
              />
              <div className="flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2.5">
                    <Badge variant="danger" live dot>
                      {sos.status === 'responding' ? 'Responding' : 'Urgent SOS'}
                    </Badge>
                    <span className="text-sm text-[var(--text-muted)] font-medium">{timeAgo(sos.triggered_at)}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-1 text-[var(--text)]">
                    {sos.worker?.name ?? 'Unidentified Worker'}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] flex items-center gap-1 mb-3">
                    <MapPin size={14} /> {sos.site?.name ?? 'Unknown site'}
                    {sos.latitude != null && sos.longitude != null && (
                      <span className="font-mono text-xs"> ({sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)})</span>
                    )}
                  </p>

                  {sos.description && (
                    <div
                      className="p-3 rounded-xl text-sm mb-3 inline-flex items-center gap-2 font-medium"
                      style={{ background: 'var(--emergency-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--emergency)' }}
                    >
                      <AlertTriangle size={15} /> {sos.description}
                    </div>
                  )}

                  {sos.worker && (
                    <div className="flex flex-wrap gap-2.5 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
                        <Droplet size={12} style={{ color: 'var(--emergency)' }} /> Blood: <strong className="text-[var(--text-secondary)]">{sos.worker.blood_group || 'N/A'}</strong>
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
                        Medical: <strong className="text-[var(--text-secondary)]">{(sos.worker.medical_conditions ?? []).join(', ') || 'None listed'}</strong>
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
                        <Phone size={12} /> Emergency: <strong className="text-[var(--text-secondary)]">{sos.worker.emergency_contact_name || 'N/A'} ({sos.worker.emergency_contact_phone || 'N/A'})</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2.5 md:justify-center shrink-0">
                  {sos.status === 'triggered' && (
                    <button
                      onClick={() => handleRespond(sos.id)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
                      style={{
                        background: 'linear-gradient(180deg, #F59E0B, #D97706)',
                        boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                      }}
                    >
                      I'm Responding
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(sos.id)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
                    style={{
                      background: 'linear-gradient(180deg, #16A34A, #15803D)',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                    }}
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
        <h3 className="font-serif text-lg font-bold text-[var(--text)] text-left">Past Events</h3>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-left">No past SOS events.</p>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="table-premium w-full text-left border-collapse text-sm">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Site</th>
                  <th>Triggered</th>
                  <th className="text-right">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {history.map((sos) => (
                  <tr key={sos.id}>
                    <td className="font-semibold text-[var(--text)]">{sos.worker?.name ?? 'Unidentified Worker'}</td>
                    <td className="text-[var(--text-muted)]">{sos.site?.name ?? '—'}</td>
                    <td className="text-[var(--text-muted)]">{new Date(sos.triggered_at).toLocaleString()}</td>
                    <td className="text-right">
                      <Badge variant={sos.status === 'resolved' ? 'success' : 'neutral'}>
                        {sos.status.replace('_', ' ')}
                      </Badge>
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
