import React, { useId } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label to the right of the box. */
  label?: React.ReactNode;
  /** Optional error text shown below. */
  error?: string;
}

/**
 * Accessible checkbox primitive. Renders a real <input type="checkbox">
 * (full keyboard + screen-reader support) with a labelled, focus-visible box.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, error, id, disabled, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1 text-left">
        <label
          htmlFor={inputId}
          className={`ui-checkbox ${disabled ? 'ui-checkbox-disabled' : ''}`}
        >
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={`ui-checkbox-input ${className}`}
            aria-invalid={error ? true : undefined}
            {...props}
          />
          {label && <span className="ui-checkbox-label">{label}</span>}
        </label>
        {error && <p className="text-xs text-red-500 font-medium pl-7">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
