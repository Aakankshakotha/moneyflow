import React from 'react'
import type { Account, AccountType, AccountStatus } from '@/types/account'
import AccountCard from './AccountCard'
import { Select } from '@/components/common'
import './AccountList.css'

interface AccountListProps {
  accounts: Account[]
  onEdit?: (account: Account) => void
  onDelete?: (account: Account) => void
  onFilterChange?: (type?: AccountType, status?: AccountStatus) => void
}

/**
 * AccountList - displays a list of accounts with filtering
 */
const AccountList: React.FC<AccountListProps> = ({
  accounts,
  onEdit,
  onDelete,
  onFilterChange,
}) => {
  const [filterType, setFilterType] = React.useState<AccountType | 'all'>('all')
  const [filterStatus, setFilterStatus] = React.useState<AccountStatus | 'all'>(
    'all'
  )

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newType = e.target.value as AccountType | 'all'
    setFilterType(newType)
    onFilterChange?.(
      newType === 'all' ? undefined : newType,
      filterStatus === 'all' ? undefined : filterStatus
    )
  }

  const handleStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newStatus = e.target.value as AccountStatus | 'all'
    setFilterStatus(newStatus)
    onFilterChange?.(
      filterType === 'all' ? undefined : filterType,
      newStatus === 'all' ? undefined : newStatus
    )
  }

  // Group accounts by type
  const groupedAccounts = accounts.reduce(
    (acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = []
      }
      acc[account.type].push(account)
      return acc
    },
    {} as Record<string, Account[]>
  )

  const typeLabels: Record<string, string> = {
    asset: 'Assets',
    liability: 'Liabilities',
    income: 'Income',
    expense: 'Expenses',
  }

  return (
    <div className="account-list">
      <div className="account-list__filters">
        <Select
          label="Filter by Type"
          value={filterType}
          onChange={handleTypeChange}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'asset', label: 'Assets' },
            { value: 'liability', label: 'Liabilities' },
            { value: 'income', label: 'Income' },
            { value: 'expense', label: 'Expenses' },
          ]}
        />
        <Select
          label="Filter by Status"
          value={filterStatus}
          onChange={handleStatusChange}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ]}
        />
      </div>

      {accounts.length === 0 ? (
        <div className="account-list__empty">
          <p>No accounts found. Create your first account to get started!</p>
        </div>
      ) : (
        <div className="account-list__groups">
          {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
            <div key={type} className="account-list__group">
              <h2 className="account-list__group-title">
                {typeLabels[type] || type}
              </h2>
              <div className="account-list__cards">
                {typeAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AccountList
