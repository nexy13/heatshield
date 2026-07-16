import { CalendarClock, Plus, Users, Clock, Edit2, Trash2 } from 'lucide-react';

const mockShifts = [
  { id: '1', date: '2026-07-16', time: '06:00 - 14:00', type: 'Morning', assigned: 24, status: 'Active' },
  { id: '2', date: '2026-07-16', time: '14:00 - 22:00', type: 'Evening', assigned: 18, status: 'Upcoming' },
  { id: '3', date: '2026-07-17', time: '06:00 - 14:00', type: 'Morning', assigned: 25, status: 'Scheduled' },
];

export default function ShiftSchedulerPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Shift Scheduler</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Plan and manage worker shifts</p>
        </div>
        <button className="btn-primary py-2.5 px-4 rounded-xl flex items-center gap-2 font-medium">
          <Plus size={16} /> Create Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockShifts.map((shift) => (
          <div key={shift.id} className="glass rounded-xl p-5 card-hover">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className="text-orange-400" />
                <span className="font-bold">{shift.date}</span>
              </div>
              <span className={`badge ${
                shift.status === 'Active' ? 'badge-success' : 
                shift.status === 'Upcoming' ? 'badge-info' : 'badge-neutral'
              }`}>
                {shift.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold mb-1">{shift.type} Shift</h3>
            <p className="text-[var(--color-text-muted)] text-sm flex items-center gap-1 mb-4">
              <Clock size={14} /> {shift.time}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Users size={16} className="text-blue-400" />
                {shift.assigned} Workers
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"><Edit2 size={14} /></button>
                <button className="p-1.5 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
