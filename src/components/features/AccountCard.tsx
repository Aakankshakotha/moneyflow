import React from 'react'
import type { Account } from '@/types/account'
import { Card } from '@/components/common'
import { formatCurrency } from '@/utils/currencyUtils'
import './AccountCard.css'

interface AccountCardProps {
  account: Account
  onEdit?: (account: Account) => void
  onDelete?: (account: Account) => void
}

/**
 * AccountCard - displays a single account with its details
 */
const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
}) => {
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      asset: 'Asset',
      liability: 'Liability',
      income: 'Income',
      expense: 'Expense',
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
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

  return (
    <Card className="account-card">
      <div className="account-card__header">
        <div>
          <h3 className="account-card__name">{account.name}</h3>
          <span className="account-card__type">
            {getTypeLabel(account.type)}
          </span>
        </div>
        {getStatusBadge(account.status)}
      </div>
      <div className="account-card__balance">
        <span className="account-card__balance-label">Balance:</span>
        <span className="account-card__balance-amount">
          {formatCurrency(account.balance)}
        </span>
      </div>
      {(onEdit || onDelete) && (
        <div className="account-card__actions">
          {onEdit && (
            <button
              className="account-card__button account-card__button--edit"
              onClick={() => onEdit(account)}
            >
              Edit
            </button>
          )}
          {onDelete && account.status === 'archived' && (
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
