import React from 'react'
import {
  CashFlowTrendChart,
  MoneyFlowChart,
  ExpensesChart,
  RecentTransactionsTable,
} from '@/components/features'
import { MetricCard } from '@/components/common'
import { useDashboardData } from '@/hooks/useDashboardData'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

/**
 * Dashboard page - displays financial overview with charts and metrics
 */
const Dashboard: React.FC = () => {
  const { accounts, transactions, metrics, loading, error } = useDashboardData()
  const { netWorth, totalAssets, totalLiabilities, cashFlow } = metrics

  if (loading) {
    return (
      <Box
        sx={{
          padding: '2rem',
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={20} />
        <Typography>Loading dashboard...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '2rem',
          width: '100%',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: '1.8rem',
              fontWeight: 700,
              m: 0,
              color: 'text.primary',
            }}
          >
            Financial Overview
          </Typography>
          <Typography
            component="p"
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              m: '0.35rem 0 0',
            }}
          >
            Welcome back, here's your money flow for{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          mb: '2rem',
        }}
      >
        <MetricCard
          title="Net Worth"
          value={netWorth}
          icon={<Box component="span">💎</Box>}
          color="blue"
          trend={{
            value: netWorth * 0.023,
            direction: 'up',
            period: 'vs last month',
          }}
        />
        <MetricCard
          title="Total Assets"
          value={totalAssets}
          icon={<Box component="span">💰</Box>}
          color="green"
          trend={{
            value: totalAssets * 0.045,
            direction: 'up',
            period: 'vs last month',
          }}
        />
        <MetricCard
          title="Liabilities"
          value={totalLiabilities}
          icon={<Box component="span">📉</Box>}
          color="pink"
          trend={{
            value: totalLiabilities * 0.033,
            direction: 'down',
            period: 'vs last month',
          }}
        />
        <MetricCard
          title="Cash Flow"
          value={cashFlow}
          icon={<Box component="span">📊</Box>}
          color="purple"
          trend={{
            value: cashFlow * 0.12,
            direction: cashFlow >= 0 ? 'up' : 'down',
            period: 'vs last month',
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.65fr) minmax(0, 1fr)',
          gap: '1.5rem',
          mb: '2rem',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            minHeight: '470px',
            display: 'flex',
            '& > *': { width: '100%', height: '100%' },
          }}
        >
          <MoneyFlowChart transactions={transactions} accounts={accounts} />
        </Box>
        <Box
          sx={{
            minHeight: '470px',
            display: 'flex',
            '& > *': { width: '100%', height: '100%' },
          }}
        >
          <ExpensesChart transactions={transactions} accounts={accounts} />
        </Box>
      </Box>

      <Box sx={{ width: '100%', mb: '2rem' }}>
        <CashFlowTrendChart transactions={transactions} accounts={accounts} />
      </Box>

      <Box sx={{ width: '100%', mb: '2rem' }}>
        <RecentTransactionsTable transactions={transactions} limit={10} />
      </Box>
    </Box>
  )
}

export default Dashboard
