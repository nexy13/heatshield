import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, id, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full text-left">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
