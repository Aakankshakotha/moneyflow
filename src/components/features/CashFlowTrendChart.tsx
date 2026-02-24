import React, { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Account } from '@/types/account'
import type { Transaction } from '@/types/transaction'
import { Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import { categoryService } from '@/services/categoryService'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface CashFlowTrendChartProps {
  transactions: Transaction[]
  accounts: Account[]
}

const CashFlowTrendChart: React.FC<CashFlowTrendChartProps> = ({
  transactions,
  accounts,
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null)

  const { chartData, detailByMonth } = useMemo(() => {
    const accountMap = new Map(accounts.map((account) => [account.id, account]))
    const monthMap = new Map<
      string,
      {
        key: string
        month: string
        monthLabel: string
        income: number
        expenses: number
        incomeCount: number
        expenseCount: number
        incomeCategories: Map<
          string,
          { name: string; amount: number; count: number }
        >
        expenseCategories: Map<
          string,
          { name: string; amount: number; count: number }
        >
      }
    >()

    const today = new Date()
    const periodMonths = 6

    for (let i = periodMonths - 1; i >= 0; i -= 1) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(monthKey, {
        key: monthKey,
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        monthLabel: monthDate.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        income: 0,
        expenses: 0,
        incomeCount: 0,
        expenseCount: 0,
        incomeCategories: new Map(),
        expenseCategories: new Map(),
      })
    }

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)
      const key = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`

      if (!monthMap.has(key)) {
        return
      }

      const fromAccount = accountMap.get(transaction.fromAccountId)
      const toAccount = accountMap.get(transaction.toAccountId)
      if (!fromAccount || !toAccount) {
        return
      }

      const monthData = monthMap.get(key)
      if (!monthData) {
        return
      }

      if (fromAccount.type === 'income' && toAccount.type === 'asset') {
        monthData.income += transaction.amount
        monthData.incomeCount += 1

        const categoryKey = transaction.category || `account-${fromAccount.id}`
        const categoryName = transaction.category
          ? categoryService.getCategoryName(transaction.category)
          : fromAccount.name
        const existingCategory = monthData.incomeCategories.get(categoryKey)

        if (existingCategory) {
          existingCategory.amount += transaction.amount
          existingCategory.count += 1
        } else {
          monthData.incomeCategories.set(categoryKey, {
            name: categoryName,
            amount: transaction.amount,
            count: 1,
          })
        }
      }

      if (fromAccount.type === 'asset' && toAccount.type === 'expense') {
        monthData.expenses += transaction.amount
        monthData.expenseCount += 1

        const categoryKey = transaction.category || `account-${toAccount.id}`
        const categoryName = transaction.category
          ? categoryService.getCategoryName(transaction.category)
          : toAccount.name
        const existingCategory = monthData.expenseCategories.get(categoryKey)

        if (existingCategory) {
          existingCategory.amount += transaction.amount
          existingCategory.count += 1
        } else {
          monthData.expenseCategories.set(categoryKey, {
            name: categoryName,
            amount: transaction.amount,
            count: 1,
          })
        }
      }
    })

    const rows = Array.from(monthMap.values())

    return {
      chartData: rows.map((item) => ({
        key: item.key,
        month: item.month,
        monthLabel: item.monthLabel,
        income: item.income,
        expenses: item.expenses,
        net: item.income - item.expenses,
      })),
      detailByMonth: new Map(
        rows.map((item) => [
          item.key,
          {
            monthLabel: item.monthLabel,
            income: item.income,
            expenses: item.expenses,
            net: item.income - item.expenses,
            incomeCount: item.incomeCount,
            expenseCount: item.expenseCount,
            incomeCategories: Array.from(item.incomeCategories.values())
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5),
            expenseCategories: Array.from(item.expenseCategories.values())
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5),
          },
        ])
      ),
    }
  }, [transactions, accounts])

  const hasData = chartData.some(
    (entry) => entry.income > 0 || entry.expenses > 0
  )

  const rootStyles = getComputedStyle(document.documentElement)
  const getThemeVar = (name: string, fallback: string): string =>
    rootStyles.getPropertyValue(name).trim() || fallback

  const chartAxis = getThemeVar('--chart-axis', '#94a3b8')
  const chartGrid = getThemeVar('--chart-grid', '#e6edf7')
  const tooltipBg = getThemeVar('--chart-tooltip-bg', '#ffffff')
  const tooltipBorder = getThemeVar('--chart-tooltip-border', '#dbe4f0')
  const tooltipText = getThemeVar('--chart-tooltip-text', '#1f2937')
  const incomeColor = getThemeVar('--chart-series-income', '#3dbb91')
  const expenseColor = getThemeVar('--chart-series-expense', '#f97316')

  const selectedMonthDetails = selectedMonthKey
    ? detailByMonth.get(selectedMonthKey)
    : null

  const handleBarClick = (entry?: { key?: string }): void => {
    if (!entry?.key) {
      return
    }

    const monthKey = entry.key

    setSelectedMonthKey((prev) => (prev === monthKey ? null : monthKey))
  }

  if (!hasData) {
    return (
      <Card sx={{ p: '1.5rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem', mb: '0.75rem' }}>
          <Typography variant="h5" component="h2" sx={{ fontSize: '1.125rem', fontWeight: 600, m: 0, color: 'var(--text-primary)' }}>
            Income vs Expenses Trend
          </Typography>
          <Typography sx={{ m: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Last 6 months</Typography>
        </Box>
        <Box sx={{ minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          No income/expense transactions yet
        </Box>
      </Card>
    )
  }

  return (
    <Card sx={{ p: '1.5rem' }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem', mb: '0.75rem' }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: '1.125rem', fontWeight: 600, m: 0, color: 'var(--text-primary)' }}>
          Income vs Expenses Trend
        </Typography>
        <Typography sx={{ m: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Last 6 months • Click a month bar for details
        </Typography>
      </Box>
      <Box sx={{ mt: '0.5rem' }}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: chartAxis }}
              axisLine={{ stroke: chartGrid }}
              tickLine={{ stroke: chartGrid }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: chartAxis }}
              axisLine={{ stroke: chartGrid }}
              tickLine={{ stroke: chartGrid }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '10px',
              }}
              labelStyle={{ color: tooltipText, fontWeight: 600 }}
              itemStyle={{ color: tooltipText }}
              formatter={(value: number | undefined) =>
                value !== undefined ? formatCurrency(value) : ''
              }
            />
            <Legend />
            <Bar
              dataKey="income"
              name="Income"
              fill={incomeColor}
              radius={[6, 6, 0, 0]}
              onClick={(payload) =>
                handleBarClick(payload?.payload as { key?: string } | undefined)
              }
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill={expenseColor}
              radius={[6, 6, 0, 0]}
              onClick={(payload) =>
                handleBarClick(payload?.payload as { key?: string } | undefined)
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {selectedMonthDetails && (
        <Box
          role="region"
          aria-live="polite"
          sx={{ mt: '1rem', borderTop: '1px solid var(--border-color)', pt: '1rem' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', mb: '0.75rem' }}>
            <Typography variant="h6" component="h3" sx={{ m: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Details for {selectedMonthDetails.monthLabel}
            </Typography>
            <Typography sx={{ m: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Net: {formatCurrency(selectedMonthDetails.net)}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
            {([{ label: 'Income', total: selectedMonthDetails.income, count: selectedMonthDetails.incomeCount, items: selectedMonthDetails.incomeCategories, emptyMsg: 'No income categories' }, { label: 'Expenses', total: selectedMonthDetails.expenses, count: selectedMonthDetails.expenseCount, items: selectedMonthDetails.expenseCategories, emptyMsg: 'No expense categories' }] as const).map((col) => (
              <Box key={col.label} sx={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', p: '0.875rem' }}>
                <Typography variant="h6" component="h4" sx={{ m: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</Typography>
                <Typography sx={{ m: '0.35rem 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(col.total)}</Typography>
                <Typography sx={{ m: '0.15rem 0 0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{col.count} transactions</Typography>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {col.items.length > 0 ? (
                    col.items.map((item) => (
                      <Box component="li" key={`${selectedMonthDetails.monthLabel}-${col.label}-${item.name}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>{item.name}</span>
                        <span>{formatCurrency(item.amount)}</span>
                      </Box>
                    ))
                  ) : (
                    <Box component="li" sx={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><span>{col.emptyMsg}</span></Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  )
}

export default CashFlowTrendChart
