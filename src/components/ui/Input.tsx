import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  /** Optional icon rendered inside the field on the left. */
  leftIcon?: React.ReactNode;
  /** Optional element rendered inside the field on the right (e.g. a password toggle). */
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, id, leftIcon, trailing, style, ...props }, ref) => {
    const hasAffix = Boolean(leftIcon || trailing);

    // Icon spacing must be inline: the unlayered `.input-field` padding would
    // otherwise beat a layered `pl-*`/`pr-*` utility.
    const affixStyle: React.CSSProperties = {
      ...(leftIcon ? { paddingLeft: '2.5rem' } : null),
      ...(trailing ? { paddingRight: '2.75rem' } : null),
      ...style,
    };

    const input = (
      <input
        id={id}
        ref={ref}
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
        style={hasAffix ? affixStyle : style}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    );

    return (
      <div className="w-full text-left" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            {label}
          </label>
        )}
        {hasAffix ? (
          <div className="relative">
            {leftIcon && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)] pointer-events-none flex" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {input}
            {trailing && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 flex">{trailing}</span>
            )}
          </div>
        ) : (
          input
        )}
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
