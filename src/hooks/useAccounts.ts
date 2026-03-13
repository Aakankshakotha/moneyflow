import { useState, useEffect } from 'react'
import type {
  Account,
  AccountStatus,
  CreateAccountDto,
  UpdateAccountDto,
} from '@/types/account'
import type { Transaction } from '@/types/transaction'
import * as accountService from '@/services/accountService'
import * as transactionService from '@/services/transactionService'

export interface UseAccountsReturn {
  accounts: Account[]
  transactions: Transaction[]
  selectedAccountId: string | null
  setSelectedAccountId: React.Dispatch<React.SetStateAction<string | null>>
  isFormOpen: boolean
  editingAccount: Account | null
  loading: boolean
  error: string | null
  showArchived: boolean
  setShowArchived: React.Dispatch<React.SetStateAction<boolean>>
  activeAccounts: Account[]
  selectedAccount: Account | null
  accountMap: Map<string, Account>
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  loadAccounts: () => Promise<void>
  handleCreateAccount: (data: CreateAccountDto | UpdateAccountDto) => Promise<void>
  handleEditAccount: (account: Account) => void
  handleDeleteAccount: (account: Account) => Promise<void>
  handleToggleAccountStatus: (account: Account) => Promise<void>
  handleCloseForm: () => void
  openAddForm: () => void
}

export const useAccounts = (): UseAccountsReturn => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    const [accountsResult, transactionsResult] = await Promise.all([
      accountService.listAccounts(),
      transactionService.listTransactions(),
    ])

    if (accountsResult.success) {
      setAccounts(accountsResult.data)
      setSelectedAccountId((prev) => {
        if (prev && accountsResult.data.some((a) => a.id === prev)) {
          return prev
        }
        return null
      })
    } else {
      setError('Failed to load accounts')
    }

    if (transactionsResult.success) {
      setTransactions(transactionsResult.data)
    }

    setLoading(false)
  }

  const handleCreateAccount = async (
    data: CreateAccountDto | UpdateAccountDto
  ): Promise<void> => {
    if (editingAccount) {
      const result = await accountService.updateAccount(
        editingAccount.id,
        data as UpdateAccountDto
      )
      if (result.success) {
        await loadAccounts()
        setEditingAccount(null)
        setIsFormOpen(false)
      } else {
        if ('field' in result.error) {
          alert(`Validation error: ${result.error.message}`)
        } else {
          alert(`Error: ${result.error.message}`)
        }
      }
    } else {
      const result = await accountService.createAccount(data as CreateAccountDto)
      if (result.success) {
        await loadAccounts()
        setIsFormOpen(false)
      } else {
        if ('field' in result.error) {
          alert(`Validation error: ${result.error.message}`)
        } else {
          alert('Failed to create account')
        }
      }
    }
  }

  const handleEditAccount = (account: Account): void => {
    setEditingAccount(account)
    setIsFormOpen(true)
  }

  const handleDeleteAccount = async (account: Account): Promise<void> => {
    if (!confirm(`Are you sure you want to delete "${account.name}"?`)) {
      return
    }

    if (account.status === 'active') {
      const shouldArchive = confirm(
        'This account is active. It must be archived before deletion. Archive it now?'
      )
      if (!shouldArchive) return

      const archiveResult = await accountService.updateAccount(account.id, {
        status: 'archived',
      })
      if (!archiveResult.success) {
        alert(`Error: ${archiveResult.error.message}`)
        return
      }
    }

    const result = await accountService.deleteAccount(account.id)
    if (result.success) {
      await loadAccounts()
    } else {
      alert(`Error: ${result.error.message}`)
    }
  }

  const handleToggleAccountStatus = async (account: Account): Promise<void> => {
    const nextStatus: AccountStatus =
      account.status === 'active' ? 'archived' : 'active'
    const result = await accountService.updateAccount(account.id, {
      status: nextStatus,
    })
    if (result.success) {
      await loadAccounts()
    } else {
      alert(`Error: ${result.error.message}`)
    }
  }

  const handleCloseForm = (): void => {
    setIsFormOpen(false)
    setEditingAccount(null)
  }

  const openAddForm = (): void => {
    setIsFormOpen(true)
  }

  const activeAccounts = accounts.filter((a) =>
    showArchived ? a.status === 'archived' : a.status === 'active'
  )
  const accountMap = new Map(accounts.map((a) => [a.id, a]))
  const totalAssets = activeAccounts
    .filter((a) => a.type === 'asset')
    .reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = activeAccounts
    .filter((a) => a.type === 'liability')
    .reduce((sum, a) => sum + a.balance, 0)
  const netWorth = totalAssets - totalLiabilities
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? null

  return {
    accounts,
    transactions,
    selectedAccountId,
    setSelectedAccountId,
    isFormOpen,
    editingAccount,
    loading,
    error,
    showArchived,
    setShowArchived,
    activeAccounts,
    selectedAccount,
    accountMap,
    totalAssets,
    totalLiabilities,
    netWorth,
    loadAccounts,
    handleCreateAccount,
    handleEditAccount,
    handleDeleteAccount,
    handleToggleAccountStatus,
    handleCloseForm,
    openAddForm,
  }
}
