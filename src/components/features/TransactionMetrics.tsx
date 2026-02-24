import React, { useMemo } from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
import type { TransactionWithAccounts } from '@/types/transaction'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

interface TransactionMetricsProps {
  transactions: TransactionWithAccounts[]
}

/**
 * TransactionMetrics - displays summary metrics for transactions
 */
const TransactionMetrics: React.FC<TransactionMetricsProps> = ({
  transactions,
}) => {
  const metrics = useMemo(() => {
    let totalIncome = 0
    let totalExpenses = 0
    let previousMonthIncome = 0
    let previousMonthExpenses = 0

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    transactions.forEach((txn) => {
      const txnDate = new Date(txn.date)
      const txnMonth = txnDate.getMonth()
      const txnYear = txnDate.getFullYear()
      const isCurrentMonth =
        txnMonth === currentMonth && txnYear === currentYear
      const isPreviousMonth =
        (txnMonth === currentMonth - 1 && txnYear === currentYear) ||
        (currentMonth === 0 && txnMonth === 11 && txnYear === currentYear - 1)

      // Income: from income account to asset account
      if (txn.fromAccount.type === 'income' && txn.toAccount.type === 'asset') {
        if (isCurrentMonth) {
          totalIncome += txn.amount
        }
        if (isPreviousMonth) {
          previousMonthIncome += txn.amount
        }
      }

      // Expense: from asset to expense account
      if (
        txn.fromAccount.type === 'asset' &&
        txn.toAccount.type === 'expense'
      ) {
        if (isCurrentMonth) {
          totalExpenses += txn.amount
        }
        if (isPreviousMonth) {
          previousMonthExpenses += txn.amount
        }
      }
    })

    const incomeChange =
      previousMonthIncome > 0
        ? ((totalIncome - previousMonthIncome) / previousMonthIncome) * 100
        : 0

    const expenseChange =
      previousMonthExpenses > 0
        ? ((totalExpenses - previousMonthExpenses) / previousMonthExpenses) *
          100
        : 0

    return {
      totalIncome,
      totalExpenses,
      incomeChange,
      expenseChange,
    }
  }, [transactions])

  const renderTrendIndicator = (change: number): JSX.Element => {
    if (Math.abs(change) < 0.1) {
      return (
        <Typography
          component="span"
          sx={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
        >
          ─
        </Typography>
      )
    }

    const isPositive = change > 0
    const icon = isPositive ? '↑' : '↓'
    const trendColor = isPositive ? '#10b981' : '#ef4444'

    return (
      <Typography
        component="span"
        sx={{ fontSize: '0.75rem', fontWeight: 500, color: trendColor }}
      >
        {icon} {Math.abs(change).toFixed(1)}% vs last month
      </Typography>
    )
  }

  const currentMonthName = new Date()
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase()

  const cardBaseSx = {
    position: 'relative' as const,
    overflow: 'hidden',
    p: '1.25rem',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--card-background)',
    flex: 1,
    minWidth: '220px',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
    },
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          ...cardBaseSx,
          '&::before': {
            ...cardBaseSx['&::before'],
            backgroundColor: '#10b981',
          },
        }}
      >
        <Box sx={{ mb: '0.5rem' }}>
          <Typography
            component="span"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
            }}
          >
            TOTAL INCOME ({currentMonthName})
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            mb: '0.5rem',
          }}
        >
          {formatCurrency(metrics.totalIncome)}
        </Typography>
        <Box>{renderTrendIndicator(metrics.incomeChange)}</Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          ...cardBaseSx,
          '&::before': {
            ...cardBaseSx['&::before'],
            backgroundColor: '#ef4444',
          },
        }}
      >
        <Box sx={{ mb: '0.5rem' }}>
          <Typography
            component="span"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
            }}
          >
            TOTAL EXPENSES ({currentMonthName})
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            mb: '0.5rem',
          }}
        >
          -{formatCurrency(metrics.totalExpenses)}
        </Typography>
        <Box>{renderTrendIndicator(metrics.expenseChange)}</Box>
      </Paper>
    </Box>
  )
}

export default TransactionMetrics
