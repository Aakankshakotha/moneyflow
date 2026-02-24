import type { HTMLAttributes, ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  children: ReactNode
  title?: string
  subtitle?: string
  footer?: ReactNode
  noPadding?: boolean
  hoverable?: boolean
  sx?: SxProps<Theme>
}

export function Card({
  children,
  title,
  subtitle,
  footer,
  noPadding = false,
  hoverable = true,
  sx: sxProp,
  className = '',
  ...rest
}: CardProps) {
  return (
    <Paper
      component="article"
      elevation={0}
      className={className || undefined}
      sx={[
        {
          border: '1px solid',
          borderColor: 'var(--border-color)',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--card-background)',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--shadow-soft)',
          overflow: 'hidden',
          ...(hoverable && {
            '&:hover': {
              boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
              borderColor: 'var(--border-color-hover)',
            },
          }),
        },
        ...(Array.isArray(sxProp) ? sxProp : sxProp ? [sxProp] : []),
      ]}
      {...rest}
    >
      {title && (
        <Box
          sx={{ px: 3, py: 2, borderBottom: '1px solid var(--border-color)' }}
        >
          <Typography
            component="h3"
            variant="h6"
            sx={{ m: 0, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{ mt: '0.25rem', color: 'var(--text-secondary)' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      <Box sx={{ p: noPadding ? 0 : 3 }}>{children}</Box>
      {footer && (
        <Box
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
