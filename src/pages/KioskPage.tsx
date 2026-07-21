import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Flame,
  Droplets,
  AlertOctagon,
  Search,
  CheckCircle,
  ArrowLeft,
  ShieldAlert,
  Clock,
  Thermometer,
  Waves,
  Wind,
  Sun,
  Wifi,
  WifiOff,
  Satellite,
  Timer,
  UserCheck,
  HeartPulse,
  Ambulance,
  PhoneCall,
  HardHat,
  CloudSun,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getSiteById } from '@/lib/api/sites';
import { getLatestWeather } from '@/lib/api/weather';
import { getSiteWorkers } from '@/lib/api/workers';
import { triggerSOS } from '@/lib/api/sos';
import type { KilnSite, WeatherReading, Worker } from '@/types/database';
import { RISK_LEVELS } from '@/lib/utils/constants';

interface WorkerWithAvatar extends Worker {
  avatar_url?: string | null;
}

const RISK_COLORS: Record<string, string> = {
  low: '#22C55E',
  moderate: '#EAB308',
  high: '#F97316',
  extreme: '#EF4444',
  danger: '#DC2626',
};

/** Large circular heat-index gauge for the kiosk display */
function KioskGauge({ heatIndex, color }: { heatIndex: number | null; color: string }) {
  const size = 290;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = heatIndex == null ? 0 : Math.min(Math.max(heatIndex, 0), 60);
  const percentage = (clamped / 60) * 100;
  const dashOffset = circumference - (percentage / 100) * circumference * 0.75; // 270° arc

  // Tick marks along the 270° arc, drawn just inside the track
  const ticks = Array.from({ length: 28 }, (_, i) => {
    const angleDeg = (i / 27) * 270;
    const rad = (angleDeg * Math.PI) / 180;
    const major = i % 3 === 0;
    const rOuter = radius - strokeWidth / 2 - 5;
    const rInner = rOuter - (major ? 10 : 6);
    const cx = size / 2;
    const cy = size / 2;
    return {
      key: i,
      major,
      lit: heatIndex != null && angleDeg <= (percentage / 100) * 270,
      x1: cx + rInner * Math.cos(rad),
      y1: cy + rInner * Math.sin(rad),
      x2: cx + rOuter * Math.cos(rad),
      y2: cy + rOuter * Math.sin(rad),
    };
  });

  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-square">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg]">
        <defs>
          <linearGradient id="kiosk-gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        {/* Tick marks */}
        {ticks.map((t) => (
          <line
            key={t.key}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.lit ? color : 'rgba(148, 163, 184, 0.22)'}
            strokeOpacity={t.lit ? 0.75 : 1}
            strokeWidth={t.major ? 2 : 1}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.8s var(--ease)' }}
          />
        ))}
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#kiosk-gauge-grad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="gauge-ring"
          style={{ filter: `drop-shadow(0 0 18px ${color}70)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="kiosk-metric font-extrabold leading-none"
          style={{ fontSize: '5.25rem', color, textShadow: `0 0 40px ${color}60` }}
        >
          {heatIndex != null ? Math.round(heatIndex) : '--'}
        </span>
        <span className="text-2xl font-bold text-slate-400 mt-1">°C</span>
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-slate-500 mt-2">
          Heat Index
        </span>
      </div>
    </div>
  );
}

/** Small live-status chip for the kiosk header */
function StatusChip({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof Wifi;
  label: string;
  tone: 'safe' | 'danger';
}) {
  const color = tone === 'safe' ? '#4ADE80' : '#F87171';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-[0.12em]"
      style={{
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        color,
      }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {label}
    </span>
  );
}

/** Compact environment metric tile beside the gauge */
function MetricTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Thermometer;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3.5"
      style={{ background: 'rgba(148, 163, 184, 0.06)', border: '1px solid rgba(148, 163, 184, 0.1)' }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="kiosk-metric text-2xl lg:text-3xl font-bold text-slate-100 whitespace-nowrap leading-none">
          {value.split(' ')[0]}
          {value.includes(' ') && (
            <span className="text-sm lg:text-base font-semibold text-slate-400 ml-1">
              {value.slice(value.indexOf(' ') + 1)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/** Emergency-response readiness tile below the SOS button */
function ReadinessTile({
  icon: Icon,
  label,
  value,
  accent = '#4ADE80',
}: {
  icon: typeof Timer;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl p-3.5 flex flex-col items-center text-center gap-1.5"
      style={{ background: 'rgba(148, 163, 184, 0.06)', border: '1px solid rgba(148, 163, 184, 0.1)' }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
      >
        <Icon size={18} />
      </div>
      <p className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-wider leading-tight">{label}</p>
      <p className="text-sm font-bold text-slate-100 leading-tight">{value}</p>
    </div>
  );
}

/** Worker-safety operating status per risk level */
const SAFETY_STATUS: Record<string, { label: string; color: string }> = {
  low: { label: 'All Clear', color: '#4ADE80' },
  moderate: { label: 'Monitor', color: '#FACC15' },
  high: { label: 'Caution', color: '#FB923C' },
  extreme: { label: 'Restricted', color: '#F87171' },
  danger: { label: 'Stop Work', color: '#EF4444' },
};

export default function KioskPage() {
  const { siteId } = useParams<{ siteId: string }>();

  const [site, setSite] = useState<KilnSite | null>(null);
  const [weather, setWeather] = useState<WeatherReading | null>(null);
  const [workers, setWorkers] = useState<WorkerWithAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydration interval states
  const [hydrationTimeLeft, setHydrationTimeLeft] = useState<number>(0);
  const [showHydrationAlert, setShowHydrationAlert] = useState(false);

  // Time & Date state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Terminal connectivity status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // SOS States
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);
  const [sosTimer, setSosTimer] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sosDetails, setSosDetails] = useState<{ workerName: string; anonymous: boolean } | null>(null);

  const countdownRef = useRef<any>(null);
  const successTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // Clock tick
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    // Network status for the header indicators
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Fetch initial data
  const loadKioskData = async () => {
    if (!siteId) return;
    try {
      setLoading(true);
      const [siteData, weatherData, workersList] = await Promise.all([
        getSiteById(siteId),
        getLatestWeather(siteId),
        getSiteWorkers(siteId),
      ]);

      if (!siteData) {
        setError('Site not found');
        return;
      }
      setSite(siteData);
      setWeather(weatherData);

      // Fetch user profile avatars for these workers
      const { data: usersList, error: usersError } = await supabase
        .from('users')
        .select('id, avatar_url')
        .eq('site_id', siteId)
        .eq('role', 'worker');

      if (!usersError && usersList) {
        const avatarMap = new Map(usersList.map(u => [u.id, u.avatar_url]));
        const workersWithAvatars = workersList.map(w => ({
          ...w,
          avatar_url: avatarMap.get(w.id) || null,
        }));
        setWorkers(workersWithAvatars);
      } else {
        setWorkers(workersList);
      }

      // Hydration countdown setup
      const intervalMin = siteData.hydration_interval_min || 30;
      setHydrationTimeLeft(intervalMin * 60);

      setLastSync(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to site database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKioskData();
    // Poll weather every 30 seconds
    const weatherTimer = setInterval(async () => {
      if (siteId) {
        const weatherData = await getLatestWeather(siteId);
        setWeather(weatherData);
        setLastSync(new Date());
      }
    }, 30000);

    return () => clearInterval(weatherTimer);
  }, [siteId]);

  // Hydration interval countdown
  useEffect(() => {
    if (loading || showHydrationAlert || hydrationTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setHydrationTimeLeft(prev => {
        if (prev <= 1) {
          setShowHydrationAlert(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, showHydrationAlert, hydrationTimeLeft]);

  // SOS Countdown logic
  useEffect(() => {
    if (!sosModalOpen || sosSuccess) return;

    if (sosTimer <= 0) {
      executeSos(null); // Trigger anonymously
      return;
    }

    countdownRef.current = setTimeout(() => {
      setSosTimer(prev => prev - 1);
    }, 1000);

    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [sosModalOpen, sosTimer, sosSuccess]);

  // Trigger SOS step 1
  const handleSosPress = () => {
    setSearchTerm('');
    setSosTimer(5);
    setSosSuccess(false);
    setSosModalOpen(true);
  };

  // Trigger SOS step 2 (execute)
  const executeSos = async (worker: Worker | null) => {
    if (!siteId) return;
    if (countdownRef.current) clearTimeout(countdownRef.current);

    try {
      // Geoloc fallback — Anekal, Bengaluru
      let lat = site?.latitude || 12.7110;
      let lng = site?.longitude || 77.6970;

      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) {
        console.log('Using site backup coordinates:', e);
      }

      await triggerSOS(worker?.id ?? null, siteId, lat, lng, worker ? `SOS for ${worker.name}` : 'Anonymous SOS from Kiosk');

      setSosDetails({
        workerName: worker ? worker.name : 'Unidentified Worker',
        anonymous: !worker
      });
      setSosSuccess(true);

      // Reset modal after 4 seconds
      successTimeoutRef.current = setTimeout(() => {
        setSosModalOpen(false);
        setSosSuccess(false);
        setSosDetails(null);
      }, 4000);

    } catch (err) {
      console.error(err);
      alert('Emergency Dispatch Failed. Retrying...');
      setSosTimer(5); // Reset timer to allow retry
    }
  };

  const handleDismissHydration = () => {
    setShowHydrationAlert(false);
    const intervalMin = site?.hydration_interval_min || 30;
    setHydrationTimeLeft(intervalMin * 60);
  };

  if (loading) {
    return (
      <div className="kiosk-root min-h-screen text-white flex flex-col font-sans select-none lg:overflow-hidden lg:h-screen animate-fade-in">
        {/* Skeleton Header */}
        <header className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 lg:py-6" style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
          <div className="flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-2xl" style={{ background: 'rgba(148,163,184,0.12)' }} />
            <div className="space-y-2">
              <div className="skeleton h-6 w-48 rounded" style={{ background: 'rgba(148,163,184,0.12)' }} />
              <div className="skeleton h-4 w-24 rounded" style={{ background: 'rgba(148,163,184,0.1)' }} />
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="skeleton h-9 w-40 rounded ml-auto" style={{ background: 'rgba(148,163,184,0.12)' }} />
            <div className="skeleton h-4 w-32 rounded ml-auto" style={{ background: 'rgba(148,163,184,0.1)' }} />
          </div>
        </header>

        {/* Skeleton Main */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 p-4 sm:p-6 lg:p-10 lg:overflow-hidden">
          <div className="flex flex-col gap-5 lg:gap-8 lg:h-full lg:overflow-hidden justify-between">
            <div className="kiosk-panel flex-1 flex items-center justify-center">
              <div className="skeleton w-64 h-64 rounded-full" style={{ background: 'rgba(148,163,184,0.08)' }} />
            </div>
            <div className="kiosk-panel p-8 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="skeleton w-16 h-16 rounded-2xl" style={{ background: 'rgba(148,163,184,0.1)' }} />
                <div className="space-y-2">
                  <div className="skeleton h-6 w-40 rounded" style={{ background: 'rgba(148,163,184,0.12)' }} />
                  <div className="skeleton h-4 w-64 rounded" style={{ background: 'rgba(148,163,184,0.1)' }} />
                </div>
              </div>
              <div className="skeleton h-16 w-28 rounded-2xl" style={{ background: 'rgba(148,163,184,0.1)' }} />
            </div>
          </div>
          <div className="h-full flex flex-col">
            <div className="kiosk-panel flex-1 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="kiosk-root min-h-screen flex flex-col items-center justify-center text-white p-8 text-center">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(220, 38, 38, 0.14)', border: '1px solid rgba(248, 113, 113, 0.3)' }}
        >
          <AlertOctagon className="w-12 h-12" style={{ color: '#F87171' }} />
        </div>
        <h1 className="font-serif text-4xl font-bold mb-3">Connection Offline</h1>
        <p className="text-slate-400 max-w-md mb-8 text-lg">{error || 'Please configure a valid site identifier.'}</p>
        <Link to="/login" className="btn-primary px-6 py-3 text-base">
          <ArrowLeft size={16} /> Admin Portal
        </Link>
      </div>
    );
  }

  const risk = weather?.risk_level || 'low';
  const riskLabel = RISK_LEVELS[risk] || RISK_LEVELS.low;
  const riskColor = RISK_COLORS[risk] || RISK_COLORS.low;
  const isDangerous = risk === 'extreme' || risk === 'danger';
  const safety = SAFETY_STATUS[risk] ?? SAFETY_STATUS.low;

  // Display-only estimates for the environment tiles
  const hourFrac = currentTime.getHours() + currentTime.getMinutes() / 60;
  const uvIndex = (() => {
    if (hourFrac < 6 || hourFrac > 18.5) return 0;
    let uv = Math.round(11 - Math.abs(13 - hourFrac) * 1.6);
    const cond = weather?.condition?.toLowerCase() ?? '';
    if (cond.includes('cloud') || cond.includes('rain') || cond.includes('haze')) uv -= 2;
    return Math.min(11, Math.max(1, uv));
  })();
  const shiftLabel =
    hourFrac >= 6 && hourFrac < 14
      ? 'Morning · 06–14'
      : hourFrac >= 14 && hourFrac < 22
        ? 'Evening · 14–22'
        : 'Night · 22–06';
  const activeWorkers = workers.filter((w) => w.status === 'active').length || workers.length;

  // Format hydration countdown
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Hydration ring progress (0-1 of interval elapsed)
  const hydrationTotal = (site.hydration_interval_min || 30) * 60;
  const hydrationProgress = hydrationTotal > 0 ? hydrationTimeLeft / hydrationTotal : 0;

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="kiosk-root min-h-screen text-white flex flex-col font-sans select-none relative lg:overflow-hidden lg:h-screen">
      {/* Danger stripes overlay when extreme/danger */}
      {isDangerous && (
        <div className="kiosk-danger-stripe absolute inset-x-0 top-0 h-1.5 z-20" aria-hidden="true" />
      )}

      {/* ── HEADER ── */}
      <header
        className="flex justify-between items-center gap-3 px-4 sm:px-6 lg:px-10 py-4 lg:py-5 relative z-10"
        style={{
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          background: 'rgba(6, 13, 31, 0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
          <div
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.4)',
            }}
          >
            <Flame className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <p className="text-[0.6rem] lg:text-[0.65rem] font-bold tracking-[0.15em] lg:tracking-[0.3em] uppercase" style={{ color: '#93C5FD' }}>
              HEATSHIELD · Safety Terminal
            </p>
            <h1 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-50 leading-tight mt-0.5">
              {site.name}
            </h1>
            <p className="text-[0.7rem] text-slate-400 tracking-[0.2em] uppercase font-semibold mt-0.5">
              {site.region || 'Kiln Area'} Cluster
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6 shrink-0">
          {/* Live status cluster */}
          <div className="hidden md:flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-[0.12em]"
                style={{
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  color: '#4ADE80',
                }}
              >
                <span className="pulse-dot" style={{ background: '#4ADE80', width: 6, height: 6 }} />
                Live
              </span>
              <StatusChip icon={Satellite} label="GPS Connected" tone="safe" />
              <StatusChip
                icon={isOnline ? Wifi : WifiOff}
                label={isOnline ? 'Network Online' : 'Network Offline'}
                tone={isOnline ? 'safe' : 'danger'}
              />
            </div>
            <p className="text-[0.65rem] text-slate-500 font-semibold tracking-[0.14em] uppercase">
              Last sync{' '}
              {lastSync
                ? lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '—'}
            </p>
          </div>

          <div className="text-right">
            <div className="kiosk-clock text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-100">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-sm text-slate-400 font-semibold tracking-wide mt-1">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* ── KIOSK MAIN SPLIT ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 p-4 sm:p-6 lg:p-10 lg:overflow-hidden relative z-10">

        {/* LEFT COLUMN: LIVE WEATHER & HYDRATION COUNTER */}
        <div className="flex flex-col gap-5 lg:gap-6 lg:h-full lg:overflow-hidden">

          {/* WEATHER / RISK PANEL */}
          <div
            className="kiosk-panel p-5 sm:p-6 lg:p-8 flex flex-col flex-1 min-h-0"
            style={isDangerous ? { borderColor: 'rgba(248, 113, 113, 0.4)', boxShadow: `0 0 60px ${riskColor}25, inset 0 1px 0 rgba(255,255,255,0.05)` } : undefined}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <span className="pulse-dot" style={{ background: riskColor }} />
                Live Heat Index
              </span>
              <span
                className={`px-5 py-2 rounded-full text-base font-extrabold uppercase tracking-wider ${riskLabel.bg} ${riskLabel.text}`}
                style={isDangerous ? { boxShadow: `0 0 24px ${riskColor}50` } : undefined}
              >
                {riskLabel.label}
              </span>
            </div>

            {/* Circular gauge + side metrics */}
            <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-6 min-h-0">
              <KioskGauge heatIndex={weather ? weather.heat_index : null} color={riskColor} />

              <div className="grid grid-cols-2 gap-3 w-full xl:w-auto xl:min-w-[300px]">
                <MetricTile
                  icon={Thermometer}
                  label="Air Temp"
                  value={weather ? `${Math.round(weather.temperature_c)}°C` : '--'}
                  accent="#FB923C"
                />
                <MetricTile
                  icon={Waves}
                  label="Humidity"
                  value={weather ? `${Math.round(weather.humidity_pct)}%` : '--'}
                  accent="#60A5FA"
                />
                <MetricTile
                  icon={Wind}
                  label="Wind"
                  value={weather?.wind_speed_kmh != null ? `${Math.round(weather.wind_speed_kmh)} km/h` : '--'}
                  accent="#2DD4BF"
                />
                <MetricTile icon={Sun} label="UV Index" value={`${uvIndex}`} accent="#FACC15" />
              </div>
            </div>

            {/* Site operating status strip */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 mt-2"
              style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}
            >
              {[
                { icon: HardHat, label: 'Worker Safety', value: safety.label, color: safety.color },
                { icon: CloudSun, label: 'Condition', value: weather?.condition || '—', color: '#93C5FD' },
                { icon: Users, label: 'On-Site Workers', value: `${activeWorkers}`, color: '#E2E8F0' },
                { icon: Clock, label: 'Current Shift', value: shiftLabel, color: '#E2E8F0' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-2.5 min-w-0">
                  <Icon size={16} className="shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-[0.6rem] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-bold truncate" style={{ color }}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HYDRATION STATUS */}
          <div className="kiosk-panel p-5 lg:p-7 flex items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-3 lg:gap-5 min-w-0">
              <div
                className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)',
                }}
              >
                <Droplets className="w-6 h-6 lg:w-8 lg:h-8" style={{ color: '#60A5FA' }} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg lg:text-2xl font-bold text-slate-100">Hydration Reminder</h3>
                <p className="text-slate-400 text-sm lg:text-base mt-1">
                  Drink 250ml water every {site.hydration_interval_min || 30} minutes.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.16em] mb-2 flex items-center justify-end gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Next Break In
              </p>
              <div
                className="relative rounded-2xl px-4 lg:px-6 py-2.5 lg:py-3 overflow-hidden"
                style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(96, 165, 250, 0.25)' }}
              >
                {/* Draining progress fill */}
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 transition-all duration-1000"
                  style={{ width: `${hydrationProgress * 100}%`, background: 'rgba(59, 130, 246, 0.12)' }}
                />
                <span className="kiosk-timer relative text-3xl lg:text-5xl font-bold" style={{ color: '#60A5FA' }}>
                  {formatTime(hydrationTimeLeft)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MASSIVE SOS DISPATCH BUTTON + RESPONSE READINESS */}
        <div className="flex flex-col gap-6 lg:h-full lg:min-h-0">
          <div className="kiosk-sos-stage flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-6 lg:gap-7 py-6 lg:py-0 relative">
            <button
              onClick={handleSosPress}
              aria-label="Trigger emergency SOS"
              className="kiosk-sos-btn group"
            >
              {/* Emitted sonar waves */}
              <span className="kiosk-sos-wave" aria-hidden="true" />
              <span className="kiosk-sos-wave kiosk-sos-wave--2" aria-hidden="true" />

              {/* Glossy 3D red cap */}
              <span className="kiosk-sos-dome">
                <span className="kiosk-sos-content">
                  <ShieldAlert
                    className="w-11 h-11 text-white mb-1.5"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                  />
                  <span className="kiosk-sos-word font-serif">SOS</span>
                  <span className="kiosk-sos-tap">Tap for instant rescue</span>
                </span>
              </span>
            </button>

            {/* Guarantee chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
              <span className="kiosk-sos-chip"><Satellite size={13} strokeWidth={2.5} /> GPS Shared</span>
              <span className="kiosk-sos-chip"><CheckCircle size={13} strokeWidth={2.5} /> Incident Logged</span>
            </div>
          </div>

          {/* Emergency response readiness */}
          <div className="kiosk-panel p-5 shrink-0">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">
                Emergency Response Readiness
              </span>
              <div className="flex items-center gap-2">
                <StatusChip icon={Satellite} label="GPS Enabled" tone="safe" />
                <StatusChip
                  icon={isOnline ? Wifi : WifiOff}
                  label={isOnline ? 'Online' : 'Offline'}
                  tone={isOnline ? 'safe' : 'danger'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ReadinessTile icon={Timer} label="Response ETA" value="< 2 min" accent="#60A5FA" />
              <ReadinessTile icon={UserCheck} label="Supervisor" value="On Duty" />
              <ReadinessTile icon={HeartPulse} label="Medical Team" value="Standby" />
              <ReadinessTile icon={Ambulance} label="Ambulance" value="Available" accent="#FB923C" />
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-slate-500 font-semibold tracking-[0.14em] uppercase mt-3.5">
              <PhoneCall size={12} /> Emergency Contact: 108 · Site Supervisor via SMS
            </p>
          </div>
        </div>

      </main>

      {/* ── FULL-SCREEN HYDRATION BREAK OVERLAY ── */}
      {showHydrationAlert && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-12 z-40 animate-fade-in"
          style={{
            background:
              'radial-gradient(900px 600px at 50% 20%, rgba(59, 130, 246, 0.25), transparent 60%), linear-gradient(170deg, #0A1A3A 0%, #081124 100%)',
          }}
        >
          <div
            className="w-44 h-44 rounded-full flex items-center justify-center mb-10"
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '2px solid rgba(96, 165, 250, 0.4)',
              boxShadow: '0 0 80px rgba(59, 130, 246, 0.35)',
            }}
          >
            <Droplets className="w-24 h-24 animate-bounce" style={{ color: '#60A5FA' }} />
          </div>
          <h2 className="font-serif font-extrabold mb-5 text-white" style={{ fontSize: 'clamp(3.5rem, 7vw, 6rem)', lineHeight: 1.05 }}>
            Water Break! 💧
          </h2>
          <p className="text-3xl max-w-3xl mb-14 leading-relaxed" style={{ color: '#BFDBFE' }}>
            All workers please stop operations, move to the cool area, and drink 250ml of clean drinking water.
          </p>
          <button
            onClick={handleDismissHydration}
            className="text-3xl font-extrabold py-6 px-16 rounded-3xl transition-all cursor-pointer active:scale-95"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF, #DBEAFE)',
              color: '#0A1A3A',
              boxShadow: '0 24px 60px rgba(59, 130, 246, 0.35)',
            }}
          >
            Break Completed
          </button>
        </div>
      )}

      {/* ── SOS SELECTION DIALOG (OVERLAY) ── */}
      {sosModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-10 z-50 animate-fade-in"
          style={{ background: 'rgba(3, 7, 18, 0.94)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >

          <div
            className="w-full max-w-4xl rounded-3xl p-8 flex flex-col max-h-[85vh] overflow-hidden relative modal-card"
            style={{
              background: 'linear-gradient(180deg, #0D1A33, #0A1428)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6)',
            }}
          >

            {/* SOS Success View */}
            {sosSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 animate-scale-up">
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center mb-8"
                  style={{
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '2px solid rgba(74, 222, 128, 0.4)',
                    boxShadow: '0 0 60px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <CheckCircle className="w-24 h-24" style={{ color: '#4ADE80' }} />
                </div>
                <h3 className="font-serif text-5xl font-extrabold mb-4 text-slate-50">SOS Triggered!</h3>
                <p className="text-2xl text-slate-300 max-w-lg mb-4 leading-relaxed">
                  Emergency SMS sent to the site supervisor for{' '}
                  <strong style={{ color: '#F87171' }}>{sosDetails?.workerName}</strong>. Help is on the way.
                </p>
                <p className="text-sm text-slate-500 font-semibold tracking-[0.16em] uppercase mb-10">
                  Incident logged for history & compliance
                </p>
                <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.15)' }}>
                  <div className="h-full animate-progress-bar" style={{ background: '#EF4444' }} />
                </div>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6 pb-5" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.12)' }}>
                  <div className="text-left">
                    <h3 className="font-serif text-3xl font-extrabold" style={{ color: '#F87171' }}>Who is triggering SOS?</h3>
                    <p className="text-slate-400 text-base mt-1">Tap your name to attach your medical details.</p>
                  </div>

                  {/* Fallback alert countdown */}
                  <div className="text-right shrink-0">
                    <div
                      className="kiosk-metric font-bold text-xl px-5 py-3 rounded-2xl badge-live"
                      style={{
                        background: 'rgba(220, 38, 38, 0.12)',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        color: '#F87171',
                      }}
                    >
                      Dispatching in {sosTimer}s
                    </div>
                  </div>
                </div>

                {/* Worker Search Bar */}
                <div className="relative mb-6">
                  <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by your name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl py-4 pl-14 pr-4 text-xl text-white placeholder-slate-500 focus:outline-none transition-colors"
                    style={{
                      background: 'rgba(3, 7, 18, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.5)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.15)'; }}
                  />
                </div>

                {/* Workers list grid */}
                <div className="flex-1 overflow-y-auto pr-2 mb-6 max-h-[45vh]">
                  {filteredWorkers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredWorkers.map((worker) => (
                        <button
                          key={worker.id}
                          onClick={() => executeSos(worker)}
                          className="p-5 rounded-2xl text-left active:scale-[0.98] transition-all flex items-center gap-4 group cursor-pointer"
                          style={{
                            background: 'rgba(3, 7, 18, 0.5)',
                            border: '1px solid rgba(148, 163, 184, 0.12)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(127, 29, 29, 0.3)';
                            e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(3, 7, 18, 0.5)';
                            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.12)';
                          }}
                        >
                          {worker.avatar_url ? (
                            <img
                              src={worker.avatar_url}
                              alt={worker.name}
                              className="w-12 h-12 rounded-full object-cover"
                              style={{ border: '2px solid rgba(148, 163, 184, 0.25)' }}
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-full text-white font-bold flex items-center justify-center text-lg shrink-0"
                              style={{ background: 'linear-gradient(135deg, #274070, #12203D)' }}
                            >
                              {worker.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-lg leading-snug text-slate-200 group-hover:text-white">{worker.name}</p>
                            <p className="text-xs text-slate-500 group-hover:text-red-300 uppercase font-semibold tracking-wide mt-0.5">
                              Blood Group: {worker.blood_group || 'N/A'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500 text-lg">
                      No matching workers found at this site.
                    </div>
                  )}
                </div>

                {/* Modal Footer (Force anonymous SOS trigger option) */}
                <div className="flex justify-between items-center pt-5" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
                  <button
                    onClick={() => setSosModalOpen(false)}
                    className="py-4 px-8 rounded-2xl text-lg text-slate-400 font-semibold transition-colors cursor-pointer hover:text-slate-200"
                    style={{ background: 'rgba(148, 163, 184, 0.06)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => executeSos(null)}
                    className="text-white font-extrabold py-4 px-8 rounded-2xl text-lg flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(180deg, #EF4444, #B91C1C)',
                      boxShadow: '0 8px 30px rgba(220, 38, 38, 0.4)',
                    }}
                  >
                    Trigger Anonymously Now
                  </button>
                </div>
              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
