import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import type { SxProps, Theme } from '@mui/material/styles'
import { formatCurrency } from '@/utils/currencyUtils'

export interface StatCardProps {
  label: string
  value: number
  /** Optional accent colour for the value (defaults to --text-primary) */
  valueColor?: string
  /** Optional left-border accent colour */
  accentColor?: string
  /** Optional footer node rendered below the value */
  footer?: React.ReactNode
  sx?: SxProps<Theme>
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  valueColor,
  accentColor,
  footer,
  sx,
}) => {
  return (
    <Paper
      elevation={0}
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          border: '1px solid', borderColor: 'divider',
          borderRadius: '12px',
          p: '1rem 1.15rem',
          boxShadow: 2,
          ...(accentColor && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              backgroundColor: accentColor,
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Typography
        component="span"
        sx={{
          display: 'block',
          m: 0,
          color: 'text.secondary',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          mt: '0.35rem',
          mb: footer ? '0.5rem' : 0,
          color: valueColor ?? 'text.primary',
          fontSize: '1.75rem',
          fontWeight: 700,
        }}
      >
        {formatCurrency(value)}
      </Box>
      {footer && <Box>{footer}</Box>}
    </Paper>
  )
}
