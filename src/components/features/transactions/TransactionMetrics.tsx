import React, { useMemo } from 'react'
import { StatCard } from '@/components/common'
import type { TransactionWithAccounts } from '@/types/transaction'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

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

      // Income: from income account into an asset or liability account
      if (
        txn.fromAccount.type === 'income' &&
        (txn.toAccount.type === 'asset' || txn.toAccount.type === 'liability')
      ) {
        if (isCurrentMonth) {
          totalIncome += txn.amount
        }
        if (isPreviousMonth) {
          previousMonthIncome += txn.amount
        }
      }

      // Expense: from asset or liability (credit card) into an expense account
      if (
        (txn.fromAccount.type === 'asset' ||
          txn.fromAccount.type === 'liability') &&
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

  const renderTrendIndicator = (change: number): React.ReactNode => {
    if (Math.abs(change) < 0.1) {
      return (
        <Typography
          component="span"
          sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
        >
          ─
        </Typography>
      )
    }
    const isPositive = change > 0
    const icon = isPositive ? '↑' : '↓'
    const trendColor = isPositive ? 'success.main' : 'error.main'
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

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        mb: '1.5rem',
      }}
    >
      <StatCard
        label={`TOTAL INCOME (${currentMonthName})`}
        value={metrics.totalIncome}
        valueColor="success.main"
        footer={renderTrendIndicator(metrics.incomeChange)}
        accentColor="success.main"
      />
      <StatCard
        label={`TOTAL EXPENSES (${currentMonthName})`}
        value={-metrics.totalExpenses}
        valueColor="error.main"
        footer={renderTrendIndicator(metrics.expenseChange)}
        accentColor="error.main"
      />
    </Box>
  )
}

export default TransactionMetrics
