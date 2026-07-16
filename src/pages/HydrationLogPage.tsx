import { Droplets, CupSoda } from 'lucide-react';
import HydrationTimer from '@/components/worker/HydrationTimer';

const mockBreaks = [
  { id: '1', time: '10:15 AM', amount: '250ml' },
  { id: '2', time: '09:45 AM', amount: '250ml' },
  { id: '3', time: '09:15 AM', amount: '500ml' },
  { id: '4', time: '08:30 AM', amount: '250ml' },
];

export default function HydrationLogPage() {
  return (
    <div className="space-y-6 animate-fade-up max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1">Hydration Tracker</h2>
        <p className="text-[var(--color-text-muted)] text-sm">Stay hydrated. Drink at least 250ml every 30 minutes.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <HydrationTimer />
        
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Droplets size={18} className="text-blue-400" /> Today's Log (1.25L)
          </h3>
          <div className="space-y-3">
            {mockBreaks.map((b) => (
              <div key={b.id} className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                <div className="flex items-center gap-2 text-sm">
                  <CupSoda size={16} className="text-blue-400" />
                  <span>{b.amount} Water</span>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{b.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
