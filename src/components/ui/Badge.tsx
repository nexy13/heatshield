import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'orange'
  | 'danger'
  | 'info'
  | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Adds the pulsing "live" treatment (maps to .badge-live). */
  live?: boolean;
  /** Leading status dot in the badge's own colour. */
  dot?: boolean;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  orange: 'badge-orange',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

/**
 * Status badge primitive. A thin wrapper over the existing .badge / .badge-*
 * CSS so every screen renders consistent pills without re-declaring classes.
 */
export function Badge({ variant = 'neutral', live = false, dot = false, className = '', children, ...props }: BadgeProps) {
  return (
    <span className={`badge ${VARIANT_CLASS[variant]} ${live ? 'badge-live' : ''} ${className}`} {...props}>
      {dot && <span className="status-dot" style={{ background: 'currentColor' }} aria-hidden="true" />}
      {children}
    </span>
  );
}
