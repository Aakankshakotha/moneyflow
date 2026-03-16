import React, { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
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
import { useTheme, alpha } from '@mui/material/styles'
import LinearProgress from '@mui/material/LinearProgress'

interface CashFlowTrendChartProps {
  transactions: Transaction[]
  accounts: Account[]
  periodMonths?: number
}

const CashFlowTrendChart: React.FC<CashFlowTrendChartProps> = ({
  transactions,
  accounts,
  periodMonths: periodMonthsProp,
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'category'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<
    'expense' | 'income'
  >('expense')

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
    const periodMonths = periodMonthsProp ?? 6

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

        // Always key by account ID to avoid duplicates from tagged/untagged txns
        const categoryKey = `account-${fromAccount.id}`
        const categoryName = fromAccount.name
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

      const isExpensePayment =
        (fromAccount.type === 'asset' || fromAccount.type === 'liability') &&
        toAccount.type === 'expense'
      if (isExpensePayment) {
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
  }, [transactions, accounts, periodMonthsProp])

  const categoryMemoData = useMemo(() => {
    const accountMap = new Map(accounts.map((a) => [a.id, a]))
    const today = new Date()
    const periodMonths = periodMonthsProp ?? 6

    const monthKeys: string[] = []
    const monthLabels: string[] = []
    for (let i = periodMonths - 1; i >= 0; i -= 1) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      monthKeys.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      )
      monthLabels.push(d.toLocaleDateString('en-US', { month: 'short' }))
    }

    const expenseAmounts = new Map<string, Map<string, number>>()
    const incomeAmounts = new Map<string, Map<string, number>>()
    const expenseCatNames = new Map<string, string>()
    const incomeCatNames = new Map<string, string>()

    transactions.forEach((txn) => {
      const fromAccount = accountMap.get(txn.fromAccountId)
      const toAccount = accountMap.get(txn.toAccountId)
      if (!fromAccount || !toAccount) return

      const txnDate = new Date(txn.date)
      const key = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, '0')}`
      if (!monthKeys.includes(key)) return

      const isExpense =
        (fromAccount.type === 'asset' || fromAccount.type === 'liability') &&
        toAccount.type === 'expense'
      if (isExpense) {
        const catKey = txn.category || `acct-${toAccount.id}`
        const catName = txn.category
          ? categoryService.getCategoryName(txn.category)
          : toAccount.name
        expenseCatNames.set(catKey, catName)
        if (!expenseAmounts.has(catKey)) expenseAmounts.set(catKey, new Map())
        const m = expenseAmounts.get(catKey)!
        m.set(key, (m.get(key) || 0) + txn.amount)
      }

      if (fromAccount.type === 'income' && toAccount.type === 'asset') {
        // Always key by account so transactions with/without a category tag
        // don't create duplicate entries for the same income source.
        const catKey = `acct-${fromAccount.id}`
        const catName = fromAccount.name
        incomeCatNames.set(catKey, catName)
        if (!incomeAmounts.has(catKey)) incomeAmounts.set(catKey, new Map())
        const m = incomeAmounts.get(catKey)!
        m.set(key, (m.get(key) || 0) + txn.amount)
      }
    })

    const buildTrend = (
      amountMap: Map<string, Map<string, number>>
    ): Record<string, number | string>[] =>
      monthKeys.map((mk, i) => {
        const row: Record<string, number | string> = {
          month: monthLabels[i],
          monthKey: mk,
        }
        amountMap.forEach((monthAmounts, catKey) => {
          row[catKey] = monthAmounts.get(mk) || 0
        })
        return row
      })

    return {
      expenseCategories: Array.from(expenseCatNames.entries()).map(
        ([key, name]) => ({ key, name })
      ),
      incomeCategories: Array.from(incomeCatNames.entries()).map(
        ([key, name]) => ({ key, name })
      ),
      expenseTrendData: buildTrend(expenseAmounts),
      incomeTrendData: buildTrend(incomeAmounts),
    }
  }, [transactions, accounts, periodMonthsProp])

  const hasData = chartData.some(
    (entry) => entry.income > 0 || entry.expenses > 0
  )

  const muiTheme = useTheme()

  const chartAxis = muiTheme.palette.text.secondary
  const chartGrid = muiTheme.palette.divider
  const tooltipBg = muiTheme.palette.background.paper
  const tooltipBorder = muiTheme.palette.divider
  const tooltipText = muiTheme.palette.text.primary
  const incomeColor = muiTheme.palette.success.main
  const expenseColor = muiTheme.palette.error.main

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

  const visibleCategories =
    categoryTypeFilter === 'expense'
      ? categoryMemoData.expenseCategories
      : categoryMemoData.incomeCategories

  const activeCategoryTrendData =
    categoryTypeFilter === 'expense'
      ? categoryMemoData.expenseTrendData
      : categoryMemoData.incomeTrendData

  const activeLineCategories =
    selectedCategory === ''
      ? visibleCategories
      : visibleCategories.filter((c) => c.key === selectedCategory)

  const periodTotalIncome = chartData.reduce((s, d) => s + d.income, 0)
  const periodTotalExpenses = chartData.reduce((s, d) => s + d.expenses, 0)
  const periodNet = periodTotalIncome - periodTotalExpenses

  if (!hasData) {
    return (
      <Card sx={{ p: '1.5rem' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '0.75rem',
            mb: '0.75rem',
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              m: 0,
              color: 'text.primary',
            }}
          >
            Income vs Expenses Trend
          </Typography>
          <Typography
            sx={{ m: 0, fontSize: '0.875rem', color: 'text.secondary' }}
          >
            Last 6 months
          </Typography>
        </Box>
        <Box
          sx={{
            minHeight: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            fontSize: '0.95rem',
          }}
        >
          No income/expense transactions yet
        </Box>
      </Card>
    )
  }

  return (
    <Card sx={{ p: '1.5rem' }}>
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          mb: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              mb: '2px',
            }}
          >
            <Typography
              component="span"
              sx={{ fontSize: '1.2rem', lineHeight: 1 }}
            >
              📊
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontSize: '1.125rem',
                fontWeight: 700,
                m: 0,
                color: 'text.primary',
              }}
            >
              Income vs Expenses Trend
            </Typography>
          </Box>
          <Typography
            sx={{ m: 0, fontSize: '0.8125rem', color: 'text.secondary' }}
          >
            {viewMode === 'overview'
              ? 'Last 6 months · click a point for details'
              : 'Monthly spend by category — last 6 months'}
          </Typography>
        </Box>

        {/* Pill segmented control */}
        <Box
          sx={{
            display: 'inline-flex',
            backgroundColor: alpha(muiTheme.palette.text.primary, 0.06),
            borderRadius: '10px',
            p: '3px',
            gap: '2px',
            flexShrink: 0,
          }}
        >
          {(['overview', 'category'] as const).map((mode) => (
            <Box
              key={mode}
              component="button"
              onClick={() => setViewMode(mode)}
              sx={{
                border: 'none',
                cursor: 'pointer',
                px: 2,
                py: 0.75,
                borderRadius: '7px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                transition: 'all 0.18s ease',
                backgroundColor:
                  viewMode === mode ? 'background.paper' : 'transparent',
                color: viewMode === mode ? 'text.primary' : 'text.secondary',
                boxShadow:
                  viewMode === mode ? '0 1px 4px rgba(0,0,0,0.14)' : 'none',
              }}
            >
              {mode === 'overview' ? 'Overview' : 'By Category'}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Period summary strip */}
      {viewMode === 'overview' && (
        <Box
          sx={{
            display: 'flex',
            gap: '0.75rem',
            mb: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              flex: '1 1 0',
              minWidth: 110,
              backgroundColor: alpha(incomeColor, 0.07),
              border: '1px solid',
              borderColor: alpha(incomeColor, 0.18),
              borderRadius: '12px',
              p: '0.7rem 0.875rem',
            }}
          >
            <Typography
              sx={{
                m: 0,
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: incomeColor,
                opacity: 0.85,
              }}
            >
              Total Income
            </Typography>
            <Typography
              sx={{
                m: 0,
                mt: '2px',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'text.primary',
              }}
            >
              {formatCurrency(periodTotalIncome)}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: '1 1 0',
              minWidth: 110,
              backgroundColor: alpha(expenseColor, 0.07),
              border: '1px solid',
              borderColor: alpha(expenseColor, 0.18),
              borderRadius: '12px',
              p: '0.7rem 0.875rem',
            }}
          >
            <Typography
              sx={{
                m: 0,
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: expenseColor,
                opacity: 0.85,
              }}
            >
              Total Expenses
            </Typography>
            <Typography
              sx={{
                m: 0,
                mt: '2px',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'text.primary',
              }}
            >
              {formatCurrency(periodTotalExpenses)}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: '1 1 0',
              minWidth: 110,
              backgroundColor: alpha(
                periodNet >= 0 ? incomeColor : expenseColor,
                0.07
              ),
              border: '1px solid',
              borderColor: alpha(
                periodNet >= 0 ? incomeColor : expenseColor,
                0.18
              ),
              borderRadius: '12px',
              p: '0.7rem 0.875rem',
            }}
          >
            <Typography
              sx={{
                m: 0,
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: periodNet >= 0 ? incomeColor : expenseColor,
                opacity: 0.85,
              }}
            >
              Net Savings
            </Typography>
            <Typography
              sx={{
                m: 0,
                mt: '2px',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: periodNet >= 0 ? incomeColor : expenseColor,
              }}
            >
              {periodNet >= 0 ? '+' : ''}
              {formatCurrency(Math.abs(periodNet))}
            </Typography>
          </Box>
        </Box>
      )}

      {viewMode === 'category' && (
        <Box sx={{ mb: '1.25rem' }}>
          {/* Type toggle */}
          <Box
            sx={{
              display: 'inline-flex',
              backgroundColor: alpha(muiTheme.palette.text.primary, 0.06),
              borderRadius: '10px',
              p: '3px',
              gap: '2px',
              mb: '0.75rem',
            }}
          >
            {(['expense', 'income'] as const).map((type) => (
              <Box
                key={type}
                component="button"
                onClick={() => {
                  setCategoryTypeFilter(type)
                  setSelectedCategory('')
                }}
                sx={{
                  border: 'none',
                  cursor: 'pointer',
                  px: 2,
                  py: 0.75,
                  borderRadius: '7px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'all 0.18s ease',
                  backgroundColor:
                    categoryTypeFilter === type
                      ? type === 'expense'
                        ? alpha(muiTheme.palette.error.main, 0.15)
                        : alpha(muiTheme.palette.success.main, 0.15)
                      : 'transparent',
                  color:
                    categoryTypeFilter === type
                      ? type === 'expense'
                        ? muiTheme.palette.error.main
                        : muiTheme.palette.success.main
                      : 'text.secondary',
                  boxShadow:
                    categoryTypeFilter === type
                      ? '0 1px 4px rgba(0,0,0,0.10)'
                      : 'none',
                }}
              >
                {type === 'expense' ? 'Expenses' : 'Income'}
              </Box>
            ))}
          </Box>

          {/* Scrollable category pills */}
          {visibleCategories.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                pb: '4px',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {[{ key: '', name: 'All' }, ...visibleCategories].map((cat) => {
                const isActive = selectedCategory === cat.key
                const activeColor =
                  categoryTypeFilter === 'expense'
                    ? muiTheme.palette.error.main
                    : muiTheme.palette.success.main
                return (
                  <Box
                    key={cat.key || 'all'}
                    component="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    sx={{
                      border: '1.5px solid',
                      borderColor: isActive ? activeColor : 'divider',
                      cursor: 'pointer',
                      px: 1.75,
                      py: 0.625,
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 400,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                      backgroundColor: isActive
                        ? alpha(activeColor, 0.1)
                        : 'background.paper',
                      color: isActive ? activeColor : 'text.secondary',
                    }}
                  >
                    {cat.name}
                  </Box>
                )
              })}
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              No {categoryTypeFilter} categories yet
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ mt: '0.5rem', '& *:focus': { outline: 'none' } }}>
        {viewMode === 'overview' ? (
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart
              data={chartData}
              onClick={(data) => {
                const ap = data?.activePayload as
                  | Array<{ payload?: { key?: string } }>
                  | undefined
                const key = ap?.[0]?.payload?.key
                if (key) handleBarClick({ key })
              }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={incomeColor} stopOpacity={0.4} />
                  <stop
                    offset="95%"
                    stopColor={incomeColor}
                    stopOpacity={0.02}
                  />
                </linearGradient>
                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={expenseColor}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={expenseColor}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartGrid}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: chartAxis }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: chartAxis }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
                width={82}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
                labelStyle={{
                  color: tooltipText,
                  fontWeight: 700,
                  marginBottom: '4px',
                }}
                itemStyle={{ color: tooltipText }}
                formatter={(value: number | undefined) =>
                  value !== undefined ? formatCurrency(value) : ''
                }
              />
              <Legend
                wrapperStyle={{ paddingTop: '0.75rem', fontSize: '0.8rem' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke={incomeColor}
                strokeWidth={2.5}
                fill="url(#incomeGradient)"
                dot={{ fill: incomeColor, r: 4, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: incomeColor,
                  fill: tooltipBg,
                }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke={expenseColor}
                strokeWidth={2.5}
                fill="url(#expenseGradient)"
                dot={{ fill: expenseColor, r: 4, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: expenseColor,
                  fill: tooltipBg,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={activeCategoryTrendData}>
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
              {activeLineCategories.map((cat, i) => {
                const color =
                  muiTheme.palette.charts.categorical[
                    i % muiTheme.palette.charts.categorical.length
                  ]
                return (
                  <Line
                    key={cat.key}
                    type="monotone"
                    dataKey={cat.key}
                    name={cat.name}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ fill: color, r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
      {viewMode === 'overview' && selectedMonthDetails && (
        <Box
          role="region"
          aria-live="polite"
          sx={{
            mt: '1.25rem',
            borderTop: '1px solid',
            borderTopColor: 'divider',
            pt: '1.25rem',
          }}
        >
          {/* Month detail header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              mb: '1rem',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  m: 0,
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                {selectedMonthDetails.monthLabel}
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor:
                    selectedMonthDetails.net >= 0
                      ? alpha(muiTheme.palette.success.main, 0.12)
                      : alpha(muiTheme.palette.error.main, 0.12),
                  color:
                    selectedMonthDetails.net >= 0
                      ? muiTheme.palette.success.main
                      : muiTheme.palette.error.main,
                }}
              >
                {selectedMonthDetails.net >= 0 ? '+' : ''}
                {formatCurrency(selectedMonthDetails.net)} net
              </Box>
            </Box>
            <Box
              component="button"
              onClick={() => setSelectedMonthKey(null)}
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'text.secondary',
                fontSize: '1rem',
                lineHeight: 1,
                px: 0.5,
                borderRadius: '4px',
                '&:hover': { color: 'text.primary' },
              }}
            >
              ✕
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '0.875rem',
            }}
          >
            {(
              [
                {
                  label: 'Income',
                  total: selectedMonthDetails.income,
                  count: selectedMonthDetails.incomeCount,
                  items: selectedMonthDetails.incomeCategories,
                  emptyMsg: 'No income categories',
                  accentColor: muiTheme.palette.success.main,
                  progressColor: 'success' as const,
                },
                {
                  label: 'Expenses',
                  total: selectedMonthDetails.expenses,
                  count: selectedMonthDetails.expenseCount,
                  items: selectedMonthDetails.expenseCategories,
                  emptyMsg: 'No expense categories',
                  accentColor: muiTheme.palette.error.main,
                  progressColor: 'error' as const,
                },
              ] as const
            ).map((col) => (
              <Box
                key={col.label}
                sx={{
                  backgroundColor: alpha(col.accentColor, 0.04),
                  border: '1px solid',
                  borderColor: alpha(col.accentColor, 0.2),
                  borderLeft: `4px solid ${col.accentColor}`,
                  borderRadius: '0 12px 12px 0',
                  p: '1rem',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  sx={{
                    m: 0,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: col.accentColor,
                    opacity: 0.85,
                  }}
                >
                  {col.label}
                </Typography>
                <Typography
                  sx={{
                    m: '0.25rem 0 0',
                    fontSize: '1.375rem',
                    fontWeight: 800,
                    color: 'text.primary',
                    lineHeight: 1.2,
                  }}
                >
                  {formatCurrency(col.total)}
                </Typography>
                <Typography
                  sx={{
                    m: '0.125rem 0 0.75rem',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                  }}
                >
                  {col.count} transaction{col.count !== 1 ? 's' : ''}
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    m: 0,
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  {col.items.length > 0 ? (
                    col.items.map((item) => (
                      <Box
                        component="li"
                        key={`${selectedMonthDetails.monthLabel}-${col.label}-${item.name}`}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.8125rem',
                            mb: '3px',
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              fontSize: 'inherit',
                              color: 'text.primary',
                              fontWeight: 500,
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            component="span"
                            sx={{
                              fontSize: 'inherit',
                              color: 'text.secondary',
                              fontWeight: 600,
                            }}
                          >
                            {formatCurrency(item.amount)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            col.total > 0
                              ? Math.min((item.amount / col.total) * 100, 100)
                              : 0
                          }
                          color={col.progressColor}
                          sx={{
                            height: 4,
                            borderRadius: 4,
                            backgroundColor: alpha(col.accentColor, 0.12),
                            '& .MuiLinearProgress-bar': { borderRadius: 4 },
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Box
                      component="li"
                      sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
                    >
                      {col.emptyMsg}
                    </Box>
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
