import React, { useMemo } from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
import type { TransactionWithAccounts } from '@/types/transaction'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import './TransactionMetrics.css'

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
          className="transaction-metrics__trend transaction-metrics__trend--neutral"
        >
          ─
        </Typography>
      )
    }

    const isPositive = change > 0
    const icon = isPositive ? '↑' : '↓'
    const className = isPositive
      ? 'transaction-metrics__trend--up'
      : 'transaction-metrics__trend--down'

    return (
      <Typography
        component="span"
        className={`transaction-metrics__trend ${className}`}
      >
        {icon} {Math.abs(change).toFixed(1)}% vs last month
      </Typography>
    )
  }

  const currentMonthName = new Date()
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase()

  return (
    <Box className="transaction-metrics">
      <Paper elevation={0} className="transaction-metrics__card transaction-metrics__card--income">
        <Box className="transaction-metrics__header">
          <Typography component="span" className="transaction-metrics__label">
            TOTAL INCOME ({currentMonthName})
          </Typography>
        </Box>
        <Typography className="transaction-metrics__value">
          {formatCurrency(metrics.totalIncome)}
        </Typography>
        <Box className="transaction-metrics__footer">
          {renderTrendIndicator(metrics.incomeChange)}
        </Box>
      </Paper>

      <Paper elevation={0} className="transaction-metrics__card transaction-metrics__card--expenses">
        <Box className="transaction-metrics__header">
          <Typography component="span" className="transaction-metrics__label">
            TOTAL EXPENSES ({currentMonthName})
          </Typography>
        </Box>
        <Typography className="transaction-metrics__value">
          -{formatCurrency(metrics.totalExpenses)}
        </Typography>
        <Box className="transaction-metrics__footer">
          {renderTrendIndicator(metrics.expenseChange)}
        </Box>
      </Paper>
    </Box>
  )
}

export default TransactionMetrics
