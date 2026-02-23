import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import FormHelperText from '@mui/material/FormHelperText'

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
  onChange,
  onBlur,
  onFocus,
  value,
  defaultValue,
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
    <Box className={containerClasses}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <InputBase
        id={id}
        type={type}
        required={required}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        value={value}
        defaultValue={defaultValue}
        fullWidth
        inputProps={{
          ...rest,
          className: inputClasses,
          'aria-invalid': error ? 'true' : undefined,
          'aria-describedby': describedBy,
        }}
        sx={{
          px: 1.5,
          py: 1,
          border: '1px solid',
          borderColor: error ? 'error.main' : 'var(--border-color)',
          borderRadius: '0.375rem',
          backgroundColor: 'var(--input-background)',
          '&:focus-within': {
            borderColor: 'var(--primary-color)',
            backgroundColor: 'var(--input-background-focus)',
          },
        }}
      />
      {error && (
        <FormHelperText id={errorId} error>
          {error}
        </FormHelperText>
      )}
      {helperText && !error && (
        <FormHelperText id={helperId}>{helperText}</FormHelperText>
      )}
    </Box>
  )
}
