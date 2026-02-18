import React from 'react'
import { Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import type { NetWorthCalculation } from '@/types/netWorth'
import './NetWorthDisplay.css'

interface NetWorthDisplayProps {
  calculation: NetWorthCalculation
  loading?: boolean
}

/**
 * NetWorthDisplay - displays current net worth summary
 */
const NetWorthDisplay: React.FC<NetWorthDisplayProps> = ({
  calculation,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card className="net-worth-display">
        <div className="net-worth-display__loading">Loading...</div>
      </Card>
    )
  }

  const isPositive = calculation.netWorth >= 0

  return (
    <Card className="net-worth-display">
      <h2 className="net-worth-display__title">Net Worth</h2>
      <div
        className={`net-worth-display__value ${isPositive ? 'positive' : 'negative'}`}
      >
        {formatCurrency(calculation.netWorth)}
      </div>

      <div className="net-worth-display__breakdown">
        <div className="net-worth-display__item">
          <span className="net-worth-display__label">Assets</span>
          <span className="net-worth-display__amount asset">
            {formatCurrency(calculation.totalAssets)}
          </span>
          <span className="net-worth-display__count">
            {calculation.assetCount}{' '}
            {calculation.assetCount === 1 ? 'account' : 'accounts'}
          </span>
        </div>

        <div className="net-worth-display__item">
          <span className="net-worth-display__label">Liabilities</span>
          <span className="net-worth-display__amount liability">
            {formatCurrency(calculation.totalLiabilities)}
          </span>
          <span className="net-worth-display__count">
            {calculation.liabilityCount}{' '}
            {calculation.liabilityCount === 1 ? 'account' : 'accounts'}
          </span>
        </div>
      </div>

      <div className="net-worth-display__footer">
        <span className="net-worth-display__timestamp">
          As of {new Date(calculation.calculatedAt).toLocaleString()}
        </span>
      </div>
    </Card>
  )
}

export default NetWorthDisplay
