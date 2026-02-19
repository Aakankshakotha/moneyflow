import React, { useState, useEffect } from 'react'
import type {
  Account,
  AccountType,
  AccountStatus,
  CreateAccountDto,
  UpdateAccountDto,
} from '@/types/account'
import { AccountForm, AccountList } from '@/components/features'
import { Button } from '@/components/common'
import * as accountService from '@/services/accountService'
import './Accounts.css'

/**
 * Accounts page - manage accounts (assets, liabilities, income, expenses)
 */
const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load accounts on mount
  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    const result = await accountService.listAccounts()

    if (result.success) {
      setAccounts(result.data)
      setFilteredAccounts(result.data)
    } else {
      setError('Failed to load accounts')
    }

    setLoading(false)
  }

  const handleCreateAccount = async (
    data: CreateAccountDto | UpdateAccountDto
  ): Promise<void> => {
    if (editingAccount) {
      // Update existing account
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
      // Create new account
      const result = await accountService.createAccount(
        data as CreateAccountDto
      )

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

      if (!shouldArchive) {
        return
      }

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
      return
    }

    alert(`Error: ${result.error.message}`)
  }

  const handleFilterChange = async (
    type?: AccountType,
    status?: AccountStatus
  ): Promise<void> => {
    // Filter from the local accounts array instead of re-fetching
    let filtered = accounts

    if (type) {
      filtered = filtered.filter((acc) => acc.type === type)
    }

    if (status) {
      filtered = filtered.filter((acc) => acc.status === status)
    }

    setFilteredAccounts(filtered)
  }

  const handleCloseForm = (): void => {
    setIsFormOpen(false)
    setEditingAccount(null)
  }

  if (loading) {
    return (
      <div className="accounts-page">
        <p>Loading accounts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="accounts-page">
        <p className="accounts-page__error">{error}</p>
        <Button onClick={loadAccounts}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="accounts-page">
      <div className="accounts-page__header">
        <h1>Accounts</h1>
        <Button onClick={() => setIsFormOpen(true)}>Create Account</Button>
      </div>

      <AccountList
        accounts={filteredAccounts}
        onEdit={handleEditAccount}
        onToggleStatus={handleToggleAccountStatus}
        onDelete={handleDeleteAccount}
        onFilterChange={handleFilterChange}
      />

      <AccountForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateAccount}
        accounts={accounts}
        account={editingAccount || undefined}
      />
    </div>
  )
}

export default Accounts
