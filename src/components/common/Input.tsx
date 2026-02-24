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
}: InputProps): JSX.Element {
  const generatedId = useId()
  const id = providedId || generatedId
  const errorId = error ? `${id}-error` : undefined
  const helperId = helperText ? `${id}-helper` : undefined
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
      className={className || undefined}
    >
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: '0.25rem',
          }}
        >
          {label}
          {required && (
            <span
              style={{ color: 'var(--error-color)', marginLeft: '0.15rem' }}
            >
              *
            </span>
          )}
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
          className: error ? 'input-error' : undefined,
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
