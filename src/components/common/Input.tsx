import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import './Input.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  id: providedId,
  className = '',
  required = false,
  disabled = false,
  type = 'text',
  ...rest
}: InputProps) {
  const generatedId = useId()
  const id = providedId || generatedId
  const errorId = error ? `${id}-error` : undefined
  const helperId = helperText ? `${id}-helper` : undefined
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

  const containerClasses = ['input-container', className]
    .filter(Boolean)
    .join(' ')

  const inputClasses = ['input', error && 'input-error']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={inputClasses}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error && (
        <p id={errorId} className="input-error-text">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="input-helper-text">
          {helperText}
        </p>
      )}
    </div>
  )
}
