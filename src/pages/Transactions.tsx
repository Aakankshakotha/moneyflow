import React, { useState, useEffect } from 'react'
import { Button, Select, Input } from '@/components/common'
import {
  TransactionForm,
  TransactionTable,
  TransactionMetrics,
} from '@/components/features'
import * as transactionService from '@/services/transactionService'
import * as accountService from '@/services/accountService'
import type {
  TransactionWithAccounts,
  CreateTransactionDto,
} from '@/types/transaction'
import type { Account } from '@/types/account'
import './Transactions.css'

/**
 * Transactions page - record and view transactions
 */
const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionWithAccounts[]>(
    []
  )
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionWithAccounts[]
  >([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState<
    'this-month' | 'this-week' | 'custom' | 'all'
  >('this-month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [accountFilter, setAccountFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Load accounts
      const accountsResult = await accountService.listAccounts()
      if (!accountsResult.success) {
        setError('Failed to load accounts')
        setLoading(false)
        return
      }
      setAccounts(accountsResult.data)

      // Load transactions
      const transactionsResult = await transactionService.listTransactions()
      if (!transactionsResult.success) {
        setError('Failed to load transactions')
        setLoading(false)
        return
      }

      // Enrich transactions with account details
      const enrichedTransactions = transactionsResult.data
        .map((transaction) => {
          const fromAccount = accountsResult.data.find(
            (acc) => acc.id === transaction.fromAccountId
          )
          const toAccount = accountsResult.data.find(
            (acc) => acc.id === transaction.toAccountId
          )

          if (!fromAccount || !toAccount) {
            return null
          }

          return {
            ...transaction,
            fromAccount,
            toAccount,
          } as TransactionWithAccounts
        })
        .filter((t): t is TransactionWithAccounts => t !== null)

      setTransactions(enrichedTransactions)
      applyDateFilter(enrichedTransactions)
    } catch (err) {
      setError('Failed to load transaction data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async (
    data: CreateTransactionDto
  ): Promise<void> => {
    const result = await transactionService.recordTransaction(data)

    if (!result.success) {
      throw new Error(result.error.message)
    }

    // Reload data to get updated balances and new transaction
    await loadData()
  }

  const applyDateFilter = (txns: TransactionWithAccounts[]): void => {
    let filtered = [...txns]

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (dateFilter === 'this-month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      )
      filtered = txns.filter((t) => {
        const txnDate = new Date(t.date)
        return txnDate >= startOfMonth && txnDate <= endOfMonth
      })
    } else if (dateFilter === 'this-week') {
      const dayOfWeek = now.getDay()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - dayOfWeek)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59)
      filtered = txns.filter((t) => {
        const txnDate = new Date(t.date)
        return txnDate >= startOfWeek && txnDate <= endOfWeek
      })
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate)
      const end = new Date(customEndDate)
      end.setHours(23, 59, 59)
      filtered = txns.filter((t) => {
        const txnDate = new Date(t.date)
        return txnDate >= start && txnDate <= end
      })
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.fromAccount.name.toLowerCase().includes(term) ||
          t.toAccount.name.toLowerCase().includes(term) ||
          t.amount.toString().includes(term)
      )
    }

    // Apply account type filter (source account only)
    if (accountFilter !== 'all') {
      filtered = filtered.filter((t) => t.fromAccount.type === accountFilter)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => {
        const isIncome =
          t.fromAccount.type === 'income' && t.toAccount.type === 'asset'
        const isExpense =
          t.fromAccount.type === 'asset' && t.toAccount.type === 'expense'
        const isTransfer = !isIncome && !isExpense

        if (typeFilter === 'income') return isIncome
        if (typeFilter === 'expense') return isExpense
        if (typeFilter === 'transfer') return isTransfer
        return true
      })
    }

    setFilteredTransactions(filtered)
  }

  useEffect(() => {
    applyDateFilter(transactions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateFilter,
    customStartDate,
    customEndDate,
    searchTerm,
    accountFilter,
    typeFilter,
    transactions,
  ])

  const handleSearch = (value: string): void => {
    setSearchTerm(value)
  }

  const handleDeleteTransaction = async (
    transaction: TransactionWithAccounts
  ): Promise<void> => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    const result = await transactionService.deleteTransaction(transaction.id)

    if (!result.success) {
      alert(`Failed to delete transaction: ${result.error.message}`)
      return
    }

    // Reload data to get updated balances
    await loadData()
  }

  if (loading) {
    return (
      <div className="transactions">
        <div className="transactions__header">
          <h1>Transactions</h1>
        </div>
        <div className="transactions__loading">Loading transactions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="transactions">
        <div className="transactions__header">
          <h1>Transactions</h1>
        </div>
        <div className="transactions__error">{error}</div>
      </div>
    )
  }

  return (
    <div className="transactions">
      <div className="transactions__header">
        <h1>Transactions</h1>
        <div className="transactions__header-actions">
          <Button variant="secondary">Export CSV</Button>
          <Button onClick={() => setIsFormOpen(true)}>Add Transaction</Button>
        </div>
      </div>

      <TransactionMetrics transactions={filteredTransactions} />

      <div className="transactions__filters">
        <div className="transactions__filter-group">
          <Input
            type="text"
            placeholder="Search by description, amount, or tag..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="transactions__filter-row">
          <Select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value as 'this-month' | 'this-week' | 'custom' | 'all'
              )
            }
            options={[
              { value: 'this-month', label: 'This Month' },
              { value: 'this-week', label: 'This Week' },
              { value: 'custom', label: 'Custom Range' },
              { value: 'all', label: 'All Time' },
            ]}
          />
          {dateFilter === 'custom' && (
            <>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                placeholder="End date"
              />
            </>
          )}
          <Select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Source: All' },
              { value: 'asset', label: 'Source: 💰 Asset' },
              { value: 'income', label: 'Source: 📈 Income' },
              { value: 'expense', label: 'Source: 💸 Expense' },
              { value: 'liability', label: 'Source: 📊 Liability' },
            ]}
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Type' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
              { value: 'transfer', label: 'Transfer' },
            ]}
          />
        </div>
      </div>

      <div className="transactions__content">
        <TransactionTable
          transactions={filteredTransactions}
          onDelete={handleDeleteTransaction}
        />
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTransaction}
        accounts={accounts}
      />
    </div>
  )
}

export default Transactions
