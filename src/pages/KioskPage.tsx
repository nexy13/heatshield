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
  Clock
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
      // Geoloc fallback
      let lat = site?.latitude || 26.8467;
      let lng = site?.longitude || 80.9462;
      
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden h-screen animate-fade-in">
        {/* Skeleton Header */}
        <header className="flex justify-between items-center px-10 py-6 border-b border-slate-900 bg-slate-900/50 backdrop-blur-md animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-800 rounded" />
              <div className="h-4 w-24 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-8 w-32 bg-slate-800 rounded ml-auto" />
            <div className="h-4 w-40 bg-slate-800 rounded ml-auto" />
          </div>
        </header>

        {/* Skeleton Main */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-10 overflow-hidden">
          {/* Left Column Skeletons */}
          <div className="flex flex-col gap-8 h-full overflow-hidden justify-between animate-pulse">
            {/* Live Weather Card Skeleton */}
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-32 bg-slate-800 rounded" />
                  <div className="h-8 w-24 bg-slate-800 rounded-full" />
                </div>
                <div className="h-28 w-40 bg-slate-850 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-900/80">
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-slate-800 rounded" />
                  <div className="h-8 w-24 bg-slate-850 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-slate-800 rounded" />
                  <div className="h-8 w-24 bg-slate-850 rounded" />
                </div>
              </div>
            </div>

            {/* Hydration Reminder Skeleton */}
            <div className="bg-slate-900/30 border border-slate-900/80 p-8 rounded-3xl flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-slate-800 rounded" />
                  <div className="h-4 w-64 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-16 w-28 bg-slate-850 rounded-2xl" />
            </div>
          </div>

          {/* Right Column (SOS Button) Skeleton */}
          <div className="h-full flex flex-col animate-pulse">
            <div className="flex-1 w-full rounded-3xl bg-slate-900/45 border border-slate-850 flex flex-col items-center justify-center p-12" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-8 text-center">
        <AlertOctagon className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold font-serif mb-2">Connection Offline</h1>
        <p className="text-slate-400 max-w-md mb-6">{error || 'Please configure a valid site identifier.'}</p>
        <Link to="/login" className="btn-primary px-6 py-3 rounded-lg flex items-center gap-2">
          <ArrowLeft size={16} /> Admin Portal
        </Link>
      </div>
    );
  }

  const risk = weather?.risk_level || 'low';
  const riskLabel = RISK_LEVELS[risk] || RISK_LEVELS.low;
  
  // Format hydration countdown
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden h-screen">
      {/* ── HEADER ── */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-slate-900 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-wide text-slate-100">{site.name}</h1>
            <p className="text-sm text-slate-400 tracking-wider uppercase font-medium mt-0.5">{site.region || 'Kiln Area'}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono font-bold text-slate-200">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-sm text-slate-400 font-medium tracking-wide">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* ── KIOSK MAIN SPLIT ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-10 overflow-hidden">
        
        {/* LEFT COLUMN: LIVE WEATHER & HYDRATION COUNTER */}
        <div className="flex flex-col gap-8 h-full overflow-hidden">
          
          {/* WEATHER / RISK CARD */}
          <div className={`p-8 rounded-3xl border flex flex-col justify-between flex-1 bg-gradient-to-br ${
            risk === 'danger' ? 'from-red-950/40 to-black border-red-500/40' :
            risk === 'extreme' ? 'from-amber-950/40 to-black border-amber-500/40' :
            risk === 'high' ? 'from-yellow-950/40 to-black border-yellow-500/40' :
            'from-slate-900 to-black border-slate-800'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700">
                    Live Heat Index
                  </span>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${riskLabel.bg} ${riskLabel.text}`}>
                  {riskLabel.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-9xl font-mono font-extrabold tracking-tight">
                  {weather ? Math.round(weather.heat_index) : '--'}
                </span>
                <span className="text-5xl text-slate-400">°C</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-900">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Air Temp</p>
                <p className="text-3xl font-semibold font-mono">{weather ? Math.round(weather.temperature_c) : '--'}°C</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Humidity</p>
                <p className="text-3xl font-semibold font-mono">{weather ? Math.round(weather.humidity_pct) : '--'}%</p>
              </div>
            </div>
          </div>

          {/* HYDRATION STATUS */}
          <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-3xl flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center">
                <Droplets className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Hydration Reminder</h3>
                <p className="text-slate-400 text-sm mt-1">Drink 250ml water every {site.hydration_interval_min || 30} minutes.</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-end gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Next Break In
              </p>
              <div className="text-4xl font-mono font-bold text-blue-400 bg-blue-500/5 border border-blue-500/15 px-5 py-2.5 rounded-2xl">
                {formatTime(hydrationTimeLeft)}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MASSIVE SOS DISPATCH BUTTON */}
        <div className="flex flex-col h-full">
          <button 
            onClick={handleSosPress}
            className="flex-1 w-full rounded-3xl bg-red-600 hover:bg-red-700 active:scale-[0.98] border border-red-500 hover:border-red-400 transition-all shadow-[0_0_50px_rgba(220,38,38,0.2)] flex flex-col items-center justify-center p-12 text-center relative group overflow-hidden"
          >
            {/* Pulsing glow background rings */}
            <div className="absolute inset-0 bg-red-500/10 group-hover:scale-105 duration-700 animate-pulse rounded-3xl" />
            <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/20 animate-pulse relative z-10">
              <ShieldAlert className="w-24 h-24 text-white" />
            </div>
            <h2 className="text-6xl font-black font-serif tracking-wide text-white relative z-10">SOS</h2>
            <p className="text-xl text-red-100/80 font-medium tracking-wide max-w-xs mt-4 relative z-10">
              TAP HERE IN EMERGENCY FOR INSTANT RESCUE
            </p>
          </button>
        </div>

      </main>

      {/* ── FULL-SCREEN HYDRATION BREAK ALIGNER ── */}
      {showHydrationAlert && (
        <div className="absolute inset-0 bg-blue-950 flex flex-col items-center justify-center text-center p-12 z-40 animate-fade-in">
          <Droplets className="w-32 h-32 text-blue-400 animate-bounce mb-8" />
          <h2 className="text-7xl font-extrabold font-serif mb-4 text-white">Water Break! 💧</h2>
          <p className="text-3xl text-blue-200 max-w-3xl mb-12 leading-relaxed">
            All workers please stop operations, move to the cool area, and drink 250ml of clean drinking water.
          </p>
          <button 
            onClick={handleDismissHydration}
            className="bg-white text-blue-950 hover:bg-slate-100 active:scale-95 text-3xl font-bold py-6 px-16 rounded-3xl shadow-2xl transition-all"
          >
            Break Completed
          </button>
        </div>
      )}

      {/* ── SOS SELECTION DIALOG (OVERLAY) ── */}
      {sosModalOpen && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-10 z-50 animate-fade-in">
          
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden relative">
            
            {/* SOS Success View */}
            {sosSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 animate-scale-up">
                <CheckCircle className="w-28 h-28 text-emerald-400 mb-6 animate-pulse" />
                <h3 className="text-5xl font-extrabold mb-4 text-slate-100">SOS Triggered!</h3>
                <p className="text-2xl text-slate-300 max-w-lg mb-8 leading-relaxed">
                  Help has been dispatched for <strong className="text-red-400">{sosDetails?.workerName}</strong>. 
                  Supervisor has been alerted via SMS.
                </p>
                <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full animate-progress-bar" />
                </div>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-5">
                  <div>
                    <h3 className="text-3xl font-extrabold text-red-500 font-serif">Who is triggering SOS?</h3>
                    <p className="text-slate-400 text-sm mt-1">Tap your name to attach your medical details.</p>
                  </div>
                  
                  {/* Fallback alert countdown */}
                  <div className="text-right">
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono font-bold text-xl px-4 py-2.5 rounded-xl">
                      Dispatching in {sosTimer}s
                    </div>
                  </div>
                </div>

                {/* Worker Search Bar */}
                <div className="relative mb-6">
                  <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by your name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4.5 pl-12 pr-4 text-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
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
                          className="bg-slate-950 hover:bg-red-950/40 hover:border-red-500/50 border border-slate-850 p-5 rounded-2xl text-left active:scale-[0.98] transition-all flex items-center gap-4 group"
                        >
                          {worker.avatar_url ? (
                            <img 
                              src={worker.avatar_url} 
                              alt={worker.name} 
                              className="w-12 h-12 rounded-full object-cover border border-slate-800" 
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-red-800 text-white font-bold flex items-center justify-center text-lg shrink-0">
                              {worker.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-lg leading-snug text-slate-200 group-hover:text-white">{worker.name}</p>
                            <p className="text-xs text-slate-500 group-hover:text-red-300 uppercase font-medium tracking-wide mt-0.5">
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
                <div className="flex justify-between items-center border-t border-slate-850 pt-5">
                  <button 
                    onClick={() => setSosModalOpen(false)}
                    className="btn-ghost py-4 px-8 rounded-2xl text-lg text-slate-400 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => executeSos(null)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-4.5 px-8 rounded-2xl text-lg flex items-center gap-2"
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
