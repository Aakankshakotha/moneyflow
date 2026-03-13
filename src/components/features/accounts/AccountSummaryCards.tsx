import React from 'react'
import Box from '@mui/material/Box'
import { StatCard } from '@/components/common'

interface AccountSummaryCardsProps {
  netWorth: number
  totalAssets: number
  totalLiabilities: number
}

export const AccountSummaryCards: React.FC<AccountSummaryCardsProps> = ({
  netWorth,
  totalAssets,
  totalLiabilities,
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '1rem',
        mb: '1.25rem',
      }}
    >
      <StatCard label="Net Worth" value={netWorth} />
      <StatCard label="Total Assets" value={totalAssets} />
      <StatCard label="Total Liabilities" value={totalLiabilities} />
    </Box>
  )
}
