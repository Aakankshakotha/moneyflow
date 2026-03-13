import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Transaction } from '@/types/transaction'
import type { Account } from '@/types/account'
import { formatCurrency } from '@/utils/currencyUtils'
import { categoryService } from '@/services/categoryService'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

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
  const muiTheme = useTheme()

  const chartOptions = useMemo(() => {
    const palette = muiTheme.palette.charts.categorical
    const tooltipBg = muiTheme.palette.background.paper
    const tooltipBorder = muiTheme.palette.divider
    const tooltipText = muiTheme.palette.text.primary
    const legendText = muiTheme.palette.text.primary
    const cardBg = muiTheme.palette.background.paper

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
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: 'none',
        borderRadius: '12px',
        p: '20px',
        boxShadow: 2,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          mb: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'text.primary',
            m: '0 0 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Typography component="span" sx={{ fontSize: '1.25rem' }}>
            📊
          </Typography>
          Expenses
        </Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            m: 0,
            whiteSpace: 'nowrap',
          }}
        >
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
