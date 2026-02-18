import React from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
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
    <div className={`metric-card metric-card--${color}`}>
      <div className="metric-card__header">
        <span className="metric-card__title">{title}</span>
        {icon && <div className="metric-card__icon">{icon}</div>}
      </div>
      <div className="metric-card__value">{formatCurrency(value)}</div>
      {trend && (
        <div className="metric-card__trend">
          <span
            className={`metric-card__trend-value metric-card__trend-value--${trend.direction}`}
          >
            {trend.direction === 'up' ? '↑' : '↓'}{' '}
            {formatCurrency(Math.abs(trend.value))}
          </span>
          <span className="metric-card__trend-period">{trend.period}</span>
        </div>
      )}
    </div>
  )
}
