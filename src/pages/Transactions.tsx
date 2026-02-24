import React, { useState, useEffect } from 'react'
import { Button } from '@/components/common'
import FormControl from '@mui/material/FormControl'
import MuiSelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
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
      <Box sx={{ p: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2rem' }}>
          <Typography variant="h4" component="h1" sx={{ m: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Transactions</Typography>
        </Box>
        <Box sx={{ color: 'var(--text-secondary)' }}>Loading transactions...</Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2rem' }}>
          <Typography variant="h4" component="h1" sx={{ m: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Transactions</Typography>
        </Box>
        <Box sx={{ color: 'var(--error-color)' }}>{error}</Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2rem' }}>
        <Typography variant="h4" component="h1" sx={{ m: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Transactions</Typography>
        <Box sx={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="secondary">Export CSV</Button>
          <Button onClick={() => setIsFormOpen(true)}>Add Transaction</Button>
        </Box>
      </Box>

      <TransactionMetrics transactions={filteredTransactions} />

      <Box sx={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '8px', p: '1rem 1.25rem', mb: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by description, amount, or tag..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ flex: 1.5, minWidth: '200px' }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: '130px' }}>
          <MuiSelect
            labelId="date-filter-label"
            label="Period"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value as 'this-month' | 'this-week' | 'custom' | 'all'
              )
            }
          >
            <MenuItem value="this-month">This Month</MenuItem>
            <MenuItem value="this-week">This Week</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </MuiSelect>
        </FormControl>
        {dateFilter === 'custom' && (
          <>
            <TextField
              size="small"
              type="date"
              label="From"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              type="date"
              label="To"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        )}
        <FormControl size="small" sx={{ minWidth: '130px' }}>
          <MuiSelect
            labelId="source-filter-label"
            label="Source"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="asset">Asset</MenuItem>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
            <MenuItem value="liability">Liability</MenuItem>
          </MuiSelect>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: '130px' }}>
          <MuiSelect
            labelId="type-filter-label"
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
            <MenuItem value="transfer">Transfer</MenuItem>
          </MuiSelect>
        </FormControl>
      </Box>

      <Box sx={{ mt: '1rem' }}>
        <TransactionTable
          transactions={filteredTransactions}
          onDelete={handleDeleteTransaction}
        />
      </Box>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTransaction}
        accounts={accounts}
      />
    </Box>
  )
}

export default Transactions
