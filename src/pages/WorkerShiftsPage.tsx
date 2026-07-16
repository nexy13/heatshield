import { CalendarClock, Clock, MapPin } from 'lucide-react';

const mockShifts = [
  { id: '1', date: 'Today, 06:00 - 14:00', site: 'Rajput Brick Works', type: 'Morning', hours: '4h 15m (Active)' },
  { id: '2', date: 'Yesterday, 06:00 - 14:00', site: 'Rajput Brick Works', type: 'Morning', hours: '8h 00m' },
  { id: '3', date: '14 Jul, 14:00 - 22:00', site: 'Rajput Brick Works', type: 'Evening', hours: '8h 00m' },
];

export default function WorkerShiftsPage() {
  return (
    <div className="space-y-6 animate-fade-up max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">My Shifts</h2>
        <p className="text-[var(--color-text-muted)] text-sm">Your work schedule and history</p>
      </div>

      <div className="space-y-4">
        {mockShifts.map((shift, i) => (
          <div key={shift.id} className={`glass rounded-xl p-5 ${i === 0 ? 'border-indigo-500/30' : ''}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className={i === 0 ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'} />
                <span className="font-bold">{shift.date}</span>
              </div>
              <span className={`badge ${i === 0 ? 'badge-success' : 'badge-neutral'}`}>
                {i === 0 ? 'IN PROGRESS' : 'COMPLETED'}
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-center gap-1">
                <MapPin size={14} /> {shift.site}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-[var(--color-text)]">{shift.type} Shift</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} /> {shift.hours} logged
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
