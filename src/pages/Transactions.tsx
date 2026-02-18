import React, { useState, useEffect } from 'react'
import { Button } from '@/components/common'
import { TransactionForm, TransactionList } from '@/components/features'
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
  const [groupByCategory, setGroupByCategory] = useState(false)

  useEffect(() => {
    loadData()
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
      setFilteredTransactions(enrichedTransactions)
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

  const handleSearch = (searchTerm: string): void => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(term) ||
        t.fromAccount.name.toLowerCase().includes(term) ||
        t.toAccount.name.toLowerCase().includes(term)
    )
    setFilteredTransactions(filtered)
  }

  const handleCategoryFilter = (category: string): void => {
    if (!category) {
      setFilteredTransactions(transactions)
      return
    }

    const filtered = transactions.filter((t) => t.category === category)
    setFilteredTransactions(filtered)
  }

  const handleToggleGrouping = (): void => {
    setGroupByCategory(!groupByCategory)
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
        <Button onClick={() => setIsFormOpen(true)}>Record Transaction</Button>
      </div>

      <div className="transactions__content">
        <TransactionList
          transactions={filteredTransactions}
          onDelete={handleDeleteTransaction}
          onSearchChange={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          groupByCategory={groupByCategory}
          onToggleGrouping={handleToggleGrouping}
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
