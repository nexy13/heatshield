import { MapPin, Siren, CheckCircle2, Phone, AlertTriangle } from 'lucide-react';

const mockSos = [
  { id: '1', workerName: 'Vikram Sharma', site: 'Rajput Brick Works', time: '2 mins ago', lat: 28.7041, lng: 77.1025, status: 'active', desc: 'Feeling dizzy and nauseous' },
  { id: '2', workerName: 'Suresh Yadav', site: 'Rajput Brick Works', time: '1 hour ago', lat: 28.7050, lng: 77.1010, status: 'resolved', desc: '' },
];

export default function SOSResponsePage() {
  const activeEvents = mockSos.filter(s => s.status === 'active');
  const pastEvents = mockSos.filter(s => s.status === 'resolved');

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2 text-red-400">
          <Siren size={24} className="animate-pulse" />
          Active SOS Emergencies
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm">Immediate response required</p>
      </div>

      {activeEvents.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center flex flex-col items-center justify-center">
          <CheckCircle2 size={48} className="text-emerald-400 mb-4 opacity-50" />
          <p className="text-lg font-semibold">No Active Emergencies</p>
          <p className="text-sm text-[var(--color-text-muted)]">All workers are currently safe.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeEvents.map((sos) => (
            <div key={sos.id} className="glass rounded-xl p-6 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl -z-10" />
              
              <div className="flex flex-col md:flex-row gap-6 justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="badge badge-danger animate-pulse">URGENT SOS</span>
                    <span className="text-sm text-[var(--color-text-muted)]">{sos.time}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{sos.workerName}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-1 mb-4">
                    <MapPin size={14} /> {sos.site} ({sos.lat.toFixed(4)}, {sos.lng.toFixed(4)})
                  </p>
                  
                  {sos.desc && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-red-300 mb-4 inline-flex items-center gap-2">
                      <AlertTriangle size={16} /> {sos.desc}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0 md:items-start">
                  <a href="tel:112" className="btn-secondary py-2.5 px-4 rounded-xl flex items-center justify-center gap-2">
                    <Phone size={18} className="text-indigo-400" />
                    Call Ambulance
                  </a>
                  <button className="btn-primary bg-gradient-to-r from-red-600 to-red-500 py-2.5 px-6 rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} />
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-8">
        <h3 className="text-lg font-bold mb-4">Past 24 Hours</h3>
        <div className="space-y-3">
          {pastEvents.map((sos) => (
            <div key={sos.id} className="glass rounded-xl p-4 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold">{sos.workerName}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{sos.time} • Resolved</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
