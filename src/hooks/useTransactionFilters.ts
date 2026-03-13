import { useState, useEffect } from 'react'
import type { TransactionWithAccounts } from '@/types/transaction'

export type DateFilter = 'this-month' | 'this-week' | 'custom' | 'all'

export interface UseTransactionFiltersReturn {
  dateFilter: DateFilter
  setDateFilter: React.Dispatch<React.SetStateAction<DateFilter>>
  customStartDate: string
  setCustomStartDate: React.Dispatch<React.SetStateAction<string>>
  customEndDate: string
  setCustomEndDate: React.Dispatch<React.SetStateAction<string>>
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  accountFilter: string
  setAccountFilter: React.Dispatch<React.SetStateAction<string>>
  typeFilter: string
  setTypeFilter: React.Dispatch<React.SetStateAction<string>>
  filteredTransactions: TransactionWithAccounts[]
}

export const useTransactionFilters = (
  transactions: TransactionWithAccounts[]
): UseTransactionFiltersReturn => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [accountFilter, setAccountFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithAccounts[]>([])

  useEffect(() => {
    let filtered = [...transactions]

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (dateFilter === 'this-month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      filtered = filtered.filter((t) => {
        const d = new Date(t.date)
        return d >= startOfMonth && d <= endOfMonth
      })
    } else if (dateFilter === 'this-week') {
      const dayOfWeek = now.getDay()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - dayOfWeek)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59)
      filtered = filtered.filter((t) => {
        const d = new Date(t.date)
        return d >= startOfWeek && d <= endOfWeek
      })
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate)
      const end = new Date(customEndDate)
      end.setHours(23, 59, 59)
      filtered = filtered.filter((t) => {
        const d = new Date(t.date)
        return d >= start && d <= end
      })
    }

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

    if (accountFilter !== 'all') {
      filtered = filtered.filter((t) => t.fromAccount.type === accountFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => {
        const isIncome = t.fromAccount.type === 'income' && t.toAccount.type === 'asset'
        const isExpense = t.fromAccount.type === 'asset' && t.toAccount.type === 'expense'
        const isTransfer = !isIncome && !isExpense
        if (typeFilter === 'income') return isIncome
        if (typeFilter === 'expense') return isExpense
        if (typeFilter === 'transfer') return isTransfer
        return true
      })
    }

    setFilteredTransactions(filtered)
  }, [
    transactions,
    dateFilter,
    customStartDate,
    customEndDate,
    searchTerm,
    accountFilter,
    typeFilter,
  ])

  return {
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    searchTerm,
    setSearchTerm,
    accountFilter,
    setAccountFilter,
    typeFilter,
    setTypeFilter,
    filteredTransactions,
  }
}
