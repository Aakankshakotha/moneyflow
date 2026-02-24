import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Transaction } from '@/types/transaction'
import type { Account } from '@/types/account'
import { formatCurrency } from '@/utils/currencyUtils'
import { categoryService } from '@/services/categoryService'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

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
      '#14b8a6',
      '#8b5cf6',
      '#f59e0b',
      '#ec4899',
      '#6366f1',
      '#22c55e',
      '#f97316',
      '#06b6d4',
      '#ef4444',
      '#a855f7',
      '#84cc16',
      '#fb7185',
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

    const getColorIndex = (key: string): number => {
      let hash = 0
      for (let index = 0; index < key.length; index += 1) {
        hash = (hash << 5) - hash + key.charCodeAt(index)
        hash |= 0
      }
      return Math.abs(hash)
    }

    // Convert to chart data format with stable distinct colors per category key
    const data = Array.from(expensesByCategory.entries())
      .map(([categoryKey, { name, amount }]) => ({
        name,
        value: amount / 100, // Convert to dollars
        itemStyle: {
          color: palette[getColorIndex(categoryKey) % palette.length],
        },
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
        right: 6,
        top: 'center',
        itemWidth: 18,
        itemHeight: 12,
        itemGap: 14,
        textStyle: {
          color: legendText,
          fontSize: 13,
        },
        formatter: (name: string) =>
          name.length > 18 ? `${name.slice(0, 18)}…` : name,
      },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          radius: ['40%', '64%'],
          center: ['33%', '53%'],
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
              show: false,
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
    <Box sx={{ backgroundColor: 'var(--card-background)', border: 'none', borderRadius: '12px', p: '20px', boxShadow: 'var(--shadow-soft)', height: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ mb: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <Typography variant="h6" component="h3" sx={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', m: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography component="span" sx={{ fontSize: '1.25rem' }}>📊</Typography>
          Expenses
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary)', m: 0, whiteSpace: 'nowrap' }}>
          Total: {formatCurrency(totalExpenses)}
        </Typography>
      </Box>
      <ReactECharts
        option={chartOptions}
        style={{ height: '450px', width: '100%', minHeight: '450px' }}
      />
    </Box>
  )
}
