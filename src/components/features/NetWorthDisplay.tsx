import React from 'react'
import { Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import type { NetWorthCalculation } from '@/types/netWorth'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

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
      <Card sx={{ p: '2rem' }}>
        <Box sx={{ textAlign: 'center', p: '2rem', color: 'var(--text-secondary)' }}>Loading...</Box>
      </Card>
    )
  }

  const isPositive = calculation.netWorth >= 0

  return (
    <Card sx={{ p: '2rem' }}>
      <Typography variant="h5" component="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, m: 0, mb: '1rem', color: 'var(--text-primary)' }}>Net Worth</Typography>
      <Box sx={{ fontSize: '2.5rem', fontWeight: 700, m: '1rem 0 2rem', color: isPositive ? '#10b981' : '#ef4444' }}>
        {formatCurrency(calculation.netWorth)}
      </Box>

      <Box sx={{ display: 'flex', gap: '2rem', m: '2rem 0', py: '1.5rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assets</Typography>
          <Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>
            {formatCurrency(calculation.totalAssets)}
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {calculation.assetCount}{' '}
            {calculation.assetCount === 1 ? 'account' : 'accounts'}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Liabilities</Typography>
          <Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b' }}>
            {formatCurrency(calculation.totalLiabilities)}
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {calculation.liabilityCount}{' '}
            {calculation.liabilityCount === 1 ? 'account' : 'accounts'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: '1.5rem', pt: '1rem', textAlign: 'center' }}>
        <Typography component="span" sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          As of {new Date(calculation.calculatedAt).toLocaleString()}
        </Typography>
      </Box>
    </Card>
  )
}

export default NetWorthDisplay
