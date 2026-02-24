import React from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import './MetricCard.css'

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
  return (
    <Paper
      elevation={0}
      className={`metric-card metric-card--${color}`}
    >
      <Box className="metric-card__header">
        <Typography component="span" className="metric-card__title">
          {title}
        </Typography>
        {icon && <Box className="metric-card__icon">{icon}</Box>}
      </Box>
      <Typography className="metric-card__value">
        {formatCurrency(value)}
      </Typography>
      {trend && (
        <Box className="metric-card__trend">
          <Typography
            component="span"
            className={`metric-card__trend-value metric-card__trend-value--${trend.direction}`}
          >
            {trend.direction === 'up' ? '↑' : '↓'}{' '}
            {formatCurrency(Math.abs(trend.value))}
          </Typography>
          <Typography component="span" className="metric-card__trend-period">
            {trend.period}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
