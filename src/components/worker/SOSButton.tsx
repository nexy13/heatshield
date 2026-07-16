import { useState, useCallback } from 'react';
import { Siren, MapPin, Loader2, CheckCircle2, Phone } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAlerts } from '@/context/AlertContext';

interface SOSButtonProps {
  onTrigger: (latitude?: number, longitude?: number, description?: string) => Promise<void>;
  disabled?: boolean;
}

export default function SOSButton({ onTrigger, disabled }: SOSButtonProps) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'sending' | 'sent'>('idle');
  const { position, loading: geoLoading, refresh: refreshGeo } = useGeolocation(false);
  const { addToast } = useAlerts();

  const handlePress = useCallback(() => {
    setStep('confirm');
    refreshGeo();
  }, [refreshGeo]);

  const handleConfirm = useCallback(async () => {
    setStep('sending');
    try {
      await onTrigger(position?.latitude, position?.longitude);
      setStep('sent');
      addToast({
        type: 'error',
        title: '🚨 SOS Sent!',
        message: 'Emergency alert has been sent to your supervisor and emergency contacts.',
        duration: 6000,
      });
      setTimeout(() => setStep('idle'), 5000);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'SOS Failed',
        message: err instanceof Error ? err.message : 'Could not send SOS. Try calling emergency contacts directly.',
        duration: 8000,
      });
      setStep('idle');
    }
  }, [onTrigger, position, addToast]);

  const handleCancel = useCallback(() => {
    setStep('idle');
  }, []);

  if (step === 'sent') {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-up">
        <div className="w-40 h-40 rounded-full bg-emerald-500/20 border-4 border-emerald-500/50 flex items-center justify-center">
          <CheckCircle2 size={64} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-emerald-400 mb-1">SOS Sent Successfully</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Help is on the way. Stay calm and stay where you are.
          </p>
        </div>
        {position && (
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-indigo-400" />
            <span>
              Location shared: {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-up">
        <div className="sos-button flex items-center justify-center">
          <Siren size={48} className="animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-red-400 mb-2">Confirm Emergency SOS?</h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
            This will immediately alert your supervisor, send your GPS location, and notify emergency contacts.
          </p>
        </div>

        {geoLoading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Loader2 size={14} className="animate-spin" />
            Getting your location...
          </div>
        )}

        {position && (
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-xs">
            <MapPin size={14} className="text-emerald-400" />
            <span>
              {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)} (±{Math.round(position.accuracy)}m)
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleCancel} className="btn-secondary px-6 py-3 rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn-danger px-8 py-3 rounded-xl flex items-center gap-2 text-lg font-bold"
          >
            <Siren size={20} />
            SEND SOS
          </button>
        </div>
      </div>
    );
  }

  if (step === 'sending') {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-up">
        <div className="sos-button flex items-center justify-center opacity-60">
          <Loader2 size={48} className="animate-spin" />
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">Sending emergency alert...</p>
      </div>
    );
  }

  // Idle state — main SOS button
  return (
    <div className="flex flex-col items-center gap-8">
      <button
        onClick={handlePress}
        disabled={disabled}
        className="sos-button flex items-center justify-center disabled:opacity-40"
        aria-label="Trigger SOS Emergency"
      >
        <span>SOS</span>
      </button>
      <div className="text-center">
        <p className="text-lg font-semibold mb-1">Emergency SOS</p>
        <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
          Press the button if you feel unwell, dizzy, or in danger. Help will be sent immediately.
        </p>
      </div>
      <a
        href="tel:112"
        className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <Phone size={16} />
        Call Emergency: 112
      </a>
    </div>
  );
}
