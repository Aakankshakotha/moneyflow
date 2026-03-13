import React, { useMemo, useState } from 'react'
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
import MuiButton from '@mui/material/Button'
import { useTheme, alpha } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'

type Period = '1m' | '1y' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  '1m': 'Month',
  '1y': 'Year',
  all: 'All',
}

/**
 * Dashboard page - displays financial overview with charts and metrics
 */
const Dashboard: React.FC = () => {
  const { accounts, transactions, metrics, loading, error } = useDashboardData()
  const {
    netWorth,
    totalAssets,
    totalLiabilities,
    cashFlow,
    income,
    expenses,
    lastMonthIncome,
    lastMonthExpenses,
    lastMonthCashFlow,
  } = metrics
  const muiTheme = useTheme()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('1m')

  const filteredTransactions = useMemo(() => {
    const now = new Date()
    if (period === '1m') {
      return transactions.filter((t) => {
        const d = new Date(t.date)
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        )
      })
    }
    if (period === '1y') {
      return transactions.filter(
        (t) => new Date(t.date).getFullYear() === now.getFullYear()
      )
    }
    return transactions
  }, [transactions, period])

  const trendPeriodMonths = useMemo(() => {
    if (period === '1m') return 1
    if (period === '1y') return 12
    if (transactions.length === 0) return 6
    const earliest = transactions.reduce((min, t) => {
      const d = new Date(t.date)
      return d < min ? d : min
    }, new Date())
    const now = new Date()
    return Math.max(
      1,
      (now.getFullYear() - earliest.getFullYear()) * 12 +
        now.getMonth() -
        earliest.getMonth() +
        1
    )
  }, [period, transactions])

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

  // ── Onboarding: no accounts set up yet ──────────────────────────────────────
  if (!loading && accounts.length === 0) {
    const steps = [
      {
        icon: '🏦',
        title: 'Add your accounts',
        desc: 'Start by adding your bank, credit card, or investment accounts so we know where your money lives.',
        cta: 'Add Account',
        route: '/accounts',
      },
      {
        icon: '💸',
        title: 'Record a transaction',
        desc: 'Log income, expenses, or transfers between accounts to start building your financial picture.',
        cta: 'Add Transaction',
        route: '/transactions',
      },
      {
        icon: '🔁',
        title: 'Set up recurring payments',
        desc: 'Automate your rent, subscriptions, or salary so nothing gets missed.',
        cta: 'Add Recurring',
        route: '/recurring',
      },
    ]
    return (
      <Box
        sx={{
          padding: '3rem 2rem',
          maxWidth: '860px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: '3rem', lineHeight: 1, mb: 2 }}>
          👋
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'text.primary',
            mb: 1,
          }}
        >
          Welcome to MoneyFlow
        </Typography>
        <Typography
          sx={{
            fontSize: '1rem',
            color: 'text.secondary',
            mb: '3rem',
            maxWidth: '520px',
            mx: 'auto',
          }}
        >
          Your personal finance dashboard is ready. Follow these three steps to
          get started.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            textAlign: 'left',
            mb: '2.5rem',
          }}
        >
          {steps.map((step, i) => (
            <Box
              key={step.route}
              sx={{
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                p: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: `"${i + 1}"`,
                  position: 'absolute',
                  top: '1rem',
                  right: '1.25rem',
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: alpha(muiTheme.palette.text.primary, 0.05),
                  lineHeight: 1,
                },
              }}
            >
              <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>
                {step.icon}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'text.primary',
                }}
              >
                {step.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {step.desc}
              </Typography>
              <MuiButton
                variant="contained"
                size="small"
                onClick={() => navigate(step.route)}
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
              >
                {step.cta}
              </MuiButton>
            </Box>
          ))}
        </Box>

        <MuiButton
          variant="outlined"
          size="large"
          onClick={() => navigate('/accounts')}
          sx={{
            textTransform: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            px: 4,
          }}
        >
          Get Started →
        </MuiButton>
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
            {period === '1m' &&
              new Date().toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            {period === '1y' && `Jan – Dec ${new Date().getFullYear()}`}
            {period === 'all' && 'All time'}
          </Typography>
        </Box>

        {/* Period pill selector */}
        <Box
          sx={{
            display: 'inline-flex',
            backgroundColor: alpha(muiTheme.palette.text.primary, 0.06),
            borderRadius: '12px',
            p: '4px',
            gap: '2px',
          }}
        >
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <Box
              key={p}
              component="button"
              onClick={() => setPeriod(p)}
              sx={{
                border: 'none',
                cursor: 'pointer',
                px: 2.5,
                py: 1,
                borderRadius: '9px',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.18s ease',
                backgroundColor:
                  period === p ? 'background.paper' : 'transparent',
                color: period === p ? 'text.primary' : 'text.secondary',
                boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.14)' : 'none',
              }}
            >
              {PERIOD_LABELS[p]}
            </Box>
          ))}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* No-data banner for the selected period */}
      {filteredTransactions.length === 0 && transactions.length > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 2, borderRadius: '12px', alignItems: 'center' }}
          action={
            <MuiButton
              color="inherit"
              size="small"
              onClick={() => navigate('/transactions')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Add Transaction
            </MuiButton>
          }
        >
          No transactions found for{' '}
          {period === '1m'
            ? new Date().toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            : period === '1y'
              ? new Date().getFullYear()
              : 'this period'}
          . Charts will appear once you record a transaction.
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
        />
        <MetricCard
          title="Total Assets"
          value={totalAssets}
          icon={<Box component="span">💰</Box>}
          color="green"
        />
        <MetricCard
          title="Liabilities"
          value={totalLiabilities}
          icon={<Box component="span">📉</Box>}
          color="pink"
        />
        <MetricCard
          title="Cash Flow"
          value={cashFlow}
          icon={<Box component="span">📊</Box>}
          color="purple"
          trend={{
            value: cashFlow - lastMonthCashFlow,
            direction: cashFlow >= lastMonthCashFlow ? 'up' : 'down',
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
          <MoneyFlowChart
            transactions={filteredTransactions}
            accounts={accounts}
          />
        </Box>
        <Box
          sx={{
            minHeight: '470px',
            display: 'flex',
            '& > *': { width: '100%', height: '100%' },
          }}
        >
          <ExpensesChart
            transactions={filteredTransactions}
            accounts={accounts}
          />
        </Box>
      </Box>

      <Box sx={{ width: '100%', mb: '2rem' }}>
        <CashFlowTrendChart
          transactions={filteredTransactions}
          accounts={accounts}
          periodMonths={trendPeriodMonths}
        />
      </Box>

      <Box sx={{ width: '100%', mb: '2rem' }}>
        <RecentTransactionsTable
          transactions={filteredTransactions}
          limit={10}
        />
      </Box>
    </Box>
  )
}

export default Dashboard
