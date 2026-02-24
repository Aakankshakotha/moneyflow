import { SelectHTMLAttributes, useId, type FocusEvent } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import NativeSelect from '@mui/material/NativeSelect'
import FormHelperText from '@mui/material/FormHelperText'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'color' | 'size'
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
}: SelectProps): JSX.Element {
  const generatedId = useId()
  const selectId = id || generatedId
  const descriptionId =
    error || helperText ? `${selectId}-description` : undefined
  const labelId = `${selectId}-label`

  return (
    <Box className={`select-container ${className}`.trim()}>
      <FormControl fullWidth size="small" error={Boolean(error)}>
        {label && (
          <InputLabel htmlFor={selectId} id={labelId} shrink>
            {label}
            {required && <span className="select-required">*</span>}
          </InputLabel>
        )}
        <NativeSelect
          id={selectId}
          aria-describedby={descriptionId}
          aria-invalid={error ? 'true' : undefined}
          required={required}
          disabled={disabled}
          onChange={onChange}
          onBlur={(event) => {
            onBlur?.(event as unknown as FocusEvent<HTMLSelectElement>)
          }}
          onFocus={(event) => {
            onFocus?.(event as unknown as FocusEvent<HTMLSelectElement>)
          }}
          value={value}
          inputProps={{
            className: error ? 'select-error' : undefined,
            'aria-label': label || placeholder || 'Select',
          }}
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
        </NativeSelect>
        {(error || helperText) && (
          <FormHelperText id={descriptionId}>
            {error || helperText}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  )
}
