import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 20, md: 32, lg: 48 };

export default function Spinner({ label = 'Loading...', size = 'md' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={sizes[size]} className="animate-spin text-orange-400" />
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
