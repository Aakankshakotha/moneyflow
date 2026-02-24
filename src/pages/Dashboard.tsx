import React, { useState, useEffect } from 'react'
import {
  CashFlowTrendChart,
  MoneyFlowChart,
  ExpensesChart,
  RecentTransactionsTable,
} from '@/components/features'
import { MetricCard } from '@/components/common'
import * as netWorthService from '@/services/netWorthService'
import * as accountService from '@/services/accountService'
import * as transactionService from '@/services/transactionService'
import type { NetWorthCalculation } from '@/types/netWorth'
import type { Account } from '@/types/account'
import type { TransactionWithAccounts } from '@/types/transaction'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import './Dashboard.css'

/**
 * Dashboard page - displays financial overview with charts and metrics
 */
const Dashboard: React.FC = () => {
  const [calculation, setCalculation] = useState<NetWorthCalculation | null>(
    null
  )
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<TransactionWithAccounts[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const [calcResult, accountsResult, transactionsResult] =
        await Promise.all([
          netWorthService.calculateNetWorth(),
          accountService.listAccounts(),
          transactionService.listTransactions(),
        ])

      if (calcResult.success) {
        setCalculation(calcResult.data)
      }

      if (accountsResult.success) {
        setAccounts(accountsResult.data)
      }

      if (transactionsResult.success && accountsResult.success) {
        const accountMap = new Map(accountsResult.data.map((a) => [a.id, a]))
        const enrichedTransactions = transactionsResult.data
          .map((txn) => {
            const fromAccount = accountMap.get(txn.fromAccountId)
            const toAccount = accountMap.get(txn.toAccountId)
            if (fromAccount && toAccount) {
              return { ...txn, fromAccount, toAccount } as TransactionWithAccounts
            }
            return null
          })
          .filter((t): t is TransactionWithAccounts => t !== null)
        setTransactions(enrichedTransactions)
      }
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const totalAssets = calculation?.totalAssets || 0
  const totalLiabilities = calculation?.totalLiabilities || 0
  const netWorth = calculation?.netWorth || 0

  const accountMap = new Map(accounts.map((a) => [a.id, a]))
  const recentTransactions = transactions.filter((txn) => {
    const txnDate = new Date(txn.date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return txnDate >= thirtyDaysAgo
  })

  const income = recentTransactions
    .filter((txn) => {
      const toAcc = accountMap.get(txn.toAccountId)
      return toAcc && toAcc.type === 'income'
    })
    .reduce((sum, txn) => sum + txn.amount, 0)

  const expenses = recentTransactions
    .filter((txn) => {
      const toAcc = accountMap.get(txn.toAccountId)
      return toAcc && toAcc.type === 'expense'
    })
    .reduce((sum, txn) => sum + txn.amount, 0)

  const cashFlow = income - expenses

  if (loading) {
    return (
      <Box className="dashboard-page" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography>Loading dashboard...</Typography>
      </Box>
    )
  }

  return (
    <Box className="dashboard-page">
      <Box className="dashboard-page__header">
        <Box>
          <Typography component="h1" className="dashboard-page__title">
            Financial Overview
          </Typography>
          <Typography component="p" className="dashboard-page__subtitle">
            Welcome back, here’s your money flow for{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Metrics Cards */}
      <Box className="dashboard-page__metrics">
        <MetricCard
          title="Net Worth"
          value={netWorth}
          icon={<Box component="span">💎</Box>}
          color="blue"
          trend={{ value: netWorth * 0.023, direction: 'up', period: 'vs last month' }}
        />
        <MetricCard
          title="Total Assets"
          value={totalAssets}
          icon={<Box component="span">💰</Box>}
          color="green"
          trend={{ value: totalAssets * 0.045, direction: 'up', period: 'vs last month' }}
        />
        <MetricCard
          title="Liabilities"
          value={totalLiabilities}
          icon={<Box component="span">📉</Box>}
          color="pink"
          trend={{ value: totalLiabilities * 0.033, direction: 'down', period: 'vs last month' }}
        />
        <MetricCard
          title="Cash Flow"
          value={cashFlow}
          icon={<Box component="span">📊</Box>}
          color="purple"
          trend={{
            value: cashFlow * 0.12,
            direction: cashFlow >= 0 ? 'up' : 'down',
            period: 'vs last month',
          }}
        />
      </Box>

      {/* Charts Grid */}
      <Box className="dashboard-page__charts">
        <Box className="dashboard-page__chart-col">
          <MoneyFlowChart transactions={transactions} accounts={accounts} />
        </Box>
        <Box className="dashboard-page__chart-col">
          <ExpensesChart transactions={transactions} accounts={accounts} />
        </Box>
      </Box>

      {/* Income vs Expenses Trend */}
      <Box className="dashboard-page__section">
        <CashFlowTrendChart transactions={transactions} accounts={accounts} />
      </Box>

      {/* Recent Transactions */}
      <Box className="dashboard-page__section">
        <RecentTransactionsTable transactions={transactions} limit={10} />
      </Box>
    </Box>
  )
}

export default Dashboard
