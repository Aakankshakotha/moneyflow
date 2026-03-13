import { useState, useEffect } from 'react'
import * as netWorthService from '@/services/netWorthService'
import * as accountService from '@/services/accountService'
import * as transactionService from '@/services/transactionService'
import type { NetWorthCalculation } from '@/types/netWorth'
import type { Account } from '@/types/account'
import type { TransactionWithAccounts } from '@/types/transaction'

export interface DashboardMetrics {
  netWorth: number
  totalAssets: number
  totalLiabilities: number
  income: number
  expenses: number
  cashFlow: number
}

export interface UseDashboardDataReturn {
  calculation: NetWorthCalculation | null
  accounts: Account[]
  transactions: TransactionWithAccounts[]
  metrics: DashboardMetrics
  loading: boolean
  error: string | null
}

export const useDashboardData = (): UseDashboardDataReturn => {
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
    const loadData = async (): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const [calcResult, accountsResult, transactionsResult] =
          await Promise.all([
            netWorthService.calculateNetWorth(),
            accountService.listAccounts(),
            transactionService.listTransactions(),
          ])

        if (calcResult.success) setCalculation(calcResult.data)
        if (accountsResult.success) setAccounts(accountsResult.data)

        if (transactionsResult.success && accountsResult.success) {
          const accountMap = new Map(accountsResult.data.map((a) => [a.id, a]))
          const enriched = transactionsResult.data
            .map((txn) => {
              const fromAccount = accountMap.get(txn.fromAccountId)
              const toAccount = accountMap.get(txn.toAccountId)
              if (fromAccount && toAccount)
                return {
                  ...txn,
                  fromAccount,
                  toAccount,
                } as TransactionWithAccounts
              return null
            })
            .filter((t): t is TransactionWithAccounts => t !== null)
          setTransactions(enriched)
        }
      } catch {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalAssets = calculation?.totalAssets ?? 0
  const totalLiabilities = calculation?.totalLiabilities ?? 0
  const netWorth = calculation?.netWorth ?? 0

  const accountMap = new Map(accounts.map((a) => [a.id, a]))
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentTransactions = transactions.filter(
    (txn) => new Date(txn.date) >= thirtyDaysAgo
  )

  // Income accounts are sources — money flows FROM them INTO asset/liability accounts.
  const income = recentTransactions
    .filter((txn) => accountMap.get(txn.fromAccountId)?.type === 'income')
    .reduce((sum, txn) => sum + txn.amount, 0)

  // Expense accounts are destinations — money flows FROM asset/liability INTO them.
  const expenses = recentTransactions
    .filter((txn) => accountMap.get(txn.toAccountId)?.type === 'expense')
    .reduce((sum, txn) => sum + txn.amount, 0)

  const cashFlow = income - expenses

  return {
    calculation,
    accounts,
    transactions,
    metrics: {
      netWorth,
      totalAssets,
      totalLiabilities,
      income,
      expenses,
      cashFlow,
    },
    loading,
    error,
  }
}
