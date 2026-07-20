interface SpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 20, md: 32, lg: 44 };

export default function Spinner({ label = 'Loading...', size = 'md' }: SpinnerProps) {
  const px = sizes[size];
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <span
        className="relative inline-flex"
        style={{ width: px, height: px }}
        role="status"
        aria-label={label}
      >
        <span
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: 'var(--border)' }}
        />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: 'var(--info)', animationDuration: '0.8s' }}
        />
      </span>
      <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
