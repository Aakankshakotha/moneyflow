import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Transaction } from '@/types/transaction'
import type { Account } from '@/types/account'
import { formatCurrency } from '@/utils/currencyUtils'
import { categoryService } from '@/services/categoryService'
import './ExpensesChart.css'

interface ExpensesChartProps {
  transactions: Transaction[]
  accounts: Account[]
}

/**
 * ExpensesChart Component
 * Displays a donut chart showing expense breakdown by category
 */
export const ExpensesChart: React.FC<ExpensesChartProps> = ({
  transactions,
  accounts,
}) => {
  const chartOptions = useMemo(() => {
    const accountMap = new Map(accounts.map((a) => [a.id, a]))
    const expensesByCategory = new Map<
      string,
      { name: string; color: string; amount: number }
    >()

    // Filter for expense transactions and group by category
    transactions.forEach((txn) => {
      const toAcc = accountMap.get(txn.toAccountId)
      if (toAcc && toAcc.type === 'expense') {
        // Use transaction category if available, otherwise use account name
        let categoryKey: string
        let categoryName: string
        let categoryColor: string

        if (txn.category) {
          categoryKey = txn.category
          categoryName = categoryService.getCategoryName(txn.category)
          categoryColor = categoryService.getCategoryColor(txn.category)
        } else {
          // Fall back to expense account name
          categoryKey = `account-${toAcc.id}`
          categoryName = toAcc.name
          categoryColor = '#ef4444' // Default red for uncategorized
        }

        const existing = expensesByCategory.get(categoryKey)
        if (existing) {
          existing.amount += txn.amount
        } else {
          expensesByCategory.set(categoryKey, {
            name: categoryName,
            color: categoryColor,
            amount: txn.amount,
          })
        }
      }
    })

    // Convert to chart data format
    const data = Array.from(expensesByCategory.values())
      .map(({ name, color, amount }) => ({
        name,
        value: amount / 100, // Convert to dollars
        itemStyle: { color },
      }))
      .sort((a, b) => b.value - a.value)

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: {
          name?: string
          value?: number
          percent?: number
        }) => {
          if (params.value !== undefined && params.percent !== undefined) {
            return `${params.name || 'Unknown'}<br/>Amount: ${formatCurrency(params.value * 100)}<br/>Percentage: ${params.percent}%`
          }
          return params.name || ''
        },
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          color: 'var(--text-primary)',
        },
      },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: 'var(--card-background)',
            borderWidth: 3,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: 'var(--text-primary)',
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    }
  }, [transactions, accounts])

  const totalExpenses = useMemo(() => {
    const accountMap = new Map(accounts.map((a) => [a.id, a]))
    return transactions
      .filter((txn) => {
        const toAcc = accountMap.get(txn.toAccountId)
        return toAcc && toAcc.type === 'expense'
      })
      .reduce((sum, txn) => sum + txn.amount, 0)
  }, [transactions, accounts])

  return (
    <div className="expenses-chart">
      <div className="expenses-chart__header">
        <h3 className="expenses-chart__title">
          <span className="expenses-chart__icon">📊</span>
          Expenses
        </h3>
        <p className="expenses-chart__subtitle">
          Total: {formatCurrency(totalExpenses)}
        </p>
      </div>
      <ReactECharts
        option={chartOptions}
        style={{ height: '300px', width: '100%' }}
      />
    </div>
  )
}
