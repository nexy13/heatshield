import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, label, id, options = [], children, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full text-left">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={`input-field bg-[var(--bg-white)] appearance-none cursor-pointer ${
            error ? 'border-red-500 focus:border-red-500' : ''
          } ${className}`}
          style={{ 
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234A4A44' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, 
            backgroundRepeat: 'no-repeat', 
            backgroundPosition: 'right 0.75rem center', 
            backgroundSize: '1rem' 
          }}
          {...props}
        >
          {children || options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
