import type { ButtonHTMLAttributes, ReactNode } from 'react'
import MuiButton from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'color'
> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    disabled && 'btn-disabled',
    loading && 'btn-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  const muiVariant = variant === 'ghost' ? 'outlined' : 'contained'
  const muiColor: 'primary' | 'secondary' | 'error' =
    variant === 'danger'
      ? 'error'
      : variant === 'secondary'
        ? 'secondary'
        : 'primary'

  const sxBySize = {
    sm: { py: 0.5, px: 1.5, fontSize: '0.875rem' },
    md: { py: 0.75, px: 2, fontSize: '0.875rem' },
    lg: { py: 1, px: 2.5, fontSize: '1rem' },
  } as const

  return (
    <MuiButton
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      variant={muiVariant}
      color={muiColor}
      fullWidth={fullWidth}
      sx={{
        textTransform: 'none',
        borderRadius: '0.5rem',
        boxShadow: 'none',
        '&.Mui-disabled': {
          pointerEvents: 'auto',
        },
        ...sxBySize[size],
      }}
      {...rest}
    >
      {loading && <CircularProgress size={16} color="inherit" />}
      {children}
    </MuiButton>
  )
}
