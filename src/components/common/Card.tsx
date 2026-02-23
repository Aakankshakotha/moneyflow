import type { HTMLAttributes, ReactNode } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  title?: string
  subtitle?: string
  footer?: ReactNode
  noPadding?: boolean
  hoverable?: boolean
}

export function Card({
  children,
  title,
  subtitle,
  footer,
  noPadding = false,
  hoverable = true,
  className = '',
  ...rest
}: CardProps) {
  const classes = [
    'card',
    hoverable && 'card-hoverable',
    noPadding && 'card-no-padding',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Paper
      component="article"
      elevation={0}
      className={classes}
      sx={{
        border: '1px solid',
        borderColor: 'var(--border-color)',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--card-background)',
      }}
      {...rest}
    >
      {title && (
        <Box
          className="card-header"
          sx={{ px: 3, py: 2, borderBottom: '1px solid var(--border-color)' }}
        >
          <Typography component="h3" className="card-title" variant="h6">
            {title}
          </Typography>
          {subtitle && (
            <Typography
              className="card-subtitle"
              variant="body2"
              sx={{ color: 'var(--text-secondary)' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      <Box className="card-body" sx={{ p: noPadding ? 0 : 3 }}>
        {children}
      </Box>
      {footer && (
        <Box
          className="card-footer"
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid var(--border-color)',
            background: 'var(--background-secondary)',
          }}
        >
          {footer}
        </Box>
      )}
    </Paper>
  )
}
