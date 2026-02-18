import { SelectHTMLAttributes, useId } from 'react'
import './Select.css'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> {
  label?: string
  options: SelectOption[]
  error?: string
  helperText?: string
  placeholder?: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export function Select({
  label,
  options,
  error,
  helperText,
  placeholder,
  required,
  disabled,
  className = '',
  id,
  onChange,
  onBlur,
  onFocus,
  value,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id || generatedId
  const descriptionId =
    error || helperText ? `${selectId}-description` : undefined

  return (
    <div className={`select-container ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`select ${error ? 'select-error' : ''}`.trim()}
        aria-describedby={descriptionId}
        aria-invalid={error ? 'true' : undefined}
        required={required}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        value={value}
        {...props}
      >
        <option value="" disabled>
          {placeholder || 'Select an option...'}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div id={descriptionId} className="select-error-text">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div id={descriptionId} className="select-helper-text">
          {helperText}
        </div>
      )}
    </div>
  )
}
