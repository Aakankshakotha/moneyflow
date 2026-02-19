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
    const rootStyles = getComputedStyle(document.documentElement)
    const getThemeVar = (name: string, fallback: string): string =>
      rootStyles.getPropertyValue(name).trim() || fallback

    const palette = [
      getThemeVar('--chart-series-1', '#5b7cfa'),
      getThemeVar('--chart-series-2', '#7c8cf8'),
      getThemeVar('--chart-series-3', '#6aa9ff'),
      getThemeVar('--chart-series-4', '#36b6a8'),
      getThemeVar('--chart-series-5', '#f59e8b'),
    ]
    const tooltipBg = getThemeVar('--chart-tooltip-bg', '#ffffff')
    const tooltipBorder = getThemeVar('--chart-tooltip-border', '#dbe4f0')
    const tooltipText = getThemeVar('--chart-tooltip-text', '#1f2937')
    const legendText = getThemeVar('--text-primary', '#1f2937')
    const cardBg = getThemeVar('--card-background', '#ffffff')

    const accountMap = new Map(accounts.map((a) => [a.id, a]))
    const expensesByCategory = new Map<
      string,
      { name: string; amount: number }
    >()

    // Filter for expense transactions and group by category
    transactions.forEach((txn) => {
      const toAcc = accountMap.get(txn.toAccountId)
      if (toAcc && toAcc.type === 'expense') {
        // Use transaction category if available, otherwise use account name
        let categoryKey: string
        let categoryName: string

        if (txn.category) {
          categoryKey = txn.category
          categoryName = categoryService.getCategoryName(txn.category)
        } else {
          // Fall back to expense account name
          categoryKey = `account-${toAcc.id}`
          categoryName = toAcc.name
        }

        const existing = expensesByCategory.get(categoryKey)
        if (existing) {
          existing.amount += txn.amount
        } else {
          expensesByCategory.set(categoryKey, {
            name: categoryName,
            amount: txn.amount,
          })
        }
      }
    })

    // Convert to chart data format
    const data = Array.from(expensesByCategory.values())
      .map(({ name, amount }, index) => ({
        name,
        value: amount / 100, // Convert to dollars
        itemStyle: { color: palette[index % palette.length] },
      }))
      .sort((a, b) => b.value - a.value)

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: {
          color: tooltipText,
        },
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
          color: legendText,
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
            borderColor: cardBg,
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
              color: legendText,
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
