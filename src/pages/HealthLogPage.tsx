import { Heart, Activity, Plus } from 'lucide-react';

const mockLogs = [
  { id: '1', date: 'Today, 10:15 AM', temp: '37.2°C', feeling: 'Good', notes: '' },
  { id: '2', date: 'Yesterday, 13:00 PM', temp: '37.8°C', feeling: 'Tired, slightly dizzy', notes: 'Rested in shade for 15 mins' },
];

export default function HealthLogPage() {
  return (
    <div className="space-y-6 animate-fade-up max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Health Log</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Track your body temperature and symptoms</p>
        </div>
        <button className="btn-primary py-2.5 px-4 rounded-xl flex items-center gap-2 font-medium">
          <Plus size={16} /> Log Entry
        </button>
      </div>

      <div className="space-y-4">
        {mockLogs.map((log) => (
          <div key={log.id} className="glass rounded-xl p-5 border-l-4 border-l-red-400">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-[var(--color-text-muted)]">{log.date}</span>
              <span className="badge badge-info">{log.feeling}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xl">
                <Heart size={20} className="animate-pulse" /> {log.temp}
              </div>
              {log.notes && (
                <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                  <Activity size={14} /> {log.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
