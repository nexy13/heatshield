import SOSButton from '@/components/worker/SOSButton';
import { useAuth } from '@/context/AuthContext';
import { Phone } from 'lucide-react';

export default function SOSPage() {
  const { profile } = useAuth();

  const handleSOS = async (lat?: number, lng?: number, desc?: string) => {
    // In production, this would call triggerSOS() from the API
    // For demo, simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('SOS triggered:', { lat, lng, desc, user: profile?.name });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      <SOSButton onTrigger={handleSOS} />

      {/* Emergency contacts */}
      <div className="mt-12 glass rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
          Emergency Contacts
        </h3>
        <div className="space-y-3">
          <a
            href="tel:112"
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-red-500/10 transition-colors"
          >
            <Phone size={18} className="text-red-400" />
            <div>
              <p className="text-sm font-medium">National Emergency</p>
              <p className="text-xs text-[var(--color-text-muted)]">112</p>
            </div>
          </a>
          <a
            href="tel:108"
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-red-500/10 transition-colors"
          >
            <Phone size={18} className="text-indigo-400" />
            <div>
              <p className="text-sm font-medium">Ambulance</p>
              <p className="text-xs text-[var(--color-text-muted)]">108</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
