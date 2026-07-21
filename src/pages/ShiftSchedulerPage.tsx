import { CalendarClock, Plus, Users, Clock, Edit2, Trash2 } from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

const mockShifts = [
  { id: '1', date: '2026-07-20', time: '06:00 - 14:00', type: 'Morning', assigned: 42, status: 'Active' },
  { id: '2', date: '2026-07-20', time: '14:00 - 22:00', type: 'Evening', assigned: 36, status: 'Upcoming' },
  { id: '3', date: '2026-07-21', time: '06:00 - 14:00', type: 'Morning', assigned: 28, status: 'Scheduled' },
];

const STATUS_STYLE: Record<string, { variant: BadgeVariant; accent: string }> = {
  Active: { variant: 'success', accent: 'var(--safe)' },
  Upcoming: { variant: 'info', accent: 'var(--info)' },
  Scheduled: { variant: 'neutral', accent: 'var(--text-light)' },
};

export default function ShiftSchedulerPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="text-left">
          <p className="eyebrow mb-1.5">Workforce Planning</p>
          <h2 className="page-title">Shift Scheduler</h2>
          <p className="page-subtitle">Plan and manage worker shifts</p>
        </div>
        <button className="btn-primary py-2.5 px-4">
          <Plus size={16} /> Create Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mockShifts.map((shift, i) => {
          const style = STATUS_STYLE[shift.status] ?? STATUS_STYLE.Scheduled;
          return (
            <div
              key={shift.id}
              className="card card-hover p-5 relative overflow-hidden animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ background: `linear-gradient(90deg, ${style.accent}, transparent)` }}
              />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="icon-chip" style={{ width: 34, height: 34, background: 'var(--brand-tint)', color: 'var(--brand)' }}>
                    <CalendarClock size={16} />
                  </span>
                  <span className="font-mono font-bold text-sm text-[var(--text)]">{shift.date}</span>
                </div>
                <Badge variant={style.variant} dot={shift.status === 'Active'}>
                  {shift.status}
                </Badge>
              </div>

              <h3 className="font-serif text-lg font-bold mb-1 text-left text-[var(--text)]">{shift.type} Shift</h3>
              <p className="text-[var(--text-muted)] text-sm flex items-center gap-1.5 mb-4">
                <Clock size={13} /> {shift.time}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)]">
                  <Users size={15} style={{ color: 'var(--info)' }} />
                  {shift.assigned} Workers
                </div>
                <div className="flex gap-1">
                  <button className="btn-icon" aria-label="Edit shift"><Edit2 size={14} /></button>
                  <button className="btn-icon btn-icon-danger" aria-label="Delete shift"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
