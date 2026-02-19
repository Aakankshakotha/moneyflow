import React from 'react'
import type { Account } from '@/types/account'
import { Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import './AccountCard.css'

interface AccountCardProps {
  account: Account
  parentName?: string
  onEdit?: (account: Account) => void
  onToggleStatus?: (account: Account) => void
  onDelete?: (account: Account) => void
}

/**
 * AccountCard - displays a single account with its details
 */
const AccountCard: React.FC<AccountCardProps> = ({
  account,
  parentName,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const getAmountDisplay = (
    accountData: Account
  ): { label: string; value: number; tone: string } => {
    if (accountData.type === 'income') {
      return {
        label: 'Total Inflow:',
        value: Math.abs(accountData.balance),
        tone: 'income',
      }
    }

    if (accountData.type === 'expense') {
      return {
        label: 'Total Spent:',
        value: Math.abs(accountData.balance),
        tone: 'expense',
      }
    }

    if (accountData.type === 'liability') {
      return {
        label: 'Balance:',
        value: accountData.balance,
        tone: 'liability',
      }
    }

    return {
      label: 'Balance:',
      value: accountData.balance,
      tone: 'asset',
    }
  }

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      asset: 'Asset',
      liability: 'Liability',
      income: 'Income',
      expense: 'Expense',
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string): JSX.Element => {
    return status === 'active' ? (
      <span className="account-card__badge account-card__badge--active">
        Active
      </span>
    ) : (
      <span className="account-card__badge account-card__badge--archived">
        Archived
      </span>
    )
  }

  const amountDisplay = getAmountDisplay(account)

  return (
    <Card className="account-card">
      <div className="account-card__header">
        <div>
          <h3 className="account-card__name">{account.name}</h3>
          {parentName && (
            <div className="account-card__parent">
              Sub-account of {parentName}
            </div>
          )}
          <span className="account-card__type">
            {getTypeLabel(account.type)}
          </span>
        </div>
        {getStatusBadge(account.status)}
      </div>
      <div className="account-card__balance">
        <span className="account-card__balance-label">
          {amountDisplay.label}
        </span>
        <span
          className={`account-card__balance-amount account-card__balance-amount--${amountDisplay.tone}`}
        >
          {formatCurrency(amountDisplay.value)}
        </span>
      </div>
      {(onEdit || onToggleStatus || onDelete) && (
        <div className="account-card__actions">
          {onEdit && (
            <button
              className="account-card__button account-card__button--edit"
              onClick={() => onEdit(account)}
            >
              Edit
            </button>
          )}
          {onToggleStatus && (
            <button
              className="account-card__button account-card__button--edit"
              onClick={() => onToggleStatus(account)}
            >
              {account.status === 'active' ? 'Archive' : 'Unarchive'}
            </button>
          )}
          {onDelete && (
            <button
              className="account-card__button account-card__button--delete"
              onClick={() => onDelete(account)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

export default AccountCard
