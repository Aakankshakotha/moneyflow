import React from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

export interface MetricCardProps {
  title: string
  value: number
  trend?: {
    value: number
    direction: 'up' | 'down'
    period: string
  }
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'pink' | 'purple'
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  icon,
  color = 'blue',
}) => {
  const iconBg: Record<string, { bg: string; color: string }> = {
    blue: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
    green: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    pink: { bg: 'rgba(236,72,153,0.1)', color: '#ec4899' },
    purple: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  }
  const iconStyle = iconBg[color] ?? iconBg.blue

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'var(--card-background)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          {title}
        </Typography>
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              backgroundColor: iconStyle.bg,
              color: iconStyle.color,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      <Typography
        sx={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '12px 0 8px',
          lineHeight: 1.2,
          wordBreak: 'break-word',
        }}
      >
        {formatCurrency(value)}
      </Typography>
      {trend && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: trend.direction === 'up' ? '#10b981' : '#ef4444',
            }}
          >
            {trend.direction === 'up' ? '↑' : '↓'}{' '}
            {formatCurrency(Math.abs(trend.value))}
          </Typography>
          <Typography component="span" sx={{ color: 'var(--text-secondary)' }}>
            {trend.period}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
