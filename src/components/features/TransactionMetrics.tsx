import React, { useMemo } from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
import type { TransactionWithAccounts } from '@/types/transaction'
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
        <span className="transaction-metrics__trend transaction-metrics__trend--neutral">
          ─
        </span>
      )
    }

    const isPositive = change > 0
    const icon = isPositive ? '↑' : '↓'
    const className = isPositive
      ? 'transaction-metrics__trend--up'
      : 'transaction-metrics__trend--down'

    return (
      <span className={`transaction-metrics__trend ${className}`}>
        {icon} {Math.abs(change).toFixed(1)}% vs last month
      </span>
    )
  }

  const currentMonthName = new Date()
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase()

  return (
    <div className="transaction-metrics">
      <div className="transaction-metrics__card transaction-metrics__card--income">
        <div className="transaction-metrics__header">
          <span className="transaction-metrics__label">
            TOTAL INCOME ({currentMonthName})
          </span>
        </div>
        <div className="transaction-metrics__value">
          {formatCurrency(metrics.totalIncome)}
        </div>
        <div className="transaction-metrics__footer">
          {renderTrendIndicator(metrics.incomeChange)}
        </div>
      </div>

      <div className="transaction-metrics__card transaction-metrics__card--expenses">
        <div className="transaction-metrics__header">
          <span className="transaction-metrics__label">
            TOTAL EXPENSES ({currentMonthName})
          </span>
        </div>
        <div className="transaction-metrics__value">
          -{formatCurrency(metrics.totalExpenses)}
        </div>
        <div className="transaction-metrics__footer">
          {renderTrendIndicator(metrics.expenseChange)}
        </div>
      </div>
    </div>
  )
}

export default TransactionMetrics
