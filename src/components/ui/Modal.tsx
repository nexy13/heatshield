import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Max width. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Hide the top-right close button. */
  hideClose?: boolean;
  /** Disable closing on backdrop click / ESC (e.g. destructive confirmations). */
  disableBackdropClose?: boolean;
  className?: string;
}

const SIZES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Accessible dialog primitive built on the existing .modal-overlay/.modal-card
 * styles. Closes on ESC and backdrop click, restores focus on unmount, and
 * exposes role="dialog" + aria-modal for screen readers.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideClose = false,
  disableBackdropClose = false,
  className = '',
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableBackdropClose) onClose();
    };
    document.addEventListener('keydown', onKey);

    // Move focus into the dialog for keyboard users.
    const t = window.setTimeout(() => {
      const focusable = cardRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])'
      );
      (focusable ?? cardRef.current)?.focus();
    }, 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose, disableBackdropClose]);

  if (!open) return null;

  const labelledById = title ? 'ui-modal-title' : undefined;
  const describedById = description ? 'ui-modal-desc' : undefined;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !disableBackdropClose) onClose();
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        aria-describedby={describedById}
        tabIndex={-1}
        className={`modal-card w-full ${SIZES[size]} p-6 outline-none ${className}`}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="text-left">
              {title && (
                <h3 id={labelledById} className="font-serif text-lg font-bold text-[var(--text)]">
                  {title}
                </h3>
              )}
              {description && (
                <p id={describedById} className="text-xs text-[var(--text-muted)] mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {!hideClose && (
              <button type="button" onClick={onClose} className="btn-icon shrink-0" aria-label="Close dialog">
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="text-left">{children}</div>

        {footer && <div className="flex items-center justify-end gap-3 mt-6">{footer}</div>}
      </div>
    </div>
  );
}
